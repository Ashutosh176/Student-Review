// Isomorphic (no `window`/`document`) site-level SEO content shared between
// client-side <Helmet> usage and middleware.ts's edge-rendered HTML for bots.

export const homeSeo = {
  title: 'StudentReview — Know what students really think',
  description: 'Explore honest student experiences, ratings and reviews of colleges and universities across India.',
};

export function homeStructuredData(origin: string) {
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

export const collegesListingSeo = {
  title: 'College Reviews — Browse All Colleges & Universities — StudentReview',
  description:
    'Browse student reviews and ratings for colleges and universities across India. Compare placements, faculty, hostel life and more before you choose.',
};

export const RANKING_TABS: { slug: string; label: string }[] = [
  { slug: '', label: 'Top Rated' },
  { slug: 'placements', label: 'Best Placement' },
  { slug: 'faculty', label: 'Best Faculty' },
  { slug: 'campus-life', label: 'Best Campus Life' },
  { slug: 'value-for-money', label: 'Best Value for Money' },
  { slug: 'most-reviewed', label: 'Most Reviewed' },
  { slug: 'trending', label: 'Trending' },
];

export function rankingSeo(label: string) {
  return {
    title: `${label} Colleges in India — Rankings & Reviews — StudentReview`,
    description: `${label} colleges in India, ranked from verified student reviews. See which institutions students rate highest for ${label.toLowerCase()}.`,
  };
}

// ---- guides (mirrored in middleware.ts — keep the two in sync) ----

export const guidesIndexSeo = {
  title: 'College Admission Guides for Indian Students — StudentReview',
  description:
    'Practical guides to choosing a college in India: approval checks, JoSAA counselling, IIT vs NIT vs IIIT, and how to spot fake college reviews.',
};

export function guideSeo(guide: { title: string; description: string }) {
  return { title: `${guide.title} — StudentReview`, description: guide.description };
}

export function guideStructuredData(guide: { slug: string; title: string; description: string; updatedAt: string }, origin: string) {
  const url = `${origin}/guides/${guide.slug}`;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: guide.title,
      description: guide.description,
      dateModified: guide.updatedAt,
      mainEntityOfPage: url,
      author: { '@type': 'Organization', name: 'StudentReview', url: origin },
      publisher: { '@type': 'Organization', name: 'StudentReview', logo: { '@type': 'ImageObject', url: `${origin}/logo.svg` } },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Guides', item: `${origin}/guides` },
        { '@type': 'ListItem', position: 2, name: guide.title, item: url },
      ],
    },
  ];
}
