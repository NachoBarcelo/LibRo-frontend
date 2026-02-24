import { useState } from 'react';
import { useCreateBook, useSearchBooks } from '@/features/books/hooks/useBooks';
import { useUpsertUserBook } from '@/features/userBooks/hooks/useUserBooks';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { Loader } from '@/shared/components/Loader';
import { PageHeader } from '@/shared/components/PageHeader';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { UserBookStatus } from '@/shared/types/domain';
import { getErrorMessage } from '@/shared/utils/error';

const statuses: UserBookStatus[] = ['TO_READ', 'FAVORITE', 'READ'];

export function BooksSearchPage() {
  const [inputValue, setInputValue] = useState('');
  const [statusByBookId, setStatusByBookId] = useState<Record<string, UserBookStatus>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const debouncedQuery = useDebouncedValue(inputValue.trim(), 350);

  const searchQuery = useSearchBooks(debouncedQuery);
  const createBook = useCreateBook();
  const upsertUserBook = useUpsertUserBook();

  function getSelectedStatus(bookId: string): UserBookStatus {
    return statusByBookId[bookId] ?? 'TO_READ';
  }

  async function handleAddToList(
    book: {
      externalId: string;
      title: string;
      author?: string;
      coverUrl?: string;
      year?: number;
    },
    status: UserBookStatus
  ) {
    setSuccessMessage(null);

    try {
      const localBook = await createBook.mutateAsync({
        externalId: book.externalId,
        title: book.title,
        author: book.author ?? 'Autor desconocido',
        coverImage: book.coverUrl,
        publishedYear: book.year
      });

      await upsertUserBook.mutateAsync({
        bookId: localBook.id,
        status
      });

      setSuccessMessage(`Libro agregado/actualizado en user-books: ${book.title}`);
    } catch {
      return;
    }
  }

  const normalizedInput = inputValue.trim().toLowerCase();
  const suggestions =
    searchQuery.data
      ?.filter((book) => {
        if (!normalizedInput) {
          return false;
        }

        const title = book.title.toLowerCase();
        const author = (book.author ?? '').toLowerCase();
        return title.includes(normalizedInput) || author.includes(normalizedInput);
      })
      .slice(0, 6) ?? [];

  return (
    <section className="stack">
      <PageHeader title="Buscar Libros" subtitle="Busca en Open Library vía backend y agrega a user-books." />

      <div className="search-box">
        <input
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder="Buscar por título, autor o ISBN"
        />

        {suggestions.length > 0 ? (
          <ul className="suggestions-list">
            {suggestions.map((book) => (
              <li key={`suggestion-${book.id}`}>
                <button
                  type="button"
                  className="suggestion-item"
                  onClick={() => setInputValue(book.title)}
                >
                  <span>{book.title}</span>
                  <small>{book.author ?? 'Autor desconocido'}</small>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {inputValue.trim() ? <small>Mostrando sugerencias en vivo para: {debouncedQuery || inputValue.trim()}</small> : null}

      {searchQuery.isLoading ? <Loader label="Buscando libros..." /> : null}
      {searchQuery.isError ? <ErrorMessage message={getErrorMessage(searchQuery.error)} /> : null}

      {!searchQuery.isLoading && !searchQuery.isError && debouncedQuery && searchQuery.data?.length === 0 ? (
        <EmptyState title="Sin resultados" description="No se encontraron libros para tu búsqueda." />
      ) : null}

      {searchQuery.data?.length ? (
        <ul className="list">
          {searchQuery.data.map((book) => {
            const statusKey = book.externalId;
            const bookId = String(statusKey);
            const status = getSelectedStatus(bookId);
            return (
              <li key={book.id} className="card">
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={`Portada de ${book.title}`}
                    className="book-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="book-cover book-cover--placeholder">Sin portada</div>
                )}
                <h3>{book.title}</h3>
                <p>Autor: {book.author ?? 'N/A'}</p>
                <p>Año: {book.year ?? 'N/A'}</p>
                <p>ISBN: {book.isbn ?? 'N/A'}</p>

                <div className="inline-form">
                  <select
                    value={status}
                    onChange={(event) =>
                      setStatusByBookId((prev) => ({
                        ...prev,
                        [bookId]: event.target.value as UserBookStatus
                      }))
                    }
                  >
                    {statuses.map((statusOption) => (
                      <option key={statusOption} value={statusOption}>
                        {statusOption}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      handleAddToList(book, status);
                    }}
                    disabled={upsertUserBook.isPending || createBook.isPending}
                  >
                    Agregar a mi lista
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      {createBook.isError ? <ErrorMessage message={getErrorMessage(createBook.error)} /> : null}
      {upsertUserBook.isError ? <ErrorMessage message={getErrorMessage(upsertUserBook.error)} /> : null}
      {successMessage ? <p>{successMessage}</p> : null}
    </section>
  );
}
