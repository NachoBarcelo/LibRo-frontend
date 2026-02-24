import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '@/app/layout/MainLayout';
import { BooksSearchPage } from '@/pages/BooksSearchPage';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ReviewDetailPage } from '@/pages/ReviewDetailPage';
import { ReviewEditPage } from '@/pages/ReviewEditPage';
import { ReviewNewPage } from '@/pages/ReviewNewPage';
import { ReviewsPage } from '@/pages/ReviewsPage';
import { UserBooksPage } from '@/pages/UserBooksPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'books/search', element: <BooksSearchPage /> },
      { path: 'user-books', element: <UserBooksPage /> },
      { path: 'reviews', element: <ReviewsPage /> },
      { path: 'reviews/new', element: <ReviewNewPage /> },
      { path: 'reviews/:id', element: <ReviewDetailPage /> },
      { path: 'reviews/:id/edit', element: <ReviewEditPage /> },
      { path: '*', element: <NotFoundPage /> }
    ]
  }
]);
