import { Injectable } from '@angular/core';

export interface ReadingProgress {
    currentPage: number; // Current page index (0-based)
    totalPages: number; // Total number of pages in the chapter/book
    percentage: number; // Progress percentage (0-100)
    lastRead: Date; // Timestamp of last read
}

export interface ChapterProgress {
    [chapterId: string]: ReadingProgress;
}

export interface BookProgress {
    chapters: ChapterProgress; // Progress for each chapter
    isComplete: boolean; // Whether all chapters are complete
}

@Injectable({
    providedIn: 'root',
})
export class ProgressService {
    private readonly PROGRESS_KEY_PREFIX = 'book-progress-';

    constructor() {}

    /**
     * Get reading progress for a specific chapter/book
     */
    getProgress(id: string): ReadingProgress | null {
        const stored = localStorage.getItem(`${this.PROGRESS_KEY_PREFIX}${id}`);
        if (!stored) {
            return null;
        }
        try {
            const progress = JSON.parse(stored);
            progress.lastRead = new Date(progress.lastRead);
            return progress;
        } catch (e) {
            console.error('Error parsing progress:', e);
            return null;
        }
    }

    /**
     * Save reading progress for a specific chapter/book
     */
    saveProgress(id: string, progress: ReadingProgress): void {
        localStorage.setItem(
            `${this.PROGRESS_KEY_PREFIX}${id}`,
            JSON.stringify(progress)
        );
    }

    /**
     * Set the current page as the furthest read page
     */
    setProgressPoint(id: string, currentPage: number, totalPages: number): void {
        const percentage = Math.round(((currentPage + 1) / totalPages) * 100);
        const progress: ReadingProgress = {
            currentPage,
            totalPages,
            percentage,
            lastRead: new Date(),
        };
        this.saveProgress(id, progress);
    }

    /**
     * Mark a chapter as complete (100% progress)
     */
    completeChapter(id: string, totalPages: number): void {
        const progress: ReadingProgress = {
            currentPage: totalPages - 1,
            totalPages,
            percentage: 100,
            lastRead: new Date(),
        };
        this.saveProgress(id, progress);
    }

    /**
     * Get all chapter progress for a book
     */
    getBookProgress(bookId: string, chapterIds: string[]): BookProgress {
        const chapters: ChapterProgress = {};
        let completedCount = 0;

        for (const chapterId of chapterIds) {
            const progress = this.getProgress(chapterId);
            if (progress) {
                chapters[chapterId] = progress;
                if (progress.percentage === 100) {
                    completedCount++;
                }
            }
        }

        return {
            chapters,
            isComplete: completedCount === chapterIds.length && chapterIds.length > 0,
        };
    }

    /**
     * Check if a book without chapters is complete
     */
    isBookComplete(bookId: string): boolean {
        const progress = this.getProgress(bookId);
        return progress?.percentage === 100 || false;
    }

    /**
     * Get the furthest read page for a chapter/book
     */
    getFurthestPage(id: string): number {
        const progress = this.getProgress(id);
        return progress?.currentPage || 0;
    }

    /**
     * Get progress percentage for display
     */
    getProgressPercentage(id: string): number {
        const progress = this.getProgress(id);
        return progress?.percentage || 0;
    }
}
