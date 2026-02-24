import { httpClient } from '@/api/httpClient';
import { UpsertUserBookDto, UserBook, UserBookStatus } from '@/shared/types/domain';

interface RawUserBook {
  id: string;
  bookId: string;
  status: UserBookStatus;
  book?: {
    id: string;
    externalId?: string;
    title: string;
    author?: string;
    publishedYear?: number;
    isbn?: string;
    coverImage?: string;
    createdAt?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

function normalizeUserBook(raw: RawUserBook): UserBook {
  return {
    id: raw.id,
    bookId: raw.bookId,
    status: raw.status,
    book: raw.book,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt
  };
}

export async function getUserBooks(status?: UserBookStatus): Promise<UserBook[]> {
  const response = await httpClient.get('/user-books', {
    params: status ? { status: status.toUpperCase() } : undefined
  });
  
  // Manejar formato { success: true, data: [...] }
  let userBooksArray: RawUserBook[] = [];
  
  if (response.data?.data && Array.isArray(response.data.data)) {
    userBooksArray = response.data.data;
  } else if (Array.isArray(response.data)) {
    userBooksArray = response.data;
  }
  
  return userBooksArray.map(normalizeUserBook);
}

export async function upsertUserBook(payload: UpsertUserBookDto): Promise<UserBook> {
  // Asegurar que el status esté en mayúsculas
  const normalizedPayload = {
    ...payload,
    status: payload.status.toUpperCase() as UserBookStatus
  };
  
  const response = await httpClient.post('/user-books', normalizedPayload);
  
  // Manejar diferentes formatos de respuesta
  let userBookData: RawUserBook;
  if (response.data?.data) {
    userBookData = response.data.data;
  } else if (response.data) {
    userBookData = response.data;
  } else {
    throw new Error('No se recibió respuesta válida del servidor');
  }
  
  return normalizeUserBook(userBookData);
}

export async function deleteUserBook(userBookId: string): Promise<void> {
  await httpClient.delete(`/user-books/${userBookId}`);
}
