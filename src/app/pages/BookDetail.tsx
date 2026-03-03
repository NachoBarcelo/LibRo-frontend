import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Calendar, Heart, ListChecks, Star, CheckCircle2, LibraryBig } from 'lucide-react';
import { getBookDetailById, searchBookDetailByExternalId } from '@/api/services/booksService';
import { BookDetail as BookDetailType, BookStatus } from '../types';
import { BookSearchDetail } from '@/shared/types/domain';
import { PageHeader } from '../components/PageHeader';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { StatusSelect } from '../components/StatusSelect';
import { useLibrary } from '../context/LibraryContext';
import { toast } from 'sonner';

function extractTextFromUnknown(value: unknown): string | null {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === 'object' && value !== null && 'value' in value) {
    const nested = (value as { value?: unknown }).value;
    return typeof nested === 'string' && nested.trim().length > 0 ? nested.trim() : null;
  }

  return null;
}

function extractGenresFromOpenLibrary(openLibrary: Record<string, unknown> | null): string[] {
  if (!openLibrary) {
    return [];
  }

  const candidates: unknown[] = [];
  candidates.push(openLibrary.subjects);

  if (typeof openLibrary.edition === 'object' && openLibrary.edition !== null) {
    candidates.push((openLibrary.edition as Record<string, unknown>).subjects);
  }

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter((item): item is string => typeof item === 'string').slice(0, 5);
    }
  }

  return [];
}

const statusLabels: Record<BookStatus, string> = {
  FAVORITE: 'Favorito',
  TO_READ: 'Por leer',
  READ: 'Leído'
};

const statusIcon: Record<BookStatus, React.ComponentType<{ className?: string }>> = {
  FAVORITE: Heart,
  TO_READ: ListChecks,
  READ: CheckCircle2
};

const statusClassName: Record<BookStatus, string> = {
  FAVORITE: 'bg-white text-primary border-white/80',
  TO_READ: 'bg-white text-primary border-white/80',
  READ: 'bg-white text-primary border-white/80'
};

function formatDate(value?: string) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function ratingStars(rating: number) {
  return Array.from({ length: 5 }).map((_, index) => (
    <Star
      key={index}
      className={`h-4 w-4 ${index < rating ? 'fill-primary text-primary' : 'text-muted-foreground/40'}`}
    />
  ));
}

