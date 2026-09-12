import { api, unwrap } from './client';
import type { PublicReview, RatingCategory } from '@/types';

export interface CreateReviewInput {
  institutionId: string;
  courseId?: string;
  relationship: 'CURRENT_STUDENT' | 'ALUMNI' | 'FORMER_STUDENT';
  batchYear: number;
  title?: string;
  body: string;
  recommend: boolean;
  ratings: { category: RatingCategory; value: number }[];
  guidelinesAccepted: true;
}

export const reviewsApi = {
  latest: (limit = 6) => unwrap<(PublicReview & { institution: { name: string; slug: string } })[]>(api.get('/reviews/latest', { params: { limit } })),
  create: (input: CreateReviewInput) => unwrap<PublicReview>(api.post('/reviews', input)),
  mine: () => unwrap<(PublicReview & { institution: { name: string; slug: string } })[]>(api.get('/reviews/mine')),
  update: (id: string, input: Partial<CreateReviewInput>) => unwrap<PublicReview>(api.patch(`/reviews/${id}`, input)),
  remove: (id: string) => unwrap<{ deleted: boolean }>(api.delete(`/reviews/${id}`)),
  report: (id: string, reason: string, details?: string) => unwrap(api.post(`/reviews/${id}/report`, { reason, details })),
  vote: (id: string) => unwrap<{ voted: boolean }>(api.post(`/reviews/${id}/vote`)),
  respond: (id: string, body: string) => unwrap(api.post(`/reviews/${id}/respond`, { body })),
};
