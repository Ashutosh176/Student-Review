import { z } from 'zod';

const ratingCategoryEnum = z.enum([
  'OVERALL',
  'PLACEMENT',
  'FACULTY',
  'INFRASTRUCTURE',
  'ADMINISTRATION',
  'CAMPUS_LIFE',
  'VALUE_FOR_MONEY',
  'HOSTEL',
]);

export const createReviewSchema = z.object({
  institutionId: z.string().uuid(),
  courseId: z.string().uuid().optional(),
  relationship: z.enum(['CURRENT_STUDENT', 'ALUMNI', 'FORMER_STUDENT']),
  batchYear: z
    .number()
    .int()
    .min(1950)
    .max(new Date().getFullYear() + 10),
  title: z.string().max(120).optional(),
  body: z.string().min(120, 'Please share at least a few sentences about your experience (min 120 characters).').max(5000),
  recommend: z.boolean(),
  ratings: z
    .array(z.object({ category: ratingCategoryEnum, value: z.number().int().min(1).max(5) }))
    .min(1)
    .refine((ratings) => ratings.some((r) => r.category === 'OVERALL'), {
      message: 'An overall rating is required',
    }),
  guidelinesAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm the community guidelines' }),
  }),
});

export const updateReviewSchema = z.object({
  title: z.string().max(120).optional(),
  body: z.string().min(120).max(5000).optional(),
  recommend: z.boolean().optional(),
  ratings: z.array(z.object({ category: ratingCategoryEnum, value: z.number().int().min(1).max(5) })).optional(),
});

export const reportReviewSchema = z.object({
  reason: z.enum([
    'SPAM',
    'FAKE_REVIEW',
    'PERSONAL_INFORMATION',
    'HARASSMENT',
    'HATE_ABUSE',
    'IRRELEVANT',
    'IMPERSONATION',
    'OTHER',
  ]),
  details: z.string().max(1000).optional(),
});

export const respondReviewSchema = z.object({
  body: z.string().min(10, 'Response is too short').max(2000),
});

export const idParamSchema = z.object({ id: z.string().uuid() });
