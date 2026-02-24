import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { ReviewForm } from '../components/ReviewForm';
import { Plus } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { toast } from 'sonner';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/ui/button';

export function NewReview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addReview, userBooks } = useLibrary();

  const queryBookId = searchParams.get('bookId') || '';
  const queryBookTitle = searchParams.get('bookTitle') || '';

  const selectedBook =
    userBooks.find((book) => book.id === queryBookId) ??
    userBooks.find((book) => book.title === queryBookTitle) ??
    userBooks[0];

  const bookId = selectedBook?.id ?? '';
  const bookTitle = selectedBook?.title ?? '';

  const handleSubmit = async (data: {
    bookId: string;
    bookTitle: string;
    title: string;
    content: string;
    rating: number;
  }) => {
    try {
      await addReview(data);
      toast.success('Reseña creada exitosamente');
      navigate('/reviews');
    } catch {
      toast.error('No se pudo crear la reseña.');
    }
  };

  if (!selectedBook) {
    return (
      <div className="min-h-screen">
        <PageHeader
          title="Nueva Reseña"
          subtitle="Comparte tu opinión sobre un libro"
          icon={<Plus className="mt-1 h-7 w-7 text-primary" />}
        />

        <div className="mx-auto max-w-3xl px-6 py-8">
          <EmptyState
            title="No tienes libros en tu lista"
            description="Agrega un libro primero para poder crear reseñas."
            action={
              <Button asChild>
                <Link to="/search">Ir a buscar libros</Link>
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Nueva Reseña"
        subtitle="Comparte tu opinión sobre un libro"
        icon={<Plus className="mt-1 h-7 w-7 text-primary" />}
      />

      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="rounded-lg border border-border bg-card p-6">
          <ReviewForm
            initialData={
              bookId && bookTitle
                ? {
                    bookId,
                    bookTitle,
                    title: '',
                    content: '',
                    rating: 0,
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            onCancel={() => navigate('/reviews')}
            submitLabel="Crear reseña"
          />
        </div>
      </div>
    </div>
  );
}
