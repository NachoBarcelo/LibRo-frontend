import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { SearchBox } from '../components/SearchBox';
import { BookCard } from '../components/BookCard';
import { StatusSelect } from '../components/StatusSelect';
import { Loader } from '../components/Loader';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { Search, Plus } from 'lucide-react';
import { Book, BookStatus } from '../types';
import { searchBooks } from '@/api/services/booksService';
import { useLibrary } from '../context/LibraryContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

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

  const { addBook, userBooks } = useLibrary();

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

  const isBookInLibrary = (book: Book) => {
    return userBooks.some((savedBook) => {
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
                const inLibrary = isBookInLibrary(book);
                const status = selectedStatuses[book.id] || 'FAVORITE';

                return (
                  <BookCard
                    key={book.id}
                    variant={cardVariant}
                    menuTriggerIcon={!inLibrary ? <Plus className="h-4 w-4" /> : undefined}
                    menuTriggerLabel={inLibrary ? 'Abrir acciones' : 'Agregar a favoritos'}
                    book={book}
                    badge={
                      inLibrary && (
                        <span className="rounded-full bg-green-600 px-2 py-1 text-xs text-white">
                          En biblioteca
                        </span>
                      )
                    }
                    actions={
                      <div className="flex w-full flex-col gap-2">
                        <StatusSelect
                          value={status}
                          onChange={(newStatus) =>
                            setSelectedStatuses({ ...selectedStatuses, [book.id]: newStatus })
                          }
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddBook(book, status)}
                          disabled={isSavingBookId === book.id}
                          className="w-full"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          {inLibrary ? 'Actualizar' : 'Agregar'}
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
