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
