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

// type: 'EXPERIENCE' (default) needs relationship + at least an OVERALL
// rating, same as always. 'ADMISSION_PROCESS' needs admissionOutcome
// instead — relationship and verification don't apply (see
// review.service.ts createReview), and ratings are optional since
// Placement/Faculty/Hostel etc. don't describe an interview.
export const createReviewSchema = z
  .object({
    institutionId: z.string().uuid(),
    courseId: z.string().uuid().optional(),
    type: z.enum(['EXPERIENCE', 'ADMISSION_PROCESS']).optional().default('EXPERIENCE'),
    relationship: z.enum(['CURRENT_STUDENT', 'ALUMNI', 'FORMER_STUDENT']).optional(),
    admissionOutcome: z.enum(['ADMITTED', 'REJECTED', 'WAITLISTED', 'WITHDREW']).optional(),
    batchYear: z
      .number()
      .int()
      .min(1950)
      .max(new Date().getFullYear() + 10),
    title: z.string().max(120).optional(),
    body: z.string().min(120, 'Please share at least a few sentences (min 120 characters).').max(5000),
    recommend: z.boolean(),
    ratings: z.array(z.object({ category: ratingCategoryEnum, value: z.number().int().min(1).max(5) })).optional().default([]),
    guidelinesAccepted: z.literal(true, {
      errorMap: () => ({ message: 'You must confirm the community guidelines' }),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'EXPERIENCE') {
      if (!data.relationship) ctx.addIssue({ code: 'custom', path: ['relationship'], message: 'Relationship is required' });
      if (!data.ratings.some((r) => r.category === 'OVERALL')) {
        ctx.addIssue({ code: 'custom', path: ['ratings'], message: 'An overall rating is required' });
      }
    } else if (!data.admissionOutcome) {
      ctx.addIssue({ code: 'custom', path: ['admissionOutcome'], message: 'Admission outcome is required' });
    }
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
