import { Router } from 'express';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { GUIDES } from '../data/guides.js';
import { publicReviewWhere } from '../utils/publishing.js';

// Dynamic sitemap (spec §29). Served at the API root so it can be proxied to
// `/sitemap.xml` on the public domain in production (see README deployment
// notes) — most static hosts can rewrite that one path to the API origin
// without routing the whole frontend through the backend.
const router = Router();

router.get('/sitemap.xml', async (req, res, next) => {
  try {
    // Only publicly visible colleges: pending/rejected ones 404 on the site,
    // and 404s listed in a sitemap count against it in Search Console.
    const institutions = await prisma.institution.findMany({
      where: { status: 'APPROVED' },
      select: {
        slug: true,
        updatedAt: true,
        admissionProcess: true,
        _count: {
          select: {
            reviews: { where: { ...publicReviewWhere(), type: 'EXPERIENCE' } },
            courses: true,
            admissionCutoffs: true,
            questions: { where: { status: 'APPROVED' } },
          },
        },
      },
    });

    const staticPaths = ['/', '/search', '/colleges', '/compare', '/rankings', '/guides', '/colleges-that-listen', '/about', '/contact', '/privacy', '/terms', '/community-guidelines', '/trust'];

    // A college's sub-tabs are listed only once they have something on them.
    // Empty tabs were ~500 near-blank URLs that Google left "Discovered –
    // currently not indexed", slowing the crawl of everything else; their
    // canonical points at the main page instead (frontend collegeTabHasContent).
    const collegePaths = (i: (typeof institutions)[number]) => [
      '',
      ...(i._count.reviews > 0 ? ['/reviews', '/placements'] : []),
      ...(i._count.courses > 0 ? ['/courses'] : []),
      ...(i._count.admissionCutoffs > 0 || i.admissionProcess ? ['/admissions'] : []),
      ...(i._count.questions > 0 ? ['/questions'] : []),
    ];

    const origin = env.clientOrigin; // never derive from the Host header
    const urls = [
      ...staticPaths.map((p) => `<url><loc>${origin}${p}</loc></url>`),
      ...GUIDES.map((g) => `<url><loc>${origin}/guides/${g.slug}</loc><lastmod>${g.updatedAt}</lastmod></url>`),
      ...institutions.flatMap((i) =>
        collegePaths(i).map((p) => `<url><loc>${origin}/college/${i.slug}${p}</loc><lastmod>${i.updatedAt.toISOString()}</lastmod></url>`),
      ),
    ];

    res.set('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`);
  } catch (err) {
    next(err);
  }
});

export default router;
