import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { FileText, Plus, Pencil, Trash2, Eye, Star } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
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

export function Reviews() {
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const { reviews, deleteReview, isLoading, error, reloadAll } = useLibrary();

  const handleDeleteReview = async () => {
    if (reviewToDelete) {
      try {
        await deleteReview(reviewToDelete);
        toast.success('Reseña eliminada');
      } catch {
        toast.error('No se pudo eliminar la reseña.');
      } finally {
        setReviewToDelete(null);
      }
    }
  };

  const sortedReviews = [...reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="relative min-h-screen h-full overflow-hidden bg-primary pb-10 text-primary-foreground md:pb-8">
      <div className="pointer-events-none absolute inset-0 opacity-35 [background:radial-gradient(circle_at_top_left,rgba(255,247,249,0.2),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(255,247,249,0.15),transparent_50%)]" />
      <PageHeader
        title="Mis Reseñas"
        subtitle="Todas tus reseñas y opiniones sobre libros"
        icon={<FileText className="mt-1 h-7 w-7 text-primary-foreground" />}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex justify-end">
          <Button asChild size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <Link to="/reviews/new">
              <Plus className="mr-2 h-4 w-4" />
              Nueva reseña
            </Link>
          </Button>
        </div>

        {isLoading && <Loader text="Cargando reseñas..." variant="on-primary" />}

        {!isLoading && error && (
          <ErrorMessage
            message={error}
            variant="on-primary"
            onRetry={() => {
              void reloadAll();
            }}
          />
        )}

        {!isLoading && !error && reviews.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-10 w-10 text-primary-foreground/70" />}
            title="No tienes reseñas"
            description="Empieza a escribir reseñas sobre los libros que has leído para compartir tus opiniones."
            action={
              <Button asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <Link to="/reviews/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear reseña
                </Link>
              </Button>
            }
          />
        ) : null}

        {!isLoading && !error && reviews.length > 0 ? (
          <div>
            <p className="mb-6 text-sm text-primary-foreground/80">
              {reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'}
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sortedReviews.map((review) => (
                <Card key={review.id} className="flex flex-col border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground">
                  <CardHeader>
                    <CardTitle className="text-base line-clamp-2">
                      {review.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-1 text-primary-foreground/80">
                      {review.bookTitle}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="mb-3 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-primary-foreground/40'
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-sm text-primary-foreground/80">
                        {review.rating}/5
                      </span>
                    </div>
                    <p className="line-clamp-3 text-sm text-primary-foreground/80">
                      {review.content}
                    </p>
                    <p className="mt-3 text-xs text-primary-foreground/70">
                      {new Date(review.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </CardContent>
                  <CardFooter className="border-t border-primary-foreground/20 pt-4">
                    <div className="flex w-full gap-2">
                      <Button asChild size="sm" variant="outline" className="flex-1 border-primary-foreground/35 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20">
                        <Link to={`/reviews/${review.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="flex-1 border-primary-foreground/35 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20">
                        <Link to={`/reviews/${review.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        className="bg-foreground text-primary-foreground hover:bg-foreground/90"
                        onClick={() => setReviewToDelete(review.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!reviewToDelete} onOpenChange={() => setReviewToDelete(null)}>
        <AlertDialogContent className="border-primary-foreground/30 bg-primary text-primary-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar reseña?</AlertDialogTitle>
            <AlertDialogDescription className="text-primary-foreground/80">
              Esta acción no se puede deshacer. La reseña será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReview} className="bg-foreground text-primary-foreground hover:bg-foreground/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
