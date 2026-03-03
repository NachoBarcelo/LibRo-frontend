import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './pages/Layout';
import { Dashboard } from './pages/Dashboard';
import { SearchBooks } from './pages/SearchBooks';
import { MyBooks } from './pages/MyBooks';
import { Stats } from './pages/Stats';
import { BookDetail } from './pages/BookDetail';
import { Reviews } from './pages/Reviews';
import { NotFound } from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'search', Component: SearchBooks },
      { path: 'my-books', Component: MyBooks },
      { path: 'stats', Component: Stats },
      { path: 'books/:id', Component: BookDetail },
      { path: 'reviews', Component: Reviews },
      { path: 'reviews/new', Component: Reviews },
      { path: 'reviews/:id', Component: Reviews },
      { path: 'reviews/:id/edit', Component: Reviews },
      { path: '*', Component: NotFound },
    ],
  },
]);
