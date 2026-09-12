import type { RankingMetric, RatingCategory } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { getPlatformSettings } from '../../services/settings.service.js';

// Full algorithm write-up lives in docs/ranking-algorithm.md — keep the two
// in sync. Summary: a Bayesian-adjusted, recency- and verification-weighted
// average with a minimum-sample-size gate, so 1-2 reviews can never place an
// institution at the top (spec §21).

const HALF_LIFE_DAYS = 365; // a review's rating weight halves every year
const VERIFIED_WEIGHT_BONUS = 1.15;
const BAYESIAN_MIN_VOTES = 15; // "m" — pulls low-volume institutions toward the global mean
const SUSPICIOUS_FLAG_RATIO_THRESHOLD = 0.2; // >20% flagged/rejected in last 90d dampens score
const SUSPICIOUS_PENALTY = 0.9;

const RATING_CATEGORY_METRICS: Partial<Record<RankingMetric, RatingCategory>> = {
  OVERALL: 'OVERALL',
  PLACEMENT: 'PLACEMENT',
  FACULTY: 'FACULTY',
  INFRASTRUCTURE: 'INFRASTRUCTURE',
  CAMPUS_LIFE: 'CAMPUS_LIFE',
  VALUE_FOR_MONEY: 'VALUE_FOR_MONEY',
};

export function decayWeight(createdAt: Date): number {
  const ageDays = (Date.now() - createdAt.getTime()) / 86_400_000;
  return Math.pow(0.5, ageDays / HALF_LIFE_DAYS);
}

// Pulls a low-sample-size raw average toward the global mean ("m"-estimate
// Bayesian average) — the core anti-gaming mechanism: a brand-new
// institution with two 5-star reviews can't outrank one with hundreds.
export function bayesianAverage(rawAvg: number, sampleSize: number, globalMean: number): number {
  return (sampleSize / (sampleSize + BAYESIAN_MIN_VOTES)) * rawAvg + (BAYESIAN_MIN_VOTES / (sampleSize + BAYESIAN_MIN_VOTES)) * globalMean;
}

async function globalMeanForCategory(category: RatingCategory): Promise<number> {
  const agg = await prisma.reviewRating.aggregate({
    where: { category, review: { status: 'APPROVED' } },
    _avg: { value: true },
  });
  return agg._avg.value ?? 3.5;
}

async function suspiciousPenaltyFor(institutionId: string): Promise<number> {
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const [total, flaggedOrRejected] = await Promise.all([
    prisma.review.count({ where: { institutionId, createdAt: { gte: since } } }),
    prisma.review.count({
      where: { institutionId, createdAt: { gte: since }, status: { in: ['FLAGGED', 'REJECTED', 'REMOVED'] } },
    }),
  ]);
  if (total === 0) return 1;
  const ratio = flaggedOrRejected / total;
  return ratio > SUSPICIOUS_FLAG_RATIO_THRESHOLD ? SUSPICIOUS_PENALTY : 1;
}

interface InstitutionScore {
  institutionId: string;
  score: number;
  sampleSize: number;
}

async function scoreByCategory(category: RatingCategory, minReviewsForRanking: number): Promise<InstitutionScore[]> {
  const globalMean = await globalMeanForCategory(category);

  const ratings = await prisma.reviewRating.findMany({
    where: { category, review: { status: 'APPROVED' } },
    select: {
      value: true,
      review: { select: { institutionId: true, createdAt: true, verifiedStudent: true } },
    },
  });

  const byInstitution = new Map<string, { weightedSum: number; weightSum: number; count: number }>();
  for (const r of ratings) {
    const bucket = byInstitution.get(r.review.institutionId) ?? { weightedSum: 0, weightSum: 0, count: 0 };
    const weight = decayWeight(r.review.createdAt) * (r.review.verifiedStudent ? VERIFIED_WEIGHT_BONUS : 1);
    bucket.weightedSum += r.value * weight;
    bucket.weightSum += weight;
    bucket.count += 1;
    byInstitution.set(r.review.institutionId, bucket);
  }

  const results: InstitutionScore[] = [];
  for (const [institutionId, bucket] of byInstitution) {
    if (bucket.count < minReviewsForRanking) continue; // minimum-sample-size gate
    const rawAvg = bucket.weightSum > 0 ? bucket.weightedSum / bucket.weightSum : 0;
    const v = bucket.count;
    const bayesian = bayesianAverage(rawAvg, v, globalMean);
    const penalty = await suspiciousPenaltyFor(institutionId);
    results.push({ institutionId, score: Math.round(bayesian * penalty * 20 * 10) / 10, sampleSize: v });
  }
  return results;
}

