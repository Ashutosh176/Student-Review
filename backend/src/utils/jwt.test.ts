import { describe, expect, it } from 'vitest';
import {
  hashToken,
  refreshTtlToDate,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from './jwt.js';

describe('access tokens', () => {
  it('round-trips the payload through sign/verify', () => {
    const token = signAccessToken({ sub: 'user-1', roles: ['STUDENT'], username: 'demo' });
    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe('user-1');
    expect(payload.roles).toEqual(['STUDENT']);
    expect(payload.username).toBe('demo');
  });

  it('rejects a tampered token', () => {
    const token = signAccessToken({ sub: 'user-1', roles: ['STUDENT'], username: 'demo' });
    expect(() => verifyAccessToken(`${token}tampered`)).toThrow();
  });

  it('rejects garbage input', () => {
    expect(() => verifyAccessToken('not.a.jwt')).toThrow();
  });
});

describe('refresh tokens', () => {
  it('round-trips the userId and includes a unique jti per token', () => {
    const tokenA = signRefreshToken('user-1');
    const tokenB = signRefreshToken('user-1');
    const payloadA = verifyRefreshToken(tokenA);
    const payloadB = verifyRefreshToken(tokenB);
    expect(payloadA.sub).toBe('user-1');
    expect(payloadB.sub).toBe('user-1');
    expect(payloadA.jti).not.toBe(payloadB.jti);
  });

  it('an access token cannot be verified as a refresh token (different secret)', () => {
    const accessToken = signAccessToken({ sub: 'user-1', roles: ['STUDENT'], username: 'demo' });
    expect(() => verifyRefreshToken(accessToken)).toThrow();
  });
});

describe('hashToken', () => {
  it('is deterministic', () => {
    expect(hashToken('same-input')).toBe(hashToken('same-input'));
  });

  it('never stores the plaintext token as its own hash', () => {
    const token = 'some-refresh-token-value';
    expect(hashToken(token)).not.toBe(token);
  });

  it('produces different hashes for different inputs', () => {
    expect(hashToken('a')).not.toBe(hashToken('b'));
  });
});

describe('refreshTtlToDate', () => {
  it('returns a date roughly TTL from now (default 30d)', () => {
    const before = Date.now();
    const result = refreshTtlToDate();
    const thirtyDaysMs = 30 * 86_400_000;
    expect(result.getTime()).toBeGreaterThanOrEqual(before + thirtyDaysMs - 5000);
    expect(result.getTime()).toBeLessThanOrEqual(before + thirtyDaysMs + 5000);
  });
});
