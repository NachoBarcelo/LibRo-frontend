import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { SearchBox } from '../components/SearchBox';
import { BookCard } from '../components/BookCard';
import { StatusSelect } from '../components/StatusSelect';
import { Loader } from '../components/Loader';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { Search, Plus, Loader2, Trash2 } from 'lucide-react';
import { Book, BookStatus } from '../types';
import { getBookEditions, searchBooks } from '@/api/services/booksService';
import { BookEdition } from '@/shared/types/domain';
import { useLibrary } from '../context/LibraryContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
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

export function SearchBooks() {
  type ViewMode = 'list' | 'grid-1' | 'grid-2' | 'grid-4';

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingBookId, setIsSavingBookId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, BookStatus>>({});
  const [editionDialogOpen, setEditionDialogOpen] = useState(false);
  const [editionOptions, setEditionOptions] = useState<BookEdition[]>([]);
  const [pendingBook, setPendingBook] = useState<Book | null>(null);
  const [pendingStatus, setPendingStatus] = useState<BookStatus>('FAVORITE');
  const [isLoadingEditions, setIsLoadingEditions] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);
  const [isDeletingBook, setIsDeletingBook] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.innerWidth >= 1024;
  });
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === 'undefined') {
      return 'grid-1';
    }
    return window.innerWidth >= 1024 ? 'grid-4' : 'grid-1';
  });

  const { addBook, updateBookStatus, removeBook, userBooks } = useLibrary();

  const statusLabel = (status: BookStatus) =>
    status === 'FAVORITE' ? 'Favorito' : status === 'TO_READ' ? 'Por leer' : 'Leído';

  useEffect(() => {
    const desktopMql = window.matchMedia('(min-width: 1024px)');
    const onChange = () => {
      setIsDesktop(desktopMql.matches);
    };
    onChange();
    desktopMql.addEventListener('change', onChange);
    return () => {
      desktopMql.removeEventListener('change', onChange);
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
  }, [isDesktop, viewMode]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const apiResults = await searchBooks(searchQuery);
      // Normalizar los resultados de la API al formato esperado
      const normalizedBooks: Book[] = apiResults.map(book => ({
        id: String(book.id),
        externalId: book.externalId,
        title: book.title,
        author: book.author ?? 'Autor desconocido',
        year: book.year,
        isbn: book.isbn,
        cover: book.coverUrl,
        description: book.description,
        genres: book.genres
      }));
      setResults(normalizedBooks);
    } catch (err) {
      setError('No pudimos realizar la búsqueda. Por favor, inténtalo de nuevo.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (book: Book) => {
    setQuery(book.title);
    handleSearch(book.title);
  };

  const handleAddBook = async (book: Book, status: BookStatus) => {
    setIsSavingBookId(book.id);

    try {
      console.log('[SearchBooks] Guardando libro con payload (pre-addBook):', book);
      await addBook(book, status);
      toast.success(`"${book.title}" agregado a tu lista como ${
        status === 'FAVORITE' ? 'Favorito' :
        status === 'TO_READ' ? 'Por leer' : 'Leído'
      }`);
    } catch {
      toast.error('No se pudo agregar el libro a tu lista.');
    } finally {
      setIsSavingBookId(null);
    }
  };

  const toYearNumber = (year: string | null | undefined): number | undefined => {
    if (!year) {
      return undefined;
    }

    const match = year.match(/\d{4}/);
    if (!match) {
      return undefined;
    }

    const parsed = Number(match[0]);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  const applyEditionToBook = (book: Book, edition: BookEdition): Book => {
    return {
      ...book,
      editionId: edition.editionId || book.editionId,
      language: edition.language || book.language,
      publisher: edition.publisher ?? book.publisher,
      cover: edition.image ?? book.cover,
      isbn: edition.isbn ?? book.isbn,
      year: toYearNumber(edition.year) ?? book.year,
    };
  };

  const handleAddBookWithEditionSelection = async (book: Book, status: BookStatus) => {
    const workId = book.externalId?.trim();

    if (!workId || !(workId.startsWith('/works/') || /^OL\d+W$/i.test(workId))) {
      await handleAddBook(book, status);
      return;
    }

    setIsLoadingEditions(true);
    setIsSavingBookId(book.id);

    try {
      const editions = await getBookEditions(workId);
      console.log('[SearchBooks] Ediciones obtenidas para', workId, editions);

      if (editions.length > 1) {
        setPendingBook(book);
        setPendingStatus(status);
        setEditionOptions(editions);
        setEditionDialogOpen(true);
        console.log('[SearchBooks] Abriendo selector de ediciones', {
          book,
          status,
          editionsCount: editions.length,
          editions,
        });
      } else if (editions.length === 1) {
        console.log('[SearchBooks] Una sola edición, se guarda automáticamente', editions[0]);
        await handleAddBook(applyEditionToBook(book, editions[0]), status);
      } else {
        console.log('[SearchBooks] Sin ediciones, se guarda libro base', book);
        await handleAddBook(book, status);
      }
    } catch {
      toast.error('No se pudieron cargar las ediciones. Intenta nuevamente.');
    } finally {
      setIsLoadingEditions(false);
      setIsSavingBookId(null);
    }
  };

  const handleSelectEdition = async (edition: BookEdition) => {
    if (!pendingBook) {
      return;
    }

    const mergedBook = applyEditionToBook(pendingBook, edition);
    console.log('[SearchBooks] Edición seleccionada', edition);
    console.log('[SearchBooks] Libro resultante tras aplicar edición', mergedBook);

    setEditionDialogOpen(false);
    await handleAddBook(mergedBook, pendingStatus);
    setPendingBook(null);
    setEditionOptions([]);
  };

  const handleChangeSavedStatus = async (book: Book, status: BookStatus) => {
    const savedBook = userBooks.find((item) => {
      if (book.externalId && item.externalId) {
        return item.externalId === book.externalId;
      }

      return item.id === book.id;
    });

    if (!savedBook) {
      await handleAddBookWithEditionSelection(book, status);
      return;
    }

    if (savedBook.status === status) {
      return;
    }

    setIsSavingBookId(book.id);

    try {
      await updateBookStatus(savedBook.id, status);
      toast.success(`Estado actualizado a ${statusLabel(status).toLowerCase()}`);
    } catch {
      toast.error('No se pudo actualizar el estado del libro.');
    } finally {
      setIsSavingBookId(null);
    }
  };

  const handleDeleteBook = async () => {
    if (!bookToDelete) {
      return;
    }

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
  };

  const getSavedBook = (book: Book) => {
    return userBooks.find((savedBook) => {
      if (book.externalId && savedBook.externalId) {
        return savedBook.externalId === book.externalId;
      }

      return savedBook.id === book.id;
    });
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

  return (
    <div className="relative min-h-screen h-full overflow-hidden bg-primary pb-10 text-primary-foreground md:pb-8">
      <div className="pointer-events-none absolute inset-0 opacity-35 [background:radial-gradient(circle_at_top_left,rgba(255,247,249,0.2),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(255,247,249,0.15),transparent_50%)]" />

      <PageHeader
        title="Buscar Libros"
        subtitle="Descubre nuevos libros para agregar a tu colección"
        icon={<Search className="mt-1 h-7 w-7 text-primary-foreground " />}
      />

      <div className="relative mx-auto max-w-7xl px-6 py-8">
        
          <SearchBox
            value={query}
            onChange={setQuery}
            onSearch={handleSearch}
            placeholder="Buscar por título o autor..."
            showSuggestions
            onSuggestionClick={handleSuggestionClick}
          />
        

        {isLoading && <Loader text="Buscando libros..." />}

        {error && (
          <ErrorMessage
            message={error}
            onRetry={() => handleSearch(query)}
          />
        )}

        {!isLoading && !error && hasSearched && results.length === 0 && (
          <EmptyState
            icon={<Search className="h-10 w-10 text-primary-foreground/70" />}
            title="No se encontraron resultados"
            description={`No encontramos libros que coincidan con "${query}". Intenta con otros términos de búsqueda.`}
          />
        )}

        {!isLoading && !error && results.length > 0 && (
          <div className="mt-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-primary-foreground/80">
                {results.length} {results.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
              </p>
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
            <div className={listClassName}>
              {results.map((book) => {
                const savedBook = getSavedBook(book);
                const inLibrary = Boolean(savedBook);
                const selectedStatus = selectedStatuses[book.id] || 'FAVORITE';
                const currentStatus = savedBook?.status ?? selectedStatus;
                const isSaving = isSavingBookId === book.id;
                const isListMode = cardVariant === 'list';
                const isGridMode = cardVariant === 'grid';
                const isDeletingThisBook = isDeletingBook && bookToDelete === savedBook?.id;

                if (isGridMode) {
                  return (
                    <div
                      key={book.id}
                          className="group relative overflow-hidden rounded-lg border border-primary-foreground/30 bg-primary-foreground/10 transition-all hover:border-primary-foreground/55 hover:shadow-md"
                    >
                      <div className="aspect-[2/3] w-full">
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
                      </div>

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/95 via-primary/80 to-transparent p-3 sm:p-4">
                        <p className="line-clamp-1 text-sm sm:text-base font-medium text-primary-foreground drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">{book.title}</p>
                        <p className="line-clamp-1 text-xs sm:text-sm text-primary-foreground/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">{book.author}</p>

                        <div className="mt-2 flex items-end justify-between gap-2">
                          {inLibrary ? (
                            <span className="rounded-full bg-green-600/85 px-2 py-1 text-xs text-white backdrop-blur-sm">
                              En biblioteca
                            </span>
                          ) : (
                            <StatusSelect
                              value={currentStatus}
                              onChange={(newStatus) =>
                                setSelectedStatuses({ ...selectedStatuses, [book.id]: newStatus })
                              }
                              disabled={isSaving || isLoadingEditions}
                              triggerClassName="h-8 w-[120px] border-primary-foreground/35 bg-primary/50 px-2 text-xs text-primary-foreground backdrop-blur-sm"
                            />
                          )}

                          <Button
                            type="button"
                            size="icon"
                            onClick={() => {
                              if (inLibrary) {
                                setBookToDelete(savedBook?.id ?? null);
                                return;
                              }

                              void handleAddBookWithEditionSelection(book, currentStatus);
                            }}
                            disabled={isSaving || isLoadingEditions || isDeletingBook}
                            className={`h-9 w-9 rounded-full shadow-sm ${inLibrary ? 'bg-destructive/85 text-destructive-foreground hover:bg-destructive' : 'bg-secondary/85 text-secondary-foreground hover:bg-secondary'}`}
                            aria-label={inLibrary ? 'Eliminar de la lista' : 'Agregar a la lista'}
                          >
                            {inLibrary ? (
                              isDeletingThisBook ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />
                            ) : isSaving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <BookCard
                    key={book.id}
                    className={isListMode ? 'bg-foreground/70 text-primary-foreground border-primary-foreground/25 [&_.text-muted-foreground]:text-primary-foreground/75' : undefined}
                    variant={cardVariant}
                    menuTriggerIcon={
                      inLibrary
                        ? isDeletingThisBook
                          ? <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                          : <Trash2 className="h-4 w-4 text-destructive" />
                        : isSaving
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Plus className="h-4 w-4" />
                    }
                    menuTriggerLabel={inLibrary ? 'Eliminar libro' : 'Agregar a favoritos'}
                    menuTriggerClassName={inLibrary ? 'text-destructive hover:bg-destructive/10' : 'bg-foreground text-primary-foreground hover:bg-foreground/90'}
                    onMenuTriggerClick={() => {
                      if (inLibrary) {
                        setBookToDelete(savedBook?.id ?? null);
                        return;
                      }

                      void handleAddBookWithEditionSelection(book, 'FAVORITE');
                    }}
                    menuTriggerDisabled={isSaving || isLoadingEditions || isDeletingBook}
                    book={book}
                    badge={
                      isListMode && inLibrary ? (
                        <span className={`rounded-full px-2 py-1 text-xs ${inLibrary ? 'bg-green-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                          En biblioteca
                        </span>
                      ) : undefined
                    }
                    actions={
                      isListMode ? (
                      <div className="flex w-full flex-col gap-2">
                        <StatusSelect
                          value={currentStatus}
                          onChange={(newStatus) =>
                            inLibrary
                              ? void handleChangeSavedStatus(book, newStatus)
                              : setSelectedStatuses({ ...selectedStatuses, [book.id]: newStatus })
                          }
                          disabled={isSaving}
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            void handleAddBookWithEditionSelection(book, selectedStatus);
                          }}
                          disabled={isSaving || isLoadingEditions}
                          className="w-full bg-foreground text-primary-foreground hover:bg-foreground/90"
                        >
                          {isSaving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="mr-2 h-4 w-4" />
                          )}
                          {isSaving ? 'Guardando...' : inLibrary ? 'Actualizar' : 'Agregar'}
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

        {!hasSearched && !isLoading && (
          <EmptyState
            icon={<Search className="h-10 w-10 text-primary/70" />}
            title="Comienza tu búsqueda"
            description="Escribe el título de un libro o el nombre de un autor en el buscador para encontrar nuevas lecturas."
          />
        )}
      </div>

      <Dialog open={editionDialogOpen} onOpenChange={setEditionDialogOpen}>
        <DialogContent className="max-w-4xl border-primary-foreground/30 bg-primary text-primary-foreground p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Selecciona una edición</DialogTitle>
            <DialogDescription className="text-primary-foreground/80">
              Encontramos varias ediciones. Elige una portada para guardar esa edición en tu biblioteca.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[65vh] overflow-y-auto pr-1 sm:max-h-[70vh]">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {editionOptions.map((edition) => (
                <button
                  key={edition.editionId}
                  type="button"
                  onClick={() => {
                    void handleSelectEdition(edition);
                  }}
                  className="rounded-md border border-primary-foreground/30 bg-primary-foreground/8 p-2 text-left transition-colors hover:bg-primary-foreground/15"
                >
                  <div className="aspect-[2/3] overflow-hidden rounded bg-primary-foreground/12">
                    {edition.image ? (
                      <img src={edition.image} alt={`Edición ${edition.editionId}`} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-primary-foreground/70">
                        Sin portada
                      </div>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-1 text-xs text-primary-foreground/80">{edition.language}</p>
                  <p className="line-clamp-1 text-xs text-primary-foreground/75">{edition.year ?? 'Año desconocido'}</p>
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!bookToDelete} onOpenChange={() => setBookToDelete(null)}>
        <AlertDialogContent className="border-primary-foreground/30 bg-primary text-primary-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar libro?</AlertDialogTitle>
            <AlertDialogDescription className="text-primary-foreground/80">
              Esta acción eliminará el libro de tu lista personal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingBook}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { void handleDeleteBook(); }}
              disabled={isDeletingBook}
              className="bg-foreground text-primary-foreground hover:bg-foreground/90"
            >
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
