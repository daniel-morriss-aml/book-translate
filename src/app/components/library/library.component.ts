import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookMetadata } from '../../models/book.model';
import { BookService } from '../../services/book.service';

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
        this.router.navigate(['/reader', book.id]);
    }
}
