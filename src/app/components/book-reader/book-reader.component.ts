import { CommonModule } from "@angular/common";
import {
    Component,
    ElementRef,
    HostListener,
    OnInit,
    ViewChild,
    signal,
    inject,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HammerModule } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { Book, Page, Sentence } from "../../models/book.model";
import { ChapterLoaderService } from "../../services/chapter-loader.service";
import {
    BookContextService,
    ChapterContext,
} from "../../services/book-context.service";
import {
    ReaderNavigationService,
    ReaderState,
} from "../../services/reader-navigation.service";
import { ReaderUIService } from "../../services/reader-ui.service";
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
    private chapterLoaderService = inject(ChapterLoaderService);
    private bookContextService = inject(BookContextService);
    private navigationService = inject(ReaderNavigationService);
    private uiService = inject(ReaderUIService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private themeService = inject(ThemeService);
    private settingsService = inject(SettingsService);
    book: Book | null = null;
    loading = true;
    error: string | null = null;
    isDarkMode = false;
    showSetProgressModal = false;
    chapterContext: ChapterContext = {
        isChapterContext: false,
        parentBookId: null,
        parentLanguage: null,
        nextChapterId: null,
    };
    readerState: ReaderState = {
        currentPageIndex: 0,
        sliderValue: 100,
        maintainTranslationLevel: false,
        furthestReadPage: null,
    };
    settings = signal<UserSettings>({
        showProgressIndicator: true,
        showTranslationSlider: true,
        darkMode: false,
        showTranslation: true,
        sentencesPerPage: 8,
        nativeLanguage: "en",
    });

    ngOnInit(): void {
        this.themeService
            .isDarkMode()
            .subscribe((isDark) => (this.isDarkMode = isDark));
        this.settingsService
            .getSettings()
            .subscribe((settings) => this.settings.set(settings));
        this.navigationService
            .getReaderState()
            .subscribe((state) => (this.readerState = state));
        this.route.params.subscribe((params) => {
            const bookId = params["id"];
            if (bookId) this.loadBook(bookId);
            else {
                this.error = "No book ID provided";
                this.loading = false;
            }
        });
    }

    private loadBook(bookId: string): void {
        this.loading = true;
        this.error = null;
        this.chapterLoaderService.loadBookById(bookId).subscribe({
            next: (book) => {
                this.book = book;
                this.navigationService.initializeReaderState(book.id);
                this.bookContextService
                    .getChapterContext(bookId)
                    .subscribe((context) => (this.chapterContext = context));
                this.loading = false;
            },
            error: (err) => {
                this.error = "Failed to load book";
                this.loading = false;
                console.error("Error loading book:", err);
            },
        });
    }

    get currentPage(): Page | null {
        return this.book?.pages[this.readerState.currentPageIndex] || null;
    }
    get currentPageIndex(): number {
        return this.readerState.currentPageIndex;
    }
    get totalPages(): number {
        return this.book?.pages.length || 0;
    }
    get sliderValue(): number {
        return this.readerState.sliderValue;
    }
    get maintainTranslationLevel(): boolean {
        return this.readerState.maintainTranslationLevel;
    }
    get isChapterContext(): boolean {
        return this.chapterContext.isChapterContext;
    }
    get parentBookId(): string | null {
        return this.chapterContext.parentBookId;
    }
    get parentLanguage(): string | null {
        return this.chapterContext.parentLanguage;
    }
    get nextChapterId(): string | null {
        return this.chapterContext.nextChapterId;
    }
    get furthestReadPage(): number | null {
        return this.readerState.furthestReadPage;
    }

    nextPage(): void {
        if (this.book && this.navigationService.navigateToNextPage(this.book))
            this.uiService.scrollToTop(this.pageContent);
    }
    previousPage(): void {
        if (
            this.book &&
            this.navigationService.navigateToPreviousPage(this.book)
        )
            this.uiService.scrollToTop(this.pageContent);
    }
    onSliderChange(value: number): void {
        if (this.book)
            this.navigationService.updateSliderValue(this.book.id, value);
    }
    toggleMaintainTranslationLevel(): void {
        if (this.book)
            this.navigationService.toggleMaintainTranslationLevel(this.book.id);
    }

    getSentenceDisplay(sentence: Sentence): string {
        return this.navigationService.getSentenceDisplay(
            sentence,
            this.readerState.sliderValue,
        );
    }

    shouldShowNative(index: number): boolean {
        return this.currentPage
            ? this.navigationService.shouldShowNative(
                  this.currentPage,
                  index,
                  this.readerState.sliderValue,
              )
            : false;
    }

    isLastPage(): boolean {
        return (
            this.readerState.currentPageIndex ===
            (this.book?.pages.length || 0) - 1
        );
    }

    openSetProgressModal(): void {
        this.showSetProgressModal = true;
    }
    closeSetProgressModal(): void {
        this.showSetProgressModal = false;
    }

    confirmSetProgress(): void {
        if (this.book)
            this.navigationService.setProgress(
                this.book.id,
                this.readerState.currentPageIndex,
                this.book.pages.length,
            );
        this.closeSetProgressModal();
    }

    goToNextChapter(): void {
        if (this.book && this.chapterContext.nextChapterId) {
            this.navigationService.completeChapter(
                this.book.id,
                this.book.pages.length,
            );
            this.router.navigate([
                "/reader",
                this.chapterContext.nextChapterId,
            ]);
        }
    }

    @HostListener("window:keydown", ["$event"])
    handleKeyboardEvent(event: KeyboardEvent): void {
        if (!this.book) return;
        const handled = this.uiService.handleKeyboardNavigation(
            event.key,
            () => this.previousPage(),
            () => this.nextPage(),
            () =>
                this.navigationService.adjustSliderByKeyboard(this.book!.id, 5),
            () =>
                this.navigationService.adjustSliderByKeyboard(
                    this.book!.id,
                    -5,
                ),
        );
        if (handled) event.preventDefault();
    }
}
