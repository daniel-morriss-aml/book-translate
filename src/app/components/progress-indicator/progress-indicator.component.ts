import { CommonModule } from '@angular/common';
import { Component, input, computed } from '@angular/core';

@Component({
    selector: 'app-progress-indicator',
    imports: [CommonModule],
    template: `
        <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <div class="max-w-4xl mx-auto">
                <!-- Progress Bar -->
                <div class="mb-2">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Reading Progress
                        </span>
                        <span class="text-sm text-gray-500 dark:text-gray-400">
                            {{ progressPercentage() }}%
                        </span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            class="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                            [style.width.%]="progressPercentage()"
                        ></div>
                    </div>
                </div>

                <!-- Page Information -->
                <div class="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>
                        Page {{ currentPage() + 1 }} of {{ totalPages() }}
                    </span>
                    @if (remainingPages() > 0) {
                        <span>
                            {{ remainingPages() }} pages remaining
                        </span>
                    } @else {
                        <span class="text-green-600 dark:text-green-400 font-medium">
                            ✓ Complete
                        </span>
                    }
                </div>
            </div>
        </div>
    `,
    styles: [`
        :host {
            display: block;
        }
    `]
})
export class ProgressIndicatorComponent {
    currentPage = input.required<number>();
    totalPages = input.required<number>();

    progressPercentage = computed(() => {
        const total = this.totalPages();
        if (total === 0) return 0;
        return Math.round(((this.currentPage() + 1) / total) * 100);
    });

    remainingPages = computed(() => {
        return Math.max(0, this.totalPages() - this.currentPage() - 1);
    });
}
