import { recomputeAllRankings } from '../modules/ranking/ranking.service.js';
import { logger } from '../config/logger.js';
import { prisma } from '../config/prisma.js';

// Runs standalone (`npm run jobs:rankings`) or can be scheduled via cron/queue
// in production. Not wired to run automatically on every request — rankings
// are read from the cached institution_ranking_scores table.
async function main() {
  const start = Date.now();
  const counts = await recomputeAllRankings();
  logger.info({ counts, ms: Date.now() - start }, 'Rankings recomputed');
  await prisma.$disconnect();
}

main().catch(async (err) => {
  logger.error({ err }, 'Ranking recompute failed');
  await prisma.$disconnect();
  process.exit(1);
});
