import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { httpClient } from '@/api/httpClient';
import { Book, BookStatus, Review, UserBook } from '../types';

interface LibraryContextType {
  userBooks: UserBook[];
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
  addBook: (book: Book, status: BookStatus) => Promise<void>;
  updateBookStatus: (bookId: string, status: BookStatus) => Promise<void>;
  removeBook: (bookId: string) => Promise<void>;
  addReview: (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateReview: (id: string, review: Partial<Review>) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  getReview: (id: string) => Review | undefined;
  getBookReviews: (bookId: string) => Review[];
  reloadAll: () => Promise<void>;
}

interface RawBook {
  id?: string | number;
  externalId?: string;
  key?: string;
  title?: string;
  author?: string;
  authorName?: string;
  year?: number;
  firstPublishYear?: number;
  publishedYear?: number;
  isbn?: string;
  coverUrl?: string;
  coverImage?: string;
  coverId?: number;
  coverI?: number;
}

interface RawUserBook {
  id?: string | number;
  userBookId?: string | number;
  bookId?: string | number;
  status?: BookStatus;
  createdAt?: string;
  updatedAt?: string;
  addedAt?: string;
  book?: RawBook;
}

interface RawReview {
  id?: string | number;
  bookId?: string | number;
  title?: string;
  content?: string;
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

function extractOlidFromKey(key?: string): string | undefined {
  if (!key) {
    return undefined;
  }

  const parts = key.split('/').filter(Boolean);
  return parts[parts.length - 1];
}

function buildExternalId(raw: RawBook): string | undefined {
  if (raw.externalId) {
    return raw.externalId;
  }

  const olid = extractOlidFromKey(raw.key);
  if (olid) {
    return `openlibrary:${olid}`;
  }

  if (raw.isbn) {
    return `openlibrary:isbn:${raw.isbn}`;
  }

  return undefined;
}

function buildCover(raw: RawBook): string | undefined {
  if (raw.coverUrl) {
    return raw.coverUrl;
  }

  if (raw.coverImage) {
    return raw.coverImage;
  }

  const coverId = raw.coverId ?? raw.coverI;
  if (coverId) {
    return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
  }

  if (raw.isbn) {
    return `https://covers.openlibrary.org/b/isbn/${raw.isbn}-M.jpg`;
  }

  return undefined;
}

function normalizeBook(raw: RawBook): Book {
  return {
    id: String(raw.id ?? ''),
    externalId: buildExternalId(raw),
    title: raw.title ?? 'Sin título',
    author: raw.author ?? raw.authorName ?? 'Autor desconocido',
    year: raw.year ?? raw.firstPublishYear ?? raw.publishedYear,
    isbn: raw.isbn,
    cover: buildCover(raw)
  };
}

function normalizeUserBook(raw: RawUserBook): UserBook {
  const innerBook = raw.book ? normalizeBook(raw.book) : null;
  // Para UserBook, el id es el userBookId (para poder eliminar)
  const userBookId = String(raw.id ?? raw.userBookId ?? '');
  const bookId = String(raw.bookId ?? innerBook?.id ?? '');

  return {
    id: bookId,
    userBookId: userBookId,
    externalId: innerBook?.externalId,
    title: innerBook?.title ?? 'Sin título',
    author: innerBook?.author ?? 'Autor desconocido',
    year: innerBook?.year,
    isbn: innerBook?.isbn,
    cover: innerBook?.cover,
    status: raw.status ?? 'TO_READ',
    addedAt: raw.createdAt ?? raw.addedAt ?? raw.updatedAt ?? new Date().toISOString()
  };
}

function normalizeReview(raw: RawReview, userBooksMap: Map<string, UserBook>): Review {
  const bookId = String(raw.bookId ?? '');
  const linkedBook = userBooksMap.get(bookId);

  return {
    id: String(raw.id ?? ''),
    bookId,
    bookTitle: linkedBook?.title ?? `Libro ${bookId}`,
    title: raw.title ?? 'Sin título',
    content: raw.content ?? '',
    rating: Number(raw.rating ?? 0),
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? raw.createdAt ?? new Date().toISOString()
  };
}

function toCreateBookPayload(book: Book) {
  const externalId = book.externalId ?? `openlibrary:fallback:${book.id}`;

  return {
    externalId,
    title: book.title,
    author: book.author,
    coverImage: book.cover,
    publishedYear: book.year
  };
}

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [userBooks, setUserBooks] = useState<UserBook[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getUserBooksMap = useCallback((books: UserBook[]) => {
    return new Map(books.map((book) => [book.id, book]));
  }, []);

  const fetchUserBooks = useCallback(async () => {
    const response = await httpClient.get('/user-books');
    
    // Manejar formato { success: true, data: [...] }
    let userBooksArray: RawUserBook[] = [];
    if (response.data?.data && Array.isArray(response.data.data)) {
      userBooksArray = response.data.data;
    } else if (Array.isArray(response.data)) {
      userBooksArray = response.data;
    }
    
    const mapped = userBooksArray.map(normalizeUserBook);
    setUserBooks(mapped);
    return mapped;
  }, []);

  const fetchReviews = useCallback(async (booksForTitle: UserBook[]) => {
    const response = await httpClient.get('/reviews');
    
    // Manejar formato { success: true, data: [...] }
    let reviewsArray: RawReview[] = [];
    if (response.data?.data && Array.isArray(response.data.data)) {
      reviewsArray = response.data.data;
    } else if (Array.isArray(response.data)) {
      reviewsArray = response.data;
    } else if (response.data?.reviews) {
      reviewsArray = response.data.reviews;
    }
    
    const booksMap = getUserBooksMap(booksForTitle);
    setReviews(reviewsArray.map((review) => normalizeReview(review, booksMap)));
  }, [getUserBooksMap]);

  const reloadAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const books = await fetchUserBooks();
      await fetchReviews(books);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'No se pudo cargar la información.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserBooks, fetchReviews]);

  useEffect(() => {
    void reloadAll();
  }, [reloadAll]);

  const addBook = useCallback(async (book: Book, status: BookStatus) => {
    setError(null);

    try {
      // Paso 1: Crear libro en la BD local
      const response = await httpClient.post('/books', toCreateBookPayload(book));
      
      // Extraer el UUID del libro - manejar diferentes formatos de respuesta
      let bookUuid: string;
      if (response.data?.data?.id) {
        // Formato: { success: true, data: { id: "UUID" } }
        bookUuid = response.data.data.id;
      } else if (response.data?.id) {
        // Formato: { id: "UUID" }
        bookUuid = response.data.id;
      } else {
        throw new Error('No se recibió el ID del libro creado');
      }

      // Paso 2: Agregar libro a user-books con el UUID y status en mayúsculas
      await httpClient.post('/user-books', {
        bookId: bookUuid,
        status: status.toUpperCase() as BookStatus
      });

      await reloadAll();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'No se pudo agregar el libro.';
      setError(message);
      throw requestError;
    }
  }, [reloadAll]);

  const updateBookStatus = useCallback(async (bookId: string, status: BookStatus) => {
    setError(null);

    try {
      await httpClient.post('/user-books', { 
        bookId, 
        status: status.toUpperCase() as BookStatus 
      });
      await reloadAll();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'No se pudo actualizar el estado del libro.';
      setError(message);
      throw requestError;
    }
  }, [reloadAll]);

  const removeBook = useCallback(async (bookId: string) => {
    setError(null);

    const found = userBooks.find((book) => book.id === bookId);
    if (!found) {
      return;
    }

    try {
      await httpClient.delete(`/user-books/${found.userBookId}`);
      await reloadAll();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'No se pudo eliminar el libro de tu lista.';
      setError(message);
      throw requestError;
    }
  }, [reloadAll, userBooks]);

  const addReview = useCallback(async (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) => {
    setError(null);

    try {
      await httpClient.post('/reviews', {
        bookId: review.bookId,
        title: review.title,
        content: review.content,
        rating: review.rating
      });
      await reloadAll();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'No se pudo crear la reseña.';
      setError(message);
      throw requestError;
    }
  }, [reloadAll]);

  const updateReview = useCallback(async (id: string, reviewData: Partial<Review>) => {
    setError(null);

    try {
      await httpClient.put(`/reviews/${id}`, {
        title: reviewData.title,
        content: reviewData.content,
        rating: reviewData.rating
      });
      await reloadAll();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'No se pudo actualizar la reseña.';
      setError(message);
      throw requestError;
    }
  }, [reloadAll]);

  const deleteReview = useCallback(async (id: string) => {
    setError(null);

    try {
      await httpClient.delete(`/reviews/${id}`);
      await reloadAll();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'No se pudo eliminar la reseña.';
      setError(message);
      throw requestError;
    }
  }, [reloadAll]);

  const getReview = useCallback((id: string) => {
    return reviews.find((review) => review.id === id);
  }, [reviews]);

  const getBookReviews = useCallback((bookId: string) => {
    return reviews.filter((review) => review.bookId === bookId);
  }, [reviews]);

  const value = useMemo<LibraryContextType>(() => ({
    userBooks,
    reviews,
    isLoading,
    error,
    addBook,
    updateBookStatus,
    removeBook,
    addReview,
    updateReview,
    deleteReview,
    getReview,
    getBookReviews,
    reloadAll
  }), [
    userBooks,
    reviews,
    isLoading,
    error,
    addBook,
    updateBookStatus,
    removeBook,
    addReview,
    updateReview,
    deleteReview,
    getReview,
    getBookReviews,
    reloadAll
  ]);

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
}
