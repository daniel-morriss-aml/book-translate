import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Book, Page, Sentence } from './models/book.model';
import { BookService } from './services/book.service';

@Component({
    selector: 'app-root',
    imports: [CommonModule, FormsModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
    book: Book | null = null;
    currentPageIndex: number = 0;
    sliderValue: number = 0;
    loading: boolean = true;
    error: string | null = null;

    constructor(private bookService: BookService) {}

    ngOnInit(): void {
        this.loadBook();
    }

    loadBook(): void {
        this.loading = true;
        this.bookService.loadBook('assets/demo-book.json').subscribe({
            next: (book) => {
                this.book = book;
                this.sliderValue = this.bookService.getSliderValue(book.id);
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
        }
    }

    previousPage(): void {
        if (this.currentPageIndex > 0) {
            this.currentPageIndex--;
        }
    }

    onSliderChange(): void {
        if (this.book) {
            this.bookService.saveSliderValue(this.book.id, this.sliderValue);
        }
    }

    getSentenceDisplay(sentence: Sentence): string {
        const percentage = this.sliderValue;
        if (percentage === 0) {
            return sentence.target;
        } else if (percentage === 100) {
            return sentence.native;
        }
        // For intermediate values, we could show both or blend them
        // For simplicity, let's show target with native as overlay based on percentage
        return sentence.target;
    }

    shouldShowNative(index: number): boolean {
        if (!this.currentPage) return false;
        const totalSentences = this.currentPage.sentences.length;
        const threshold = (this.sliderValue / 100) * totalSentences;
        return index < threshold;
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
