import { FormEvent, useMemo, useState } from 'react';
import { CreateReviewDto, Review, UpdateReviewDto } from '@/shared/types/domain';

type ReviewFormMode = 'create' | 'edit';

interface ReviewFormProps {
  mode: ReviewFormMode;
  initialReview?: Review;
  defaultBookId?: number | string;
  isSubmitting?: boolean;
  submitError?: string;
  onSubmit: (payload: CreateReviewDto | UpdateReviewDto) => void;
}

export function ReviewForm({
  mode,
  initialReview,
  defaultBookId,
  isSubmitting,
  submitError,
  onSubmit
}: ReviewFormProps) {
  const [bookId, setBookId] = useState(String(initialReview?.bookId ?? defaultBookId ?? ''));
  const [title, setTitle] = useState(initialReview?.title ?? '');
  const [content, setContent] = useState(initialReview?.content ?? '');
  const [rating, setRating] = useState(String(initialReview?.rating ?? 1));
  const [formError, setFormError] = useState<string | null>(null);

  const normalizedRating = useMemo(() => Number.parseInt(rating, 10), [rating]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (mode === 'create' && !bookId.trim()) {
      setFormError('bookId es requerido.');
      return;
    }

    if (!title.trim()) {
      setFormError('title es requerido.');
      return;
    }

    if (!content.trim()) {
      setFormError('content es requerido.');
      return;
    }

    if (!Number.isInteger(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
      setFormError('rating debe ser un entero entre 1 y 5.');
      return;
    }

    if (mode === 'create') {
      onSubmit({
        bookId: Number.isNaN(Number(bookId)) ? bookId : Number(bookId),
        title: title.trim(),
        content: content.trim(),
        rating: normalizedRating
      });
      return;
    }

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      rating: normalizedRating
    });
  }

  return (
    <form onSubmit={handleSubmit} className="stack">
      {mode === 'create' ? (
        <label className="stack-sm">
          Book ID
          <input value={bookId} onChange={(event) => setBookId(event.target.value)} placeholder="Ej: 1" />
        </label>
      ) : null}

      <label className="stack-sm">
        Título
        <input value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>

      <label className="stack-sm">
        Contenido
        <textarea value={content} onChange={(event) => setContent(event.target.value)} rows={5} />
      </label>

      <label className="stack-sm">
        Rating (1 a 5)
        <input
          type="number"
          value={rating}
          onChange={(event) => setRating(event.target.value)}
          min={1}
          max={5}
          step={1}
        />
      </label>

      {formError ? <p className="error">{formError}</p> : null}
      {submitError ? <p className="error">{submitError}</p> : null}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando...' : mode === 'create' ? 'Crear reseña' : 'Actualizar reseña'}
      </button>
    </form>
  );
}
