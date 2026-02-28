import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteUserBook, getUserBooks, upsertUserBook } from '@/api/services/userBooksService';
import { booksQueryKeys } from '@/features/books/hooks/useBooks';
import { UpsertUserBookDto, UserBookStatus } from '@/shared/types/domain';

export const userBooksQueryKeys = {
  all: ['user-books'] as const,
  list: (status?: UserBookStatus) => [...userBooksQueryKeys.all, 'list', status ?? 'ALL'] as const
};

export function useUserBooks(status?: UserBookStatus) {
  return useQuery({
    queryKey: userBooksQueryKeys.list(status),
    queryFn: () => getUserBooks(status)
  });
}

export function useUpsertUserBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpsertUserBookDto) => upsertUserBook(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userBooksQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: booksQueryKeys.library() });
    }
  });
}

export function useDeleteUserBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUserBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userBooksQueryKeys.all });
    }
  });
}
