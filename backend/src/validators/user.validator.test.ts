import { describe, expect, it } from 'vitest';
import { changePasswordSchema, deactivateAccountSchema } from './user.validator.js';

describe('changePasswordSchema', () => {
  const valid = { currentPassword: 'anything', newPassword: 'NewPass1' };

  it('accepts a new password meeting all complexity rules', () => {
    expect(() => changePasswordSchema.parse(valid)).not.toThrow();
  });

  it('rejects a new password missing an uppercase letter', () => {
    expect(() => changePasswordSchema.parse({ ...valid, newPassword: 'newpass1' })).toThrow();
  });

  it('rejects a new password missing a number', () => {
    expect(() => changePasswordSchema.parse({ ...valid, newPassword: 'NewPassword' })).toThrow();
  });

  it('rejects a new password under 8 characters', () => {
    expect(() => changePasswordSchema.parse({ ...valid, newPassword: 'New1' })).toThrow();
  });

  it('rejects an empty current password', () => {
    expect(() => changePasswordSchema.parse({ ...valid, currentPassword: '' })).toThrow();
  });

  it('does not enforce complexity rules on the current password (it already exists)', () => {
    expect(() => changePasswordSchema.parse({ ...valid, currentPassword: 'weak' })).not.toThrow();
  });
});

describe('deactivateAccountSchema', () => {
  it('accepts any non-empty password', () => {
    expect(() => deactivateAccountSchema.parse({ password: 'whatever-it-is' })).not.toThrow();
  });

  it('rejects an empty password', () => {
    expect(() => deactivateAccountSchema.parse({ password: '' })).toThrow();
  });
});
