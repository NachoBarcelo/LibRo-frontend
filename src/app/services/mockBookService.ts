import { Book } from '../types';

const mockBooks: Book[] = [
  {
    id: 'openlibrary:OL45883W',
    externalId: 'openlibrary:OL45883W',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    year: 1925,
    isbn: '978-0743273565',
    cover: 'https://covers.openlibrary.org/b/id/7725340-M.jpg'
  },
  {
    id: 'openlibrary:OL45883W1',
    externalId: 'openlibrary:OL45883W1',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    year: 1960,
    isbn: '978-0061120084',
    cover: 'https://covers.openlibrary.org/b/id/8235657-M.jpg'
  },
  {
    id: 'openlibrary:OL45883W2',
    externalId: 'openlibrary:OL45883W2',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    year: 1813,
    isbn: '978-0141439518',
    cover: 'https://covers.openlibrary.org/b/id/7725392-M.jpg'
  },
  {
    id: 'openlibrary:OL45883W3',
    externalId: 'openlibrary:OL45883W3',
    title: '1984',
    author: 'George Orwell',
    year: 1949,
    isbn: '978-0451524935',
    cover: 'https://covers.openlibrary.org/b/id/8422246-M.jpg'
  },
  {
    id: 'openlibrary:OL45883W4',
    externalId: 'openlibrary:OL45883W4',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    year: 1951,
    isbn: '978-0316769174',
    cover: 'https://covers.openlibrary.org/b/id/7725465-M.jpg'
  },
  {
    id: 'openlibrary:OL45883W5',
    externalId: 'openlibrary:OL45883W5',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    year: 1937,
    isbn: '978-0547928227',
    cover: 'https://covers.openlibrary.org/b/id/8406152-M.jpg'
  }
];

interface RawSearchBook {
  externalId?: string;
  key?: string;
  title?: string;
  author?: string;
  authorName?: string;
  year?: number;
  firstPublishYear?: number;
  isbn?: string;
  coverUrl?: string;
  coverImage?: string;
  coverId?: number;
  coverI?: number;
}

function extractOlidFromKey(key?: string): string | undefined {
  if (!key) {
    return undefined;
  }

  const parts = key.split('/').filter(Boolean);
  return parts[parts.length - 1];
}

function buildExternalId(raw: RawSearchBook): string {
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

  return `openlibrary:fallback:${raw.title ?? 'sin-titulo'}:${raw.author ?? raw.authorName ?? 'sin-autor'}:${String(raw.year ?? raw.firstPublishYear ?? 'na')}`;
}

function buildCover(raw: RawSearchBook): string | undefined {
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

function normalizeSearchBook(raw: RawSearchBook): Book {
  const externalId = buildExternalId(raw);
  return {
    id: externalId,
    externalId,
    title: raw.title ?? 'Sin título',
    author: raw.author ?? raw.authorName ?? 'Autor desconocido',
    year: raw.year ?? raw.firstPublishYear,
    isbn: raw.isbn,
    cover: buildCover(raw)
  };
}

export async function searchBooks(query: string): Promise<Book[]> {
  if (!query.trim()) {
    return [];
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const lowerQuery = query.toLowerCase();
  return mockBooks.filter(book =>
    book.title.toLowerCase().includes(lowerQuery) ||
    book.author.toLowerCase().includes(lowerQuery)
  );
}

export async function getSuggestions(query: string): Promise<Book[]> {
  if (query.trim().length < 2) {
    return [];
  }

  const results = await searchBooks(query);
  return results.slice(0, 6);
}

export async function getBookById(id: string): Promise<Book | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));

  return mockBooks.find(book => book.id === id || book.externalId === id) || null;
}
