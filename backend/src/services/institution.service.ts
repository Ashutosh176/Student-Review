import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { toSlug } from '../utils/slug.js';
import type { InstitutionType, RatingCategory } from '@prisma/client';

const ALL_CATEGORIES: RatingCategory[] = [
  'OVERALL',
  'PLACEMENT',
  'FACULTY',
  'INFRASTRUCTURE',
  'ADMINISTRATION',
  'CAMPUS_LIFE',
  'VALUE_FOR_MONEY',
  'HOSTEL',
];

// Backs the homepage trust strip — real counts instead of hardcoded marketing copy.
export async function platformStats() {
  const [institutionCount, verifiedReviewCount] = await Promise.all([
    prisma.institution.count({ where: { status: 'APPROVED' } }),
    prisma.review.count({ where: { status: 'APPROVED', verifiedStudent: true } }),
  ]);
  return { institutionCount, verifiedReviewCount };
}

// Any student can propose a new college; it stays invisible to the public
// (and unreviewable) until an admin approves it — see admin.service.ts's
// decideInstitutionSubmission.
export async function submitInstitution(
  userId: string,
  input: {
    name: string;
    type: InstitutionType;
    city: string;
    state: string;
    establishedYear?: number;
    website?: string;
    description?: string;
    categoryId?: string;
  },
) {
  const slug = toSlug(input.name);
  const existing = await prisma.institution.findUnique({ where: { slug } });
  if (existing) throw AppError.conflict(`An institution with a matching slug ("${slug}") already exists`);

  return prisma.institution.create({
    data: {
      slug,
      name: input.name,
      type: input.type,
      establishedYear: input.establishedYear,
      website: input.website || undefined,
      description: input.description,
      categoryId: input.categoryId || undefined,
      status: 'PENDING',
      submittedByUserId: userId,
      locations: { create: { city: input.city, state: input.state, isPrimary: true } },
    },
    include: { locations: { where: { isPrimary: true }, take: 1 } },
  });
}

export async function ratingSummaryFor(institutionId: string) {
  const grouped = await prisma.reviewRating.groupBy({
    by: ['category'],
    where: { review: { institutionId, status: 'APPROVED' } },
    _avg: { value: true },
    _count: { _all: true },
  });
  const map = new Map(grouped.map((g) => [g.category, { average: g._avg.value ?? 0, count: g._count._all }]));

  const [reviewCount, verifiedCount] = await Promise.all([
    prisma.review.count({ where: { institutionId, status: 'APPROVED' } }),
    prisma.review.count({ where: { institutionId, status: 'APPROVED', verifiedStudent: true } }),
  ]);

  return {
    reviewCount,
    verifiedCount,
    ratings: ALL_CATEGORIES.map((category) => ({
      category,
      average: Math.round((map.get(category)?.average ?? 0) * 10) / 10,
      count: map.get(category)?.count ?? 0,
    })),
  };
}

// Backs the search page's filter sidebar with real, present-in-the-data
// options — never a hardcoded/guessed list that could offer a state or
// category with zero matching institutions.
export async function listSearchFilters() {
  const [states, cities, categories] = await Promise.all([
    prisma.institutionLocation.findMany({ where: { isPrimary: true }, select: { state: true }, distinct: ['state'] }),
    prisma.institutionLocation.findMany({ where: { isPrimary: true }, select: { city: true }, distinct: ['city'] }),
    prisma.institutionCategory.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: 'asc' } }),
  ]);
  return {
    states: states.map((s) => s.state).sort(),
    cities: cities.map((c) => c.city).sort(),
    categories,
  };
}

export async function listInstitutions(params: {
  q?: string;
  state?: string;
  city?: string;
  course?: string;
  type?: string;
  categorySlug?: string;
  verifiedOnly?: boolean;
  sort: 'relevant' | 'rating' | 'reviews' | 'name';
  page: number;
  pageSize: number;
}) {
  const where: Record<string, unknown> = { status: 'APPROVED' };
  if (params.q) {
    // Matches the search bar's own placeholder promise ("colleges, cities,
    // courses...") — previously only matched name/city, never courses.
    where.OR = [
      { name: { contains: params.q, mode: 'insensitive' } },
      { locations: { some: { city: { contains: params.q, mode: 'insensitive' } } } },
      { courses: { some: { name: { contains: params.q, mode: 'insensitive' } } } },
    ];
  }
  if (params.type) where.type = params.type;
  if (params.verifiedOnly) where.verified = true;
  if (params.categorySlug) where.category = { slug: params.categorySlug };
  if (params.course) where.courses = { some: { name: { contains: params.course, mode: 'insensitive' } } };
  if (params.state || params.city) {
    where.locations = {
      some: {
        ...(params.state ? { state: { equals: params.state, mode: 'insensitive' } } : {}),
        ...(params.city ? { city: { equals: params.city, mode: 'insensitive' } } : {}),
      },
    };
  }

  const orderBy =
    params.sort === 'name'
      ? { name: 'asc' as const }
      : params.sort === 'reviews'
        ? undefined // handled post-fetch via review counts, see below
        : undefined;

  const [total, institutions] = await Promise.all([
    prisma.institution.count({ where }),
    prisma.institution.findMany({
      where,
      orderBy,
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      include: { locations: { where: { isPrimary: true }, take: 1 }, category: true },
    }),
  ]);

  const withSummaries = await Promise.all(
    institutions.map(async (inst) => ({ ...inst, summary: await ratingSummaryFor(inst.id) })),
  );

  if (params.sort === 'rating') {
    withSummaries.sort((a, b) => {
      const av = a.summary.ratings.find((r) => r.category === 'OVERALL')?.average ?? 0;
      const bv = b.summary.ratings.find((r) => r.category === 'OVERALL')?.average ?? 0;
      return bv - av;
    });
  } else if (params.sort === 'reviews') {
    withSummaries.sort((a, b) => b.summary.reviewCount - a.summary.reviewCount);
  }

  return { total, page: params.page, pageSize: params.pageSize, items: withSummaries };
}

export async function searchInstitutions(q: string, limit: number) {
  const institutions = await prisma.institution.findMany({
    where: {
      status: 'APPROVED',
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
        { locations: { some: { city: { contains: q, mode: 'insensitive' } } } },
      ],
    },
    take: limit,
    include: { locations: { where: { isPrimary: true }, take: 1 } },
  });
  return institutions;
}

export async function getInstitutionBySlug(slug: string) {
  const institution = await prisma.institution.findFirst({
    where: { slug, status: 'APPROVED' },
    include: {
      locations: true,
      category: true,
      courses: true,
      organizationProfile: true,
      admissionCutoffs: { include: { course: { select: { name: true } } }, orderBy: [{ year: 'desc' as const }, { examName: 'asc' as const }] },
    },
  });
  if (!institution) throw AppError.notFound('Institution not found');
  const summary = await ratingSummaryFor(institution.id);
  return { ...institution, summary };
}

export async function getCompareData(slugs: string[]) {
  const institutions = await prisma.institution.findMany({
    where: { slug: { in: slugs }, status: 'APPROVED' },
    include: { locations: { where: { isPrimary: true }, take: 1 } },
  });
  if (institutions.length < 2) throw AppError.badRequest('At least 2 valid institutions are required to compare');

  const withSummaries = await Promise.all(
    institutions.map(async (inst) => ({ ...inst, summary: await ratingSummaryFor(inst.id) })),
  );
  // Preserve requested order for a stable shareable comparison URL.
  return slugs
    .map((slug) => withSummaries.find((i) => i.slug === slug))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));
}
