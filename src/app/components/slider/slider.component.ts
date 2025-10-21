import { CommonModule } from '@angular/common';
import {
    Component,
    computed,
    effect,
    input,
    output,
    signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Book } from '../../models/book.model';

@Component({
    selector: 'app-slider',
    imports: [CommonModule, FormsModule],
    templateUrl: './slider.component.html',
    styleUrl: './slider.component.css',
})
export class SliderComponent {
    sliderValue = input<number>(0);
    maintainTranslationLevel = input<boolean>(false);
    book = input<Book | null>(null);

    // Local signal for two-way binding with the range input
    localSliderValue = signal<number>(0);

    sliderChange = output<number>();
    maintainLevelToggle = output<void>();

    // Computed property for button classes
    maintainButtonClasses = computed(() => {
        const isActive = this.maintainTranslationLevel();
        return {
            'px-3 py-1 text-xs rounded-md border transition': true,
            'bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500':
                isActive,
            'hover:bg-blue-700 dark:hover:bg-blue-600': isActive,
            'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600':
                !isActive,
            'hover:bg-gray-50 dark:hover:bg-gray-600': !isActive,
        };
    });

    constructor() {
        // Sync input signal with local signal
        effect(() => {
            this.localSliderValue.set(this.sliderValue());
        });
    }

    onSliderChange(): void {
        this.sliderChange.emit(this.localSliderValue());
    }

    toggleMaintainTranslationLevel(): void {
        this.maintainLevelToggle.emit();
    }
}
