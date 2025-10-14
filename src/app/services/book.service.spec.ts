import { provideHttpClient } from '@angular/common/http';
import {
    HttpTestingController,
    provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Book } from '../models/book.model';
import { BookService } from './book.service';

describe('BookService', () => {
    let service: BookService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                BookService,
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        });
        service = TestBed.inject(BookService);
        httpMock = TestBed.inject(HttpTestingController);

        // Clear localStorage before each test
        localStorage.clear();
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should load book data', () => {
        const mockBook: Book = {
            id: 'test-book',
            title: 'Test Book',
            targetLanguage: 'English',
            nativeLanguage: 'Spanish',
            pages: [
                {
                    pageNumber: 1,
                    sentences: [{ target: 'Hello', native: 'Hola' }],
                },
            ],
        };

        service.loadBook('assets/test-book.json').subscribe((book) => {
            expect(book).toEqual(mockBook);
        });

        const req = httpMock.expectOne('assets/test-book.json');
        expect(req.request.method).toBe('GET');
        req.flush(mockBook);
    });

    it('should get slider value from localStorage', () => {
        localStorage.setItem('slider-test-book', '75');
        const value = service.getSliderValue('test-book');
        expect(value).toBe(75);
    });

    it('should return 0 if no slider value stored', () => {
        const value = service.getSliderValue('non-existent-book');
        expect(value).toBe(0);
    });

    it('should save slider value to localStorage', () => {
        service.saveSliderValue('test-book', 50);
        const stored = localStorage.getItem('slider-test-book');
        expect(stored).toBe('50');
    });

    it('should update slider value in localStorage', () => {
        service.saveSliderValue('test-book', 25);
        expect(localStorage.getItem('slider-test-book')).toBe('25');

        service.saveSliderValue('test-book', 75);
        expect(localStorage.getItem('slider-test-book')).toBe('75');
    });

    it('should get maintainTranslationLevel from localStorage', () => {
        localStorage.setItem('maintain-translation-test-book', 'true');
        const value = service.getMaintainTranslationLevel('test-book');
        expect(value).toBe(true);
    });

    it('should return false if no maintainTranslationLevel stored', () => {
        const value = service.getMaintainTranslationLevel('non-existent-book');
        expect(value).toBe(false);
    });

    it('should save maintainTranslationLevel to localStorage', () => {
        service.saveMaintainTranslationLevel('test-book', true);
        const stored = localStorage.getItem('maintain-translation-test-book');
        expect(stored).toBe('true');

        service.saveMaintainTranslationLevel('test-book', false);
        const stored2 = localStorage.getItem('maintain-translation-test-book');
        expect(stored2).toBe('false');
    });
});
