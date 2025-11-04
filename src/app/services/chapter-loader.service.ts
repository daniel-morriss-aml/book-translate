import { Injectable, inject } from "@angular/core";
import { Observable, forkJoin } from "rxjs";
import { map, switchMap, catchError } from "rxjs/operators";
import {
    Book,
    Page,
    Sentence,
    BookMetadata,
    ChapterContent,
} from "../models/book.model";
import { BookService } from "./book.service";
import { SettingsService } from "./settings.service";

interface Translation {
    code: string;
    name: string;
    title: string;
    chaptersPath?: string;
}

interface BookWithTranslations extends BookMetadata {
    translations?: Translation[];
}

@Injectable({
    providedIn: "root",
})
export class ChapterLoaderService {
    private bookService = inject(BookService);
    private settingsService = inject(SettingsService);

    loadBookById(bookId: string): Observable<Book> {
        return this.bookService.loadBookList().pipe(
            switchMap((books) => {
                const bookMetadata = books.find((b) => b.id === bookId);
                if (bookMetadata) {
                    return this.bookService.loadBook(bookMetadata.path);
                } else {
                    // If not found in books, try loading as chapter
                    return this.loadChapterById(bookId, books);
                }
            }),
        );
    }

    private loadChapterById(
        chapterId: string,
        books: BookMetadata[],
    ): Observable<Book> {
        // Check if this is a new multi-language chapter ID (pattern: pap-LANG-NNN)
        const newFormatMatch = chapterId.match(/^([a-z-]+)-([a-z]{2})-(\d+)$/);

        if (newFormatMatch) {
            return this.loadNewFormatChapter(chapterId, newFormatMatch, books);
        }

        // Legacy format handling
        return this.loadLegacyChapter(chapterId, books);
    }

    private loadNewFormatChapter(
        chapterId: string,
        match: RegExpMatchArray,
        books: BookMetadata[],
    ): Observable<Book> {
        const targetLang = match[2]; // e.g., 'de', 'en', 'es'
        const chapterNum = match[3]; // e.g., '001'

        // Find the book by checking if any translation's chapter ID pattern matches
        const book = books.find((b) => {
            const bookWithTranslations = b as BookWithTranslations;
            if (
                !bookWithTranslations.translations ||
                bookWithTranslations.translations.length === 0
            )
                return false;
            return bookWithTranslations.translations.some(
                (t) => t.code === targetLang,
            );
        }) as BookWithTranslations | undefined;

        if (!book || !book.translations) {
            throw new Error("Book not found");
        }

        const currentSettings = this.settingsService.getCurrentSettings();
        const targetTranslation = book.translations.find(
            (t) => t.code === targetLang,
        );
        const nativeLanguage = currentSettings.nativeLanguage;
        const nativeTranslation = book.translations.find(
            (t) => t.code === nativeLanguage,
        );

        if (!targetTranslation || !nativeTranslation) {
            throw new Error("Translation not found");
        }

        // Build paths to chapter files
        const basePath = `assets/${book.id}`;
        const targetPath = `${basePath}/${targetLang}/chapter-${parseInt(chapterNum, 10)}.json`;
        const nativePath = `${basePath}/${nativeLanguage}/chapter-${parseInt(chapterNum, 10)}.json`;

        // Load both chapters
        return forkJoin([
            this.bookService.loadChapterContent(targetPath),
            this.bookService.loadChapterContent(nativePath),
        ]).pipe(
            map(([targetContent, nativeContent]) => {
                return this.createBookFromChapterContent(
                    chapterId,
                    targetContent,
                    nativeContent,
                    targetTranslation,
                    nativeTranslation,
                    parseInt(chapterNum, 10),
                    currentSettings.sentencesPerPage,
                );
            }),
        );
    }

    private loadLegacyChapter(
        chapterId: string,
        books: BookMetadata[],
    ): Observable<Book> {
        const booksWithChapters = books.filter(
            (b) => b.hasChapters && (b.chaptersPath || b.translations),
        );

        if (booksWithChapters.length === 0) {
            throw new Error("Book not found");
        }

        return this.searchBooksForChapter(booksWithChapters, chapterId);
    }

    private searchBooksForChapter(
        books: BookMetadata[],
        chapterId: string,
    ): Observable<Book> {
        const searchBook = (index: number): Observable<Book> => {
            if (index >= books.length) {
                throw new Error("Book not found");
            }

            const book = books[index];

            if (book.translations) {
                return this.searchTranslationChapters(book, chapterId).pipe(
                    catchError(() => searchBook(index + 1)),
                );
            } else if (book.chaptersPath) {
                return this.bookService.loadChapters(book.chaptersPath).pipe(
                    switchMap((chapters) => {
                        const chapter = chapters.find(
                            (c) => c.id === chapterId,
                        );
                        if (chapter) {
                            return this.bookService.loadBook(chapter.path);
                        } else {
                            return searchBook(index + 1);
                        }
                    }),
                    catchError(() => searchBook(index + 1)),
                );
            } else {
                return searchBook(index + 1);
            }
        };

        return searchBook(0);
    }

    private searchTranslationChapters(
        book: BookWithTranslations,
        chapterId: string,
    ): Observable<Book> {
        const searchTranslation = (index: number): Observable<Book> => {
            if (!book.translations || index >= book.translations.length) {
                throw new Error("Chapter not found in translations");
            }

            const translation = book.translations[index];
            if (!translation.chaptersPath) {
                return searchTranslation(index + 1);
            }

            return this.bookService.loadChapters(translation.chaptersPath).pipe(
                switchMap((chapters) => {
                    const chapter = chapters.find((c) => c.id === chapterId);
                    if (chapter) {
                        // Check if it's new format and handle accordingly
                        const newFormatMatch = chapterId.match(
                            /^([a-z-]+)-([a-z]{2})-(\d+)$/,
                        );
                        if (newFormatMatch) {
                            return this.loadNewFormatChapter(
                                chapterId,
                                newFormatMatch,
                                [book],
                            );
                        } else {
                            return this.bookService.loadBook(chapter.path);
                        }
                    } else {
                        return searchTranslation(index + 1);
                    }
                }),
                catchError(() => searchTranslation(index + 1)),
            );
        };

        return searchTranslation(0);
    }

    private createBookFromChapterContent(
        chapterId: string,
        targetContent: ChapterContent,
        nativeContent: ChapterContent,
        targetTranslation: Translation,
        nativeTranslation: Translation,
        chapterNum: number,
        sentencesPerPage: number,
    ): Book {
        const pages: Page[] = [];
        const targetSentences = targetContent.sentences;
        const nativeSentences = nativeContent.sentences;
        const totalSentences = Math.max(
            targetSentences.length,
            nativeSentences.length,
        );

        // Create pages by grouping sentences
        for (let i = 0; i < totalSentences; i += sentencesPerPage) {
            const pageSentences: Sentence[] = [];

            for (
                let j = 0;
                j < sentencesPerPage && i + j < totalSentences;
                j++
            ) {
                const idx = i + j;
                pageSentences.push({
                    target: targetSentences[idx]?.sentence || "",
                    native: nativeSentences[idx]?.sentence || "",
                });
            }

            pages.push({
                pageNumber: pages.length + 1,
                sentences: pageSentences,
            });
        }

        return {
            id: chapterId,
            title: `${targetTranslation.title} - Chapter ${chapterNum}`,
            targetLanguage: targetTranslation.name,
            nativeLanguage: nativeTranslation.name,
            pages: pages,
        };
    }
}
