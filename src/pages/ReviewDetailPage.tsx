import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDeleteReview, useReview } from '@/features/reviews/hooks/useReviews';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { Loader } from '@/shared/components/Loader';
import { PageHeader } from '@/shared/components/PageHeader';
import { getErrorMessage } from '@/shared/utils/error';

export function ReviewDetailPage() {
  const params = useParams();
  const reviewId = params.id;
  const navigate = useNavigate();

  const reviewQuery = useReview(reviewId);
  const deleteMutation = useDeleteReview();

  return (
    <section className="stack">
      <PageHeader title="Detalle de Reseña" actions={<Link to="/reviews">Volver</Link>} />

      {reviewQuery.isLoading ? <Loader label="Cargando reseña..." /> : null}
      {reviewQuery.isError ? <ErrorMessage message={getErrorMessage(reviewQuery.error)} /> : null}

      {reviewQuery.data ? (
        <article className="card stack-sm">
          <h2>{reviewQuery.data.title}</h2>
          <p>Book ID: {reviewQuery.data.bookId}</p>
          <p>Rating: {reviewQuery.data.rating}</p>
          <p>{reviewQuery.data.content}</p>

          <div className="inline-form">
            <Link to={`/reviews/${reviewQuery.data.id}/edit`}>Editar</Link>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('¿Eliminar esta reseña?')) {
                  deleteMutation.mutate(reviewQuery.data.id, {
                    onSuccess: () => {
                      navigate('/reviews');
                    }
                  });
                }
              }}
              disabled={deleteMutation.isPending}
            >
              Eliminar
            </button>
          </div>
        </article>
      ) : null}

      {deleteMutation.isError ? <ErrorMessage message={getErrorMessage(deleteMutation.error)} /> : null}
    </section>
  );
}
