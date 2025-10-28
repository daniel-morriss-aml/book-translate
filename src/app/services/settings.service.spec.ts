import { TestBed } from '@angular/core/testing';
import { SettingsService, UserSettings } from './settings.service';

describe('SettingsService', () => {
    let service: SettingsService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SettingsService);
        // Clear localStorage before each test
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return default settings when no stored settings exist', () => {
        const settings = service.getCurrentSettings();
        expect(settings).toEqual({
            showProgressIndicator: true,
            showTranslationSlider: true,
            darkMode: false,
            showTranslation: true,
        });
    });

    it('should load settings from localStorage', () => {
        const testSettings: UserSettings = {
            showProgressIndicator: false,
            showTranslationSlider: true,
            darkMode: true,
            showTranslation: true,
        };
        localStorage.setItem('book-reader-settings', JSON.stringify(testSettings));

        // Create new service instance to trigger loading
        const newService = TestBed.inject(SettingsService);
        const settings = newService.getCurrentSettings();

        expect(settings).toEqual(testSettings);
    });

    it('should save settings to localStorage', () => {
        service.updateSetting('darkMode', true);

        const stored = localStorage.getItem('book-reader-settings');
        expect(stored).toBeTruthy();

        const parsed = JSON.parse(stored!);
        expect(parsed.darkMode).toBe(true);
    });

    it('should emit settings changes', (done) => {
        service.getSettings().subscribe(settings => {
            if (settings.darkMode === true) {
                expect(settings.darkMode).toBe(true);
                done();
            }
        });

        service.updateSetting('darkMode', true);
    });

    it('should toggle progress indicator', () => {
        const initialSetting = service.getCurrentSettings().showProgressIndicator;
        service.toggleProgressIndicator();
        const newSetting = service.getCurrentSettings().showProgressIndicator;

        expect(newSetting).toBe(!initialSetting);
    });

    it('should toggle translation slider', () => {
        const initialSetting = service.getCurrentSettings().showTranslationSlider;
        service.toggleTranslationSlider();
        const newSetting = service.getCurrentSettings().showTranslationSlider;

        expect(newSetting).toBe(!initialSetting);
    });

    it('should toggle dark mode', () => {
        const initialSetting = service.getCurrentSettings().darkMode;
        service.toggleDarkMode();
        const newSetting = service.getCurrentSettings().darkMode;

        expect(newSetting).toBe(!initialSetting);
    });

    it('should reset to defaults', () => {
        // Change some settings
        service.updateSetting('darkMode', true);
        service.updateSetting('showProgressIndicator', false);

        // Reset to defaults
        service.resetToDefaults();

        const settings = service.getCurrentSettings();
        expect(settings).toEqual({
            showProgressIndicator: true,
            showTranslationSlider: true,
            darkMode: false,
            showTranslation: true,
        });
    });

    it('should handle localStorage errors gracefully', () => {
        // Mock localStorage to throw an error
        spyOn(localStorage, 'getItem').and.throwError('Storage error');

        // Should not throw and should return defaults
        const newService = TestBed.inject(SettingsService);
        const settings = newService.getCurrentSettings();

        expect(settings).toEqual({
            showProgressIndicator: true,
            showTranslationSlider: true,
            darkMode: false,
            showTranslation: true,
        });
    });

    it('should merge stored settings with defaults for backward compatibility', () => {
        // Store partial settings (simulating old version)
        const partialSettings = { darkMode: true };
        localStorage.setItem('book-reader-settings', JSON.stringify(partialSettings));

        const newService = TestBed.inject(SettingsService);
        const settings = newService.getCurrentSettings();

        expect(settings).toEqual({
            showProgressIndicator: true, // default
            showTranslationSlider: true, // default
            darkMode: true, // from storage
            showTranslation: true, // default
        });
    });
});
