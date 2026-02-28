import { httpClient } from '@/api/httpClient';
import { Book, BookEdition, BookSearchDetail, BookSearchResult, CreateBookDto } from '@/shared/types/domain';
import { BookDetail, BookDetailReview, BookDetailUserBook } from '@/app/types';

interface RawBook {
  id?: number | string;
  key?: string;
  bookId?: number | string;
  externalId?: string;
  titulo?: string;
  autor?: string;
  imagen?: string | null;
  sinopsis?: string | null;
  generos?: string[];
  idioma?: string;
  anio?: string | null;
  editorial?: string | null;
  edicionId?: string;
  editionId?: string;
  language?: string;
  publisher?: string;
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
  createdAt?: string;
  userBooks?: RawBookDetailUserBook[];
  reviews?: RawBookDetailReview[];
  openLibrary?: Record<string, unknown> | null;
  synopsis?: string | null;
  genres?: string[];
}

interface RawBookDetailUserBook {
  id?: string | number;
  bookId?: string | number;
  status?: 'FAVORITE' | 'TO_READ' | 'READ';
  createdAt?: string;
}

interface RawBookDetailReview {
  id?: string | number;
  bookId?: string | number;
  title?: string;
  content?: string;
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
}

function buildCoverUrl(raw: RawBook): string | undefined {
  if (raw.imagen) {
    return raw.imagen;
  }

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

function normalizeBookDetailUserBook(raw: RawBookDetailUserBook): BookDetailUserBook {
  return {
    id: String(raw.id ?? ''),
    bookId: String(raw.bookId ?? ''),
    status: raw.status ?? 'TO_READ',
    createdAt: raw.createdAt
  };
}

function normalizeBookDetailReview(raw: RawBookDetailReview): BookDetailReview {
  return {
    id: String(raw.id ?? ''),
    bookId: String(raw.bookId ?? ''),
    title: raw.title ?? 'Sin título',
    content: raw.content ?? '',
    rating: Number(raw.rating ?? 0),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt
  };
}

function normalizeBookDetail(raw: RawBook): BookDetail {
  const genres = Array.isArray(raw.genres)
    ? raw.genres
    : Array.isArray(raw.generos)
    ? raw.generos
    : [];

  return {
    id: String(raw.id ?? raw.bookId ?? ''),
    externalId: raw.externalId,
    title: raw.title ?? raw.titulo ?? 'Sin título',
    author: raw.author ?? raw.authorName ?? raw.autor ?? 'Autor desconocido',
    coverImage: buildCoverUrl(raw),
    publishedYear: raw.publishedYear ?? raw.year ?? raw.firstPublishYear ?? raw.publishedYear,
    synopsis: raw.synopsis ?? raw.sinopsis ?? null,
    genres: genres.slice(0, 5),
    createdAt: raw.createdAt,
    userBooks: Array.isArray(raw.userBooks)
      ? raw.userBooks.map(normalizeBookDetailUserBook)
      : [],
    reviews: Array.isArray(raw.reviews)
      ? raw.reviews.map(normalizeBookDetailReview)
      : [],
    openLibrary: raw.openLibrary ?? null
  };
}

function extractOlidFromKey(key?: string): string | undefined {
  if (!key) {
    return undefined;
  }

  const parts = key.split('/').filter(Boolean);
  const lastPart = parts[parts.length - 1];
  return lastPart || undefined;
}

function buildExternalId(raw: RawBook): string {
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

  const title = (raw.title ?? raw.titulo)?.trim() || 'sin-titulo';
  const author = (raw.author ?? raw.authorName ?? raw.autor ?? 'sin-autor').trim();
  const year = String(raw.year ?? raw.firstPublishYear ?? raw.publishedYear ?? 'na');
  return `openlibrary:fallback:${title}:${author}:${year}`;
}

function normalizeBook(raw: RawBook): Book {
  return {
    id: String(raw.id ?? raw.bookId ?? raw.key ?? raw.isbn ?? raw.title ?? raw.titulo ?? ''),
    externalId: raw.externalId,
    editionId: raw.edicionId ?? raw.editionId,
    title: raw.title ?? raw.titulo ?? 'Sin título',
    author: raw.author ?? raw.authorName ?? raw.autor ?? 'Autor desconocido',
    language: raw.idioma ?? raw.language,
    publisher: raw.editorial ?? raw.publisher,
    year: raw.year ?? raw.firstPublishYear ?? raw.publishedYear,
    isbn: raw.isbn,
    coverUrl: buildCoverUrl(raw),
    description: raw.synopsis ?? raw.sinopsis ?? undefined,
    genres: Array.isArray(raw.genres)
      ? raw.genres.slice(0, 5)
      : Array.isArray(raw.generos)
      ? raw.generos.slice(0, 5)
      : undefined
  };
}

export async function getBooks(): Promise<Book[]> {
  const { data } = await httpClient.get('/books');
  
  // Asegurar que data sea un array
  const booksArray = Array.isArray(data) ? data : (data?.books || data?.results || []);
  
  return booksArray.map(normalizeBook);
}

export async function searchBooks(query: string): Promise<BookSearchResult[]> {
  try {
    const response = await httpClient.get('/api/books/search', {
      params: { query, language: 'spa' }
    });

    const payload = response.data?.data ?? response.data;
    const booksArray: RawBook[] = Array.isArray(payload) ? payload : [];

    return booksArray.map((rawBook, index) => {
      const normalized = normalizeBook(rawBook);
      const externalId = String(rawBook.externalId ?? rawBook.key ?? buildExternalId(rawBook));

      return {
        ...normalized,
        id: `${externalId}-${index}`,
        externalId
      };
    });
  } catch (error: unknown) {
    const status =
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as { response?: { status?: number } }).response?.status === 'number'
        ? (error as { response?: { status?: number } }).response?.status
        : undefined;

    if (status === 404) {
      return [];
    }

    throw error;
  }
}

