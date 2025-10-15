import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    private isDarkMode$ = new BehaviorSubject<boolean>(this.getInitialTheme());

    constructor() {
        this.applyTheme(this.isDarkMode$.value);
    }

    private getInitialTheme(): boolean {
        const stored = localStorage.getItem('theme');
        if (stored) {
            return stored === 'dark';
        }
        // Check system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    isDarkMode(): Observable<boolean> {
        return this.isDarkMode$.asObservable();
    }

    toggleTheme(): void {
        const newValue = !this.isDarkMode$.value;
        this.isDarkMode$.next(newValue);
        this.applyTheme(newValue);
        localStorage.setItem('theme', newValue ? 'dark' : 'light');
    }

    private applyTheme(isDark: boolean): void {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
}
