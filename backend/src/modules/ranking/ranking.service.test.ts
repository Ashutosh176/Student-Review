import { describe, expect, it } from 'vitest';
import { bayesianAverage, decayWeight } from './ranking.service.js';

describe('decayWeight', () => {
  it('weighs a brand-new review at 1', () => {
    expect(decayWeight(new Date())).toBeCloseTo(1, 5);
  });

  it('halves the weight after one half-life (365 days)', () => {
    const yearAgo = new Date(Date.now() - 365 * 86_400_000);
    expect(decayWeight(yearAgo)).toBeCloseTo(0.5, 2);
  });

  it('quarters the weight after two half-lives', () => {
    const twoYearsAgo = new Date(Date.now() - 730 * 86_400_000);
    expect(decayWeight(twoYearsAgo)).toBeCloseTo(0.25, 2);
  });
});

describe('bayesianAverage', () => {
  it('returns exactly the global mean at zero sample size', () => {
    expect(bayesianAverage(5, 0, 3.5)).toBeCloseTo(3.5, 5);
  });

  it('weighs the raw average and global mean equally when sample size equals the prior strength (15)', () => {
    expect(bayesianAverage(5, 15, 3.5)).toBeCloseTo((5 + 3.5) / 2, 5);
  });

  it('pulls a small sample strongly toward the global mean, not the raw average', () => {
    // Two 5-star reviews shouldn't be able to outscore a well-established
    // institution — this is the anti-gaming guarantee the algorithm exists for.
    const twoFiveStars = bayesianAverage(5, 2, 3.5);
    expect(twoFiveStars).toBeLessThan(4);
    expect(twoFiveStars).toBeGreaterThan(3.5);
  });

  it('approaches the raw average as sample size grows large', () => {
    const largeSample = bayesianAverage(4.8, 10_000, 3.5);
    expect(largeSample).toBeCloseTo(4.8, 1);
  });
});
