import { z } from 'zod';

// z.coerce.boolean() runs JS `Boolean(value)`, which makes the string "false"
// coerce to `true` (any non-empty string is truthy) — breaking `?verifiedOnly=false`.
const booleanQueryParam = z
  .enum(['true', 'false'])
  .optional()
  .transform((v) => v === 'true');

export const listInstitutionsQuerySchema = z.object({
  q: z.string().max(200).optional(),
  state: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  course: z.string().max(200).optional(),
  type: z.string().max(50).optional(),
  categorySlug: z.string().max(100).optional(),
  verifiedOnly: booleanQueryParam,
  sort: z.enum(['relevant', 'rating', 'reviews', 'name']).optional().default('relevant'),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(20).optional().default(8),
});

export const reviewsQuerySchema = z.object({
  sort: z.enum(['recent', 'helpful', 'highest', 'lowest']).optional().default('recent'),
  verifiedOnly: booleanQueryParam,
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export const slugParamSchema = z.object({ slug: z.string().min(1) });

export const compareQuerySchema = z.object({
  slugs: z
    .string()
    .transform((s) => s.split(',').map((x) => x.trim()).filter(Boolean))
    .refine((arr) => arr.length >= 2 && arr.length <= 3, 'Compare requires 2 or 3 institutions'),
});
