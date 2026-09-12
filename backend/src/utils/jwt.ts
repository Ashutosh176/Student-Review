import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/env.js';
import type { RoleName } from '@prisma/client';

export interface AccessTokenPayload {
  sub: string; // userId
  roles: RoleName[];
  username: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessTtl as jwt.SignOptions['expiresIn'] });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwt.accessSecret) as AccessTokenPayload;
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId, jti: crypto.randomUUID() }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshTtl as jwt.SignOptions['expiresIn'],
  });
}

export function verifyRefreshToken(token: string): { sub: string; jti: string } {
  return jwt.verify(token, env.jwt.refreshSecret) as { sub: string; jti: string };
}

// Refresh tokens are stored hashed (never plaintext) so a DB leak can't be replayed.
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function refreshTtlToDate(): Date {
  const match = /^(\d+)([smhd])$/.exec(env.jwt.refreshTtl);
  const amount = match ? Number(match[1]) : 30;
  const unit = match ? match[2] : 'd';
  const multiplier = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit] ?? 86_400_000;
  return new Date(Date.now() + amount * multiplier);
}
