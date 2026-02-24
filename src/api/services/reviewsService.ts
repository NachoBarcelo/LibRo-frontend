import { httpClient } from '@/api/httpClient';
import { CreateReviewDto, Review, UpdateReviewDto } from '@/shared/types/domain';

interface RawReview {
  id: string | number;
  bookId: string | number;
  title: string;
  content: string;
  rating: number;
  createdAt?: string;
  updatedAt?: string;
}

function normalizeReview(raw: RawReview): Review {
  return {
    id: String(raw.id),
    bookId: String(raw.bookId),
    title: raw.title,
    content: raw.content,
    rating: raw.rating,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt
  };
}

export async function getReviews(): Promise<Review[]> {
  const response = await httpClient.get('/reviews');
  
  // Manejar formato { success: true, data: [...] }
  let reviewsArray: RawReview[] = [];
  if (response.data?.data && Array.isArray(response.data.data)) {
    reviewsArray = response.data.data;
  } else if (Array.isArray(response.data)) {
    reviewsArray = response.data;
  } else if (response.data?.reviews) {
    reviewsArray = response.data.reviews;
  }
  
  return reviewsArray.map(normalizeReview);
}

export async function getReviewById(id: string): Promise<Review> {
  const response = await httpClient.get(`/reviews/${id}`);
  const reviewData = response.data?.data || response.data;
  return normalizeReview(reviewData);
}

export async function getReviewsByBookId(bookId: string): Promise<Review[]> {
  const response = await httpClient.get(`/reviews/book/${bookId}`);
  
  let reviewsArray: RawReview[] = [];
  if (response.data?.data && Array.isArray(response.data.data)) {
    reviewsArray = response.data.data;
  } else if (Array.isArray(response.data)) {
    reviewsArray = response.data;
  } else if (response.data?.reviews) {
    reviewsArray = response.data.reviews;
  }
  
  return reviewsArray.map(normalizeReview);
}

export async function createReview(payload: CreateReviewDto): Promise<Review> {
  const response = await httpClient.post('/reviews', payload);
  const reviewData = response.data?.data || response.data;
  return normalizeReview(reviewData);
}

export async function updateReview(id: string, payload: UpdateReviewDto): Promise<Review> {
  const response = await httpClient.put(`/reviews/${id}`, payload);
  const reviewData = response.data?.data || response.data;
  return normalizeReview(reviewData);
}

export async function deleteReview(id: string): Promise<void> {
  await httpClient.delete(`/reviews/${id}`);
}
