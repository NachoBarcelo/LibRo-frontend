import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createReview,
  deleteReview,
  getReviewById,
  getReviews,
  getReviewsByBookId,
  updateReview
} from '@/api/services/reviewsService';
import { CreateReviewDto, UpdateReviewDto } from '@/shared/types/domain';

export const reviewsQueryKeys = {
  all: ['reviews'] as const,
  list: () => [...reviewsQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...reviewsQueryKeys.all, 'detail', id] as const,
  byBook: (bookId: string) => [...reviewsQueryKeys.all, 'book', bookId] as const
};

export function useReviews() {
  return useQuery({
    queryKey: reviewsQueryKeys.list(),
    queryFn: getReviews
  });
}

export function useReview(id?: string) {
  return useQuery({
    queryKey: reviewsQueryKeys.detail(id ?? ''),
    queryFn: () => getReviewById(id!),
    enabled: Boolean(id)
  });
}

export function useReviewsByBook(bookId?: string) {
  return useQuery({
    queryKey: reviewsQueryKeys.byBook(bookId ?? ''),
    queryFn: () => getReviewsByBookId(bookId!),
    enabled: Boolean(bookId)
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewDto) => createReview(payload),
    onSuccess: (review) => {
      queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.byBook(review.bookId) });
    }
  });
}

export function useUpdateReview(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateReviewDto) => updateReview(id, payload),
    onSuccess: (review) => {
      queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.byBook(review.bookId) });
    }
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.all });
    }
  });
}
