import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookMetadata, ChapterMetadata } from '../../models/book.model';
import { BookService } from '../../services/book.service';
import { ProgressService } from '../../services/progress.service';

@Component({
    selector: 'app-chapters',
    imports: [CommonModule],
    templateUrl: './chapters.component.html',
    styleUrl: './chapters.component.css',
})
export class ChaptersComponent implements OnInit {
    book: BookMetadata | null = null;
    chapters: ChapterMetadata[] = [];
    loading: boolean = true;
    error: string | null = null;

    constructor(
        private bookService: BookService,
        private progressService: ProgressService,
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            const bookId = params['id'];
            if (bookId) {
                this.loadChapters(bookId);
            } else {
                this.error = 'No book ID provided';
                this.loading = false;
            }
        });
    }

    loadChapters(bookId: string): void {
        this.loading = true;
        // Load book list to find the book metadata
        this.bookService.loadBookList().subscribe({
            next: (books) => {
                const bookMetadata = books.find((b) => b.id === bookId);
                if (bookMetadata && bookMetadata.hasChapters && bookMetadata.chaptersPath) {
                    this.book = bookMetadata;
                    // Load chapters
                    this.bookService.loadChapters(bookMetadata.chaptersPath).subscribe({
                        next: (chapters) => {
                            this.chapters = chapters;
                            this.loading = false;
                        },
                        error: (err) => {
                            this.error = 'Failed to load chapters';
                            this.loading = false;
                            console.error('Error loading chapters:', err);
                        },
                    });
                } else {
                    this.error = 'Book not found or does not have chapters';
                    this.loading = false;
                }
            },
            error: (err) => {
                this.error = 'Failed to load book';
                this.loading = false;
                console.error('Error loading book:', err);
            },
        });
    }

    openChapter(chapter: ChapterMetadata): void {
        this.router.navigate(['/reader', chapter.id]);
    }

    backToLibrary(): void {
        this.router.navigate(['/']);
    }

    getChapterProgress(chapterId: string): number {
        return this.progressService.getProgressPercentage(chapterId);
    }

    isChapterComplete(chapterId: string): boolean {
        return this.getChapterProgress(chapterId) === 100;
    }
}
