import { Router } from 'express';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';

// Dynamic sitemap (spec §29). Served at the API root so it can be proxied to
// `/sitemap.xml` on the public domain in production (see README deployment
// notes) — most static hosts can rewrite that one path to the API origin
// without routing the whole frontend through the backend.
const router = Router();

router.get('/sitemap.xml', async (req, res, next) => {
  try {
    const [institutions] = await Promise.all([prisma.institution.findMany({ select: { slug: true, updatedAt: true } })]);

    const staticPaths = ['/', '/search', '/colleges', '/compare', '/rankings', '/about', '/contact', '/privacy', '/terms', '/community-guidelines'];

    const origin = env.clientOrigin; // never derive from the Host header
    const urls = [
      ...staticPaths.map((p) => `<url><loc>${origin}${p}</loc></url>`),
      ...institutions.map(
        (i) => `<url><loc>${origin}/college/${i.slug}</loc><lastmod>${i.updatedAt.toISOString()}</lastmod></url>`,
      ),
    ];

    res.set('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`);
  } catch (err) {
    next(err);
  }
});

export default router;
