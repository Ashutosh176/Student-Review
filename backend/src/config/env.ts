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

  // Hours between public-visibility batches for approved reviews (see
  // utils/publishing.ts). 0 disables batching (dev default).
  // Where /api/contact messages are delivered.
  contactTo: process.env.CONTACT_TO ?? 'no-reply@studentreview.in',

  reviewPublishBatchHours: Number(process.env.REVIEW_PUBLISH_BATCH_HOURS ?? (process.env.NODE_ENV === 'production' ? 12 : 0)),

  cookieSecret: required('COOKIE_SECRET', 'dev-cookie-secret-change-me'),

  email: {
    provider: process.env.EMAIL_PROVIDER ?? 'console',
    // Resend's shared, no-verification-needed sender for test mode — swap
    // once a custom domain is verified in the Resend dashboard.
    from: process.env.EMAIL_FROM ?? 'onboarding@resend.dev',
    resendApiKey: process.env.RESEND_API_KEY ?? '',
  },

  // GoDaddy/Titan (or any standard) SMTP — EMAIL_PROVIDER=smtp. Never logged;
  // email.service.ts only ever logs `to`/`subject`, never this object.
  smtp: {
    host: process.env.SMTP_HOST ?? '',
    port: Number(process.env.SMTP_PORT ?? 465),
    // Only "false" opts out — SMTP_SECURE unset still defaults to true,
    // matching port 465's implicit-TLS convention.
    secure: process.env.SMTP_SECURE !== 'false',
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.SMTP_FROM || process.env.SMTP_USER || '',
  },

  msg91: {
    authKey: process.env.MSG91_AUTH_KEY ?? '',
    // The domain added + verified under Email → Domains in the MSG91 panel.
    domain: process.env.MSG91_DOMAIN ?? '',
    fromEmail: process.env.MSG91_FROM_EMAIL ?? '',
    fromName: process.env.MSG91_FROM_NAME ?? 'StudentReview',
    // Each is a separately approved template ID from Email → Templates.
    templates: {
      verifyEmail: process.env.MSG91_TEMPLATE_VERIFY_EMAIL ?? '',
      resetPassword: process.env.MSG91_TEMPLATE_RESET_PASSWORD ?? '',
      collegeOtp: process.env.MSG91_TEMPLATE_COLLEGE_OTP ?? '',
      savedCollegeReview: process.env.MSG91_TEMPLATE_SAVED_COLLEGE_REVIEW ?? '',
    },
  },

  // "Students say..." AI summary (aiSummary.service.ts) — inert (never
  // called, feature just stays off) until this is set.
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',

  // The one permanent site-owner admin account. adminBootstrap.service.ts
  // grants this email the ADMIN role at boot — idempotently, and it never
  // touches the password on an account that already exists, so changing
  // the password later via the app is never silently reverted on restart.
  admin: {
    email: process.env.ADMIN_EMAIL ?? '',
    username: process.env.ADMIN_USERNAME ?? 'admin',
    password: process.env.ADMIN_PASSWORD ?? '',
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
    keyId: (process.env.RAZORPAY_KEY_ID ?? '').trim(),
    keySecret: (process.env.RAZORPAY_KEY_SECRET ?? '').trim(),
    webhookSecret: (process.env.RAZORPAY_WEBHOOK_SECRET ?? '').trim(),
  },
};

// Refuse to boot in production with dev-default secrets — a known JWT secret
// lets anyone forge an ADMIN token.
if (env.isProd) {
  const weak = (v: string) => v.length < 32 || v.includes('change-me');
  const bad = [
    weak(env.jwt.accessSecret) && 'JWT_ACCESS_SECRET',
    weak(env.jwt.refreshSecret) && 'JWT_REFRESH_SECRET',
    weak(env.cookieSecret) && 'COOKIE_SECRET',
    env.clientOrigin.startsWith('http://') && 'CLIENT_ORIGIN (must be https)',
    env.email.provider === 'console' && 'EMAIL_PROVIDER (console would log OTP codes)',
    env.razorpay.keyId && !env.razorpay.keySecret && 'RAZORPAY_KEY_SECRET',
  ].filter(Boolean);
  if (bad.length) throw new Error('Insecure production configuration: ' + bad.join(', '));
}
