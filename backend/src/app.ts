import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { openApiSpec } from './config/swagger.js';
import { generalLimiter } from './middlewares/rateLimiters.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import institutionRoutes from './routes/institution.routes.js';
import reviewRoutes from './routes/review.routes.js';
import questionRoutes from './routes/question.routes.js';
import rankingRoutes from './routes/ranking.routes.js';
import userRoutes from './routes/user.routes.js';
import organizationRoutes from './routes/organization.routes.js';
import adminRoutes from './routes/admin.routes.js';
import contactRoutes from './routes/contact.routes.js';
import sitemapRoutes from './routes/sitemap.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import faqRoutes from './routes/faq.routes.js';
import verificationRoutes from './routes/verification.routes.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(
    helmet({
      // Extends helmet's default CSP (script-src/frame-src/connect-src all
      // fall back to 'self' otherwise) so the Razorpay Checkout script and
      // its payment iframe are allowed to load.
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          'script-src': ["'self'", 'https://checkout.razorpay.com'],
          'frame-src': ["'self'", 'https://api.razorpay.com', 'https://checkout.razorpay.com'],
          'connect-src': ["'self'", 'https://api.razorpay.com', 'https://lumberjack.razorpay.com'],
          'img-src': ["'self'", 'data:', 'https://*.razorpay.com'],
        },
      },
    }),
  );
  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(
    express.json({
      limit: '1mb', // request size limit (spec §26)
      verify: (req, _res, buf) => {
        // Kept alongside the parsed body so the Razorpay webhook can verify
        // its HMAC signature against the exact bytes that were sent.
        (req as express.Request).rawBody = buf;
      },
    }),
  );
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser(env.cookieSecret));
  // Request logs deliberately omit client IP, headers and query strings: an
  // IP+timestamp line for POST /api/reviews would otherwise be a
  // reviewer-correlation record for anyone with log access.
  app.use(
    pinoHttp({
      logger,
      autoLogging: { ignore: (req) => req.url === '/health' },
      serializers: {
        req: (req) => ({ id: req.id, method: req.method, url: String(req.url).split('?')[0] }),
        res: (res) => ({ statusCode: res.statusCode }),
      },
    }),
  );
  app.use(generalLimiter);

  app.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));
  app.use(sitemapRoutes);
  if (!env.isProd) app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

  app.use('/api/auth', authRoutes);
  app.use('/api/institutions', institutionRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/questions', questionRoutes);
  app.use('/api/rankings', rankingRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/organization', organizationRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/webhooks', webhookRoutes);
  app.use('/api/faqs', faqRoutes);
  app.use('/api/verifications', verificationRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
