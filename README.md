# Book Translate - Bilingual Ebook Reader

A modern bilingual ebook reader built with Angular 19 (standalone) and Tailwind CSS. Read books with progressive translation overlay controlled by a slider.

## Features

-   📖 **Single Page Display** - One page visible at a time for focused reading
-   🔄 **Progressive Translation** - Slider (0-100%) gradually reveals native language translations
-   ⌨️ **Keyboard Navigation** - Arrow keys for quick navigation and slider adjustment
-   💾 **Persistent State** - Slider position saved per book in localStorage
-   🎨 **Modern UI** - Responsive design with Tailwind CSS
-   ✅ **Tested** - Comprehensive test suite with 12 passing tests

## Demo Book

Includes an excerpt from "The Little Prince" (English → Spanish) with 3 pages demonstrating the bilingual reading experience.

## How It Works

1. **Target language** (e.g., English) is shown by default
2. Adjust the **slider** from 0% to 100% to progressively replace sentences with **native language** (e.g., Spanish)
3. **0% = All target language**, **100% = All native language**
4. Slider position is **saved automatically** for each book

## Keyboard Controls

| Key | Action                     |
| --- | -------------------------- |
| `←` | Previous page              |
| `→` | Next page                  |
| `↑` | Increase translation by 5% |
| `↓` | Decrease translation by 5% |

## Getting Started

### Prerequisites

-   Node.js 20.x or later
-   npm 10.x or later

### Installation

```bash
npm install
```

### Development Server

```bash
npm start
```

Navigate to `http://localhost:4200/`. The application will automatically reload when you make changes.

### Build

```bash
npm run build
```

Build artifacts will be stored in the `dist/` directory.

### Running Tests

```bash
npm test -- --browsers=ChromeHeadlessCI --watch=false
```

## Project Structure

```
src/
├── app/
│   ├── models/
│   │   └── book.model.ts          # TypeScript interfaces
│   ├── services/
│   │   ├── book.service.ts        # Book loading & state management
│   │   └── book.service.spec.ts   # Service tests
│   ├── app.component.ts           # Main component with keyboard handling
│   ├── app.component.html         # Reader UI template
│   ├── app.component.spec.ts      # Component tests
│   └── app.config.ts              # App configuration
├── assets/
│   └── demo-book.json             # Demo book data
└── styles.css                      # Global styles with Tailwind
```

## Book JSON Format

Books are loaded from JSON files in the `assets/` directory:

```json
{
    "id": "unique-book-id",
    "title": "Book Title",
    "targetLanguage": "English",
    "nativeLanguage": "Spanish",
    "pages": [
        {
            "pageNumber": 1,
            "sentences": [
                {
                    "target": "English sentence.",
                    "native": "Spanish translation."
                }
            ]
        }
    ]
}
```

## Technology Stack

-   **Framework**: Angular 19 (Standalone Components)
-   **Styling**: Tailwind CSS v3
-   **Language**: TypeScript
-   **Testing**: Karma + Jasmine
-   **Build Tool**: Angular CLI

## Additional Resources

For more information on using the Angular CLI, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