async function scoreMostReviewed(minReviewsForRanking: number): Promise<InstitutionScore[]> {
  const grouped = await prisma.review.groupBy({
    by: ['institutionId'],
    where: { status: 'APPROVED' },
    _count: { _all: true },
  });
  return grouped
    .filter((g) => g._count._all >= minReviewsForRanking)
    .map((g) => ({ institutionId: g.institutionId, score: g._count._all, sampleSize: g._count._all }));
}

async function scoreTrending(): Promise<InstitutionScore[]> {
  const now = Date.now();
  const last30 = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const prev60to30 = new Date(now - 60 * 24 * 60 * 60 * 1000);

  const [recent, previous] = await Promise.all([
    prisma.review.groupBy({ by: ['institutionId'], where: { status: 'APPROVED', createdAt: { gte: last30 } }, _count: { _all: true } }),
    prisma.review.groupBy({
      by: ['institutionId'],
      where: { status: 'APPROVED', createdAt: { gte: prev60to30, lt: last30 } },
      _count: { _all: true },
    }),
  ]);
  const prevMap = new Map(previous.map((p) => [p.institutionId, p._count._all]));

  return recent
    .filter((r) => r._count._all >= 2) // small floor so a single burst review isn't "trending"
    .map((r) => {
      const prevCount = prevMap.get(r.institutionId) ?? 0;
      const growth = Math.max(0, r._count._all - prevCount);
      return { institutionId: r.institutionId, score: r._count._all + growth * 1.5, sampleSize: r._count._all };
    });
}

export async function computeMetricScores(metric: RankingMetric, minReviewsForRanking = 5): Promise<InstitutionScore[]> {
  const category = RATING_CATEGORY_METRICS[metric];
  if (category) return scoreByCategory(category, minReviewsForRanking);
  if (metric === 'MOST_REVIEWED') return scoreMostReviewed(minReviewsForRanking);
  if (metric === 'TRENDING') return scoreTrending();
  return [];
}

export async function recomputeRankingMetric(metric: RankingMetric, minReviewsForRanking = 5): Promise<number> {
  const scores = await computeMetricScores(metric, minReviewsForRanking);
  scores.sort((a, b) => b.score - a.score);

  await prisma.$transaction(
    scores.map((s, idx) =>
      prisma.institutionRankingScore.upsert({
        where: { institutionId_metric: { institutionId: s.institutionId, metric } },
        create: { institutionId: s.institutionId, metric, score: s.score, rank: idx + 1 },
        update: { score: s.score, rank: idx + 1, computedAt: new Date() },
      }),
    ),
  );
  return scores.length;
}

export async function recomputeAllRankings(): Promise<Record<string, number>> {
  const settings = await getPlatformSettings();
  const metrics: RankingMetric[] = [
    'OVERALL',
    'PLACEMENT',
    'FACULTY',
    'INFRASTRUCTURE',
    'CAMPUS_LIFE',
    'VALUE_FOR_MONEY',
    'MOST_REVIEWED',
    'TRENDING',
  ];
  const out: Record<string, number> = {};
  for (const m of metrics) out[m] = await recomputeRankingMetric(m, settings.minReviewsForRanking);
  return out;
}

export async function getRankings(metric: RankingMetric, limit = 20, offset = 0) {
  return prisma.institutionRankingScore.findMany({
    where: { metric },
    orderBy: { rank: 'asc' },
    take: limit,
    skip: offset,
    include: {
      institution: {
        include: { locations: { where: { isPrimary: true }, take: 1 } },
      },
    },
  });
}
