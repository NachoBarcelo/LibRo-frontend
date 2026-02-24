export type UserBookStatus = 'FAVORITE' | 'TO_READ' | 'READ';

export interface Book {
  id: string;
  externalId?: string;
  title: string;
  author?: string;
  year?: number;
  isbn?: string;
  coverUrl?: string;
}

export interface BookSearchResult {
  id: string;
  externalId: string;
  title: string;
  author?: string;
  year?: number;
  isbn?: string;
  coverUrl?: string;
}

export interface CreateBookDto {
  externalId: string;
  title: string;
  author: string;
  coverImage?: string;
  publishedYear?: number;
}

export interface UserBook {
  id: string;
  bookId: string;
  status: UserBookStatus;
  book?: Book;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  bookId: string;
  title: string;
  content: string;
  rating: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReviewDto {
  bookId: string;
  title: string;
  content: string;
  rating: number;
}

export interface UpdateReviewDto {
  title: string;
  content: string;
  rating: number;
}

export interface UpsertUserBookDto {
  bookId: string;
  status: UserBookStatus;
}
