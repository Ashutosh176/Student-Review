import { isbot } from 'isbot';
import { next } from '@vercel/edge';
import { collegeSeoMeta, collegeStructuredData, type CollegeTab } from './src/lib/seo/collegeSeo';
import { collegeContentHtml } from './src/lib/seo/collegeContent';
import { injectHead, injectRootContent } from './src/lib/seo/renderBotHtml';
import { homeSeo, homeStructuredData, collegesListingSeo, RANKING_TABS, rankingSeo } from './src/lib/seo/siteSeo';
import type { InstitutionDetail, PublicReview } from './src/types';

// Bot-aware prerendering: crawlers that don't execute JavaScript (Bing,
// nearly every social-share unfurler, AI answer engines) only ever see this
// app's static index.html, identical for every URL — no per-page title,
// description, canonical, structured data, or review content. Googlebot
// eventually renders the JS and sees the real per-page <Helmet> output (see
// CollegeLayout.tsx etc.), but on a delayed second pass, which is a weaker
// signal than content present in the initial HTML.
//
// This middleware only ever changes what BOTS see; real visitors (anything
// that doesn't match `isbot`) fall through to `next()` completely untouched
// — the existing SPA is not modified in any way for them. Serving different
// (but equivalent, data-accurate) HTML to crawlers vs. browsers is Google's
// own long-documented "dynamic rendering" pattern for JS-heavy sites, not
// cloaking — cloaking is showing DIFFERENT content to game rankings; this
// shows the SAME content, just pre-rendered from the same API data.

export const config = {
  matcher: ['/', '/colleges', '/rankings', '/rankings/:metric', '/college/:slug', '/college/:slug/:tab'],
};

const API_BASE = process.env.VITE_API_BASE_URL?.startsWith('http')
  ? process.env.VITE_API_BASE_URL
  : 'https://api.studentreview.in/api';

const COLLEGE_TABS: CollegeTab[] = ['overview', 'reviews', 'placements', 'admissions', 'courses', 'jobs', 'questions'];

async function fetchIndexHtml(request: Request): Promise<string> {
  const res = await fetch(new URL('/index.html', request.url));
  return res.text();
}

function botResponse(html: string): Response {
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Bots re-crawl on their own schedule; caching at Vercel's CDN avoids
      // re-fetching institution data from the backend on every single hit.
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'X-Robots-Tag': 'all',
    },
  });
}

async function handleCollege(request: Request, origin: string, slug: string, tabPath?: string): Promise<Response | undefined> {
  const tab: CollegeTab = (['reviews', 'placements', 'admissions', 'courses', 'jobs', 'questions'].find((t) => t === tabPath) as CollegeTab) ?? 'overview';
  if (tabPath && !COLLEGE_TABS.includes(tab)) return undefined; // unknown sub-path (e.g. /questions/:id) — let it pass through normally

  const [instRes, reviewsRes] = await Promise.all([
    fetch(`${API_BASE}/institutions/${slug}`),
    fetch(`${API_BASE}/institutions/${slug}/reviews?sort=helpful&pageSize=5`),
  ]);
  if (!instRes.ok) return undefined; // unknown college — fall through to the normal 404 the SPA renders

  const inst = ((await instRes.json()) as { data: InstitutionDetail }).data;
  const reviews = reviewsRes.ok ? (((await reviewsRes.json()) as { data: PublicReview[] }).data ?? []) : [];

  const seo = collegeSeoMeta(inst, tab);
  const html = injectHead(await fetchIndexHtml(request), {
    title: seo.title,
    description: seo.description,
    canonical: `${origin}${seo.path}`,
    structuredData: collegeStructuredData(inst, origin),
  });
  return botResponse(injectRootContent(html, collegeContentHtml(inst, reviews)));
}

async function handleHome(request: Request, origin: string): Promise<Response> {
  const html = injectHead(await fetchIndexHtml(request), {
    title: homeSeo.title,
    description: homeSeo.description,
    canonical: `${origin}/`,
    structuredData: homeStructuredData(origin),
  });
  return botResponse(html);
}

async function handleCollegesListing(request: Request, origin: string): Promise<Response> {
  const html = injectHead(await fetchIndexHtml(request), {
    title: collegesListingSeo.title,
    description: collegesListingSeo.description,
    canonical: `${origin}/colleges`,
  });
  return botResponse(html);
}

async function handleRankings(request: Request, origin: string, metricSlug?: string): Promise<Response | undefined> {
  const active = RANKING_TABS.find((t) => t.slug === (metricSlug ?? '')) ?? RANKING_TABS[0];
  if (metricSlug && !RANKING_TABS.some((t) => t.slug === metricSlug)) return undefined; // unknown metric slug — let it 404 normally
  const seo = rankingSeo(active.label);
  const html = injectHead(await fetchIndexHtml(request), {
    title: seo.title,
    description: seo.description,
    canonical: `${origin}/rankings${metricSlug ? `/${metricSlug}` : ''}`,
  });
  return botResponse(html);
}

export default async function middleware(request: Request) {
  const ua = request.headers.get('user-agent') ?? '';
  if (!isbot(ua)) return next();

  const url = new URL(request.url);
  const origin = url.origin;
  const parts = url.pathname.split('/').filter(Boolean); // '/college/x/reviews' -> ['college','x','reviews']

  try {
    let response: Response | undefined;
    if (parts.length === 0) {
      response = await handleHome(request, origin);
    } else if (parts[0] === 'colleges' && parts.length === 1) {
      response = await handleCollegesListing(request, origin);
    } else if (parts[0] === 'rankings' && parts.length <= 2) {
      response = await handleRankings(request, origin, parts[1]);
    } else if (parts[0] === 'college' && parts.length <= 3) {
      response = await handleCollege(request, origin, parts[1], parts[2]);
    }
    return response ?? next();
  } catch {
    // Any failure (backend down, malformed data, etc.) must never break the
    // page — fall back to the exact same SPA a real visitor would get.
    return next();
  }
}
