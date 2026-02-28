import { Link, useNavigate, useParams } from 'react-router-dom';
import { ReviewForm } from '@/features/reviews/components/ReviewForm';
import { useReview, useUpdateReview } from '@/features/reviews/hooks/useReviews';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { Loader } from '@/shared/components/Loader';
import { PageHeader } from '@/shared/components/PageHeader';
import { getErrorMessage } from '@/shared/utils/error';

export function ReviewEditPage() {
  const params = useParams();
  const navigate = useNavigate();
  const reviewId = params.id;

  const reviewQuery = useReview(reviewId);
  const updateReviewMutation = useUpdateReview(reviewId ?? '');

  if (!reviewId) {
    return (
      <section className="stack">
        <PageHeader title="Editar Reseña" actions={<Link to="/reviews">Volver</Link>} />
        <ErrorMessage message="ID inválido." />
      </section>
    );
  }

  return (
    <section className="stack">
      <PageHeader title="Editar Reseña" actions={<Link to="/reviews">Volver</Link>} />

      {reviewQuery.isLoading ? <Loader label="Cargando reseña..." /> : null}
      {reviewQuery.isError ? <ErrorMessage message={getErrorMessage(reviewQuery.error)} /> : null}

      {reviewQuery.data ? (
        <ReviewForm
          mode="edit"
          initialReview={reviewQuery.data}
          isSubmitting={updateReviewMutation.isPending}
          submitError={updateReviewMutation.isError ? getErrorMessage(updateReviewMutation.error) : undefined}
          onSubmit={(payload) => {
            updateReviewMutation.mutate(payload, {
              onSuccess: () => {
                navigate(`/reviews/${reviewId}`);
              }
            });
          }}
        />
      ) : null}
    </section>
  );
}
