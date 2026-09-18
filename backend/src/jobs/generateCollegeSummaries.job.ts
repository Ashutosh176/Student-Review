import { regenerateAllInstitutionSummaries } from '../services/aiSummary.service.js';
import { logger } from '../config/logger.js';
import { prisma } from '../config/prisma.js';

// Runs standalone (`npm run jobs:ai-summaries`) or can be scheduled via
// cron/queue in production — each eligible institution costs a real,
// billed Claude API call, so this is not wired to run automatically on
// every request or every new review the way ranking recompute is.
async function main() {
  const start = Date.now();
  const result = await regenerateAllInstitutionSummaries();
  logger.info({ ...result, ms: Date.now() - start }, 'AI college summaries regenerated');
  await prisma.$disconnect();
}

main().catch(async (err) => {
  logger.error({ err }, 'AI summary regeneration failed');
  await prisma.$disconnect();
  process.exit(1);
});
