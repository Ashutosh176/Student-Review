import { z } from 'zod';

export const setUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'BANNED']),
  reason: z.string().max(500).optional(),
});

export const moderateReviewActionSchema = z.object({
  action: z.enum(['APPROVE', 'HIDE', 'REMOVE', 'REQUEST_CLARIFICATION']),
  reason: z.string().max(500).optional(),
});

export const decisionSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED']),
  reason: z.string().max(500).optional(),
});

const INSTITUTION_TYPES = [
  'IIT',
  'NIT',
  'IIIT',
  'PRIVATE_UNIVERSITY',
  'STATE_UNIVERSITY',
  'DEEMED_UNIVERSITY',
  'ENGINEERING_COLLEGE',
  'MANAGEMENT_INSTITUTE',
  'MEDICAL_COLLEGE',
  'LAW_SCHOOL',
  'ARTS_SCIENCE_COLLEGE',
  'OTHER',
] as const;

export const createInstitutionSchema = z.object({
  name: z.string().min(2).max(200),
  type: z.enum(INSTITUTION_TYPES),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  establishedYear: z.coerce.number().int().min(1800).max(new Date().getFullYear()).optional(),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().max(3000).optional(),
  categoryId: z.string().uuid().optional().or(z.literal('')),
});

// Full-replace edit of an institution's core details from the admin panel. The
// slug is deliberately not editable — changing it would break every public URL
// and search-engine listing for the college.
export const updateInstitutionSchema = z.object({
  name: z.string().min(2).max(200),
  type: z.enum(INSTITUTION_TYPES),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  establishedYear: z.number().int().min(1800).max(new Date().getFullYear()).nullable().optional(),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().max(3000).optional(),
  admissionProcess: z.string().max(5000).optional(),
  editorialOverview: z.string().max(5000).optional(),
  categoryId: z.string().uuid().optional().or(z.literal('')).nullable(),
});

export const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
});

export const setFeaturedSchema = z.object({ featured: z.boolean() });

export const setJobStatusSchema = z.object({ status: z.enum(['PUBLISHED', 'CLOSED']) });

export const paginationQuerySchema = z.object({
  q: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export const createFaqSchema = z.object({
  question: z.string().min(3).max(300),
  answer: z.string().min(3).max(3000),
  order: z.coerce.number().int().optional().default(0),
  published: z.boolean().optional().default(true),
});

export const updateFaqSchema = z.object({
  question: z.string().min(3).max(300).optional(),
  answer: z.string().min(3).max(3000).optional(),
  order: z.coerce.number().int().optional(),
  published: z.boolean().optional(),
});

export const setUserRoleSchema = z.object({
  role: z.enum(['STUDENT', 'ORGANIZATION', 'MODERATOR', 'ADMIN']),
  grant: z.boolean(),
});

export const updatePlatformSettingsSchema = z.object({
  reportAutoFlagThreshold: z.coerce.number().int().min(1).max(50).optional(),
  rapidSubmissionWindowMinutes: z.coerce.number().int().min(1).max(1440).optional(),
  rapidSubmissionCount: z.coerce.number().int().min(1).max(50).optional(),
  minReviewsForRanking: z.coerce.number().int().min(1).max(100).optional(),
  proPlanPriceInr: z.coerce.number().int().min(0).max(1_000_000).optional(),
  businessPlanPriceInr: z.coerce.number().int().min(0).max(1_000_000).optional(),
});

export const revokeSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const contentModerationActionSchema = z.object({
  action: z.enum(['APPROVE', 'REMOVE']),
  reason: z.string().max(500).optional(),
});

export const institutionDomainParamSchema = z.object({
  id: z.string().uuid(),
  domainId: z.string().uuid(),
});

// ───────────────────────── Admissions ─────────────────────────

const COURSE_LEVELS = ['UG', 'PG', 'DOCTORATE', 'DIPLOMA'] as const;

export const createCourseSchema = z.object({
  name: z.string().min(2).max(150),
  level: z.enum(COURSE_LEVELS),
  department: z.string().max(120).optional(),
  durationYears: z.coerce.number().min(0.5).max(10).optional(),
  feePerYearInr: z.coerce.number().int().min(0).optional(),
  totalFeeInr: z.coerce.number().int().min(0).optional(),
});

export const updateCourseSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  level: z.enum(COURSE_LEVELS).optional(),
  department: z.string().max(120).optional(),
  durationYears: z.coerce.number().min(0.5).max(10).optional(),
  feePerYearInr: z.coerce.number().int().min(0).optional(),
  totalFeeInr: z.coerce.number().int().min(0).optional(),
});

export const setEntranceExamsSchema = z.object({
  examNames: z.array(z.string().min(1).max(60)).max(20),
});

export const createAdmissionCutoffSchema = z.object({
  courseId: z.string().uuid(),
  examName: z.string().min(1).max(60),
  category: z.string().min(1).max(40),
  year: z.coerce
    .number()
    .int()
    .min(2000)
    .max(new Date().getFullYear() + 1),
  openingRank: z.coerce.number().int().min(1).optional(),
  closingRank: z.coerce.number().int().min(1).optional(),
  percentile: z.coerce.number().min(0).max(100).optional(),
});
