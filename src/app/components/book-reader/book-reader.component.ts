import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Book, Page, Sentence } from '../../models/book.model';
import { BookService } from '../../services/book.service';
import { ProgressService } from '../../services/progress.service';
import { ThemeService } from '../../services/theme.service';

@Component({
    selector: 'app-book-reader',
    imports: [CommonModule, FormsModule],
    templateUrl: './book-reader.component.html',
    styleUrl: './book-reader.component.css',
})
export class BookReaderComponent implements OnInit {
    book: Book | null = null;
    currentPageIndex: number = 0;
    sliderValue: number = 0;
    loading: boolean = true;
    error: string | null = null;
    maintainTranslationLevel: boolean = false;
    isDarkMode: boolean = false;
    showSetProgressModal: boolean = false;
    isChapterContext: boolean = false;
    nextChapterId: string | null = null;

    constructor(
        private bookService: BookService,
        private progressService: ProgressService,
        private route: ActivatedRoute,
        private router: Router,
        private themeService: ThemeService
    ) {}

    ngOnInit(): void {
        // Subscribe to theme changes
        this.themeService.isDarkMode().subscribe((isDark) => {
            this.isDarkMode = isDark;
        });

        this.route.params.subscribe((params) => {
            const bookId = params['id'];
            if (bookId) {
                this.loadBookById(bookId);
            } else {
                this.error = 'No book ID provided';
                this.loading = false;
            }
        });
    }

    loadBookById(bookId: string): void {
        this.loading = true;
        // Load book list to find the path
        this.bookService.loadBookList().subscribe({
            next: (books) => {
                const bookMetadata = books.find((b) => b.id === bookId);
                if (bookMetadata) {
                    this.loadBook(bookMetadata.path);
                } else {
                    // If not found in books, try loading chapters from all books
                    this.loadChapterById(bookId, books);
                }
            },
            error: (err) => {
                this.error = 'Failed to load book';
                this.loading = false;
                console.error('Error loading book:', err);
            },
        });
    }

    loadChapterById(chapterId: string, books: any[]): void {
        // Find books with chapters and search through their chapters
        const booksWithChapters = books.filter(
            (b) => b.hasChapters && b.chaptersPath
        );

        if (booksWithChapters.length === 0) {
            this.error = 'Book not found';
            this.loading = false;
            return;
        }

        // Search through each book's chapters
        let searchIndex = 0;

        const searchNextBook = () => {
            if (searchIndex >= booksWithChapters.length) {
                this.error = 'Book not found';
                this.loading = false;
                return;
            }

            const book = booksWithChapters[searchIndex];
            this.bookService.loadChapters(book.chaptersPath).subscribe({
                next: (chapters) => {
                    const chapter = chapters.find((c) => c.id === chapterId);
                    if (chapter) {
                        this.loadBook(chapter.path);
                    } else {
                        searchIndex++;
                        searchNextBook();
                    }
                },
                error: (err) => {
                    console.error('Error loading chapters for book:', book.id, err);
                    searchIndex++;
                    searchNextBook();
                },
            });
        };

        searchNextBook();
    }

    loadBook(bookPath: string): void {
        this.bookService.loadBook(bookPath).subscribe({
            next: (book) => {
                this.book = book;
                this.sliderValue = this.bookService.getSliderValue(book.id);
                this.maintainTranslationLevel =
                    this.bookService.getMaintainTranslationLevel(book.id);
                
                // Load furthest read page
                const furthestPage = this.progressService.getFurthestPage(book.id);
                this.currentPageIndex = furthestPage;
                
                // Check if this is a chapter context (to determine if we should show "Next Chapter" button)
                this.checkChapterContext(book.id);
                
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to load book';
                this.loading = false;
                console.error('Error loading book:', err);
            },
        });
    }

