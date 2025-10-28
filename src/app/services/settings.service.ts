import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserSettings {
    showProgressIndicator: boolean;
    showTranslationSlider: boolean;
    darkMode: boolean;
    showTranslation: boolean;
    sentencesPerPage: number;
    nativeLanguage: string; // 'en', 'de', 'es'
}

@Injectable({
    providedIn: 'root',
})
export class SettingsService {
    private readonly SETTINGS_KEY = 'book-reader-settings';

    private defaultSettings: UserSettings = {
        showProgressIndicator: true,
        showTranslationSlider: true,
        darkMode: false,
        showTranslation: true,
        sentencesPerPage: 8,
        nativeLanguage: 'en',
    };

    private settingsSubject = new BehaviorSubject<UserSettings>(this.loadSettings());

    constructor() {}

    private loadSettings(): UserSettings {
        try {
            const stored = localStorage.getItem(this.SETTINGS_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Merge with defaults to handle new settings
                return { ...this.defaultSettings, ...parsed };
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
        return this.defaultSettings;
    }

    private saveSettings(settings: UserSettings): void {
        try {
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
            this.settingsSubject.next(settings);
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    getSettings(): Observable<UserSettings> {
        return this.settingsSubject.asObservable();
    }

    getCurrentSettings(): UserSettings {
        return this.settingsSubject.value;
    }

    updateSetting<K extends keyof UserSettings>(key: K, value: UserSettings[K]): void {
        const currentSettings = this.getCurrentSettings();
        const newSettings = { ...currentSettings, [key]: value };
        this.saveSettings(newSettings);
    }

    toggleProgressIndicator(): void {
        const current = this.getCurrentSettings();
        this.updateSetting('showProgressIndicator', !current.showProgressIndicator);
    }

    toggleTranslationSlider(): void {
        const current = this.getCurrentSettings();
        this.updateSetting('showTranslationSlider', !current.showTranslationSlider);
    }

    toggleDarkMode(): void {
        const current = this.getCurrentSettings();
        this.updateSetting('darkMode', !current.darkMode);
    }

    toggleShowTranslation(): void {
        const current = this.getCurrentSettings();
        this.updateSetting('showTranslation', !current.showTranslation);
    }

    updateSentencesPerPage(value: number): void {
        this.updateSetting('sentencesPerPage', value);
    }

    updateNativeLanguage(language: string): void {
        this.updateSetting('nativeLanguage', language);
    }

    resetToDefaults(): void {
        this.saveSettings(this.defaultSettings);
    }
}
