import Razorpay from 'razorpay';
import { env } from './env.js';

// Test-mode keys (rzp_test_...) come from the Razorpay dashboard — Settings →
// API Keys → Generate Test Key. No live/KYC account is required for test mode.
export const razorpayEnabled = Boolean(env.razorpay.keyId && env.razorpay.keySecret);

export const razorpay = razorpayEnabled
  ? new Razorpay({ key_id: env.razorpay.keyId, key_secret: env.razorpay.keySecret })
  : null;
