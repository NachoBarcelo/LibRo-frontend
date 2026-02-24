export type BookStatus = 'FAVORITE' | 'TO_READ' | 'READ';

export interface Book {
  id: string;
  externalId?: string;
  title: string;
  author: string;
  year?: number;
  isbn?: string;
  cover?: string;
  description?: string;
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
