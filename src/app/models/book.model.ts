export interface Sentence {
    target: string;
    native: string;
}

export interface Page {
    pageNumber: number;
    sentences: Sentence[];
}

export interface Book {
    id: string;
    title: string;
    targetLanguage: string;
    nativeLanguage: string;
    pages: Page[];
}

// New structure for chapter content with sentences array
export interface ChapterSentence {
    index: number;
    sentence: string;
}

export interface ChapterContent {
    sentences: ChapterSentence[];
}

export interface ChapterMetadata {
    id: string;
    title: string;
    path: string;
}

// Language translation option for a book
export interface LanguageTranslation {
    code: string; // e.g., 'en', 'de', 'es'
    name: string; // e.g., 'English', 'German', 'Spanish'
    title: string; // Translated book title
    chaptersPath?: string; // Path to chapters JSON for this language
}

export interface BookMetadata {
    id: string;
    title: string;
    targetLanguage: string;
    nativeLanguage: string;
    path: string;
    coverImage: string;
    description: string;
    hasChapters?: boolean;
    chaptersPath?: string;
    // New fields for multi-language support
    translations?: LanguageTranslation[];
    baseTitle?: string; // e.g., "Pride and Prejudice" without language suffix
}
