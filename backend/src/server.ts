import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './config/prisma.js';
import { verifySmtpConnection } from './services/email.service.js';

const app = createApp();

const server = app.listen(env.port, () => {
  logger.info(`StudentReview API listening on http://localhost:${env.port}`);
  logger.info(`API docs available at http://localhost:${env.port}/api/docs`);
});

// Non-blocking — a slow/unreachable mail server should never delay the API
// coming up. Logs success/failure only; never the SMTP password.
void verifySmtpConnection();

async function shutdown(signal: string) {
  logger.info(`Received ${signal}, shutting down gracefully`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
