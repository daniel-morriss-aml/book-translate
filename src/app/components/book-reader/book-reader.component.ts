import { CommonModule } from "@angular/common";
import {
    Component,
    ElementRef,
    HostListener,
    OnInit,
    ViewChild,
    signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HammerModule } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { Book, Page, Sentence } from "../../models/book.model";
import { BookService } from "../../services/book.service";
import { ProgressService } from "../../services/progress.service";
import { SettingsService, UserSettings } from "../../services/settings.service";
import { ThemeService } from "../../services/theme.service";
import { HeaderComponent } from "../header/header.component";
import { ProgressIndicatorComponent } from "../progress-indicator/progress-indicator.component";
import { SliderComponent } from "../slider/slider.component";

@Component({
    selector: "app-book-reader",
    imports: [
        CommonModule,
        FormsModule,
        SliderComponent,
        HeaderComponent,
        ProgressIndicatorComponent,
        HammerModule,
    ],
    templateUrl: "./book-reader.component.html",
    styleUrl: "./book-reader.component.css",
})
export class BookReaderComponent implements OnInit {
    @ViewChild("pageContent") pageContent?: ElementRef;

    book: Book | null = null;
    currentPageIndex: number = 0;
    sliderValue: number = 100; // remove
    loading: boolean = true;
    error: string | null = null;
    maintainTranslationLevel: boolean = false;
    isDarkMode: boolean = false;
    showSetProgressModal: boolean = false;
    isChapterContext: boolean = false;
    parentBookId: string | null = null;
    parentLanguage: string | null = null;
    nextChapterId: string | null = null;
    furthestReadPage: number | null = null;

    settings = signal<UserSettings>({
        showProgressIndicator: true,
        showTranslationSlider: true,
        darkMode: false,
        showTranslation: true,
        sentencesPerPage: 8,
        nativeLanguage: 'en',
    });

    constructor(
        private bookService: BookService,
        private progressService: ProgressService,
        private route: ActivatedRoute,
        private router: Router,
        private themeService: ThemeService,
        private settingsService: SettingsService,
    ) {}

    ngOnInit(): void {
        // Subscribe to theme changes
        this.themeService.isDarkMode().subscribe((isDark) => {
            this.isDarkMode = isDark;
        });

        // Subscribe to settings changes
        this.settingsService.getSettings().subscribe((settings) => {
            this.settings.set(settings);
        });

        this.route.params.subscribe((params) => {
            const bookId = params["id"];
            if (bookId) {
                this.loadBookById(bookId);
            } else {
                this.error = "No book ID provided";
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
                this.error = "Failed to load book";
                this.loading = false;
                console.error("Error loading book:", err);
            },
        });
    }

