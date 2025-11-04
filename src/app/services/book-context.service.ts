import { Injectable, inject } from "@angular/core";
import { Observable, of } from "rxjs";
import { map, switchMap, catchError } from "rxjs/operators";
import { BookService } from "./book.service";
import { BookMetadata } from "../models/book.model";

export interface ChapterContext {
    isChapterContext: boolean;
    parentBookId: string | null;
    parentLanguage: string | null;
    nextChapterId: string | null;
}

@Injectable({
    providedIn: "root",
})
export class BookContextService {
    private bookService = inject(BookService);

    getChapterContext(bookId: string): Observable<ChapterContext> {
        // Check if this is a new format chapter ID (pattern: bookPrefix-LANG-NNN)
        const newFormatMatch = bookId.match(/^([a-z-]+)-([a-z]{2})-(\d+)$/);

        if (newFormatMatch) {
            return this.getNewFormatChapterContext(bookId, newFormatMatch);
        }

        // Legacy format
        return this.getLegacyChapterContext(bookId);
    }

    private getNewFormatChapterContext(
        bookId: string,
        match: RegExpMatchArray,
    ): Observable<ChapterContext> {
        const targetLang = match[2]; // e.g., 'de', 'en', 'es'

        return this.bookService.loadBookList().pipe(
            switchMap((books) => {
                // Find the book that has translations with this language
                const book = books.find((b) => {
                    if (!b.translations || b.translations.length === 0)
                        return false;
                    return b.translations.some((t) => t.code === targetLang);
                });

                if (!book || !book.translations) {
                    return of(this.createEmptyContext());
                }

                // Find the translation for the target language
                const translation = book.translations.find(
                    (t) => t.code === targetLang,
                );

                if (!translation || !translation.chaptersPath) {
                    return of(this.createEmptyContext());
                }

                // Load chapters to find the next chapter
                return this.bookService
                    .loadChapters(translation.chaptersPath)
                    .pipe(
                        map((chapters) => {
                            // Find current chapter index
                            const chapterIndex = chapters.findIndex(
                                (c) => c.id === bookId,
                            );

                            if (chapterIndex === -1) {
                                return this.createEmptyContext();
                            }

                            // Calculate next chapter ID if it exists
                            const nextChapterId =
                                chapterIndex < chapters.length - 1
                                    ? chapters[chapterIndex + 1].id
                                    : null;

                            return {
                                isChapterContext: true,
                                parentBookId: book.id,
                                parentLanguage: targetLang,
                                nextChapterId,
                            };
                        }),
                        catchError(() => of(this.createEmptyContext())),
                    );
            }),
            catchError(() => of(this.createEmptyContext())),
        );
    }

    private getLegacyChapterContext(
        bookId: string,
    ): Observable<ChapterContext> {
        return this.bookService.loadBookList().pipe(
            switchMap((books) => {
                const booksWithChapters = books.filter(
                    (b) => b.hasChapters && b.chaptersPath,
                );

                return this.searchLegacyBooks(booksWithChapters, bookId);
            }),
            catchError(() => of(this.createEmptyContext())),
        );
    }

    private searchLegacyBooks(
        books: BookMetadata[],
        bookId: string,
    ): Observable<ChapterContext> {
        const searchBook = (index: number): Observable<ChapterContext> => {
            if (index >= books.length) {
                return of(this.createEmptyContext());
            }

            const bookMetadata = books[index];
            return this.bookService
                .loadChapters(bookMetadata.chaptersPath!)
                .pipe(
                    map((chapters) => {
                        const chapterIndex = chapters.findIndex(
                            (c) => c.id === bookId,
                        );
                        if (chapterIndex !== -1) {
                            // Find next chapter if it exists
                            const nextChapterId =
                                chapterIndex < chapters.length - 1
                                    ? chapters[chapterIndex + 1].id
                                    : null;

                            return {
                                isChapterContext: true,
                                parentBookId: bookMetadata.id,
                                parentLanguage: null,
                                nextChapterId,
                            };
                        } else {
                            return this.createEmptyContext();
                        }
                    }),
                    switchMap((context) => {
                        if (context.isChapterContext) {
                            return of(context);
                        } else {
                            return searchBook(index + 1);
                        }
                    }),
                    catchError(() => searchBook(index + 1)),
                );
        };

        return searchBook(0);
    }

    private createEmptyContext(): ChapterContext {
        return {
            isChapterContext: false,
            parentBookId: null,
            parentLanguage: null,
            nextChapterId: null,
        };
    }
}
