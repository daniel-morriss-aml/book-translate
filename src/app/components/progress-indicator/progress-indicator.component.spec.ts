import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressIndicatorComponent } from './progress-indicator.component';

describe('ProgressIndicatorComponent', () => {
    let component: ProgressIndicatorComponent;
    let fixture: ComponentFixture<ProgressIndicatorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ProgressIndicatorComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(ProgressIndicatorComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        fixture.componentRef.setInput('currentPage', 0);
        fixture.componentRef.setInput('totalPages', 10);
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should calculate progress percentage correctly', () => {
        fixture.componentRef.setInput('currentPage', 4);
        fixture.componentRef.setInput('totalPages', 10);
        fixture.detectChanges();

        expect(component.progressPercentage()).toBe(50);
    });

    it('should calculate remaining pages correctly', () => {
        fixture.componentRef.setInput('currentPage', 3);
        fixture.componentRef.setInput('totalPages', 10);
        fixture.detectChanges();

        expect(component.remainingPages()).toBe(6);
    });

    it('should show 100% when on last page', () => {
        fixture.componentRef.setInput('currentPage', 9);
        fixture.componentRef.setInput('totalPages', 10);
        fixture.detectChanges();

        expect(component.progressPercentage()).toBe(100);
        expect(component.remainingPages()).toBe(0);
    });

    it('should handle zero total pages', () => {
        fixture.componentRef.setInput('currentPage', 0);
        fixture.componentRef.setInput('totalPages', 0);
        fixture.detectChanges();

        expect(component.progressPercentage()).toBe(0);
        expect(component.remainingPages()).toBe(0);
    });

    it('should display correct page information', () => {
        fixture.componentRef.setInput('currentPage', 2);
        fixture.componentRef.setInput('totalPages', 5);
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('Page 3 of 5');
        expect(compiled.textContent).toContain('2 pages remaining');
    });

    it('should show complete status when finished', () => {
        fixture.componentRef.setInput('currentPage', 4);
        fixture.componentRef.setInput('totalPages', 5);
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('✓ Complete');
    });

    it('should update progress bar width based on percentage', () => {
        fixture.componentRef.setInput('currentPage', 1);
        fixture.componentRef.setInput('totalPages', 4);
        fixture.detectChanges();

        const progressBar = fixture.nativeElement.querySelector('.bg-blue-600') as HTMLElement;
        expect(progressBar.style.width).toBe('50%');
    });
});
