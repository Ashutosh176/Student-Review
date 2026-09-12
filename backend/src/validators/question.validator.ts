import { z } from 'zod';

export const createQuestionSchema = z.object({
  institutionId: z.string().uuid(),
  title: z.string().min(10, 'Question is too short').max(300),
  body: z.string().max(2000).optional(),
});

export const createAnswerSchema = z.object({
  body: z.string().min(5, 'Answer is too short').max(3000),
});
