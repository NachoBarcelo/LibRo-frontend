import { useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ReviewForm } from '@/features/reviews/components/ReviewForm';
import { useCreateReview } from '@/features/reviews/hooks/useReviews';
import { PageHeader } from '@/shared/components/PageHeader';
import { getErrorMessage } from '@/shared/utils/error';

export function ReviewNewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const createReviewMutation = useCreateReview();

  const defaultBookId = useMemo(() => searchParams.get('bookId') ?? '', [searchParams]);

  return (
    <section className="stack">
      <PageHeader
        title="Nueva Reseña"
        subtitle="Crear reseña con validaciones mínimas."
        actions={<Link to="/reviews">Volver al listado</Link>}
      />

      <ReviewForm
        mode="create"
        defaultBookId={defaultBookId}
        isSubmitting={createReviewMutation.isPending}
        submitError={createReviewMutation.isError ? getErrorMessage(createReviewMutation.error) : undefined}
        onSubmit={(payload) => {
          if (!("bookId" in payload)) {
            return;
          }

          createReviewMutation.mutate(payload, {
            onSuccess: (review) => {
              navigate(`/reviews/${review.id}`);
            }
          });
        }}
      />
    </section>
  );
}
