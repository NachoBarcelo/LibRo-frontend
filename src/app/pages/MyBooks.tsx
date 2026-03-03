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
    <div className="relative min-h-screen h-full overflow-hidden bg-primary pb-10 text-primary-foreground md:pb-8">
      
      <PageHeader
        title="Mis Libros"
        subtitle="Gestiona tu colección personal y estados de lectura"
        icon={<BookMarked className="mt-1 h-7 w-7 text-primary-foreground" />}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-8">
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
            <TabsList className="grid w-full max-w-2xl grid-cols-4 border border-primary-foreground/30 bg-primary-foreground/10">
              <TabsTrigger className="text-primary-foreground/80 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground" value="ALL">
                Todos ({statusCounts.ALL})
              </TabsTrigger>
              <TabsTrigger className="text-primary-foreground/80 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground" value="FAVORITE">
                Favoritos ({statusCounts.FAVORITE})
              </TabsTrigger>
              <TabsTrigger className="text-primary-foreground/80 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground" value="TO_READ">
                Por leer ({statusCounts.TO_READ})
              </TabsTrigger>
              <TabsTrigger className="text-primary-foreground/80 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground" value="READ">
                Leídos ({statusCounts.READ})
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              className={viewMode === 'list' ? '' : 'bg-secondary/75 text-secondary-foreground hover:bg-secondary/90'}
              onClick={() => setViewMode('list')}
            >
              Listado
            </Button>
            {!isDesktop && (
              <Button
                type="button"
                size="sm"
                variant={viewMode === 'grid-1' ? 'secondary' : 'ghost'}
                className={viewMode === 'grid-1' ? '' : 'bg-secondary/75 text-secondary-foreground hover:bg-secondary/90'}
                onClick={() => setViewMode('grid-1')}
              >
                1 col
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant={viewMode === 'grid-2' ? 'secondary' : 'ghost'}
              className={viewMode === 'grid-2' ? '' : 'bg-secondary/75 text-secondary-foreground hover:bg-secondary/90'}
              onClick={() => setViewMode('grid-2')}
            >
              2 col
            </Button>
            {isDesktop && (
              <Button
                type="button"
                size="sm"
                variant={viewMode === 'grid-4' ? 'secondary' : 'ghost'}
                className={viewMode === 'grid-4' ? '' : 'bg-secondary/75 text-secondary-foreground hover:bg-secondary/90'}
                onClick={() => setViewMode('grid-4')}
              >
                4 col
              </Button>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-foreground/70" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por título o autor..."
              className="h-10 w-full rounded-md border border-primary-foreground/30 bg-primary-foreground/10 pl-9 pr-3 text-sm text-primary-foreground outline-none transition-colors placeholder:text-primary-foreground/60 focus-visible:ring-2 focus-visible:ring-primary-foreground/40"
            />
          </label>
        </div>

        <Collapsible
          open={isAuthorFilterOpen}
          onOpenChange={setIsAuthorFilterOpen}
          className="mb-6 rounded-lg border border-primary-foreground/30 bg-primary-foreground/10"
        >
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-primary-foreground/15"
            >
              <div>
                <p className="text-sm text-primary-foreground">Filtrar por autor</p>
                <p className="text-xs text-primary-foreground/70">
                  {selectedAuthors.length > 0
                    ? `${selectedAuthors.length} seleccionado(s)`
                    : `${authorOptions.length} autores disponibles`}
                </p>
              </div>
              <ChevronDown className={`h-4 w-4 text-primary-foreground/75 transition-transform ${isAuthorFilterOpen ? 'rotate-180' : ''}`} />
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="border-t border-primary-foreground/20 p-4">
              <div className="mb-3 flex items-center justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="bg-secondary/75 text-secondary-foreground hover:bg-secondary/90"
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
                        className="flex cursor-pointer items-center justify-between rounded-md border border-primary-foreground/25 bg-primary-foreground/8 px-3 py-2 text-sm text-primary-foreground hover:bg-primary-foreground/15"
                      >
                        <span className="truncate pr-3">{authorName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-primary-foreground/70">{authorCounts[normalizedAuthor] ?? 0}</span>
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
                <p className="text-sm text-primary-foreground/70">No hay autores disponibles para este filtro.</p>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {filteredBooks.length === 0 ? (
          <EmptyState
            icon={<BookMarked className="h-10 w-10 text-primary-foreground/70" />}
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
                <Button type="button" variant="outline" className="border-primary-foreground/35 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20" onClick={() => setSearchTerm('')}>
                  Limpiar búsqueda
                </Button>
              ) : selectedAuthors.length > 0 ? (
                <Button type="button" variant="outline" className="border-primary-foreground/35 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20" onClick={() => setSelectedAuthors([])}>
                  Limpiar autores
                </Button>
              ) : (
                <Button asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
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
            <div className="sticky bottom-20 z-20 mb-6 flex items-center justify-between gap-3 rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-2 backdrop-blur md:static md:rounded-none md:border-0 md:bg-transparent md:px-0 md:py-0">
              <p className="text-sm text-primary-foreground/80">
                {filteredBooks.length}{' '}
                {filteredBooks.length === 1 ? 'libro' : 'libros'}
              </p>

              <Button asChild size="icon" className="h-9 w-9 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90" aria-label="Agregar libros">
                <Link to="/search">
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Agregar libros</span>
                </Link>
              </Button>
            </div>
            <div className={listClassName}>
              {filteredBooks.map((book) => {
                const isListMode = cardVariant === 'list';
                const isGridMode = cardVariant === 'grid';
                const isDeletingThisBook = isDeletingBook && bookToDelete === book.id;

                if (isGridMode) {
                  return (
                    <div
                      key={book.id}
                      className="group relative overflow-hidden rounded-lg border border-primary-foreground/30 bg-primary-foreground/10 transition-all hover:border-primary-foreground/55 hover:shadow-md"
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
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-foreground/12 to-primary-foreground/5 text-sm text-primary-foreground/75">
                            Sin portada
                          </div>
                        )}
                      </Link>

                      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/95 via-primary/80 to-transparent p-3 sm:p-4">
                        <p className="line-clamp-1 text-sm sm:text-base font-medium text-primary-foreground drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">{book.title}</p>
                        <p className="line-clamp-1 text-xs sm:text-sm text-primary-foreground/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">{book.author}</p>
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
                    className={isListMode ? 'bg-foreground/70 text-primary-foreground border-primary-foreground/25 [&_.text-muted-foreground]:text-primary-foreground/75' : undefined}
                    variant={cardVariant}
                    coverLinkTo={`/books/${book.id}`}
                    menuTriggerIcon={isDeletingThisBook ? <Loader2 className="h-4 w-4 animate-spin text-destructive" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                    menuTriggerLabel="Eliminar libro"
                    menuTriggerClassName="bg-foreground text-primary-foreground hover:bg-foreground/90"
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
                            className="w-full bg-foreground text-primary-foreground hover:bg-foreground/90"
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
        <AlertDialogContent className="border-primary-foreground/30 bg-primary text-primary-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar libro?</AlertDialogTitle>
            <AlertDialogDescription className="text-primary-foreground/80">
              Esta acción eliminará el libro de tu lista personal. Las reseñas asociadas
              a este libro no se eliminarán.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingBook}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBook} disabled={isDeletingBook} className="bg-foreground text-primary-foreground hover:bg-foreground/90">
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
