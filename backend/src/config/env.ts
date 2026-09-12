import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const val = process.env[name] ?? fallback;
  if (val === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return val;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT ?? 4000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',

  databaseUrl: required('DATABASE_URL', 'postgresql://user:password@localhost:5432/studentreview'),

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET', 'dev-access-secret-change-me'),
    refreshSecret: required('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-me'),
    accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
    refreshTtl: process.env.JWT_REFRESH_TTL ?? '30d',
  },

  cookieSecret: required('COOKIE_SECRET', 'dev-cookie-secret-change-me'),

  email: {
    provider: process.env.EMAIL_PROVIDER ?? 'console',
    // Resend's shared, no-verification-needed sender for test mode — swap
    // once a custom domain is verified in the Resend dashboard.
    from: process.env.EMAIL_FROM ?? 'onboarding@resend.dev',
    resendApiKey: process.env.RESEND_API_KEY ?? '',
  },

  upload: {
    dir: process.env.UPLOAD_DIR ?? './uploads',
    maxMb: Number(process.env.MAX_UPLOAD_MB ?? 5),
  },

  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 900000),
    max: Number(process.env.RATE_LIMIT_MAX ?? 300),
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID ?? '',
    keySecret: process.env.RAZORPAY_KEY_SECRET ?? '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET ?? '',
  },
};
