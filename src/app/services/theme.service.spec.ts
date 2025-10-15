import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
    let service: ThemeService;

    beforeEach(() => {
        localStorage.clear();
        document.documentElement.classList.remove('dark');
        TestBed.configureTestingModule({});
        service = TestBed.inject(ThemeService);
    });

    afterEach(() => {
        localStorage.clear();
        document.documentElement.classList.remove('dark');
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize with light mode when no preference stored', () => {
        service.isDarkMode().subscribe((isDark) => {
            expect(isDark).toBe(false);
        });
    });

    it('should toggle theme from light to dark', () => {
        service.toggleTheme();
        service.isDarkMode().subscribe((isDark) => {
            expect(isDark).toBe(true);
        });
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(localStorage.getItem('theme')).toBe('dark');
    });

    it('should toggle theme from dark to light', () => {
        service.toggleTheme(); // dark
        service.toggleTheme(); // light
        service.isDarkMode().subscribe((isDark) => {
            expect(isDark).toBe(false);
        });
        expect(document.documentElement.classList.contains('dark')).toBe(false);
        expect(localStorage.getItem('theme')).toBe('light');
    });

    it('should persist theme preference to localStorage', () => {
        service.toggleTheme();
        expect(localStorage.getItem('theme')).toBe('dark');

        service.toggleTheme();
        expect(localStorage.getItem('theme')).toBe('light');
    });

    it('should read theme from localStorage on initialization', () => {
        localStorage.setItem('theme', 'dark');
        const newService = new ThemeService();
        newService.isDarkMode().subscribe((isDark) => {
            expect(isDark).toBe(true);
        });
    });
});
