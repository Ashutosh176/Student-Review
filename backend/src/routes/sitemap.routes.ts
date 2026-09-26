import { Router } from 'express';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { GUIDES } from '../data/guides.js';

// Dynamic sitemap (spec §29). Served at the API root so it can be proxied to
// `/sitemap.xml` on the public domain in production (see README deployment
// notes) — most static hosts can rewrite that one path to the API origin
// without routing the whole frontend through the backend.
const router = Router();

router.get('/sitemap.xml', async (req, res, next) => {
  try {
    // Only publicly visible colleges: pending/rejected ones 404 on the site,
    // and 404s listed in a sitemap count against it in Search Console.
    const institutions = await prisma.institution.findMany({ where: { status: 'APPROVED' }, select: { slug: true, updatedAt: true } });

    const staticPaths = ['/', '/search', '/colleges', '/compare', '/rankings', '/guides', '/about', '/contact', '/privacy', '/terms', '/community-guidelines', '/trust'];

    // Each college's sub-tabs are distinct, indexable content (reviews,
    // placements, admissions) with their own title/description — not just
    // duplicates of the overview tab, so they belong in the sitemap too.
    const collegeSubPaths = ['', '/reviews', '/placements', '/admissions', '/courses', '/questions'];

    const origin = env.clientOrigin; // never derive from the Host header
    const urls = [
      ...staticPaths.map((p) => `<url><loc>${origin}${p}</loc></url>`),
      ...GUIDES.map((g) => `<url><loc>${origin}/guides/${g.slug}</loc><lastmod>${g.updatedAt}</lastmod></url>`),
      ...institutions.flatMap((i) =>
        collegeSubPaths.map((p) => `<url><loc>${origin}/college/${i.slug}${p}</loc><lastmod>${i.updatedAt.toISOString()}</lastmod></url>`),
      ),
    ];

    res.set('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`);
  } catch (err) {
    next(err);
  }
});

export default router;
