import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookMetadata } from '../../models/book.model';
import { BookService } from '../../services/book.service';
import { ProgressService } from '../../services/progress.service';

@Component({
    selector: 'app-library',
    imports: [CommonModule],
    templateUrl: './library.component.html',
    styleUrl: './library.component.css',
})
export class LibraryComponent implements OnInit {
    books: BookMetadata[] = [];
    loading: boolean = true;
    error: string | null = null;

    constructor(
        private bookService: BookService,
        private progressService: ProgressService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadBooks();
    }

    loadBooks(): void {
        this.loading = true;
        this.bookService.loadBookList().subscribe({
            next: (books) => {
                this.books = books;
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to load book library';
                this.loading = false;
                console.error('Error loading books:', err);
            },
        });
    }

    openBook(book: BookMetadata): void {
        if (book.hasChapters) {
            this.router.navigate(['/chapters', book.id]);
        } else {
            this.router.navigate(['/reader', book.id]);
        }
    }

    isBookComplete(book: BookMetadata): boolean {
        if (book.hasChapters && book.chaptersPath) {
            // For books with chapters, we need to check all chapters
            // This is a simplified check - in a real app, we'd load chapters first
            // For now, we'll just check if there's any progress stored
            return false; // Will be properly implemented when chapters are loaded
        } else {
            // For books without chapters, check the book itself
            return this.progressService.isBookComplete(book.id);
        }
    }
}
