import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { Eye, Pencil, Trash2, Star, ArrowLeft } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { toast } from 'sonner';

export function ReviewDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { getReview, deleteReview, isLoading, error, reloadAll } = useLibrary();

  const review = id ? getReview(id) : undefined;

  const handleDelete = async () => {
    if (id) {
      try {
        await deleteReview(id);
        toast.success('Reseña eliminada');
        navigate('/reviews');
      } catch {
        toast.error('No se pudo eliminar la reseña.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen h-full overflow-hidden bg-primary pb-10 text-primary-foreground md:pb-8">
        <div className="pointer-events-none absolute inset-0 opacity-35 [background:radial-gradient(circle_at_top_left,rgba(255,247,249,0.2),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(255,247,249,0.15),transparent_50%)]" />
        <PageHeader title="Detalle de reseña" icon={<Eye className="mt-1 h-7 w-7 text-primary-foreground" />} />
        <div className="relative mx-auto max-w-7xl px-6 py-8">
          <Loader text="Cargando reseña..." variant="on-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen h-full overflow-hidden bg-primary pb-10 text-primary-foreground md:pb-8">
        <div className="pointer-events-none absolute inset-0 opacity-35 [background:radial-gradient(circle_at_top_left,rgba(255,247,249,0.2),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(255,247,249,0.15),transparent_50%)]" />
        <PageHeader title="Detalle de reseña" icon={<Eye className="mt-1 h-7 w-7 text-primary-foreground" />} />
        <div className="relative mx-auto max-w-7xl px-6 py-8">
          <ErrorMessage
            message={error}
            variant="on-primary"
            onRetry={() => {
              void reloadAll();
            }}
          />
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="relative min-h-screen h-full overflow-hidden bg-primary pb-10 text-primary-foreground md:pb-8">
        <div className="pointer-events-none absolute inset-0 opacity-35 [background:radial-gradient(circle_at_top_left,rgba(255,247,249,0.2),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(255,247,249,0.15),transparent_50%)]" />
        <PageHeader
          title="Reseña no encontrada"
          icon={<Eye className="mt-1 h-7 w-7 text-primary-foreground" />}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-8">
          <EmptyState
            title="Reseña no encontrada"
            description="La reseña que buscas no existe o ha sido eliminada."
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
        title={review.title}
        subtitle={review.bookTitle}
        icon={<Eye className="mt-1 h-7 w-7 text-primary-foreground" />}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="border-primary-foreground/35 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20">
              <Link to={`/reviews/${review.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>
            <Button
              size="sm"
              className="bg-foreground text-primary-foreground hover:bg-foreground/90"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </div>
        }
      />

      <div className="relative mx-auto max-w-4xl px-6 py-8">
        <Button asChild variant="ghost" size="sm" className="mb-6 bg-secondary/70 text-secondary-foreground hover:bg-secondary/90">
          <Link to="/reviews">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a reseñas
          </Link>
        </Button>

        <Card className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground">
          <CardHeader className="space-y-4">
            <div>
              <h2 className="text-2xl">{review.title}</h2>
              <p className="mt-1 text-lg text-primary-foreground/85">
                {review.bookTitle}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < review.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-primary-foreground/40'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-primary-foreground/80">
                {review.rating}/5
              </span>
            </div>

            <div className="flex gap-4 text-sm text-primary-foreground/75">
              <span>
                Creada:{' '}
                {new Date(review.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              {review.updatedAt !== review.createdAt && (
                <span>
                  Actualizada:{' '}
                  {new Date(review.updatedAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              )}
            </div>
          </CardHeader>

          <CardContent className="max-w-none">
            <div className="whitespace-pre-wrap text-base leading-relaxed">
              {review.content}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="border-primary-foreground/30 bg-primary text-primary-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar reseña?</AlertDialogTitle>
            <AlertDialogDescription className="text-primary-foreground/80">
              Esta acción no se puede deshacer. La reseña será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-foreground text-primary-foreground hover:bg-foreground/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
