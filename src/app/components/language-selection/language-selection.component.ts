import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookMetadata, LanguageTranslation } from '../../models/book.model';
import { BookService } from '../../services/book.service';
import { SettingsService } from '../../services/settings.service';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-language-selection',
  imports: [CommonModule, HeaderComponent],
  templateUrl: './language-selection.component.html',
  styleUrl: './language-selection.component.css'
})
export class LanguageSelectionComponent implements OnInit {
    book = signal<BookMetadata | null>(null);
    nativeLanguage = signal<string>('en');
    availableTranslations = signal<LanguageTranslation[]>([]);
    loading = signal<boolean>(true);
    error = signal<string | null>(null);

    constructor(
        private bookService: BookService,
        private settingsService: SettingsService,
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    ngOnInit(): void {
        // Get native language from settings
        this.nativeLanguage.set(
            this.settingsService.getCurrentSettings().nativeLanguage,
        );

        this.route.params.subscribe((params) => {
            const bookId = params['id'];
            if (bookId) {
                this.loadBook(bookId);
            } else {
                this.error.set('No book ID provided');
                this.loading.set(false);
            }
        });
    }

    loadBook(bookId: string): void {
        this.loading.set(true);
        this.bookService.loadBookList().subscribe({
            next: (books) => {
                const bookMetadata = books.find((b) => b.id === bookId);
                if (bookMetadata && bookMetadata.translations) {
                    this.book.set(bookMetadata);
                    // Filter out the native language from available translations
                    const filtered = bookMetadata.translations.filter(
                        (t) => t.code !== this.nativeLanguage(),
                    );
                    this.availableTranslations.set(filtered);
                    this.loading.set(false);
                } else {
                    this.error.set('Book not found or has no translations');
                    this.loading.set(false);
                }
            },
            error: (err) => {
                this.error.set('Failed to load book');
                this.loading.set(false);
                console.error('Error loading book:', err);
            },
        });
    }

    selectLanguage(translation: LanguageTranslation): void {
        const bookId = this.book()?.id;
        if (bookId) {
            // Navigate to chapters with language code
            this.router.navigate(['/chapters', bookId, translation.code]);
        }
    }

    getNativeLanguageName(): string {
        const nativeLang = this.book()?.translations?.find(
            (t) => t.code === this.nativeLanguage(),
        );
        return nativeLang?.name || 'English';
    }
}
