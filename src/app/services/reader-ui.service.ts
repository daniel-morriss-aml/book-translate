import { Injectable, ElementRef } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ReaderUIService {
    scrollToTop(pageContent?: ElementRef): void {
        if (pageContent) {
            pageContent.nativeElement.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        }
    }

    isLastPage(currentPageIndex: number, totalPages: number): boolean {
        return currentPageIndex === totalPages - 1;
    }

    handleKeyboardNavigation(
        key: string,
        onPreviousPage: () => void,
        onNextPage: () => void,
        onSliderUp: () => void,
        onSliderDown: () => void
    ): boolean {
        switch (key) {
            case 'ArrowLeft':
                onPreviousPage();
                return true;
            case 'ArrowRight':
                onNextPage();
                return true;
            case 'ArrowUp':
                onSliderUp();
                return true;
            case 'ArrowDown':
                onSliderDown();
                return true;
            default:
                return false;
        }
    }
}
