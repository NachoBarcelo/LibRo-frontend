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
    <div className="min-h-screen">
      <PageHeader
        title="Mis Reseñas"
        subtitle="Todas tus reseñas y opiniones sobre libros"
        icon={<FileText className="mt-1 h-7 w-7 text-primary" />}
        actions={
          <Button asChild size="sm">
            <Link to="/reviews/new">
              <Plus className="mr-2 h-4 w-4" />
              Nueva reseña
            </Link>
          </Button>
        }
      />

      <div className="mx-auto max-w-7xl px-6 py-8">
        {isLoading && <Loader text="Cargando reseñas..." />}

        {!isLoading && error && (
          <ErrorMessage
            message={error}
            onRetry={() => {
              void reloadAll();
            }}
          />
        )}

        {!isLoading && !error && reviews.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-10 w-10 text-muted-foreground" />}
            title="No tienes reseñas"
            description="Empieza a escribir reseñas sobre los libros que has leído para compartir tus opiniones."
            action={
              <Button asChild>
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
            <p className="mb-6 text-sm text-muted-foreground">
              {reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'}
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sortedReviews.map((review) => (
                <Card key={review.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-base line-clamp-2">
                      {review.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-1">
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
                              : 'text-muted'
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-sm text-muted-foreground">
                        {review.rating}/5
                      </span>
                    </div>
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {review.content}
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </CardContent>
                  <CardFooter className="border-t border-border pt-4">
                    <div className="flex w-full gap-2">
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <Link to={`/reviews/${review.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="flex-1">
                        <Link to={`/reviews/${review.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar reseña?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La reseña será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReview}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
