import { describe, expect, it } from 'vitest';
import { highestPlan, planAtLeast } from './plan.service.js';

describe('plan ordering', () => {
  it('ranks Free < Pro < Business', () => {
    expect(planAtLeast('FREE', 'PRO')).toBe(false);
    expect(planAtLeast('PRO', 'PRO')).toBe(true);
    expect(planAtLeast('BUSINESS', 'PRO')).toBe(true);
    expect(planAtLeast('PRO', 'BUSINESS')).toBe(false);
  });

  it('picks the highest live plan, defaulting to Free', () => {
    expect(highestPlan([])).toBe('FREE');
    expect(highestPlan(['PRO'])).toBe('PRO');
    expect(highestPlan(['PRO', 'BUSINESS'])).toBe('BUSINESS');
  });
});
