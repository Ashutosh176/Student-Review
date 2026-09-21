import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

// General API limiter (spec §26).
export const generalLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// Tighter limiter for login/register to blunt credential stuffing.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again later.' },
});

// Login only counts FAILED attempts — that is what credential stuffing looks
// like. Counting successful logins too meant a campus/hostel network (many
// students behind one IP) exhausted the shared limit and got locked out.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many failed attempts, please try again in a few minutes.' },
});

// Review submission limiter — one of the primary anti-abuse levers (spec §36).
export const reviewSubmitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Review submission limit reached. Please try again later.' },
});

// Report submission limiter.
export const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many reports submitted. Please try again later.' },
});

// University-email OTP start/resend/verify — blunts brute-forcing a 6-digit
// code by spinning up many OTP rows, and general verification spam.
export const verificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many verification attempts, please try again later.' },
});
