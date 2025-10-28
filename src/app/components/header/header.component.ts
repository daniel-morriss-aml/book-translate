import { Component, input } from "@angular/core";
import { Router } from "@angular/router";
import { ArrowBigLeft, LucideAngularModule } from "lucide-angular";
import { Book, BookMetadata } from "../../models/book.model";
import { HamburgerMenuComponent } from "../hamburger-menu/hamburger-menu.component";

@Component({
    selector: "app-header",
    imports: [LucideAngularModule, HamburgerMenuComponent],
    templateUrl: "./header.component.html",
    styleUrl: "./header.component.css",
})
export class HeaderComponent {
    readonly fileIcon = ArrowBigLeft;
    book = input<Book | BookMetadata | null>(null);
    isChapterContext = input<boolean>(false);
    isLanguageSelectionContext = input<boolean>(false);
    parentBookId = input<string | null>(null);
    parentLanguage = input<string | null>(null);
    subHeading = input<string | null>(null);

    constructor(private router: Router) {}

    onBack(): void {
        if (this.isChapterContext() && this.parentBookId()) {
            // Navigate back to chapters page with language preserved
            if (this.parentLanguage()) {
                this.router.navigate(["/chapters", this.parentBookId(), this.parentLanguage()]);
            } else {
                this.router.navigate(["/chapters", this.parentBookId()]);
            }
        } else if (this.isLanguageSelectionContext() && this.parentBookId()) {
            // Navigate back to language selection page
            this.router.navigate(["/language", this.parentBookId()]);
        } else {
            // Navigate back to library
            this.router.navigate(["/"]);
        }
    }

    get backButtonText(): string {
        if (this.isChapterContext()) {
            return "Back to Chapters";
        } else if (this.isLanguageSelectionContext()) {
            return "Back to Languages";
        } else {
            return "Back to Library";
        }
    }
}
