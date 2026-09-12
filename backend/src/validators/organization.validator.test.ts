import { describe, expect, it } from 'vitest';
import { checkoutSchema, verifyPaymentSchema } from './organization.validator.js';

describe('checkoutSchema', () => {
  it('accepts PRO and BUSINESS plans', () => {
    expect(() => checkoutSchema.parse({ plan: 'PRO' })).not.toThrow();
    expect(() => checkoutSchema.parse({ plan: 'BUSINESS' })).not.toThrow();
  });

  it('rejects the FREE plan — there is nothing to check out for it', () => {
    expect(() => checkoutSchema.parse({ plan: 'FREE' })).toThrow();
  });

  it('rejects a missing plan', () => {
    expect(() => checkoutSchema.parse({})).toThrow();
  });
});

describe('verifyPaymentSchema', () => {
  const valid = { orderId: 'order_abc123', paymentId: 'pay_abc123', signature: 'deadbeef' };

  it('accepts a well-formed verification payload', () => {
    expect(() => verifyPaymentSchema.parse(valid)).not.toThrow();
  });

  it('rejects an empty orderId, paymentId, or signature', () => {
    expect(() => verifyPaymentSchema.parse({ ...valid, orderId: '' })).toThrow();
    expect(() => verifyPaymentSchema.parse({ ...valid, paymentId: '' })).toThrow();
    expect(() => verifyPaymentSchema.parse({ ...valid, signature: '' })).toThrow();
  });
});
