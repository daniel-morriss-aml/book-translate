import { CommonModule } from "@angular/common";
import { Component, OnInit, signal, computed } from "@angular/core";
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
    template: `
        <div class="relative">
            <!-- Menu Button -->
            <button
                (click)="toggleMenu()"
                class="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                [attr.aria-label]="isMenuOpen() ? 'Close menu' : 'Open menu'"
                [attr.aria-expanded]="isMenuOpen()"
            >
                <lucide-angular
                    [img]="isMenuOpen() ? closeIcon : menuIcon"
                    [size]="20"
                ></lucide-angular>
            </button>

            <!-- Menu Dropdown -->
            @if (isMenuOpen()) {
                <div
                    class="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
                >
                    <!-- Menu Header -->
                    <div
                        class="px-4 py-3 border-b border-gray-200 dark:border-gray-700"
                    >
                        <div class="flex items-center gap-2">
                            <lucide-angular
                                [img]="settingsIcon"
                                [size]="16"
                            ></lucide-angular>
                            <h3
                                class="text-sm font-medium text-gray-800 dark:text-gray-200"
                            >
                                Display Settings
                            </h3>
                        </div>
                    </div>

                    <!-- Menu Items -->
                    <div class="py-2">
                        <!-- Dark Mode Toggle -->
                        <button
                            (click)="toggleDarkMode()"
                            class="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div class="flex items-center gap-3">
                                <lucide-angular
                                    [img]="
                                        settings().darkMode ? moonIcon : sunIcon
                                    "
                                    [size]="16"
                                    class="text-gray-500 dark:text-gray-400"
                                ></lucide-angular>
                                <span
                                    class="text-sm text-gray-700 dark:text-gray-300"
                                >
                                    {{
                                        settings().darkMode
                                            ? "Dark Mode"
                                            : "Light Mode"
                                    }}
                                </span>
                            </div>
                            <div class="relative">
                                <input
                                    type="checkbox"
                                    [checked]="settings().darkMode"
                                    readonly
                                    class="sr-only"
                                />
                                <div
                                    class="w-10 h-6 bg-gray-200 dark:bg-gray-600 rounded-full relative transition-colors"
                                    [class.bg-blue-600]="settings().darkMode"
                                >
                                    <div
                                        class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                                        [class.translate-x-4]="
                                            settings().darkMode
                                        "
                                    ></div>
                                </div>
                            </div>
                        </button>

                        <!-- Progress Indicator Toggle -->
                        <button
                            (click)="toggleProgressIndicator()"
                            class="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div class="flex items-center gap-3">
                                <lucide-angular
                                    [img]="chartIcon"
                                    [size]="16"
                                    class="text-gray-500 dark:text-gray-400"
                                ></lucide-angular>
                                <span
                                    class="text-sm text-gray-700 dark:text-gray-300"
                                >
                                    Reading Progress
                                </span>
                            </div>
                            <div class="relative">
                                <input
                                    type="checkbox"
                                    [checked]="settings().showProgressIndicator"
                                    readonly
                                    class="sr-only"
                                />
                                <div
                                    class="w-10 h-6 bg-gray-200 dark:bg-gray-600 rounded-full relative transition-colors"
                                    [class.bg-blue-600]="
                                        settings().showProgressIndicator
                                    "
                                >
                                    <div
                                        class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                                        [class.translate-x-4]="
                                            settings().showProgressIndicator
                                        "
                                    ></div>
                                </div>
                            </div>
                        </button>

                        <!-- Translation Slider Toggle -->
                        <button
                            (click)="toggleTranslationSlider()"
                            class="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div class="flex items-center gap-3">
                                <lucide-angular
                                    [img]="slidersIcon"
                                    [size]="16"
                                    class="text-gray-500 dark:text-gray-400"
                                ></lucide-angular>
                                <span
                                    class="text-sm text-gray-700 dark:text-gray-300"
                                >
                                    Translation Slider
                                </span>
                            </div>
                            <div class="relative">
                                <input
                                    type="checkbox"
                                    [checked]="settings().showTranslationSlider"
                                    readonly
                                    class="sr-only"
                                />
                                <div
                                    class="w-10 h-6 bg-gray-200 dark:bg-gray-600 rounded-full relative transition-colors"
                                    [class.bg-blue-600]="
                                        settings().showTranslationSlider
                                    "
                                >
                                    <div
                                        class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                                        [class.translate-x-4]="
                                            settings().showTranslationSlider
                                        "
                                    ></div>
                                </div>
                            </div>
                        </button>

                        <!-- Show Translation Toggle -->
                        <button
                            (click)="toggleShowTranslation()"
                            class="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div class="flex items-center gap-3">
                                <lucide-angular
                                    [img]="languagesIcon"
                                    [size]="16"
                                    class="text-gray-500 dark:text-gray-400"
                                ></lucide-angular>
                                <span
                                    class="text-sm text-gray-700 dark:text-gray-300"
                                >
                                    Show Translation
                                </span>
                            </div>
                            <div class="relative">
                                <input
                                    type="checkbox"
                                    [checked]="settings().showTranslation"
                                    readonly
                                    class="sr-only"
                                />
                                <div
                                    class="w-10 h-6 bg-gray-200 dark:bg-gray-600 rounded-full relative transition-colors"
                                    [class.bg-blue-600]="
                                        settings().showTranslation
                                    "
                                >
                                    <div
                                        class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                                        [class.translate-x-4]="
                                            settings().showTranslation
                                        "
                                    ></div>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Backdrop -->
                <div class="fixed inset-0 z-40" (click)="closeMenu()"></div>
            }
        </div>
    `,
    styles: [
        `
            :host {
                display: block;
            }
        `,
    ],
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
        showProgressIndicator: true,
        showTranslationSlider: true,
        darkMode: false,
        showTranslation: true,
    });

    constructor(
        private settingsService: SettingsService,
        private themeService: ThemeService,
    ) {}

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
}