    loadChapterById(chapterId: string, books: any[]): void {
        // Check if this is a new multi-language chapter ID (pattern: pap-LANG-NNN)
        const newFormatMatch = chapterId.match(/^([a-z-]+)-([a-z]{2})-(\d+)$/);
        
        if (newFormatMatch) {
            // New format: load chapter content for target and native languages
            this.loadNewFormatChapter(chapterId, newFormatMatch, books);
            return;
        }

        // Find books with chapters and search through their chapters (legacy)
        const booksWithChapters = books.filter(
            (b) => b.hasChapters && (b.chaptersPath || b.translations),
        );

        if (booksWithChapters.length === 0) {
            this.error = "Book not found";
            this.loading = false;
            return;
        }

        // Search through each book's chapters
        let searchIndex = 0;

        const searchNextBook = () => {
            if (searchIndex >= booksWithChapters.length) {
                this.error = "Book not found";
                this.loading = false;
                return;
            }

            const book = booksWithChapters[searchIndex];
            
            // For multi-language books, search all translation chapter lists
            if (book.translations) {
                this.searchTranslationChapters(book, chapterId, () => {
                    searchIndex++;
                    searchNextBook();
                });
            } else if (book.chaptersPath) {
                // Legacy single chapter list
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
                        console.error(
                            "Error loading chapters for book:",
                            book.id,
                            err,
                        );
                        searchIndex++;
                        searchNextBook();
                    },
                });
            } else {
                searchIndex++;
                searchNextBook();
            }
        };

        searchNextBook();
    }

    searchTranslationChapters(book: any, chapterId: string, onNotFound: () => void): void {
        let translationIndex = 0;
        
        const searchNextTranslation = () => {
            if (translationIndex >= book.translations.length) {
                onNotFound();
                return;
            }
            
            const translation = book.translations[translationIndex];
            if (!translation.chaptersPath) {
                translationIndex++;
                searchNextTranslation();
                return;
            }
            
            this.bookService.loadChapters(translation.chaptersPath).subscribe({
                next: (chapters) => {
                    const chapter = chapters.find((c: any) => c.id === chapterId);
                    if (chapter) {
                        // For new format, we need to detect and handle differently
                        const newFormatMatch = chapterId.match(/^([a-z-]+)-([a-z]{2})-(\d+)$/);
                        if (newFormatMatch) {
                            this.loadNewFormatChapter(chapterId, newFormatMatch, [book]);
                        } else {
                            this.loadBook(chapter.path);
                        }
                    } else {
                        translationIndex++;
                        searchNextTranslation();
                    }
                },
                error: (err) => {
                    console.error("Error loading translation chapters:", err);
                    translationIndex++;
                    searchNextTranslation();
                },
            });
        };
        
        searchNextTranslation();
    }

    loadNewFormatChapter(chapterId: string, match: RegExpMatchArray, books: any[]): void {
        const bookPrefix = match[1];  // e.g., 'pap'
        const targetLang = match[2];   // e.g., 'de', 'en', 'es'
        const chapterNum = match[3];   // e.g., '001'

        // Find the book by checking if any translation's chapter ID pattern matches
        // For example, chapter ID 'pap-es-001' should match a book with translations
        const book = books.find((b: any) => {
            if (!b.translations || b.translations.length === 0) return false;
            
            // Check if any translation has chapters with IDs that start with the same prefix
            return b.translations.some((t: any) => {
                if (!t.chaptersPath) return false;
                // The chapter ID pattern should match: bookPrefix-languageCode-number
                // We can check if this translation's language code matches
                return t.code === targetLang;
            });
        });
        
        if (!book || !book.translations) {
            this.error = "Book not found";
            this.loading = false;
            return;
        }

        const targetTranslation = book.translations.find((t: any) => t.code === targetLang);
        const nativeLanguage = this.settings().nativeLanguage;
        const nativeTranslation = book.translations.find((t: any) => t.code === nativeLanguage);

        if (!targetTranslation || !nativeTranslation) {
            this.error = "Translation not found";
            this.loading = false;
            return;
        }

        // Build paths to chapter files - use the actual folder name from book ID
        const basePath = `assets/${book.id}`;
        const targetPath = `${basePath}/${targetLang}/chapter-${parseInt(chapterNum, 10)}.json`;
        const nativePath = `${basePath}/${nativeLanguage}/chapter-${parseInt(chapterNum, 10)}.json`;

        // Load both chapters
        Promise.all([
            this.bookService.loadChapterContent(targetPath).toPromise(),
            this.bookService.loadChapterContent(nativePath).toPromise()
        ]).then(([targetContent, nativeContent]) => {
            if (!targetContent || !nativeContent) {
                this.error = "Failed to load chapter content";
                this.loading = false;
                return;
            }

            // Create a Book object from the chapter content
            const sentencesPerPage = this.settings().sentencesPerPage;
            const pages: Page[] = [];
            const targetSentences = targetContent.sentences;
            const nativeSentences = nativeContent.sentences;
            const totalSentences = Math.max(targetSentences.length, nativeSentences.length);

            // Create pages by grouping sentences
            for (let i = 0; i < totalSentences; i += sentencesPerPage) {
                const pageSentences: Sentence[] = [];
                
                for (let j = 0; j < sentencesPerPage && (i + j) < totalSentences; j++) {
                    const idx = i + j;
                    pageSentences.push({
                        target: targetSentences[idx]?.sentence || '',
                        native: nativeSentences[idx]?.sentence || ''
                    });
                }

                pages.push({
                    pageNumber: pages.length + 1,
                    sentences: pageSentences
                });
            }

            // Create the book object
            this.book = {
                id: chapterId,
                title: `${targetTranslation.title} - Chapter ${parseInt(chapterNum, 10)}`,
                targetLanguage: targetTranslation.name,
                nativeLanguage: nativeTranslation.name,
                pages: pages
            };

            this.sliderValue = this.bookService.getSliderValue(chapterId);
            this.maintainTranslationLevel =
                this.bookService.getMaintainTranslationLevel(chapterId);

            // Load furthest read page
            const furthestPage = this.progressService.getFurthestPage(chapterId);
            this.furthestReadPage = furthestPage;
            this.currentPageIndex = furthestPage;

            // Check if this is a chapter context
            this.checkChapterContext(chapterId);

            this.loading = false;
        }).catch((err) => {
            this.error = "Failed to load chapter";
            this.loading = false;
            console.error("Error loading new format chapter:", err);
        });
    }

    loadBook(bookPath: string): void {
        this.bookService.loadBook(bookPath).subscribe({
            next: (book) => {
                this.book = book;
                this.sliderValue = this.bookService.getSliderValue(book.id);
                this.maintainTranslationLevel =
                    this.bookService.getMaintainTranslationLevel(book.id);

                // Load furthest read page
                const furthestPage = this.progressService.getFurthestPage(
                    book.id,
                );
                this.furthestReadPage = furthestPage;
                this.currentPageIndex = furthestPage;

                // Check if this is a chapter context (to determine if we should show "Next Chapter" button)
                this.checkChapterContext(book.id);

                this.loading = false;
            },
            error: (err) => {
                this.error = "Failed to load book";
                this.loading = false;
                console.error("Error loading book:", err);
            },
        });
    }

    checkChapterContext(bookId: string): void {
        // Check if this is a new format chapter ID (pattern: bookPrefix-LANG-NNN)
        const newFormatMatch = bookId.match(/^([a-z-]+)-([a-z]{2})-(\d+)$/);
        
        if (newFormatMatch) {
            // New format chapter
            this.checkNewFormatChapterContext(bookId, newFormatMatch);
            return;
        }

        // Legacy format - Load book list to check if this is a chapter
        this.bookService.loadBookList().subscribe({
            next: (books) => {
                const booksWithChapters = books.filter(
                    (b) => b.hasChapters && b.chaptersPath,
                );

                let searchIndex = 0;

                const searchNextBook = () => {
                    if (searchIndex >= booksWithChapters.length) {
                        return;
                    }

                    const bookMetadata = booksWithChapters[searchIndex];
                    this.bookService
                        .loadChapters(bookMetadata.chaptersPath!)
                        .subscribe({
                            next: (chapters) => {
                                const chapterIndex = chapters.findIndex(
                                    (c) => c.id === bookId,
                                );
                                if (chapterIndex !== -1) {
                                    this.isChapterContext = true;
                                    this.parentBookId = bookMetadata.id;
                                    // Find next chapter if it exists
                                    if (chapterIndex < chapters.length - 1) {
                                        this.nextChapterId =
                                            chapters[chapterIndex + 1].id;
                                    }
                                } else {
                                    searchIndex++;
                                    searchNextBook();
                                }
                            },
                            error: (err) => {
                                console.error(
                                    "Error loading chapters for book:",
                                    bookMetadata.id,
                                    err,
                                );
                                searchIndex++;
                                searchNextBook();
                            },
                        });
                };

                searchNextBook();
            },
            error: (err) => {
                console.error("Error checking chapter context:", err);
            },
        });
    }

    checkNewFormatChapterContext(bookId: string, match: RegExpMatchArray): void {
        const bookPrefix = match[1];  // e.g., 'pap'
        const targetLang = match[2];   // e.g., 'de', 'en', 'es'
        const chapterNum = parseInt(match[3], 10);   // e.g., 1, 2, 3

        // Load book list to find the parent book and check for next chapter
        this.bookService.loadBookList().subscribe({
            next: (books) => {
                // Find the book that has translations with this language
                const book = books.find((b) => {
                    if (!b.translations || b.translations.length === 0) return false;
                    return b.translations.some((t) => t.code === targetLang);
                });

                if (!book || !book.translations) {
                    return;
                }

                // Find the translation for the target language
                const translation = book.translations.find((t) => t.code === targetLang);
                
                if (!translation || !translation.chaptersPath) {
                    return;
                }

                // Load chapters to find the next chapter
                this.bookService.loadChapters(translation.chaptersPath).subscribe({
                    next: (chapters) => {
                        // Find current chapter index
                        const chapterIndex = chapters.findIndex(
                            (c) => c.id === bookId
                        );

                        if (chapterIndex !== -1) {
                            this.isChapterContext = true;
                            this.parentBookId = book.id;
                            this.parentLanguage = targetLang;
                            
                            // Calculate next chapter ID if it exists
                            if (chapterIndex < chapters.length - 1) {
                                const nextChapter = chapters[chapterIndex + 1];
                                this.nextChapterId = nextChapter.id;
                            }
                        }
                    },
                    error: (err) => {
                        console.error("Error loading chapters:", err);
                    },
                });
            },
            error: (err) => {
                console.error("Error checking chapter context:", err);
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
                this.sliderValue = 100;
                this.onSliderChange(this.sliderValue);
            }
            // Update progress when navigating
            this.updateProgress();
            // Scroll to top of page content
            this.scrollToTop();
        }
    }

    updateProgress(): void {
        if (this.book) {
            // Only update if this is further than the previous furthest read page
            if (
                this.furthestReadPage === null ||
                this.currentPageIndex > this.furthestReadPage
            ) {
                this.progressService.setProgressPoint(
                    this.book.id,
                    this.currentPageIndex,
                    this.totalPages,
                );
                // Update the local furthest read page
                this.furthestReadPage = this.currentPageIndex;
            }
        }
    }

    previousPage(): void {
        if (this.currentPageIndex > 0) {
            this.currentPageIndex--;
            if (!this.maintainTranslationLevel) {
                this.sliderValue = 100;
                this.onSliderChange(this.sliderValue);
            }
            // Scroll to top of page content
            this.scrollToTop();
        }
    }

    onSliderChange(value: number): void {
        this.sliderValue = value;
        if (this.book) {
            this.bookService.saveSliderValue(this.book.id, this.sliderValue);
        }
    }

    toggleMaintainTranslationLevel(): void {
        this.maintainTranslationLevel = !this.maintainTranslationLevel;
        if (this.book) {
            this.bookService.saveMaintainTranslationLevel(
                this.book.id,
                this.maintainTranslationLevel,
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

        // If showTranslation is off, never show native text
        if (!this.settings().showTranslation) {
            return false;
        }

        const totalSentences = this.currentPage.sentences.length;
        const threshold = (this.sliderValue / 100) * totalSentences;
        return index < threshold;
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
                this.totalPages,
            );
            // Update the local furthest read page to match the reset
            this.furthestReadPage = this.currentPageIndex;
        }
        this.closeSetProgressModal();
    }

    goToNextChapter(): void {
        if (this.book && this.nextChapterId) {
            // Mark current chapter as complete
            this.progressService.completeChapter(this.book.id, this.totalPages);
            // Navigate to next chapter
            this.router.navigate(["/reader", this.nextChapterId]);
            // Scroll to top will happen when new chapter loads
        }
    }

    scrollToTop(): void {
        if (this.pageContent) {
            this.pageContent.nativeElement.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    }

    @HostListener("window:keydown", ["$event"])
    handleKeyboardEvent(event: KeyboardEvent): void {
        switch (event.key) {
            case "ArrowLeft":
                event.preventDefault();
                this.previousPage();
                break;
            case "ArrowRight":
                event.preventDefault();
                this.nextPage();
                break;
            case "ArrowUp":
                event.preventDefault();
                this.sliderValue = Math.min(100, this.sliderValue + 5);
                this.onSliderChange(this.sliderValue);
                break;
            case "ArrowDown":
                event.preventDefault();
                this.sliderValue = Math.max(0, this.sliderValue - 5);
                this.onSliderChange(this.sliderValue);
                break;
        }
    }
}
