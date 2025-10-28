import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Book, BookMetadata, ChapterMetadata } from "../models/book.model";

@Injectable({
    providedIn: "root",
})
export class BookService {
    constructor(private http: HttpClient) {}

    loadBookList(): Observable<BookMetadata[]> {
        return this.http.get<BookMetadata[]>("assets/books.json");
    }

    loadChapters(chaptersPath: string): Observable<ChapterMetadata[]> {
        return this.http.get<ChapterMetadata[]>(chaptersPath);
    }

    loadBook(bookPath: string): Observable<Book> {
        return this.http.get<Book>(bookPath);
    }

    getSliderValue(bookId: string): number {
        const stored = localStorage.getItem(`slider-${bookId}`);
        return stored ? parseInt(stored, 10) : 100;
    }

    saveSliderValue(bookId: string, value: number): void {
        localStorage.setItem(`slider-${bookId}`, value.toString());
    }

    getMaintainTranslationLevel(bookId: string): boolean {
        const stored = localStorage.getItem(`maintain-translation-${bookId}`);
        return stored === "true";
    }

    saveMaintainTranslationLevel(bookId: string, value: boolean): void {
        localStorage.setItem(
            `maintain-translation-${bookId}`,
            value.toString(),
        );
    }
}
