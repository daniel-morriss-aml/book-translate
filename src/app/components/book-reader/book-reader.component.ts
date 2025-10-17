import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Book, Page, Sentence } from '../../models/book.model';
import { BookService } from '../../services/book.service';
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

    constructor(
        private bookService: BookService,
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
        let foundChapter = false;
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
                        foundChapter = true;
                        this.loadBook(chapter.path);
                    } else {
                        searchIndex++;
                        searchNextBook();
                    }
                },
                error: (err) => {
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
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to load book';
                this.loading = false;
                console.error('Error loading book:', err);
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
