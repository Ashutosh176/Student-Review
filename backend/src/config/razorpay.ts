import Razorpay from 'razorpay';
import { env } from './env.js';
import { logger } from './logger.js';

// Test-mode keys (rzp_test_...) come from the Razorpay dashboard — Settings →
// API Keys → Generate Test Key. No live/KYC account is required for test mode.
export const razorpayEnabled = Boolean(env.razorpay.keyId && env.razorpay.keySecret);

// Derived from the key prefix so UI banners reflect what is actually configured.
export type RazorpayMode = 'live' | 'test' | 'disabled';
export const razorpayMode: RazorpayMode = !razorpayEnabled
  ? 'disabled'
  : env.razorpay.keyId.startsWith('rzp_live_')
    ? 'live'
    : 'test';

export const razorpay = razorpayEnabled
  ? new Razorpay({ key_id: env.razorpay.keyId, key_secret: env.razorpay.keySecret })
  : null;

// Shape only (never the values): lets a mis-pasted key be diagnosed from the logs.
logger.info(
  {
    razorpayEnabled,
    keyIdPrefix: env.razorpay.keyId.slice(0, 9),
    keyIdLength: env.razorpay.keyId.length,
    keySecretLength: env.razorpay.keySecret.length,
    webhookSecretLength: env.razorpay.webhookSecret.length,
  },
  'Razorpay configuration',
);
