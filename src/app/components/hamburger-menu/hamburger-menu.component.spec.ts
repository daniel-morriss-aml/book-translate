import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HamburgerMenuComponent } from './hamburger-menu.component';
import { SettingsService } from '../../services/settings.service';
import { ThemeService } from '../../services/theme.service';
import { BehaviorSubject } from 'rxjs';

describe('HamburgerMenuComponent', () => {
    let component: HamburgerMenuComponent;
    let fixture: ComponentFixture<HamburgerMenuComponent>;
    let mockSettingsService: jasmine.SpyObj<SettingsService>;
    let mockThemeService: jasmine.SpyObj<ThemeService>;
    let settingsSubject: BehaviorSubject<any>;

    beforeEach(async () => {
        settingsSubject = new BehaviorSubject({
            showProgressIndicator: true,
            showTranslationSlider: true,
            darkMode: false,
        });

        mockSettingsService = jasmine.createSpyObj('SettingsService', [
            'toggleProgressIndicator',
            'toggleTranslationSlider',
            'toggleDarkMode',
            'getSettings'
        ]);
        mockSettingsService.getSettings.and.returnValue(settingsSubject.asObservable());

        mockThemeService = jasmine.createSpyObj('ThemeService', ['toggleTheme']);

        await TestBed.configureTestingModule({
            imports: [HamburgerMenuComponent],
            providers: [
                { provide: SettingsService, useValue: mockSettingsService },
                { provide: ThemeService, useValue: mockThemeService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(HamburgerMenuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with closed menu', () => {
        expect(component.isMenuOpen()).toBe(false);
    });

    it('should toggle menu open and closed', () => {
        expect(component.isMenuOpen()).toBe(false);

        component.toggleMenu();
        expect(component.isMenuOpen()).toBe(true);

        component.toggleMenu();
        expect(component.isMenuOpen()).toBe(false);
    });

    it('should close menu when closeMenu is called', () => {
        component.isMenuOpen.set(true);
        component.closeMenu();
        expect(component.isMenuOpen()).toBe(false);
    });

    it('should display menu when isMenuOpen is true', () => {
        component.isMenuOpen.set(true);
        fixture.detectChanges();

        const menu = fixture.nativeElement.querySelector('.absolute.right-0');
        expect(menu).toBeTruthy();
    });

    it('should not display menu when isMenuOpen is false', () => {
        component.isMenuOpen.set(false);
        fixture.detectChanges();

        const menu = fixture.nativeElement.querySelector('.absolute.right-0');
        expect(menu).toBeFalsy();
    });

    it('should call toggleDarkMode on both services when dark mode toggle is clicked', () => {
        component.toggleDarkMode();

        expect(mockThemeService.toggleTheme).toHaveBeenCalled();
        expect(mockSettingsService.toggleDarkMode).toHaveBeenCalled();
    });

    it('should call settingsService.toggleProgressIndicator when progress indicator toggle is clicked', () => {
        component.toggleProgressIndicator();

        expect(mockSettingsService.toggleProgressIndicator).toHaveBeenCalled();
    });

    it('should call settingsService.toggleTranslationSlider when translation slider toggle is clicked', () => {
        component.toggleTranslationSlider();

        expect(mockSettingsService.toggleTranslationSlider).toHaveBeenCalled();
    });

    it('should update settings when settings service emits new values', () => {
        const newSettings = {
            showProgressIndicator: false,
            showTranslationSlider: false,
            darkMode: true,
            showTranslation: true,
            sentencesPerPage: 8,
            nativeLanguage: 'en',
        };

        settingsSubject.next(newSettings);
        fixture.detectChanges();

        expect(component.settings()).toEqual(newSettings);
    });

    it('should show correct toggle states in UI', () => {
        const newSettings = {
            showProgressIndicator: false,
            showTranslationSlider: true,
            darkMode: false,
            showTranslation: true,
            sentencesPerPage: 8,
            nativeLanguage: 'en',
        };

        settingsSubject.next(newSettings);
        component.isMenuOpen.set(true);
        fixture.detectChanges();

        const toggles = fixture.nativeElement.querySelectorAll('.w-10.h-6');
        expect(toggles.length).toBe(3);

        // Check if toggles reflect the correct state visually
        const darkModeToggle = toggles[0];
        const progressToggle = toggles[1];
        const sliderToggle = toggles[2];

        expect(darkModeToggle.classList.contains('bg-blue-600')).toBe(false);
        expect(progressToggle.classList.contains('bg-blue-600')).toBe(false);
        expect(sliderToggle.classList.contains('bg-blue-600')).toBe(true);
    });

    it('should close menu when backdrop is clicked', () => {
        component.isMenuOpen.set(true);
        fixture.detectChanges();

        const backdrop = fixture.nativeElement.querySelector('.fixed.inset-0');
        expect(backdrop).toBeTruthy();

        backdrop.click();
        expect(component.isMenuOpen()).toBe(false);
    });

    it('should show correct icon based on menu state', () => {
        // Menu closed - should show menu icon
        component.isMenuOpen.set(false);
        fixture.detectChanges();

        let button = fixture.nativeElement.querySelector('button');
        expect(button.getAttribute('aria-expanded')).toBe('false');

        // Menu open - should show close icon
        component.isMenuOpen.set(true);
        fixture.detectChanges();

        button = fixture.nativeElement.querySelector('button');
        expect(button.getAttribute('aria-expanded')).toBe('true');
    });

    it('should have proper accessibility attributes', () => {
        const button = fixture.nativeElement.querySelector('button');

        expect(button.hasAttribute('aria-label')).toBe(true);
        expect(button.hasAttribute('aria-expanded')).toBe(true);
    });
});
