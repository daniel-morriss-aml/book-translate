import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { LibraryComponent } from './library.component';
import { BookMetadata } from '../../models/book.model';

describe('LibraryComponent', () => {
    let httpTestingController: HttpTestingController;
    let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LibraryComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([]),
            ],
        }).compileComponents();

        httpTestingController = TestBed.inject(HttpTestingController);
        router = TestBed.inject(Router);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should create', () => {
        const fixture = TestBed.createComponent(LibraryComponent);
        const component = fixture.componentInstance;
        expect(component).toBeTruthy();
    });

    it('should initialize with loading state', () => {
        const fixture = TestBed.createComponent(LibraryComponent);
        const component = fixture.componentInstance;
        expect(component.loading).toBe(true);
    });

    it('should load book list on init', () => {
        const fixture = TestBed.createComponent(LibraryComponent);
        const component = fixture.componentInstance;
        
        const mockBooks: BookMetadata[] = [
            {
                id: 'book1',
                title: 'Test Book',
                targetLanguage: 'English',
                nativeLanguage: 'Spanish',
                path: 'assets/book1.json',
                coverImage: '',
                description: 'Test description'
            }
        ];

        fixture.detectChanges();

        const req = httpTestingController.expectOne('assets/books.json');
        expect(req.request.method).toBe('GET');
        req.flush(mockBooks);

        expect(component.books).toEqual(mockBooks);
        expect(component.loading).toBe(false);
    });

    it('should handle error when loading books fails', () => {
        const fixture = TestBed.createComponent(LibraryComponent);
        const component = fixture.componentInstance;

        fixture.detectChanges();

        const req = httpTestingController.expectOne('assets/books.json');
        req.error(new ProgressEvent('error'));

        expect(component.error).toBe('Failed to load book library');
        expect(component.loading).toBe(false);
    });

    it('should navigate to reader when opening a book', () => {
        const fixture = TestBed.createComponent(LibraryComponent);
        const component = fixture.componentInstance;
        const navigateSpy = spyOn(router, 'navigate');

        const mockBook: BookMetadata = {
            id: 'book1',
            title: 'Test Book',
            targetLanguage: 'English',
            nativeLanguage: 'Spanish',
            path: 'assets/book1.json',
            coverImage: '',
            description: 'Test description'
        };

        component.openBook(mockBook);

        expect(navigateSpy).toHaveBeenCalledWith(['/reader', 'book1']);
    });
});
