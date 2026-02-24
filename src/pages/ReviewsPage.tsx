import { Link, useSearchParams } from 'react-router-dom';
import { useDeleteReview, useReviews, useReviewsByBook } from '@/features/reviews/hooks/useReviews';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { Loader } from '@/shared/components/Loader';
import { PageHeader } from '@/shared/components/PageHeader';
import { getErrorMessage } from '@/shared/utils/error';

export function ReviewsPage() {
  const [searchParams] = useSearchParams();
  const bookId = searchParams.get('bookId') ?? undefined;

  const allReviewsQuery = useReviews();
  const reviewsByBookQuery = useReviewsByBook(bookId ?? undefined);
  const deleteReviewMutation = useDeleteReview();

  const activeQuery = bookId ? reviewsByBookQuery : allReviewsQuery;

  return (
    <section className="stack">
      <PageHeader
        title="Reseñas"
        subtitle={bookId ? `Filtradas por bookId=${bookId}` : 'Listado global de reseñas.'}
        actions={<Link to={bookId ? `/reviews/new?bookId=${bookId}` : '/reviews/new'}>Nueva reseña</Link>}
      />

      {activeQuery.isLoading ? <Loader label="Cargando reseñas..." /> : null}
      {activeQuery.isError ? <ErrorMessage message={getErrorMessage(activeQuery.error)} /> : null}

      {!activeQuery.isLoading && !activeQuery.isError && activeQuery.data?.length === 0 ? (
        <EmptyState title="No hay reseñas para mostrar." />
      ) : null}

      {activeQuery.data?.length ? (
        <ul className="list">
          {activeQuery.data.map((review) => (
            <li key={review.id} className="card">
              <h3>{review.title}</h3>
              <p>Book ID: {review.bookId}</p>
              <p>Rating: {review.rating}</p>
              <div className="inline-form">
                <Link to={`/reviews/${review.id}`}>Ver detalle</Link>
                <Link to={`/reviews/${review.id}/edit`}>Editar</Link>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('¿Eliminar reseña?')) {
                      deleteReviewMutation.mutate(review.id);
                    }
                  }}
                  disabled={deleteReviewMutation.isPending}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {deleteReviewMutation.isError ? <ErrorMessage message={getErrorMessage(deleteReviewMutation.error)} /> : null}
    </section>
  );
}
