import { useState } from 'react';
import { useDeleteUserBook, useUpsertUserBook, useUserBooks } from '@/features/userBooks/hooks/useUserBooks';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { Loader } from '@/shared/components/Loader';
import { PageHeader } from '@/shared/components/PageHeader';
import { UserBookStatus } from '@/shared/types/domain';
import { getErrorMessage } from '@/shared/utils/error';

const statusOptions: Array<UserBookStatus | 'ALL'> = ['ALL', 'TO_READ', 'FAVORITE', 'READ'];

export function UserBooksPage() {
  const [filterStatus, setFilterStatus] = useState<UserBookStatus | 'ALL'>('ALL');
  const statusFilter = filterStatus === 'ALL' ? undefined : filterStatus;

  const userBooksQuery = useUserBooks(statusFilter);
  const upsertMutation = useUpsertUserBook();
  const deleteMutation = useDeleteUserBook();

  return (
    <section className="stack">
      <PageHeader title="Mis Libros" subtitle="GET /user-books con filtro opcional por status." />

      <div className="inline-form">
        <label>
          Status
          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value as UserBookStatus | 'ALL')}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      {userBooksQuery.isLoading ? <Loader label="Cargando user-books..." /> : null}
      {userBooksQuery.isError ? <ErrorMessage message={getErrorMessage(userBooksQuery.error)} /> : null}

      {!userBooksQuery.isLoading && !userBooksQuery.isError && userBooksQuery.data?.length === 0 ? (
        <EmptyState title="No hay libros en tu lista." />
      ) : null}

      {userBooksQuery.data?.length ? (
        <ul className="list">
          {userBooksQuery.data.map((item) => {
            const bookTitle = item.book?.title ?? `Book #${item.bookId}`;
            return (
              <li key={item.id} className="card">
                <h3>{bookTitle}</h3>
                <p>Status actual: {item.status}</p>

                <div className="inline-form">
                  <select
                    value={item.status}
                    onChange={(event) =>
                      upsertMutation.mutate({
                        bookId: item.bookId,
                        status: event.target.value as UserBookStatus
                      })
                    }
                    disabled={upsertMutation.isPending}
                  >
                    <option value="TO_READ">TO_READ</option>
                    <option value="FAVORITE">FAVORITE</option>
                    <option value="READ">READ</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(item.id)}
                    disabled={deleteMutation.isPending}
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      {upsertMutation.isError ? <ErrorMessage message={getErrorMessage(upsertMutation.error)} /> : null}
      {deleteMutation.isError ? <ErrorMessage message={getErrorMessage(deleteMutation.error)} /> : null}
    </section>
  );
}
