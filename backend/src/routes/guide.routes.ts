import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';
import { findGuide, guideSummaries } from '../data/guides.js';

// Editorial guides (content lives in data/guides.ts). Read by the SPA's
// /guides pages and by frontend/middleware.ts to prerender them for crawlers.
const router = Router();

router.get('/', (_req, res) => {
  ok(res, guideSummaries());
});

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const guide = findGuide(req.params.slug);
    if (!guide) throw AppError.notFound('Guide not found');
    // Resolve related colleges to name + city, skipping any that aren't
    // publicly visible (renamed slug, pending/rejected) rather than linking a 404.
    const rows = guide.relatedColleges.length
      ? await prisma.institution.findMany({
          where: { slug: { in: guide.relatedColleges }, status: 'APPROVED' },
          select: { slug: true, name: true, locations: { where: { isPrimary: true }, take: 1, select: { city: true } } },
        })
      : [];
    const bySlug = new Map(rows.map((r) => [r.slug, { slug: r.slug, name: r.name, city: r.locations[0]?.city ?? null }]));
    const relatedColleges = guide.relatedColleges.map((s) => bySlug.get(s)).filter((x): x is NonNullable<typeof x> => Boolean(x));
    ok(res, { ...guide, relatedColleges });
  }),
);

export default router;
