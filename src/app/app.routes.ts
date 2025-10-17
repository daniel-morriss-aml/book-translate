import { Routes } from '@angular/router';
import { BookReaderComponent } from './components/book-reader/book-reader.component';
import { ChaptersComponent } from './components/chapters/chapters.component';
import { LibraryComponent } from './components/library/library.component';

export const routes: Routes = [
    { path: '', component: LibraryComponent },
    { path: 'chapters/:id', component: ChaptersComponent },
    { path: 'reader/:id', component: BookReaderComponent },
    { path: '**', redirectTo: '' },
];
