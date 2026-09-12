import { api, unwrap } from './client';
import type { AnswerItem, QuestionSummary } from '@/types';

export const questionsApi = {
  mine: () =>
    unwrap<{
      questions: (QuestionSummary & { institution: { name: string; slug: string } })[];
      answers: { id: string; body: string; upvoteCount: number; createdAt: string; question: { id: string; title: string; institution: { slug: string } } }[];
    }>(api.get('/questions/mine')),
  create: (institutionId: string, title: string, body?: string) =>
    unwrap<QuestionSummary>(api.post('/questions', { institutionId, title, body })),
  getOne: (id: string) => unwrap<QuestionSummary & { answers: AnswerItem[] }>(api.get(`/questions/${id}`)),
  answer: (questionId: string, body: string) => unwrap<AnswerItem>(api.post(`/questions/${questionId}/answers`, { body })),
  upvote: (answerId: string) => unwrap<{ voted: boolean }>(api.post(`/questions/answers/${answerId}/upvote`)),
};
