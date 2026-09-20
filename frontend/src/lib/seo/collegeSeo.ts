import type { InstitutionDetail } from '../../types';

// Isomorphic (no `window`/`document`) — used by both CollegeLayout's client-side
// <Helmet> and middleware.ts's edge-rendered HTML for bots, so the two can never
// drift out of sync. `origin` is passed in rather than read from `window.location`
// because the edge runtime has no `window`.

export type CollegeTab = 'overview' | 'reviews' | 'placements' | 'admissions' | 'courses' | 'jobs' | 'questions';

export interface CollegeSeoMeta {
  title: string;
  description: string;
  path: string;
}

function overallRating(inst: InstitutionDetail) {
  return inst.summary.ratings.find((r) => r.category === 'OVERALL');
}

export function collegeSeoMeta(inst: InstitutionDetail, tab: CollegeTab): CollegeSeoMeta {
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

// AggregateRating + Review — Google's rich-result eligibility for the star
// rating shown next to this page in search (needs >=1 rating to render).
// BreadcrumbList — Colleges > name trail shown in the SERP instead of the raw URL.
export function collegeStructuredData(inst: InstitutionDetail, origin: string) {
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
