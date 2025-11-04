import { provideHttpClient } from '@angular/common/http';
import {
    HttpTestingController,
    provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { BookReaderComponent } from './book-reader.component';

describe('BookReaderComponent', () => {
    let component: BookReaderComponent;
    let fixture: ComponentFixture<BookReaderComponent>;
    let httpTestingController: HttpTestingController;

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
        fixture = TestBed.createComponent(BookReaderComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
        expect(component.loading).toBe(true);
        expect(component.error).toBe(null);
        expect(component.book).toBe(null);
    });
});
