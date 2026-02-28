import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { BookCard } from '../components/BookCard';
import { StatusSelect } from '../components/StatusSelect';
import { EmptyState } from '../components/EmptyState';
import { BookMarked, Plus, Trash2, Loader2 } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { BookStatus } from '../types';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
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

type FilterStatus = 'ALL' | BookStatus;

export function MyBooks() {
  type ViewMode = 'list' | 'grid-1' | 'grid-2' | 'grid-4';

  const [filter, setFilter] = useState<FilterStatus>('ALL');
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);
  const [isUpdatingBookId, setIsUpdatingBookId] = useState<string | null>(null);
  const [isDeletingBook, setIsDeletingBook] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.innerWidth >= 1024;
  });
  const [isSmallUp, setIsSmallUp] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.innerWidth >= 640;
  });
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === 'undefined') {
      return 'grid-1';
    }
    return window.innerWidth >= 1024 ? 'grid-4' : 'grid-1';
  });
  const { userBooks, updateBookStatus, removeBook, isLoading, error, reloadAll } = useLibrary();

  useEffect(() => {
    const desktopMql = window.matchMedia('(min-width: 1024px)');
    const smallMql = window.matchMedia('(min-width: 640px)');
    const onChange = () => {
      setIsDesktop(desktopMql.matches);
      setIsSmallUp(smallMql.matches);
    };
    onChange();
    desktopMql.addEventListener('change', onChange);
    smallMql.addEventListener('change', onChange);
    return () => {
      desktopMql.removeEventListener('change', onChange);
      smallMql.removeEventListener('change', onChange);
    };
  }, []);

  useEffect(() => {
    if (isDesktop && viewMode === 'grid-1') {
      setViewMode('grid-4');
      return;
    }
    if (!isSmallUp && (viewMode === 'grid-2' || viewMode === 'grid-4')) {
      setViewMode('grid-1');
      return;
    }
    if (!isDesktop && viewMode === 'grid-4') {
      setViewMode(isSmallUp ? 'grid-2' : 'grid-1');
    }
  }, [isDesktop, isSmallUp, viewMode]);

  const filteredBooks =
    filter === 'ALL'
      ? userBooks
      : userBooks.filter((book) => book.status === filter);

  const handleStatusChange = async (bookId: string, newStatus: BookStatus) => {
    setIsUpdatingBookId(bookId);
    try {
      await updateBookStatus(bookId, newStatus);
      toast.success('Estado actualizado');
    } catch {
      toast.error('No se pudo actualizar el estado.');
    } finally {
      setIsUpdatingBookId(null);
    }
  };

  const handleDeleteBook = async () => {
    if (bookToDelete) {
      setIsDeletingBook(true);
      try {
        await removeBook(bookToDelete);
        toast.success('Libro eliminado de tu lista');
      } catch {
        toast.error('No se pudo eliminar el libro.');
      } finally {
        setIsDeletingBook(false);
        setBookToDelete(null);
      }
    }
  };

  const statusCounts = {
    ALL: userBooks.length,
    FAVORITE: userBooks.filter((b) => b.status === 'FAVORITE').length,
    TO_READ: userBooks.filter((b) => b.status === 'TO_READ').length,
    READ: userBooks.filter((b) => b.status === 'READ').length,
  };

  const listClassName = viewMode === 'list'
    ? 'flex flex-col gap-4'
    : `grid gap-6 ${
        viewMode === 'grid-1'
          ? 'grid-cols-1'
          : viewMode === 'grid-2'
          ? 'grid-cols-1 sm:grid-cols-2'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      }`;
  const cardVariant = viewMode === 'list' ? 'list' : 'grid';

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Mis Libros"
        subtitle="Gestiona tu colección personal y estados de lectura"
        icon={<BookMarked className="mt-1 h-7 w-7 text-primary" />}
        actions={
          <Button asChild size="sm">
            <Link to="/search">
              <Plus className="mr-2 h-4 w-4" />
              Agregar libros
            </Link>
          </Button>
        }
      />

      <div className="mx-auto max-w-7xl px-6 py-8">
        {isLoading && <Loader text="Cargando tus libros..." />}

        {!isLoading && error && (
          <ErrorMessage
            message={error}
            onRetry={() => {
              void reloadAll();
            }}
          />
        )}

        {!isLoading && !error && (
          <>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterStatus)}>
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="ALL">
                Todos ({statusCounts.ALL})
              </TabsTrigger>
              <TabsTrigger value="FAVORITE">
                Favoritos ({statusCounts.FAVORITE})
              </TabsTrigger>
              <TabsTrigger value="TO_READ">
                Por leer ({statusCounts.TO_READ})
              </TabsTrigger>
              <TabsTrigger value="READ">
                Leídos ({statusCounts.READ})
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              onClick={() => setViewMode('list')}
            >
              Listado
            </Button>
            {!isDesktop && (
              <Button
                type="button"
                size="sm"
                variant={viewMode === 'grid-1' ? 'secondary' : 'ghost'}
                onClick={() => setViewMode('grid-1')}
              >
                1 col
              </Button>
            )}
            {isSmallUp && (
              <Button
                type="button"
                size="sm"
                variant={viewMode === 'grid-2' ? 'secondary' : 'ghost'}
                onClick={() => setViewMode('grid-2')}
              >
                2 col
              </Button>
            )}
            {isDesktop && (
              <Button
                type="button"
                size="sm"
                variant={viewMode === 'grid-4' ? 'secondary' : 'ghost'}
                onClick={() => setViewMode('grid-4')}
              >
                4 col
              </Button>
            )}
          </div>
        </div>

        {filteredBooks.length === 0 ? (
          <EmptyState
            icon={<BookMarked className="h-10 w-10 text-muted-foreground" />}
            title={
              filter === 'ALL'
                ? 'No tienes libros en tu lista'
                : `No tienes libros ${
                    filter === 'FAVORITE'
                      ? 'favoritos'
                      : filter === 'TO_READ'
                      ? 'por leer'
                      : 'leídos'
                  }`
            }
            description="Agrega libros desde el buscador y organízalos por estado."
            action={
              <Button asChild>
                <Link to="/search">
                  <Plus className="mr-2 h-4 w-4" />
                  Buscar libros
                </Link>
              </Button>
            }
          />
        ) : (
          <div>
            <p className="mb-6 text-sm text-muted-foreground">
              {filteredBooks.length}{' '}
              {filteredBooks.length === 1 ? 'libro' : 'libros'}
            </p>
            <div className={listClassName}>
              {filteredBooks.map((book) => {
                const isListMode = cardVariant === 'list';
                const isGridMode = cardVariant === 'grid';
                const isDeletingThisBook = isDeletingBook && bookToDelete === book.id;

                return (
                  <BookCard
                    key={book.id}
                    variant={cardVariant}
                    coverLinkTo={`/books/${book.id}`}
                    menuTriggerIcon={isDeletingThisBook ? <Loader2 className="h-4 w-4 animate-spin text-destructive" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                    menuTriggerLabel="Eliminar libro"
                    menuTriggerClassName="text-destructive hover:bg-destructive/10"
                    onMenuTriggerClick={() => setBookToDelete(book.id)}
                    menuTriggerDisabled={isDeletingBook}
                    minimalGridInfo={isGridMode}
                    book={book}
                    badge={
                      isListMode ? (
                        <span className="rounded-full bg-green-600 px-2 py-1 text-xs text-white">
                          En biblioteca
                        </span>
                      ) : undefined
                    }
                    coverOverlay={
                      isGridMode ? (
                        <div className="flex items-end justify-between gap-2">
                          <span className="rounded-full bg-green-600/85 px-2 py-1 text-xs text-white backdrop-blur-sm">
                            En biblioteca
                          </span>
                          <Button
                            type="button"
                            size="icon"
                            onClick={() => setBookToDelete(book.id)}
                            disabled={isDeletingBook}
                            className="h-9 w-9 rounded-full bg-destructive/85 text-destructive-foreground shadow-sm hover:bg-destructive"
                            aria-label="Eliminar de la lista"
                          >
                            {isDeletingThisBook ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </div>
                      ) : undefined
                    }
                    actions={
                      isListMode ? (
                        <div className="flex w-full flex-col gap-2">
                          <StatusSelect
                            value={book.status}
                            onChange={(newStatus) =>
                              handleStatusChange(book.id, newStatus)
                            }
                            disabled={isUpdatingBookId === book.id || isDeletingBook}
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setBookToDelete(book.id)}
                            disabled={isDeletingBook}
                            className="w-full"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </Button>
                        </div>
                      ) : undefined
                    }
                  />
                );
              })}
            </div>
          </div>
        )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!bookToDelete} onOpenChange={() => setBookToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar libro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el libro de tu lista personal. Las reseñas asociadas
              a este libro no se eliminarán.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingBook}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBook} disabled={isDeletingBook}>
              {isDeletingBook ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
