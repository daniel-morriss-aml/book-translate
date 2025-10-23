import { provideHttpClient } from '@angular/common/http';
import {
    HttpTestingController,
    provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { BookReaderComponent } from './book-reader.component';

describe('BookReaderComponent', () => {
    let httpTestingController: HttpTestingController;
    let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BookReaderComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([]),
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({ id: 'demo-book-001' }),
                    },
                },
            ],
        }).compileComponents();

        httpTestingController = TestBed.inject(HttpTestingController);
        router = TestBed.inject(Router);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should create', () => {
        const fixture = TestBed.createComponent(BookReaderComponent);
        const component = fixture.componentInstance;
        expect(component).toBeTruthy();
    });

    it('should initialize with loading state', () => {
        const fixture = TestBed.createComponent(BookReaderComponent);
        const component = fixture.componentInstance;
        expect(component.loading).toBe(true);
        expect(component.book).toBe(null);
    });

    it('should initialize slider value to 0', () => {
        const fixture = TestBed.createComponent(BookReaderComponent);
        const component = fixture.componentInstance;
        expect(component.sliderValue).toBe(0);
    });

    it('should handle keyboard events for page navigation', () => {
        const fixture = TestBed.createComponent(BookReaderComponent);
        const component = fixture.componentInstance;

        component.book = {
            id: 'test-book',
            title: 'Test Book',
            targetLanguage: 'English',
            nativeLanguage: 'Spanish',
            pages: [
                { pageNumber: 1, sentences: [] },
                { pageNumber: 2, sentences: [] },
            ],
        };
        component.loading = false;
        component.currentPageIndex = 0;

        const rightArrowEvent = new KeyboardEvent('keydown', {
            key: 'ArrowRight',
        });
        component.handleKeyboardEvent(rightArrowEvent);
        expect(component.currentPageIndex).toBe(1);

        const leftArrowEvent = new KeyboardEvent('keydown', {
            key: 'ArrowLeft',
        });
        component.handleKeyboardEvent(leftArrowEvent);
        expect(component.currentPageIndex).toBe(0);
    });

    it('should handle keyboard events for slider adjustment', () => {
        const fixture = TestBed.createComponent(BookReaderComponent);
        const component = fixture.componentInstance;
        component.sliderValue = 50;
        component.book = {
            id: 'test',
            title: 'Test',
            targetLanguage: 'EN',
            nativeLanguage: 'ES',
            pages: [],
        };

        const upArrowEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        component.handleKeyboardEvent(upArrowEvent);
        expect(component.sliderValue).toBe(55);

        const downArrowEvent = new KeyboardEvent('keydown', {
            key: 'ArrowDown',
        });
        component.handleKeyboardEvent(downArrowEvent);
        expect(component.sliderValue).toBe(50);
    });

    it('should not allow slider value below 0 or above 100', () => {
        const fixture = TestBed.createComponent(BookReaderComponent);
        const component = fixture.componentInstance;
        component.book = {
            id: 'test',
            title: 'Test',
            targetLanguage: 'EN',
            nativeLanguage: 'ES',
            pages: [],
        };

        component.sliderValue = 0;
        const downArrowEvent = new KeyboardEvent('keydown', {
            key: 'ArrowDown',
        });
        component.handleKeyboardEvent(downArrowEvent);
        expect(component.sliderValue).toBe(0);

        component.sliderValue = 100;
        const upArrowEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        component.handleKeyboardEvent(upArrowEvent);
        expect(component.sliderValue).toBe(100);
    });

    it('should initialize maintainTranslationLevel to false', () => {
        const fixture = TestBed.createComponent(BookReaderComponent);
        const component = fixture.componentInstance;
        expect(component.maintainTranslationLevel).toBe(false);
    });

    it('should reset slider to 0 when navigating pages with maintainTranslationLevel off', () => {
        const fixture = TestBed.createComponent(BookReaderComponent);
        const component = fixture.componentInstance;
        component.book = {
            id: 'test-book',
            title: 'Test Book',
            targetLanguage: 'English',
            nativeLanguage: 'Spanish',
            pages: [
                { pageNumber: 1, sentences: [] },
                { pageNumber: 2, sentences: [] },
            ],
        };
        component.maintainTranslationLevel = false;
        component.sliderValue = 50;
        component.currentPageIndex = 0;

        component.nextPage();
        expect(component.currentPageIndex).toBe(1);
        expect(component.sliderValue).toBe(0);

        component.sliderValue = 75;
        component.previousPage();
        expect(component.currentPageIndex).toBe(0);
        expect(component.sliderValue).toBe(0);
    });

    it('should maintain slider value when navigating pages with maintainTranslationLevel on', () => {
        const fixture = TestBed.createComponent(BookReaderComponent);
        const component = fixture.componentInstance;
        component.book = {
            id: 'test-book',
            title: 'Test Book',
            targetLanguage: 'English',
            nativeLanguage: 'Spanish',
            pages: [
                { pageNumber: 1, sentences: [] },
                { pageNumber: 2, sentences: [] },
            ],
        };
        component.maintainTranslationLevel = true;
        component.sliderValue = 50;
        component.currentPageIndex = 0;

        component.nextPage();
        expect(component.currentPageIndex).toBe(1);
        expect(component.sliderValue).toBe(50);

        component.sliderValue = 75;
        component.previousPage();
        expect(component.currentPageIndex).toBe(0);
        expect(component.sliderValue).toBe(75);
    });

    it('should toggle maintainTranslationLevel value', () => {
        const fixture = TestBed.createComponent(BookReaderComponent);
        const component = fixture.componentInstance;
        component.book = {
            id: 'test-book',
            title: 'Test Book',
            targetLanguage: 'English',
            nativeLanguage: 'Spanish',
            pages: [],
        };

        expect(component.maintainTranslationLevel).toBe(false);
        component.toggleMaintainTranslationLevel();
        expect(component.maintainTranslationLevel).toBe(true);
        component.toggleMaintainTranslationLevel();
        expect(component.maintainTranslationLevel).toBe(false);
    });

    it('should scroll to top when navigating to next page', () => {
        const fixture = TestBed.createComponent(BookReaderComponent);
        const component = fixture.componentInstance;
        component.book = {
            id: 'test-book',
            title: 'Test Book',
            targetLanguage: 'English',
            nativeLanguage: 'Spanish',
            pages: [
                { pageNumber: 1, sentences: [] },
                { pageNumber: 2, sentences: [] },
            ],
        };
        component.currentPageIndex = 0;
        
        // Mock the scrollToTop method
        spyOn(component, 'scrollToTop');
        
        component.nextPage();
        
        expect(component.scrollToTop).toHaveBeenCalled();
    });

    it('should scroll to top when navigating to previous page', () => {
        const fixture = TestBed.createComponent(BookReaderComponent);
        const component = fixture.componentInstance;
        component.book = {
            id: 'test-book',
            title: 'Test Book',
            targetLanguage: 'English',
            nativeLanguage: 'Spanish',
            pages: [
                { pageNumber: 1, sentences: [] },
                { pageNumber: 2, sentences: [] },
            ],
        };
        component.currentPageIndex = 1;
        
        // Mock the scrollToTop method
        spyOn(component, 'scrollToTop');
        
        component.previousPage();
        
        expect(component.scrollToTop).toHaveBeenCalled();
    });

    // Removed: backToLibrary method no longer exists - functionality moved to header component
});
