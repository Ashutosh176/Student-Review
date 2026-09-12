import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';
import { getRankings } from '../modules/ranking/ranking.service.js';
import type { RankingMetric } from '@prisma/client';

const VALID_METRICS: RankingMetric[] = [
  'OVERALL',
  'PLACEMENT',
  'FACULTY',
  'INFRASTRUCTURE',
  'CAMPUS_LIFE',
  'VALUE_FOR_MONEY',
  'MOST_REVIEWED',
  'TRENDING',
];

export const list = asyncHandler(async (req, res) => {
  const metric = (req.query.metric as string)?.toUpperCase() ?? 'OVERALL';
  if (!VALID_METRICS.includes(metric as RankingMetric)) {
    throw AppError.badRequest(`Invalid metric. Must be one of: ${VALID_METRICS.join(', ')}`);
  }
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const offset = Number(req.query.offset) || 0;
  const rows = await getRankings(metric as RankingMetric, limit, offset);
  ok(
    res,
    rows.map((r) => ({
      rank: r.rank,
      score: r.score,
      institution: {
        id: r.institution.id,
        slug: r.institution.slug,
        name: r.institution.name,
        logoUrl: r.institution.logoUrl,
        verified: r.institution.verified,
        location: r.institution.locations[0] ? { city: r.institution.locations[0].city, state: r.institution.locations[0].state } : null,
      },
    })),
  );
});