export function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const [bookDetail, setBookDetail] = useState<BookDetailType | null>(null);
  const [searchDetail, setSearchDetail] = useState<BookSearchDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { updateBookStatus } = useLibrary();

  useEffect(() => {
    if (!id) {
      setError('No se recibió el identificador del libro.');
      setIsLoading(false);
      return;
    }

    const loadDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const detail = await getBookDetailById(id);
        console.log('[BookDetail] GET /books/:id response', detail);
        setBookDetail(detail);

        const externalId = detail.externalId?.trim();
        if (externalId && externalId.startsWith('/works/')) {
          try {
            const detailByExternalId = await searchBookDetailByExternalId(externalId);
            console.log('[BookDetail] GET /api/books/search/detail response', detailByExternalId);
            setSearchDetail(detailByExternalId);
          } catch {
            setSearchDetail(null);
          }
        } else {
          setSearchDetail(null);
        }
      } catch {
        setError('No pudimos cargar el detalle del libro.');
        setBookDetail(null);
        setSearchDetail(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadDetail();
  }, [id]);

  const primaryUserStatus = useMemo(() => {
    if (!bookDetail || bookDetail.userBooks.length === 0) {
      return null;
    }
    return bookDetail.userBooks[0].status;
  }, [bookDetail]);

  const synopsisText = useMemo(() => {
    if (!bookDetail) {
      return null;
    }

    const fromSearchDetail = extractTextFromUnknown(searchDetail?.synopsis);
    if (fromSearchDetail) {
      return fromSearchDetail;
    }

    const fromTopLevel = extractTextFromUnknown(bookDetail.synopsis);
    if (fromTopLevel) {
      return fromTopLevel;
    }

    if (!bookDetail.openLibrary) {
      return null;
    }

    const openLibrary = bookDetail.openLibrary;
    const directDescription = extractTextFromUnknown(openLibrary.description);
    if (directDescription) {
      return directDescription;
    }

    if (typeof openLibrary.edition === 'object' && openLibrary.edition !== null) {
      return extractTextFromUnknown((openLibrary.edition as Record<string, unknown>).description);
    }

    return null;
  }, [bookDetail, searchDetail]);

  const genres = useMemo(() => {
    if (!bookDetail) {
      return [] as string[];
    }

    if (searchDetail?.genres && searchDetail.genres.length > 0) {
      return searchDetail.genres.slice(0, 5);
    }

    if (bookDetail.genres.length > 0) {
      return bookDetail.genres.slice(0, 5);
    }

    return extractGenresFromOpenLibrary(bookDetail.openLibrary);
  }, [bookDetail, searchDetail]);

  const handleStatusChange = async (newStatus: BookStatus) => {
    if (!bookDetail) {
      return;
    }

    setIsUpdatingStatus(true);
    try {
      await updateBookStatus(bookDetail.id, newStatus);
      setBookDetail((current) => {
        if (!current) {
          return current;
        }

        if (current.userBooks.length === 0) {
          return current;
        }

        return {
          ...current,
          userBooks: current.userBooks.map((item, index) =>
            index === 0 ? { ...item, status: newStatus } : item
          )
        };
      });
      toast.success('Estado actualizado');
    } catch {
      toast.error('No se pudo actualizar el estado.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen h-full overflow-hidden bg-primary pb-10 text-primary-foreground md:pb-8">
        <div className="pointer-events-none absolute inset-0 opacity-35 [background:radial-gradient(circle_at_top_left,rgba(255,247,249,0.2),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(255,247,249,0.15),transparent_50%)]" />
        <PageHeader title="Detalle del libro" subtitle="Cargando información..." icon={<BookOpen className="mt-1 h-7 w-7 text-primary-foreground" />} />
        <div className="relative mx-auto max-w-7xl px-6 py-8">
          <Loader text="Cargando detalle del libro..." variant="on-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen h-full overflow-hidden bg-primary pb-10 text-primary-foreground md:pb-8">
        <div className="pointer-events-none absolute inset-0 opacity-35 [background:radial-gradient(circle_at_top_left,rgba(255,247,249,0.2),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(255,247,249,0.15),transparent_50%)]" />
        <PageHeader title="Detalle del libro" icon={<BookOpen className="mt-1 h-7 w-7 text-primary-foreground" />} />
        <div className="relative mx-auto max-w-7xl px-6 py-8">
          <ErrorMessage message={error} variant="on-primary" />
        </div>
      </div>
    );
  }

  if (!bookDetail) {
    return (
      <div className="relative min-h-screen h-full overflow-hidden bg-primary pb-10 text-primary-foreground md:pb-8">
        <div className="pointer-events-none absolute inset-0 opacity-35 [background:radial-gradient(circle_at_top_left,rgba(255,247,249,0.2),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(255,247,249,0.15),transparent_50%)]" />
        <PageHeader title="Libro no encontrado" icon={<BookOpen className="mt-1 h-7 w-7 text-primary-foreground" />} />
        <div className="relative mx-auto max-w-7xl px-6 py-8">
          <EmptyState
            title="Libro no encontrado"
            description="No encontramos un libro local con ese identificador."
            action={
              <Button asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <Link to="/my-books">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a Mis Libros
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
        title={bookDetail.title}
        subtitle={bookDetail.author ?? 'Autor desconocido'}
        icon={<LibraryBig className="mt-1 h-7 w-7 text-primary-foreground" />}
        actions={
          <Button asChild size="sm" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 sm:w-auto">
            <Link to="/my-books">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Mis Libros
            </Link>
          </Button>
        }
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid w-full min-w-0 gap-6 lg:grid-cols-12">
          <Card className="w-full min-w-0 overflow-hidden border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground lg:col-span-4 lg:mx-0">
            <div className="w-full">
            <div className="aspect-[2/3] bg-primary-foreground/10">
              {bookDetail.coverImage ? (
                <img src={bookDetail.coverImage} alt={bookDetail.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-foreground/12 to-primary-foreground/5">
                  <BookOpen className="h-16 w-16 text-primary-foreground/40" />
                </div>
              )}
            </div>
            </div>
            <CardContent className="space-y-3 p-5">
              <div className="flex flex-wrap items-center gap-2">
                {primaryUserStatus ? (
                  <Badge variant="outline" className={statusClassName[primaryUserStatus]}>
                    {React.createElement(statusIcon[primaryUserStatus], { className: 'h-3.5 w-3.5' })}
                    {statusLabels[primaryUserStatus]}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground/75">Sin estado personal</Badge>
                )}
                {bookDetail.publishedYear && (
                  <Badge variant="secondary" className="gap-1 bg-secondary text-secondary-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {bookDetail.publishedYear}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="min-w-0 space-y-6 lg:col-span-8">
            <Card className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground">
              <CardHeader>
                <CardTitle className="text-xl">Sinopsis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="whitespace-pre-wrap text-sm text-primary-foreground/80">
                  {synopsisText ?? 'No hay sinopsis disponible para este libro.'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground">
              <CardHeader>
                <CardTitle className="text-xl">Géneros</CardTitle>
              </CardHeader>
              <CardContent>
                {genres.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {genres.map((genre) => (
                      <Badge key={genre} variant="outline" className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-primary-foreground/75">No hay géneros disponibles.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground">
              <CardHeader>
                <CardTitle className="text-xl">Estado en tu lista personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {bookDetail.userBooks.length > 0 ? (
                  <>
                    {primaryUserStatus && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-primary-foreground/80">Editar estado:</span>
                        <StatusSelect
                          value={primaryUserStatus}
                          onChange={(newStatus) => {
                            void handleStatusChange(newStatus);
                          }}
                          disabled={isUpdatingStatus}
                          triggerClassName="h-9 border-primary-foreground/35 bg-primary-foreground/10 text-primary-foreground"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-primary-foreground/75">Este libro aún no está agregado en tu lista personal.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground">
              <CardHeader>
                <CardTitle className="text-xl">Reseñas del libro ({bookDetail.reviews.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {bookDetail.reviews.length === 0 ? (
                  <p className="text-sm text-primary-foreground/75">Todavía no hay reseñas para este libro.</p>
                ) : (
                  bookDetail.reviews.map((review, index) => (
                    <div key={review.id}>
                      {index > 0 && <Separator className="mb-4" />}
                      <div className="space-y-2">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <h3 className="text-base font-medium">{review.title}</h3>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">{ratingStars(review.rating)}</div>
                            <span className="text-xs text-primary-foreground/80">{review.rating}/5</span>
                          </div>
                        </div>
                        <p className="whitespace-pre-wrap text-sm text-primary-foreground/80">{review.content}</p>
                        <p className="text-xs text-primary-foreground/75">
                          Creada: {formatDate(review.createdAt)}
                          {review.updatedAt && review.updatedAt !== review.createdAt ? ` · Actualizada: ${formatDate(review.updatedAt)}` : ''}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
