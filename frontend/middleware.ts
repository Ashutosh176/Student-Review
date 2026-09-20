import { isbot } from 'isbot';
import { next } from '@vercel/edge';
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
//
// EVERYTHING below is inlined into this one file on purpose, duplicating
// src/lib/seo/* (which the React pages' <Helmet> use) rather than importing
// it: Vercel's zero-config middleware for a non-Next.js project transpiles
// only this entry file — it does NOT bundle local relative imports elsewhere
// in the project, so `import { x } from './src/lib/seo/...'` deploys fine
// but throws ERR_MODULE_NOT_FOUND at request time (learned the hard way —
// this took production down twice). Type-only imports (`import type`) are
// fine, since TypeScript erases them entirely at compile time; only VALUE
// imports (functions, constants) from local files are the problem. If you
// change the SEO copy in src/lib/seo/*, mirror the change here too.

export const config = {
  matcher: ['/', '/colleges', '/rankings', '/rankings/:metric', '/college/:slug', '/college/:slug/:tab'],
};

const API_BASE = process.env.VITE_API_BASE_URL?.startsWith('http')
  ? process.env.VITE_API_BASE_URL
  : 'https://api.studentreview.in/api';

// ---- src/lib/seo/renderBotHtml.ts (inlined, see file header comment) ----

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface BotHeadTags {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  structuredData?: unknown;
}

function injectHead(html: string, tags: BotHeadTags): string {
  const title = escapeHtml(tags.title);
  const description = escapeHtml(tags.description);
  const ogTitle = escapeHtml(tags.ogTitle ?? tags.title);
  const ogDescription = escapeHtml(tags.ogDescription ?? tags.description);

  const inserted = [
    `<meta name="description" content="${description}">`,
    `<link rel="canonical" href="${escapeHtml(tags.canonical)}">`,
    `<meta property="og:title" content="${ogTitle}">`,
    `<meta property="og:description" content="${ogDescription}">`,
    `<meta property="og:url" content="${escapeHtml(tags.canonical)}">`,
    tags.structuredData ? `<script type="application/ld+json">${JSON.stringify(tags.structuredData)}</script>` : '',
  ]
    .filter(Boolean)
    .join('\n    ');

  return html.replace(/<title>.*?<\/title>/s, `<title>${title}</title>\n    ${inserted}`);
}

function injectRootContent(html: string, contentHtml: string): string {
  return html.replace('<div id="root"></div>', `<div id="root">${contentHtml}</div>`);
}

// ---- src/lib/seo/collegeSeo.ts (inlined) ----

type CollegeTab = 'overview' | 'reviews' | 'placements' | 'admissions' | 'courses' | 'jobs' | 'questions';

function overallRating(inst: InstitutionDetail) {
  return inst.summary.ratings.find((r) => r.category === 'OVERALL');
}

function collegeSeoMeta(inst: InstitutionDetail, tab: CollegeTab): { title: string; description: string; path: string } {
  const overall = overallRating(inst);
  const reviewCount = inst.summary.reviewCount.toLocaleString('en-IN');
  const base = `/college/${inst.slug}`;

  switch (tab) {
    case 'reviews':
      return {
        title: `${inst.name} Reviews — Student Experiences & Ratings — StudentReview`,
        description: `Read ${reviewCount} verified student reviews of ${inst.name} — placements, faculty, hostel, campus life and admission experiences, straight from real students.`,
        path: `${base}/reviews`,
      };
    case 'placements': {
      const placement = inst.summary.ratings.find((r) => r.category === 'PLACEMENT');
      return {
        title: `${inst.name} Placements — Student Reviews & Ratings — StudentReview`,
        description: `How students rate placements at ${inst.name}${placement ? ` — ${placement.average.toFixed(1)}/5 based on ${placement.count} reviews` : ''}. Read real placement experiences before you apply.`,
        path: `${base}/placements`,
      };
    }
    case 'admissions':
      return {
        title: `${inst.name} Admissions — Process, Cutoffs & Fees — StudentReview`,
        description: `Admission process, entrance exams, course fees and cutoff ranks for ${inst.name}, plus real applicant experiences from StudentReview.`,
        path: `${base}/admissions`,
      };
    case 'courses':
      return {
        title: `${inst.name} Courses & Programs — StudentReview`,
        description: `Courses, programs and duration offered at ${inst.name}, with student reviews and ratings for each.`,
        path: `${base}/courses`,
      };
    case 'jobs':
      return {
        title: `Jobs & Internships at ${inst.name} — StudentReview`,
        description: `Open jobs and internship listings posted by ${inst.name} on StudentReview.`,
        path: `${base}/jobs`,
      };
    case 'questions':
      return {
        title: `${inst.name} Questions & Answers — Ask Current Students — StudentReview`,
        description: `Questions and answers about ${inst.name}, answered by current students and alumni on StudentReview.`,
        path: `${base}/questions`,
      };
    case 'overview':
    default:
      return {
        title: `${inst.name} — Reviews, Ratings & More — StudentReview`,
        description:
          inst.description ??
          `${reviewCount} student reviews of ${inst.name}${overall ? ` — rated ${overall.average.toFixed(1)}/5` : ''}. Read honest, anonymous feedback on placements, faculty and campus life.`,
        path: base,
      };
  }
}