    checkChapterContext(bookId: string): void {
        // Load book list to check if this is a chapter
        this.bookService.loadBookList().subscribe({
            next: (books) => {
                const booksWithChapters = books.filter(
                    (b) => b.hasChapters && b.chaptersPath
                );

                let searchIndex = 0;

                const searchNextBook = () => {
                    if (searchIndex >= booksWithChapters.length) {
                        return;
                    }

                    const bookMetadata = booksWithChapters[searchIndex];
                    this.bookService.loadChapters(bookMetadata.chaptersPath!).subscribe({
                        next: (chapters) => {
                            const chapterIndex = chapters.findIndex((c) => c.id === bookId);
                            if (chapterIndex !== -1) {
                                this.isChapterContext = true;
                                // Find next chapter if it exists
                                if (chapterIndex < chapters.length - 1) {
                                    this.nextChapterId = chapters[chapterIndex + 1].id;
                                }
                            } else {
                                searchIndex++;
                                searchNextBook();
                            }
                        },
                        error: (err) => {
                            console.error('Error loading chapters for book:', bookMetadata.id, err);
                            searchIndex++;
                            searchNextBook();
                        },
                    });
                };

                searchNextBook();
            },
            error: (err) => {
                console.error('Error checking chapter context:', err);
            },
        });
    }

    get currentPage(): Page | null {
        return this.book?.pages[this.currentPageIndex] || null;
    }

    get totalPages(): number {
        return this.book?.pages.length || 0;
    }

    nextPage(): void {
        if (this.currentPageIndex < this.totalPages - 1) {
            this.currentPageIndex++;
            if (!this.maintainTranslationLevel) {
                this.sliderValue = 0;
                this.onSliderChange();
            }
            // Update progress when navigating
            this.updateProgress();
        }
    }

    updateProgress(): void {
        if (this.book) {
            const currentProgress = this.progressService.getProgress(this.book.id);
            // Only update if this is further than the previous progress
            if (!currentProgress || this.currentPageIndex > currentProgress.currentPage) {
                this.progressService.setProgressPoint(
                    this.book.id,
                    this.currentPageIndex,
                    this.totalPages
                );
            }
        }
    }

    previousPage(): void {
        if (this.currentPageIndex > 0) {
            this.currentPageIndex--;
            if (!this.maintainTranslationLevel) {
                this.sliderValue = 0;
                this.onSliderChange();
            }
        }
    }

    onSliderChange(): void {
        if (this.book) {
            this.bookService.saveSliderValue(this.book.id, this.sliderValue);
        }
    }

    toggleMaintainTranslationLevel(): void {
        this.maintainTranslationLevel = !this.maintainTranslationLevel;
        if (this.book) {
            this.bookService.saveMaintainTranslationLevel(
                this.book.id,
                this.maintainTranslationLevel
            );
        }
    }

    getSentenceDisplay(sentence: Sentence): string {
        const percentage = this.sliderValue;
        if (percentage === 0) {
            return sentence.target;
        } else if (percentage === 100) {
            return sentence.native;
        }
        return sentence.target;
    }

    shouldShowNative(index: number): boolean {
        if (!this.currentPage) return false;
        const totalSentences = this.currentPage.sentences.length;
        const threshold = (this.sliderValue / 100) * totalSentences;
        return index < threshold;
    }

    backToLibrary(): void {
        this.router.navigate(['/']);
    }

    isLastPage(): boolean {
        return this.currentPageIndex === this.totalPages - 1;
    }

    openSetProgressModal(): void {
        this.showSetProgressModal = true;
    }

    closeSetProgressModal(): void {
        this.showSetProgressModal = false;
    }

    confirmSetProgress(): void {
        if (this.book) {
            this.progressService.setProgressPoint(
                this.book.id,
                this.currentPageIndex,
                this.totalPages
            );
        }
        this.closeSetProgressModal();
    }

    goToNextChapter(): void {
        if (this.book && this.nextChapterId) {
            // Mark current chapter as complete
            this.progressService.completeChapter(this.book.id, this.totalPages);
            // Navigate to next chapter
            this.router.navigate(['/reader', this.nextChapterId]);
        }
    }

    @HostListener('window:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.previousPage();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.nextPage();
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.sliderValue = Math.min(100, this.sliderValue + 5);
                this.onSliderChange();
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.sliderValue = Math.max(0, this.sliderValue - 5);
                this.onSliderChange();
                break;
        }
    }
}
