// LOCAL-ONLY end-to-end check of listing sorts + rankings. Inserts synthetic
// test reviews, verifies ordering, then deletes everything it created.
// Refuses to run against anything but a 127.0.0.1/localhost database.
import { prisma } from '../src/config/prisma.js';
import { listInstitutions } from '../src/services/institution.service.js';
import { recomputeAllRankings, getRankings } from '../src/modules/ranking/ranking.service.js';

if (!/@(127\.0\.0\.1|localhost)[:/]/.test(process.env.DATABASE_URL ?? '')) {
  throw new Error('Refusing to run: DATABASE_URL is not a local database');
}

const DAY = 86_400_000;
let failures = 0;
function check(label: string, cond: boolean, detail?: unknown) {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}${cond ? '' : `  -> ${JSON.stringify(detail)}`}`);
  if (!cond) failures++;
}

async function main() {
  const all = await prisma.institution.findMany({ where: { status: 'APPROVED' }, orderBy: { name: 'asc' }, select: { id: true, name: true } });
  // Pick colleges from the END of the alphabet so a page-local sort bug
  // (the old behaviour) can't accidentally pass.
  const [A, B, C, D] = all.slice(-4);
  console.log('Test colleges:', { A: A.name, B: B.name, C: C.name, D: D.name });

  const user = await prisma.user.create({ data: { username: `e2e_${Date.now()}`, email: `e2e_${Date.now()}@test.local`, passwordHash: 'x' } });

  async function review(institutionId: string, overall: number, daysAgo: number, verified = true) {
    await prisma.review.create({
      data: {
        userId: user.id,
        institutionId,
        relationship: 'ALUMNI',
        batchYear: 2024,
        body: 'E2E TEST REVIEW — local database only',
        recommend: overall >= 3,
        verifiedStudent: verified,
        status: 'APPROVED',
        createdAt: new Date(Date.now() - daysAgo * DAY),
        ratings: { create: (['OVERALL', 'PLACEMENT', 'FACULTY', 'INFRASTRUCTURE', 'CAMPUS_LIFE', 'VALUE_FOR_MONEY'] as const).map((category) => ({ category, value: overall })) },
      },
    });
  }

  // A: 7 reviews avg 4.x, old (not trending). B: 8 reviews avg ~3, all this week.
  // C: 1 review of 5 stars (must NOT top "Top rated"). D: 6 reviews avg 4.8, 20 days ago.
  for (const v of [5, 4, 4, 5, 4, 4, 5]) await review(A.id, v, 120);
  for (const v of [3, 3, 3, 4, 3, 2, 3, 3]) await review(B.id, v, 2);
  await review(C.id, 5, 3);
  for (const v of [5, 5, 5, 4, 5, 5]) await review(D.id, v, 20);

  const rating = await listInstitutions({ sort: 'rating', page: 1, pageSize: 4 });
  const ratingNames = rating.items.map((i) => i.name);
  check('Top rated: D (4.8×6) first', ratingNames[0] === D.name, ratingNames);
  check('Top rated: A (4.4×7) second', ratingNames[1] === A.name, ratingNames);
  check('Top rated: single 5-star C does not beat A/D', ratingNames.indexOf(C.name) > 1, ratingNames);
  check('Top rated: total covers all colleges', rating.total === all.length, rating.total);

  const reviews = await listInstitutions({ sort: 'reviews', page: 1, pageSize: 4 });
  check('Most reviewed order B,A,D,C', reviews.items.map((i) => i.name).join('|') === [B, A, D, C].map((x) => x.name).join('|'), reviews.items.map((i) => i.name));

  const trending = await listInstitutions({ sort: 'trending', page: 1, pageSize: 4 });
  const tn = trending.items.map((i) => i.name);
  check('Trending: B (8 this week) first', tn[0] === B.name, tn);
  check('Trending: excludes A (reviews 120 days old)', !tn.includes(A.name), tn);
  check('Trending: only active colleges counted', trending.total === 3, trending.total);
  check('Card summary shows real avg for D', trending.items.find((i) => i.name === D.name)?.summary.ratings.find((r) => r.category === 'OVERALL')?.average === 4.8);

  const page2 = await listInstitutions({ sort: 'rating', page: 2, pageSize: 4 });
  check('Pagination: page 2 has no overlap with page 1', !page2.items.some((i) => ratingNames.includes(i.name)));

  const counts = await recomputeAllRankings();
  console.log('Recompute counts:', counts);
  const overall = await getRankings('OVERALL', 10);
  check('Rankings OVERALL: D #1, A #2, C/B gated or lower', overall[0]?.institution.name === D.name && overall[1]?.institution.name === A.name, overall.map((r) => [r.rank, r.institution.name, r.score]));
  check('Rankings OVERALL: C (1 review) excluded by min-review gate', !overall.some((r) => r.institution.name === C.name));
  const trendRank = await getRankings('TRENDING', 10);
  check('Rankings TRENDING: B #1', trendRank[0]?.institution.name === B.name, trendRank.map((r) => [r.rank, r.institution.name]));

  // Stale-row cleanup: move B's reviews out of the trending window and recompute.
  await prisma.review.updateMany({ where: { institutionId: B.id, userId: user.id }, data: { createdAt: new Date(Date.now() - 200 * DAY) } });
  await recomputeAllRankings();
  const trendAfter = await getRankings('TRENDING', 10);
  check('Rankings TRENDING: B removed once it stops trending', !trendAfter.some((r) => r.institution.name === B.name), trendAfter.map((r) => r.institution.name));
  const ranks = trendAfter.map((r) => r.rank);
  check('Rankings TRENDING: ranks contiguous from 1', ranks.every((r, i) => r === i + 1), ranks);

  // Clean up everything this script created.
  await prisma.review.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
  await recomputeAllRankings();
  check('Cleanup: no ranking rows left', (await prisma.institutionRankingScore.count()) === 0);

  console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main().finally(() => prisma.$disconnect());
