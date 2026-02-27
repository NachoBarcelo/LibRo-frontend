import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { SearchBox } from '../components/SearchBox';
import { BookCard } from '../components/BookCard';
import { StatusSelect } from '../components/StatusSelect';
import { Loader } from '../components/Loader';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { Search, Plus, ChevronDown, Loader2 } from 'lucide-react';
import { Book, BookStatus } from '../types';
import { searchBooks } from '@/api/services/booksService';
import { useLibrary } from '../context/LibraryContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';

export function SearchBooks() {
  type ViewMode = 'list' | 'grid-1' | 'grid-2' | 'grid-4';

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingBookId, setIsSavingBookId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, BookStatus>>({});
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

  const { addBook, updateBookStatus, userBooks } = useLibrary();

  const statuses: BookStatus[] = ['TO_READ', 'FAVORITE', 'READ'];

  const statusLabel = (status: BookStatus) =>
    status === 'FAVORITE' ? 'Favorito' : status === 'TO_READ' ? 'Por leer' : 'Leído';

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
        cover: book.coverUrl
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

  const handleChangeSavedStatus = async (book: Book, status: BookStatus) => {
    const savedBook = userBooks.find((item) => {
      if (book.externalId && item.externalId) {
        return item.externalId === book.externalId;
      }

      return item.id === book.id;
    });

    if (!savedBook) {
      await handleAddBook(book, status);
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

  const getSavedBook = (book: Book) => {
    return userBooks.find((savedBook) => {
      if (book.externalId && savedBook.externalId) {
        return savedBook.externalId === book.externalId;
      }

      return savedBook.id === book.id;
    });
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
        title="Buscar Libros"
        subtitle="Descubre nuevos libros para agregar a tu colección"
        icon={<Search className="mt-1 h-7 w-7 text-primary" />}
      />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <SearchBox
            value={query}
            onChange={setQuery}
            onSearch={handleSearch}
            placeholder="Buscar por título o autor..."
            showSuggestions
            onSuggestionClick={handleSuggestionClick}
          />
        </div>

        {isLoading && <Loader text="Buscando libros..." />}

        {error && (
          <ErrorMessage
            message={error}
            onRetry={() => handleSearch(query)}
          />
        )}

        {!isLoading && !error && hasSearched && results.length === 0 && (
          <EmptyState
            icon={<Search className="h-10 w-10 text-muted-foreground" />}
            title="No se encontraron resultados"
            description={`No encontramos libros que coincidan con "${query}". Intenta con otros términos de búsqueda.`}
          />
        )}

        {!isLoading && !error && results.length > 0 && (
          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {results.length} {results.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
              </p>
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
            <div className={listClassName}>
              {results.map((book) => {
                const savedBook = getSavedBook(book);
                const inLibrary = Boolean(savedBook);
                const selectedStatus = selectedStatuses[book.id] || 'FAVORITE';
                const currentStatus = savedBook?.status ?? selectedStatus;
                const isSaving = isSavingBookId === book.id;

                return (
                  <BookCard
                    key={book.id}
                    variant={cardVariant}
                    menuTriggerIcon={!inLibrary ? (isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />) : undefined}
                    menuTriggerLabel={inLibrary ? 'Acciones' : 'Agregar a favoritos'}
                    onMenuTriggerClick={!inLibrary ? () => {
                      void handleAddBook(book, 'FAVORITE');
                    } : undefined}
                    menuTriggerDisabled={isSaving}
                    book={book}
                    badge={
                      inLibrary && (
                        <span className="rounded-full bg-green-600 px-2 py-1 text-xs text-white">
                          En biblioteca
                        </span>
                      )
                    }
                    coverOverlay={
                      inLibrary && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              disabled={isSaving}
                              className="h-8 w-full justify-between bg-background/65 px-2 text-xs backdrop-blur-sm"
                            >
                              <span>{isSaving ? 'Guardando...' : statusLabel(currentStatus)}</span>
                              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="center" className="w-40">
                            {statuses.map((statusOption) => (
                              <DropdownMenuItem
                                key={statusOption}
                                onClick={() => {
                                  void handleChangeSavedStatus(book, statusOption);
                                }}
                              >
                                {statusLabel(statusOption)}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )
                    }
                    actions={
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
                            void handleAddBook(book, selectedStatus);
                          }}
                          disabled={isSaving}
                          className="w-full"
                        >
                          {isSaving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="mr-2 h-4 w-4" />
                          )}
                          {isSaving ? 'Guardando...' : inLibrary ? 'Actualizar' : 'Agregar'}
                        </Button>
                      </div>
                    }
                  />
                );
              })}
            </div>
          </div>
        )}

        {!hasSearched && !isLoading && (
          <EmptyState
            icon={<Search className="h-10 w-10 text-muted-foreground" />}
            title="Comienza tu búsqueda"
            description="Escribe el título de un libro o el nombre de un autor en el buscador para encontrar nuevas lecturas."
          />
        )}
      </div>
    </div>
  );
}