function normalizeBookSearchDetail(raw: RawBook): BookSearchDetail {
  const genres = Array.isArray(raw.generos)
    ? raw.generos
    : Array.isArray(raw.genres)
    ? raw.genres
    : [];

  return {
    title: raw.titulo ?? raw.title ?? 'Sin título',
    author: raw.autor ?? raw.author ?? raw.authorName ?? 'Autor desconocido',
    image: raw.imagen ?? buildCoverUrl(raw) ?? null,
    synopsis: raw.sinopsis ?? raw.synopsis ?? null,
    genres: genres.slice(0, 5),
  };
}

export async function searchBookDetailByExternalId(externalId: string): Promise<BookSearchDetail> {
  const response = await httpClient.get('/api/books/search/detail', {
    params: { externalId }
  });

  const payload: RawBook = response.data?.data ?? response.data;
  return normalizeBookSearchDetail(payload);
}

function normalizeBookEdition(raw: RawBook): BookEdition {
  return {
    editionId: String(raw.edicionId ?? raw.key ?? ''),
    language: raw.idioma ?? 'Otro',
    isbn: raw.isbn ? String(raw.isbn) : null,
    year: raw.anio ?? null,
    publisher: raw.editorial ?? null,
    image: raw.imagen ?? buildCoverUrl(raw) ?? null,
  };
}

export async function getBookEditions(workId: string): Promise<BookEdition[]> {
  const normalizedWorkId = workId.startsWith('/works/') ? workId.replace('/works/', '') : workId;
  const response = await httpClient.get(`/books/${normalizedWorkId}/editions`);
  const payload = response.data?.data ?? response.data;
  const editionsArray: RawBook[] = Array.isArray(payload) ? payload : [];
  return editionsArray.map(normalizeBookEdition);
}

export async function createBook(payload: CreateBookDto): Promise<Book> {
  const response = await httpClient.post('/books', payload);
  
  // Manejar diferentes formatos de respuesta
  let bookData: RawBook;
  if (response.data?.data) {
    // Formato: { success: true, data: { id: "UUID", ... } }
    bookData = response.data.data;
  } else if (response.data) {
    // Formato directo
    bookData = response.data;
  } else {
    throw new Error('No se recibió respuesta válida del servidor');
  }
  
  return normalizeBook(bookData);
}

export async function getBookDetailById(id: string): Promise<BookDetail> {
  const response = await httpClient.get(`/books/${id}`);

  const rawData: RawBook = response.data?.data ?? response.data;
  return normalizeBookDetail(rawData);
}
