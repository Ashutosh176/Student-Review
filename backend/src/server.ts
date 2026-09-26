import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './config/prisma.js';
import { verifySmtpConnection } from './services/email.service.js';
import { ensureAdminAccount } from './services/adminBootstrap.service.js';
import { recomputeAllRankings } from './modules/ranking/ranking.service.js';

const app = createApp();

const server = app.listen(env.port, () => {
  logger.info(`StudentReview API listening on http://localhost:${env.port}`);
  logger.info(`API docs available at http://localhost:${env.port}/api/docs`);
});

// Non-blocking — a slow/unreachable mail server should never delay the API
// coming up. Logs success/failure only; never the SMTP password.
void verifySmtpConnection();
void ensureAdminAccount();

// Rankings are served from the cached institution_ranking_scores table, so
// something has to refresh it. Render (free tier) has no cron, so it runs
// in-process: shortly after boot (which also covers cold starts after the
// instance spun down) and then hourly. Reviews only become public at 12h batch
// boundaries, so hourly is plenty fresh.
const RANKING_RECOMPUTE_INTERVAL_MS = 60 * 60 * 1000;
async function recomputeRankingsInBackground() {
  try {
    const counts = await recomputeAllRankings();
    logger.info({ counts }, 'Rankings recomputed');
  } catch (err) {
    logger.error({ err }, 'Scheduled ranking recompute failed');
  }
}
if (env.nodeEnv !== 'test') {
  setTimeout(() => void recomputeRankingsInBackground(), 30_000).unref();
  setInterval(() => void recomputeRankingsInBackground(), RANKING_RECOMPUTE_INTERVAL_MS).unref();
}

async function shutdown(signal: string) {
  logger.info(`Received ${signal}, shutting down gracefully`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
