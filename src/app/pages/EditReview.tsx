import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { ReviewForm } from '../components/ReviewForm';
import { EmptyState } from '../components/EmptyState';
import { Pencil, ArrowLeft } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

export function EditReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getReview, updateReview } = useLibrary();

  const review = id ? getReview(id) : undefined;

  const handleSubmit = async (data: {
    bookId: string;
    bookTitle: string;
    title: string;
    content: string;
    rating: number;
  }) => {
    if (id) {
      try {
        await updateReview(id, data);
        toast.success('Reseña actualizada exitosamente');
        navigate(`/reviews/${id}`);
      } catch {
        toast.error('No se pudo actualizar la reseña.');
      }
    }
  };

  if (!review) {
    return (
      <div className="relative min-h-screen h-full overflow-hidden bg-primary pb-10 text-primary-foreground md:pb-8">
        <div className="pointer-events-none absolute inset-0 opacity-35 [background:radial-gradient(circle_at_top_left,rgba(255,247,249,0.2),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(255,247,249,0.15),transparent_50%)]" />
        <PageHeader
          title="Reseña no encontrada"
          icon={<Pencil className="mt-1 h-7 w-7 text-primary-foreground" />}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-8">
          <EmptyState
            title="Reseña no encontrada"
            description="La reseña que intentas editar no existe o ha sido eliminada."
            action={
              <Button asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <Link to="/reviews">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a reseñas
                </Link>
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen h-full overflow-hidden bg-primary pb-10 text-primary-foreground md:pb-8">
      <div className="pointer-events-none absolute inset-0 opacity-35 [background:radial-gradient(circle_at_top_left,rgba(255,247,249,0.2),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(255,247,249,0.15),transparent_50%)]" />
      <PageHeader
        title="Editar Reseña"
        subtitle={review.bookTitle}
        icon={<Pencil className="mt-1 h-7 w-7 text-primary-foreground" />}
      />

      <div className="relative mx-auto max-w-3xl px-6 py-8">
        <Button asChild variant="ghost" size="sm" className="mb-6 bg-secondary/70 text-secondary-foreground hover:bg-secondary/90">
          <Link to={`/reviews/${review.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>

        <div className="rounded-lg border border-primary-foreground/30 bg-primary-foreground/10 p-6">
          <ReviewForm
            initialData={{
              bookId: review.bookId,
              bookTitle: review.bookTitle,
              title: review.title,
              content: review.content,
              rating: review.rating,
            }}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/reviews/${review.id}`)}
            submitLabel="Guardar cambios"
            variant="on-primary"
          />
        </div>
      </div>
    </div>
  );
}
