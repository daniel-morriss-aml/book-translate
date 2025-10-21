import { Component, input } from '@angular/core';
import { Router } from '@angular/router';
import { ArrowBigLeft, LucideAngularModule } from 'lucide-angular';
import { Book, BookMetadata } from '../../models/book.model';

@Component({
    selector: 'app-header',
    imports: [LucideAngularModule],
    templateUrl: './header.component.html',
    styleUrl: './header.component.css',
})
export class HeaderComponent {
    readonly fileIcon = ArrowBigLeft;
    book = input<Book | BookMetadata | null>(null);
    isChapterContext = input<boolean>(false);
    parentBookId = input<string | null>(null);
    subHeading = input<string | null>(null);

    constructor(private router: Router) {}

    onBack(): void {
        if (this.isChapterContext() && this.parentBookId()) {
            // Navigate back to chapters page
            this.router.navigate(['/chapters', this.parentBookId()]);
        } else {
            // Navigate back to library
            this.router.navigate(['/']);
        }
    }

    get backButtonText(): string {
        return this.isChapterContext() ? 'Back to Chapters' : 'Back to Library';
    }
}
