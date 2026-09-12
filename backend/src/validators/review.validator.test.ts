import { describe, expect, it } from 'vitest';
import { createReviewSchema } from './review.validator.js';

const validBody = {
  institutionId: '11111111-1111-1111-1111-111111111111',
  relationship: 'CURRENT_STUDENT',
  batchYear: 2024,
  body: 'A'.repeat(150),
  recommend: true,
  ratings: [{ category: 'OVERALL', value: 4 }],
  guidelinesAccepted: true,
};

describe('createReviewSchema', () => {
  it('accepts a well-formed review', () => {
    expect(() => createReviewSchema.parse(validBody)).not.toThrow();
  });

  it('rejects a review below the minimum length', () => {
    expect(() => createReviewSchema.parse({ ...validBody, body: 'too short' })).toThrow();
  });

  it('rejects a review with no OVERALL rating', () => {
    expect(() => createReviewSchema.parse({ ...validBody, ratings: [{ category: 'PLACEMENT', value: 4 }] })).toThrow();
  });

  it('rejects a review that has not accepted community guidelines', () => {
    expect(() => createReviewSchema.parse({ ...validBody, guidelinesAccepted: false })).toThrow();
  });

  it('rejects an invalid rating value out of range', () => {
    expect(() => createReviewSchema.parse({ ...validBody, ratings: [{ category: 'OVERALL', value: 7 }] })).toThrow();
  });
});
