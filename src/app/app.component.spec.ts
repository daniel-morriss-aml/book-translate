import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppComponent],
            providers: [provideHttpClient(), provideHttpClientTesting()],
        }).compileComponents();
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });

    it('should initialize with loading state', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app.loading).toBe(true);
        expect(app.book).toBe(null);
    });

    it('should initialize slider value to 0', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app.sliderValue).toBe(0);
    });

    it('should handle keyboard events for page navigation', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;

        // Mock a loaded book with pages
        app.book = {
            id: 'test-book',
            title: 'Test Book',
            targetLanguage: 'English',
            nativeLanguage: 'Spanish',
            pages: [
                { pageNumber: 1, sentences: [] },
                { pageNumber: 2, sentences: [] },
            ],
        };
        app.loading = false;
        app.currentPageIndex = 0;

        const rightArrowEvent = new KeyboardEvent('keydown', {
            key: 'ArrowRight',
        });
        app.handleKeyboardEvent(rightArrowEvent);
        expect(app.currentPageIndex).toBe(1);

        const leftArrowEvent = new KeyboardEvent('keydown', {
            key: 'ArrowLeft',
        });
        app.handleKeyboardEvent(leftArrowEvent);
        expect(app.currentPageIndex).toBe(0);
    });

    it('should handle keyboard events for slider adjustment', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        app.sliderValue = 50;
        app.book = {
            id: 'test',
            title: 'Test',
            targetLanguage: 'EN',
            nativeLanguage: 'ES',
            pages: [],
        };

        const upArrowEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        app.handleKeyboardEvent(upArrowEvent);
        expect(app.sliderValue).toBe(55);

        const downArrowEvent = new KeyboardEvent('keydown', {
            key: 'ArrowDown',
        });
        app.handleKeyboardEvent(downArrowEvent);
        expect(app.sliderValue).toBe(50);
    });

    it('should not allow slider value below 0 or above 100', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        app.book = {
            id: 'test',
            title: 'Test',
            targetLanguage: 'EN',
            nativeLanguage: 'ES',
            pages: [],
        };

        app.sliderValue = 0;
        const downArrowEvent = new KeyboardEvent('keydown', {
            key: 'ArrowDown',
        });
        app.handleKeyboardEvent(downArrowEvent);
        expect(app.sliderValue).toBe(0);

        app.sliderValue = 100;
        const upArrowEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        app.handleKeyboardEvent(upArrowEvent);
        expect(app.sliderValue).toBe(100);
    });

    it('should initialize maintainTranslationLevel to false', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app.maintainTranslationLevel).toBe(false);
    });

    it('should reset slider to 0 when navigating pages with maintainTranslationLevel off', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        app.book = {
            id: 'test-book',
            title: 'Test Book',
            targetLanguage: 'English',
            nativeLanguage: 'Spanish',
            pages: [
                { pageNumber: 1, sentences: [] },
                { pageNumber: 2, sentences: [] },
            ],
        };
        app.maintainTranslationLevel = false;
        app.sliderValue = 50;
        app.currentPageIndex = 0;

        app.nextPage();
        expect(app.currentPageIndex).toBe(1);
        expect(app.sliderValue).toBe(0);

        app.sliderValue = 75;
        app.previousPage();
        expect(app.currentPageIndex).toBe(0);
        expect(app.sliderValue).toBe(0);
    });

    it('should maintain slider value when navigating pages with maintainTranslationLevel on', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        app.book = {
            id: 'test-book',
            title: 'Test Book',
            targetLanguage: 'English',
            nativeLanguage: 'Spanish',
            pages: [
                { pageNumber: 1, sentences: [] },
                { pageNumber: 2, sentences: [] },
            ],
        };
        app.maintainTranslationLevel = true;
        app.sliderValue = 50;
        app.currentPageIndex = 0;

        app.nextPage();
        expect(app.currentPageIndex).toBe(1);
        expect(app.sliderValue).toBe(50);

        app.sliderValue = 75;
        app.previousPage();
        expect(app.currentPageIndex).toBe(0);
        expect(app.sliderValue).toBe(75);
    });

    it('should toggle maintainTranslationLevel value', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        app.book = {
            id: 'test-book',
            title: 'Test Book',
            targetLanguage: 'English',
            nativeLanguage: 'Spanish',
            pages: [],
        };

        expect(app.maintainTranslationLevel).toBe(false);
        app.toggleMaintainTranslationLevel();
        expect(app.maintainTranslationLevel).toBe(true);
        app.toggleMaintainTranslationLevel();
        expect(app.maintainTranslationLevel).toBe(false);
    });
});
