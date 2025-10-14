# Book Translate - Bilingual Ebook Reader

A modern bilingual ebook reader built with Angular 19 (standalone) and Tailwind CSS. Read books with progressive translation overlay controlled by a slider.

## Features

-   📚 **Library View** - Browse and select from multiple books on the landing page
-   📖 **Single Page Display** - One page visible at a time for focused reading
-   🔄 **Progressive Translation** - Slider (0-100%) gradually reveals native language translations
-   ⌨️ **Keyboard Navigation** - Arrow keys for quick navigation and slider adjustment
-   💾 **Persistent State** - Slider position saved per book in localStorage
-   🎨 **Modern UI** - Responsive design with Tailwind CSS
-   🧩 **Component-Based Architecture** - Modular design with separate library and reader components
-   ✅ **Tested** - Comprehensive test suite with 26 passing tests

## Demo Books

Includes two demo books:
-   **The Little Prince** (English → Spanish) - Classic tale by Antoine de Saint-Exupéry
-   **Alice in Wonderland** (English → French) - Lewis Carroll's beloved story

## How It Works

1. **Browse** the library and select a book to read
2. **Target language** (e.g., English) is shown by default in the reader
3. Adjust the **slider** from 0% to 100% to progressively replace sentences with **native language** (e.g., Spanish)
4. **0% = All target language**, **100% = All native language**
5. Slider position is **saved automatically** for each book
6. Click **"Back to Library"** to return and select another book

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
│   ├── components/
│   │   ├── library/
│   │   │   ├── library.component.ts          # Library landing page
│   │   │   ├── library.component.html        # Library UI template
│   │   │   ├── library.component.css         # Library styles
│   │   │   └── library.component.spec.ts     # Library tests
│   │   └── book-reader/
│   │       ├── book-reader.component.ts      # Book reader with keyboard handling
│   │       ├── book-reader.component.html    # Reader UI template
│   │       ├── book-reader.component.css     # Reader styles
│   │       └── book-reader.component.spec.ts # Reader tests
│   ├── models/
│   │   └── book.model.ts                     # TypeScript interfaces
│   ├── services/
│   │   ├── book.service.ts                   # Book loading & state management
│   │   └── book.service.spec.ts              # Service tests
│   ├── app.component.ts                      # Root component (router outlet)
│   ├── app.component.html                    # Root template
│   ├── app.component.spec.ts                 # Root component tests
│   ├── app.config.ts                         # App configuration with routing
│   └── app.routes.ts                         # Route definitions
├── assets/
│   ├── books.json                            # Book catalog/metadata
│   ├── demo-book.json                        # The Little Prince data
│   └── demo-book-2.json                      # Alice in Wonderland data
└── styles.css                                 # Global styles with Tailwind
```

## Book JSON Format

### Book Catalog (`assets/books.json`)

The catalog lists all available books:

```json
[
    {
        "id": "unique-book-id",
        "title": "Book Title",
        "targetLanguage": "English",
        "nativeLanguage": "Spanish",
        "path": "assets/demo-book.json",
        "coverImage": "",
        "description": "Book description for the library view"
    }
]
```

### Individual Book Files

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
-   **Routing**: Angular Router
-   **Styling**: Tailwind CSS v3
-   **Language**: TypeScript
-   **Testing**: Karma + Jasmine
-   **Build Tool**: Angular CLI

## Additional Resources

For more information on using the Angular CLI, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
