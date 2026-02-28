export type BookStatus = 'FAVORITE' | 'TO_READ' | 'READ';

export interface Book {
  id: string;
  externalId?: string;
  editionId?: string;
  title: string;
  author: string;
  language?: string;
  publisher?: string;
  year?: number;
  isbn?: string;
  cover?: string;
  description?: string;
  genres?: string[];
}

export interface UserBook extends Book {
  userBookId: string;
  status: BookStatus;
  addedAt: string;
}

export interface Review {
  id: string;
  bookId: string;
  bookTitle: string;
  title: string;
  content: string;
  rating: number; // 1-5
  createdAt: string;
  updatedAt: string;
}

export interface BookDetailUserBook {
  id: string;
  bookId: string;
  status: BookStatus;
  createdAt?: string;
}

export interface BookDetailReview {
  id: string;
  bookId: string;
  title: string;
  content: string;
  rating: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookDetail {
  id: string;
  externalId?: string;
  title: string;
  author?: string;
  coverImage?: string;
  publishedYear?: number;
  synopsis?: string | null;
  genres: string[];
  createdAt?: string;
  userBooks: BookDetailUserBook[];
  reviews: BookDetailReview[];
  openLibrary: Record<string, unknown> | null;
}
