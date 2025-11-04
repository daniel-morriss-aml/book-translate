import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Book, Page, Sentence } from '../models/book.model';
import { BookService } from './book.service';
import { ProgressService } from './progress.service';
import { SettingsService } from './settings.service';

export interface ReaderState {
    currentPageIndex: number;
    sliderValue: number;
    maintainTranslationLevel: boolean;
    furthestReadPage: number | null;
}

@Injectable({
    providedIn: 'root',
})
export class ReaderNavigationService {
    private bookService = inject(BookService);
    private progressService = inject(ProgressService);
    private settingsService = inject(SettingsService);

    private readerState = new BehaviorSubject<ReaderState>({
        currentPageIndex: 0,
        sliderValue: 100,
        maintainTranslationLevel: false,
        furthestReadPage: null,
    });

    getReaderState(): Observable<ReaderState> {
        return this.readerState.asObservable();
    }

    initializeReaderState(bookId: string): ReaderState {
        const sliderValue = this.bookService.getSliderValue(bookId);
        const maintainTranslationLevel = this.bookService.getMaintainTranslationLevel(bookId);
        const furthestReadPage = this.progressService.getFurthestPage(bookId);

        const state: ReaderState = {
            currentPageIndex: furthestReadPage,
            sliderValue,
            maintainTranslationLevel,
            furthestReadPage,
        };

        this.readerState.next(state);
        return state;
    }

    navigateToNextPage(book: Book): boolean {
        const currentState = this.readerState.value;
        const totalPages = book.pages.length;

        if (currentState.currentPageIndex < totalPages - 1) {
            const newState = {
                ...currentState,
                currentPageIndex: currentState.currentPageIndex + 1,
            };

            if (!currentState.maintainTranslationLevel) {
                newState.sliderValue = 100;
                this.saveSliderValue(book.id, 100);
            }

            this.updateProgress(book, newState.currentPageIndex, totalPages);
            this.readerState.next(newState);
            return true;
        }
        return false;
    }

    navigateToPreviousPage(book: Book): boolean {
        const currentState = this.readerState.value;

        if (currentState.currentPageIndex > 0) {
            const newState = {
                ...currentState,
                currentPageIndex: currentState.currentPageIndex - 1,
            };

            if (!currentState.maintainTranslationLevel) {
                newState.sliderValue = 100;
                this.saveSliderValue(book.id, 100);
            }

            this.readerState.next(newState);
            return true;
        }
        return false;
    }

    updateSliderValue(bookId: string, value: number): void {
        const currentState = this.readerState.value;
        const newState = {
            ...currentState,
            sliderValue: value,
        };

        this.saveSliderValue(bookId, value);
        this.readerState.next(newState);
    }

    toggleMaintainTranslationLevel(bookId: string): void {
        const currentState = this.readerState.value;
        const newValue = !currentState.maintainTranslationLevel;
        const newState = {
            ...currentState,
            maintainTranslationLevel: newValue,
        };

        this.bookService.saveMaintainTranslationLevel(bookId, newValue);
        this.readerState.next(newState);
    }

    shouldShowNative(page: Page, sentenceIndex: number, sliderValue: number): boolean {
        const settings = this.settingsService.getCurrentSettings();

        if (!settings.showTranslation) {
            return false;
        }

        const totalSentences = page.sentences.length;
        const threshold = (sliderValue / 100) * totalSentences;
        return sentenceIndex < threshold;
    }

    getSentenceDisplay(sentence: Sentence, sliderValue: number): string {
        if (sliderValue === 0) {
            return sentence.target;
        } else if (sliderValue === 100) {
            return sentence.native;
        }
        return sentence.target;
    }

    adjustSliderByKeyboard(bookId: string, increment: number): void {
        const currentState = this.readerState.value;
        const newValue = Math.max(0, Math.min(100, currentState.sliderValue + increment));
        this.updateSliderValue(bookId, newValue);
    }

    setProgress(bookId: string, pageIndex: number, totalPages: number): void {
        this.progressService.setProgressPoint(bookId, pageIndex, totalPages);

        const currentState = this.readerState.value;
        const newState = {
            ...currentState,
            furthestReadPage: pageIndex,
        };

        this.readerState.next(newState);
    }

    completeChapter(bookId: string, totalPages: number): void {
        this.progressService.completeChapter(bookId, totalPages);
    }

    private saveSliderValue(bookId: string, value: number): void {
        this.bookService.saveSliderValue(bookId, value);
    }

    private updateProgress(book: Book, currentPageIndex: number, totalPages: number): void {
        const currentState = this.readerState.value;

        if (
            currentState.furthestReadPage === null ||
            currentPageIndex > currentState.furthestReadPage
        ) {
            this.progressService.setProgressPoint(book.id, currentPageIndex, totalPages);

            const newState = {
                ...currentState,
                furthestReadPage: currentPageIndex,
            };

            this.readerState.next(newState);
        }
    }
}
