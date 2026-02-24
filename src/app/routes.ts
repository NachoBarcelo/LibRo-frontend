import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './pages/Layout';
import { Dashboard } from './pages/Dashboard';
import { SearchBooks } from './pages/SearchBooks';
import { MyBooks } from './pages/MyBooks';
import { Reviews } from './pages/Reviews';
import { NewReview } from './pages/NewReview';
import { ReviewDetail } from './pages/ReviewDetail';
import { EditReview } from './pages/EditReview';
import { NotFound } from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'search', Component: SearchBooks },
      { path: 'my-books', Component: MyBooks },
      { path: 'reviews', Component: Reviews },
      { path: 'reviews/new', Component: NewReview },
      { path: 'reviews/:id', Component: ReviewDetail },
      { path: 'reviews/:id/edit', Component: EditReview },
      { path: '*', Component: NotFound },
    ],
  },
]);
