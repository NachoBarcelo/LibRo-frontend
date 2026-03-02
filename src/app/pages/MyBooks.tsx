import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { BookCard } from '../components/BookCard';
import { StatusSelect } from '../components/StatusSelect';
import { EmptyState } from '../components/EmptyState';
import { BookMarked, Plus, Trash2, Loader2, Search, ChevronDown } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { BookStatus } from '../types';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
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

function normalizeAuthorName(authorName?: string): string {
  return (authorName?.trim() || 'Autor desconocido').toLocaleLowerCase('es');
}

export function MyBooks() {
  type ViewMode = 'list' | 'grid-1' | 'grid-2' | 'grid-4';

  const [filter, setFilter] = useState<FilterStatus>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [isAuthorFilterOpen, setIsAuthorFilterOpen] = useState(false);
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
    if (!isDesktop && viewMode === 'grid-4') {
      setViewMode('grid-2');
    }
  }, [isDesktop, isSmallUp, viewMode]);

  const statusFilteredBooks =
    filter === 'ALL'
      ? userBooks
      : userBooks.filter((book) => book.status === filter);

  const authorOptions = Array.from(
    new Map(
      statusFilteredBooks.map((book) => {
        const authorName = (book.author?.trim() || 'Autor desconocido');
        return [normalizeAuthorName(authorName), authorName];
      })
    ).values()
  ).sort((a, b) => a.localeCompare(b, 'es'));

  const authorCounts = statusFilteredBooks.reduce<Record<string, number>>((accumulator, book) => {
    const authorName = (book.author?.trim() || 'Autor desconocido');
    const normalizedAuthor = normalizeAuthorName(authorName);
    accumulator[normalizedAuthor] = (accumulator[normalizedAuthor] ?? 0) + 1;
    return accumulator;
  }, {});

  const authorFilteredBooks = selectedAuthors.length
    ? statusFilteredBooks.filter((book) => selectedAuthors.includes(normalizeAuthorName(book.author)))
    : statusFilteredBooks;

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredBooks = authorFilteredBooks.filter((book) => {
    if (!normalizedSearchTerm) {
      return true;
    }

    const title = book.title?.toLowerCase() ?? '';
    const author = book.author?.toLowerCase() ?? '';

    return title.includes(normalizedSearchTerm) || author.includes(normalizedSearchTerm);
  });

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

  const gridGapClass = viewMode === 'grid-2' ? 'gap-3 sm:gap-4' : 'gap-6';

  const listClassName = viewMode === 'list'
    ? 'flex flex-col gap-4'
    : `grid ${gridGapClass} ${
        viewMode === 'grid-1'
          ? 'grid-cols-1'
          : viewMode === 'grid-2'
          ? 'grid-cols-2'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      }`;
  const cardVariant = viewMode === 'list' ? 'list' : 'grid';

  const toggleAuthorFilter = (authorName: string, checked: boolean) => {
    const normalizedAuthor = normalizeAuthorName(authorName);

    if (checked) {
      setSelectedAuthors((current) =>
        current.includes(normalizedAuthor) ? current : [...current, normalizedAuthor]
      );
      return;
    }

    setSelectedAuthors((current) => current.filter((author) => author !== normalizedAuthor));
  };

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
            <Button
              type="button"
              size="sm"
              variant={viewMode === 'grid-2' ? 'secondary' : 'ghost'}
              onClick={() => setViewMode('grid-2')}
            >
              2 col
            </Button>
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

        <div className="mb-6">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por título o autor..."
              className="h-10 w-full rounded-md border border-primary/20 bg-primary/10 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </label>
        </div>

        <Collapsible
          open={isAuthorFilterOpen}
          onOpenChange={setIsAuthorFilterOpen}
          className="mb-6 rounded-lg border border-border/60 bg-background/60"
        >
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-accent/20"
            >
              <div>
                <p className="text-sm">Filtrar por autor</p>
                <p className="text-xs text-muted-foreground">
                  {selectedAuthors.length > 0
                    ? `${selectedAuthors.length} seleccionado(s)`
                    : `${authorOptions.length} autores disponibles`}
                </p>
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isAuthorFilterOpen ? 'rotate-180' : ''}`} />
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="border-t border-border/60 p-4">
              <div className="mb-3 flex items-center justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAuthors([])}
                  disabled={selectedAuthors.length === 0}
                >
                  Todos
                </Button>
              </div>

              {authorOptions.length > 0 ? (
                <div className="grid max-h-56 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
                  {authorOptions.map((authorName) => {
                    const normalizedAuthor = normalizeAuthorName(authorName);
                    const isChecked = selectedAuthors.includes(normalizedAuthor);

                    return (
                      <label
                        key={authorName}
                        className="flex cursor-pointer items-center justify-between rounded-md border border-border/60 px-3 py-2 text-sm hover:bg-accent/30"
                      >
                        <span className="truncate pr-3">{authorName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{authorCounts[normalizedAuthor] ?? 0}</span>
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(value) => toggleAuthorFilter(authorName, Boolean(value))}
                            aria-label={`Filtrar por ${authorName}`}
                          />
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No hay autores disponibles para este filtro.</p>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {filteredBooks.length === 0 ? (
          <EmptyState
            icon={<BookMarked className="h-10 w-10 text-muted-foreground" />}
            title={
              normalizedSearchTerm
                ? 'No encontramos coincidencias'
                : filter === 'ALL'
                  ? 'No tienes libros en tu lista'
                  : `No tienes libros ${
                      filter === 'FAVORITE'
                        ? 'favoritos'
                        : filter === 'TO_READ'
                        ? 'por leer'
                        : 'leídos'
                    }`
            }
            description={
              normalizedSearchTerm
                ? 'Prueba con otro título o autor, o limpia la búsqueda.'
                : selectedAuthors.length > 0
                  ? 'No hay libros para los autores seleccionados con este estado.'
                : 'Agrega libros desde el buscador y organízalos por estado.'
            }
            action={
              normalizedSearchTerm ? (
                <Button type="button" variant="outline" onClick={() => setSearchTerm('')}>
                  Limpiar búsqueda
                </Button>
              ) : selectedAuthors.length > 0 ? (
                <Button type="button" variant="outline" onClick={() => setSelectedAuthors([])}>
                  Limpiar autores
                </Button>
              ) : (
                <Button asChild>
                  <Link to="/search">
                    <Plus className="mr-2 h-4 w-4" />
                    Buscar libros
                  </Link>
                </Button>
              )
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

                if (isGridMode) {
                  return (
                    <div
                      key={book.id}
                      className="group relative overflow-hidden rounded-lg border border-border/60 bg-muted transition-all hover:border-primary/60 hover:shadow-md"
                    >
                      <Link
                        to={`/books/${book.id}`}
                        aria-label={`Ver detalle de ${book.title}`}
                        className="block aspect-[2/3] w-full"
                      >
                        {book.cover ? (
                          <img
                            src={book.cover}
                            alt={book.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 text-sm text-muted-foreground">
                            Sin portada
                          </div>
                        )}
                      </Link>

                      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/98 via-background/80 to-transparent p-3 sm:p-4">
                        <p className="line-clamp-1 text-sm sm:text-base font-medium text-foreground drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">{book.title}</p>
                        <p className="line-clamp-1 text-xs sm:text-sm text-foreground/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">{book.author}</p>
                      </div>

                      <Button
                        type="button"
                        size="icon"
                        onClick={() => setBookToDelete(book.id)}
                        disabled={isDeletingBook}
                        className="absolute bottom-3 right-3 h-9 w-9 rounded-full bg-destructive/85 text-destructive-foreground shadow-sm hover:bg-destructive"
                        aria-label="Eliminar de la lista"
                      >
                        {isDeletingThisBook ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  );
                }

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
                    book={book}
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
