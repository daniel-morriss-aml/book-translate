import { Routes } from '@angular/router';
import { BookReaderComponent } from './components/book-reader/book-reader.component';
import { LibraryComponent } from './components/library/library.component';

export const routes: Routes = [
    { path: '', component: LibraryComponent },
    { path: 'reader/:id', component: BookReaderComponent },
    { path: '**', redirectTo: '' },
];
