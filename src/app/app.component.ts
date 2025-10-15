import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, CommonModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
    isDarkMode = false;

    constructor(private themeService: ThemeService) {}

    ngOnInit(): void {
        this.themeService.isDarkMode().subscribe((isDark) => {
            this.isDarkMode = isDark;
        });
    }

    toggleTheme(): void {
        this.themeService.toggleTheme();
    }
}
