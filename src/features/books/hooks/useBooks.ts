import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createBook, getBooks, searchBooks } from '@/api/services/booksService';
import { CreateBookDto } from '@/shared/types/domain';

export const booksQueryKeys = {
  all: ['books'] as const,
  library: () => [...booksQueryKeys.all, 'library'] as const,
  search: (query: string) => [...booksQueryKeys.all, 'search', query] as const
};

export function useLibraryBooks() {
  return useQuery({
    queryKey: booksQueryKeys.library(),
    queryFn: getBooks
  });
}

export function useSearchBooks(query: string) {
  return useQuery({
    queryKey: booksQueryKeys.search(query),
    queryFn: () => searchBooks(query),
    enabled: query.trim().length > 0
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBookDto) => createBook(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: booksQueryKeys.library() });
    }
  });
}
