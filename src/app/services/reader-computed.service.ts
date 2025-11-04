import { Injectable } from '@angular/core';
import { Book } from '../models/book.model';
import { ReaderState } from './reader-navigation.service';
import { ChapterContext } from './book-context.service';

@Injectable({
    providedIn: 'root',
})
export class ReaderComputedService {
    getCurrentPageIndex(state: ReaderState): number {
        return state.currentPageIndex;
    }

    getTotalPages(book: Book | null): number {
        return book?.pages.length || 0;
    }

    getSliderValue(state: ReaderState): number {
        return state.sliderValue;
    }

    getMaintainTranslationLevel(state: ReaderState): boolean {
        return state.maintainTranslationLevel;
    }

    getIsChapterContext(context: ChapterContext): boolean {
        return context.isChapterContext;
    }

    getParentBookId(context: ChapterContext): string | null {
        return context.parentBookId;
    }

    getParentLanguage(context: ChapterContext): string | null {
        return context.parentLanguage;
    }

    getNextChapterId(context: ChapterContext): string | null {
        return context.nextChapterId;
    }

    getFurthestReadPage(state: ReaderState): number | null {
        return state.furthestReadPage;
    }

    isLastPage(currentPageIndex: number, totalPages: number): boolean {
        return currentPageIndex === totalPages - 1;
    }
}