function collegeStructuredData(inst: InstitutionDetail, origin: string) {
  const overall = overallRating(inst);
  const location = inst.locations[0];
  const canonicalUrl = `${origin}/college/${inst.slug}`;

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CollegeOrUniversity',
      name: inst.name,
      url: canonicalUrl,
      ...(inst.website ? { sameAs: [inst.website] } : {}),
      ...(location ? { address: { '@type': 'PostalAddress', addressLocality: location.city, addressRegion: location.state, addressCountry: location.country ?? 'IN' } } : {}),
      ...(overall && inst.summary.reviewCount > 0
        ? {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: overall.average.toFixed(1),
              reviewCount: inst.summary.reviewCount,
              bestRating: '5',
              worstRating: '1',
            },
          }
        : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Colleges', item: `${origin}/colleges` },
        { '@type': 'ListItem', position: 2, name: inst.name, item: canonicalUrl },
      ],
    },
  ];
}

// ---- src/lib/seo/collegeContent.ts (inlined) ----

function collegeContentHtml(inst: InstitutionDetail, reviews: PublicReview[]): string {
  const overall = overallRating(inst);
  const location = inst.locations[0];

  const reviewsHtml = reviews
    .filter((r) => r.body)
    .map((r) => {
      const rating = r.ratings.find((x) => x.category === 'OVERALL')?.value;
      return `<article>
        <h3>${escapeHtml(r.title ?? `${r.relationship.replace('_', ' ').toLowerCase()} review`)}</h3>
        ${rating ? `<p>Rating: ${rating}/5</p>` : ''}
        <p>${escapeHtml(r.body ?? '')}</p>
      </article>`;
    })
    .join('\n');

  return `
    <h1>${escapeHtml(inst.name)} — Student Reviews & Ratings</h1>
    ${location ? `<p>${escapeHtml(location.city)}, ${escapeHtml(location.state)}</p>` : ''}
    ${inst.description ? `<p>${escapeHtml(inst.description)}</p>` : ''}
    <p>${overall ? `Rated ${overall.average.toFixed(1)}/5` : 'Not yet rated'} based on ${inst.summary.reviewCount.toLocaleString('en-IN')} student reviews (${inst.summary.verifiedCount.toLocaleString('en-IN')} verified).</p>
    <h2>Student Reviews</h2>
    ${reviewsHtml || '<p>No reviews yet — be the first to share your experience.</p>'}
  `;
}

// ---- src/lib/seo/siteSeo.ts (inlined) ----

const homeSeo = {
  title: 'StudentReview — Know what students really think',
  description: 'Explore honest student experiences, ratings and reviews of colleges and universities across India.',
};

function homeStructuredData(origin: string) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'StudentReview',
      url: origin,
      logo: `${origin}/logo.svg`,
      sameAs: ['https://www.instagram.com/studentreview.india', 'https://www.linkedin.com/company/studentreview-in'],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'StudentReview',
      url: origin,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${origin}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ];
}

const collegesListingSeo = {
  title: 'College Reviews — Browse All Colleges & Universities — StudentReview',
  description:
    'Browse student reviews and ratings for colleges and universities across India. Compare placements, faculty, hostel life and more before you choose.',
};

const RANKING_TABS: { slug: string; label: string }[] = [
  { slug: '', label: 'Top Rated' },
  { slug: 'placements', label: 'Best Placement' },
  { slug: 'faculty', label: 'Best Faculty' },
  { slug: 'campus-life', label: 'Best Campus Life' },
  { slug: 'value-for-money', label: 'Best Value for Money' },
  { slug: 'most-reviewed', label: 'Most Reviewed' },
  { slug: 'trending', label: 'Trending' },
];

function rankingSeo(label: string) {
  return {
    title: `${label} Colleges in India — Rankings & Reviews — StudentReview`,
    description: `${label} colleges in India, ranked from verified student reviews. See which institutions students rate highest for ${label.toLowerCase()}.`,
  };
}

// ---- route handlers ----

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
