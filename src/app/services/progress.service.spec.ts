import { TestBed } from '@angular/core/testing';

import { ProgressService, ReadingProgress } from './progress.service';

describe('ProgressService', () => {
    let service: ProgressService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ProgressService);
        // Clear localStorage before each test
        localStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return null for non-existent progress', () => {
        const progress = service.getProgress('non-existent-id');
        expect(progress).toBeNull();
    });

    it('should save and retrieve progress', () => {
        const testProgress: ReadingProgress = {
            currentPage: 5,
            totalPages: 10,
            percentage: 60,
            lastRead: new Date(),
        };

        service.saveProgress('test-id', testProgress);
        const retrieved = service.getProgress('test-id');

        expect(retrieved).toBeTruthy();
        expect(retrieved?.currentPage).toBe(5);
        expect(retrieved?.totalPages).toBe(10);
        expect(retrieved?.percentage).toBe(60);
    });

    it('should set progress point correctly', () => {
        service.setProgressPoint('chapter-1', 3, 10);
        const progress = service.getProgress('chapter-1');

        expect(progress).toBeTruthy();
        expect(progress?.currentPage).toBe(3);
        expect(progress?.totalPages).toBe(10);
        expect(progress?.percentage).toBe(40); // (3+1)/10 * 100 = 40%
    });

    it('should mark chapter as complete', () => {
        service.completeChapter('chapter-1', 10);
        const progress = service.getProgress('chapter-1');

        expect(progress).toBeTruthy();
        expect(progress?.currentPage).toBe(9);
        expect(progress?.totalPages).toBe(10);
        expect(progress?.percentage).toBe(100);
    });

    it('should calculate book progress correctly', () => {
        // Set up progress for 3 chapters
        service.setProgressPoint('chapter-1', 9, 10); // 100%
        service.setProgressPoint('chapter-2', 4, 10); // 50%
        service.setProgressPoint('chapter-3', 0, 10); // 10%

        const bookProgress = service.getBookProgress('book-1', [
            'chapter-1',
            'chapter-2',
            'chapter-3',
        ]);

        expect(bookProgress.chapters['chapter-1'].percentage).toBe(100);
        expect(bookProgress.chapters['chapter-2'].percentage).toBe(50);
        expect(bookProgress.chapters['chapter-3'].percentage).toBe(10);
        expect(bookProgress.isComplete).toBe(false);
    });

    it('should detect completed book', () => {
        // Mark all chapters as complete
        service.completeChapter('chapter-1', 10);
        service.completeChapter('chapter-2', 10);
        service.completeChapter('chapter-3', 10);

        const bookProgress = service.getBookProgress('book-1', [
            'chapter-1',
            'chapter-2',
            'chapter-3',
        ]);

        expect(bookProgress.isComplete).toBe(true);
    });

    it('should check if book without chapters is complete', () => {
        expect(service.isBookComplete('book-1')).toBe(false);

        service.completeChapter('book-1', 10);

        expect(service.isBookComplete('book-1')).toBe(true);
    });

    it('should get furthest page', () => {
        service.setProgressPoint('chapter-1', 7, 10);
        expect(service.getFurthestPage('chapter-1')).toBe(7);
        expect(service.getFurthestPage('non-existent')).toBe(0);
    });

    it('should get progress percentage', () => {
        service.setProgressPoint('chapter-1', 4, 10);
        expect(service.getProgressPercentage('chapter-1')).toBe(50);
        expect(service.getProgressPercentage('non-existent')).toBe(0);
    });
});
