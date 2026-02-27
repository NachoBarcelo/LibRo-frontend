import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Book } from '../types';
import { searchBooks } from '@/api/services/booksService';
import { Loader } from './Loader';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void | Promise<void>;
  placeholder?: string;
  showSuggestions?: boolean;
  onSuggestionClick?: (book: Book) => void;
}

export function SearchBox({
  value,
  onChange,
  onSearch,
  placeholder = 'Buscar libros...',
  showSuggestions = false,
  onSuggestionClick,
}: SearchBoxProps) {
  const [suggestions, setSuggestions] = useState<Book[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showSuggestions || value.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const loadSuggestions = async () => {
      setIsLoadingSuggestions(true);
      try {
        const results = await searchBooks(value);
        // Normalizar los resultados y limitar a 6
        const normalized = results.slice(0, 6).map(book => ({
          id: String(book.id),
          externalId: book.externalId,
          title: book.title,
          author: book.author ?? 'Autor desconocido',
          year: book.year,
          isbn: book.isbn,
          cover: book.coverUrl
        }));
        setSuggestions(normalized);
        setShowDropdown(true);
      } catch (error) {
        console.error('Error loading suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    const timer = setTimeout(loadSuggestions, 300);
    return () => clearTimeout(timer);
  }, [value, showSuggestions]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    setIsSubmitting(true);
    try {
      await Promise.resolve(onSearch(value));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    onChange('');
    setSuggestions([]);
    setShowDropdown(false);
  };

  const handleSuggestionClick = (book: Book) => {
    setShowDropdown(false);
    onSuggestionClick?.(book);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-20"
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowDropdown(true);
            }
          }}
        />
        {value && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-7 w-7 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              className="h-7 px-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                  Buscando...
                </>
              ) : (
                'Buscar'
              )}
            </Button>
          </div>
        )}
      </form>

      {showDropdown && showSuggestions && (
        <div className="absolute top-full z-50 mt-2 w-full rounded-lg border border-border bg-popover shadow-lg">
          {isLoadingSuggestions ? (
            <div className="p-4">
              <Loader text="Buscando..." size="sm" />
            </div>
          ) : suggestions.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {suggestions.map((book) => (
                <button
                  key={book.id}
                  type="button"
                  onClick={() => handleSuggestionClick(book)}
                  className="flex w-full items-start gap-3 border-b border-border p-3 text-left transition-colors hover:bg-accent/50 last:border-0"
                >
                  <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded bg-muted">
                    {book.cover ? (
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/10">
                        <Search className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium line-clamp-1">{book.title}</p>
                    <p className="text-sm text-muted-foreground">{book.author}</p>
                    {book.year && (
                      <p className="text-xs text-muted-foreground">{book.year}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No se encontraron sugerencias
            </div>
          )}
        </div>
      )}
    </div>
  );
}