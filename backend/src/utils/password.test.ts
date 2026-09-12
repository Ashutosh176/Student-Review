import { describe, expect, it } from 'vitest';
import { hashPassword, isStrongPassword, verifyPassword } from './password.js';

describe('password hashing', () => {
  it('hashes and verifies a correct password', async () => {
    const hash = await hashPassword('CorrectHorse1');
    expect(await verifyPassword(hash, 'CorrectHorse1')).toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await hashPassword('CorrectHorse1');
    expect(await verifyPassword(hash, 'WrongPassword1')).toBe(false);
  });

  it('never stores the plaintext password in the hash', async () => {
    const hash = await hashPassword('SuperSecret123');
    expect(hash).not.toContain('SuperSecret123');
  });
});

describe('isStrongPassword', () => {
  it('accepts a password with upper, lower, digit, and 8+ length', () => {
    expect(isStrongPassword('Abcdefg1')).toBe(true);
  });

  it('rejects a password missing an uppercase letter', () => {
    expect(isStrongPassword('abcdefg1')).toBe(false);
  });

  it('rejects a password shorter than 8 characters', () => {
    expect(isStrongPassword('Ab1defg')).toBe(false);
  });
});
