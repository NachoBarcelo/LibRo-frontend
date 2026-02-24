import { httpClient } from '@/api/httpClient';
import { Book, BookSearchResult, CreateBookDto } from '@/shared/types/domain';

interface RawBook {
  id?: number | string;
  key?: string;
  bookId?: number | string;
  externalId?: string;
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

function buildCoverUrl(raw: RawBook): string | undefined {
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

  const title = raw.title?.trim() || 'sin-titulo';
  const author = (raw.author ?? raw.authorName ?? 'sin-autor').trim();
  const year = String(raw.year ?? raw.firstPublishYear ?? raw.publishedYear ?? 'na');
  return `openlibrary:fallback:${title}:${author}:${year}`;
}

function normalizeBook(raw: RawBook): Book {
  return {
    id: raw.id ?? raw.bookId ?? raw.key ?? raw.isbn ?? raw.title ?? '',
    externalId: raw.externalId,
    title: raw.title ?? 'Sin título',
    author: raw.author ?? raw.authorName ?? 'Autor desconocido',
    year: raw.year ?? raw.firstPublishYear ?? raw.publishedYear,
    isbn: raw.isbn,
    coverUrl: buildCoverUrl(raw)
  };
}

export async function getBooks(): Promise<Book[]> {
  const { data } = await httpClient.get('/books');
  
  // Asegurar que data sea un array
  const booksArray = Array.isArray(data) ? data : (data?.books || data?.results || []);
  
  return booksArray.map(normalizeBook);
}

export async function searchBooks(query: string): Promise<BookSearchResult[]> {
  const { data } = await httpClient.get('/api/books/search', {
    params: { query }
  });

  // Manejar diferentes formatos de respuesta de la API
  let booksArray: RawBook[] = [];
  
  if (Array.isArray(data)) {
    booksArray = data;
  } else if (data && Array.isArray(data.docs)) {
    // Formato Open Library API
    booksArray = data.docs;
  } else if (data && Array.isArray(data.results)) {
    booksArray = data.results;
  } else if (data && Array.isArray(data.books)) {
    booksArray = data.books;
  } else if (data && typeof data === 'object') {
    // Si es un objeto con alguna propiedad que sea array, intentar usar esa
    const firstArrayProp = Object.values(data).find(val => Array.isArray(val));
    if (firstArrayProp && Array.isArray(firstArrayProp)) {
      booksArray = firstArrayProp;
    }
  }

  return booksArray.map((rawBook, index) => {
    const normalized = normalizeBook(rawBook);
    const externalId = buildExternalId(rawBook);

    return {
      ...normalized,
      id: `${externalId}-${index}`,
      externalId
    };
  });
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
