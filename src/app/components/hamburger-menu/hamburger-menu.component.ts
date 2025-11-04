import { CommonModule } from "@angular/common";
import { Component, OnInit, signal, inject } from "@angular/core";
import {
    Menu,
    X,
    Moon,
    Sun,
    BarChart3,
    Sliders,
    Settings,
    Languages,
    LucideAngularModule,
} from "lucide-angular";
import { SettingsService, UserSettings } from "../../services/settings.service";
import { ThemeService } from "../../services/theme.service";

@Component({
    selector: "app-hamburger-menu",
    imports: [CommonModule, LucideAngularModule],
    templateUrl: "./hamburger-menu.component.html",
    styleUrl: "./hamburger-menu.component.css",
})
export class HamburgerMenuComponent implements OnInit {
    readonly menuIcon = Menu;
    readonly closeIcon = X;
    readonly moonIcon = Moon;
    readonly sunIcon = Sun;
    readonly chartIcon = BarChart3;
    readonly slidersIcon = Sliders;
    readonly settingsIcon = Settings;
    readonly languagesIcon = Languages;

    isMenuOpen = signal(false);
    settings = signal<UserSettings>({
        showProgressIndicator: false,
        showTranslationSlider: false,
        darkMode: false,
        showTranslation: true,
        sentencesPerPage: 8,
        nativeLanguage: "en",
    });

    private settingsService = inject(SettingsService);
    private themeService = inject(ThemeService);

    ngOnInit(): void {
        // Subscribe to settings changes
        this.settingsService.getSettings().subscribe((settings) => {
            this.settings.set(settings);
        });
    }

    toggleMenu(): void {
        this.isMenuOpen.update((open) => !open);
    }

    closeMenu(): void {
        this.isMenuOpen.set(false);
    }

    toggleDarkMode(): void {
        this.themeService.toggleTheme();
        this.settingsService.toggleDarkMode();
    }

    toggleProgressIndicator(): void {
        this.settingsService.toggleProgressIndicator();
    }

    toggleTranslationSlider(): void {
        this.settingsService.toggleTranslationSlider();
    }

    toggleShowTranslation(): void {
        this.settingsService.toggleShowTranslation();
    }

    onNativeLanguageChange(event: Event): void {
        const target = event.target as HTMLSelectElement;
        this.settingsService.updateNativeLanguage(target.value);
    }

    onSentencesPerPageChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.settingsService.updateSentencesPerPage(parseInt(target.value, 10));
    }
}
