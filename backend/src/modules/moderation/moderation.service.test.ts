import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '../../config/prisma.js';
import { moderateReview } from './moderation.service.js';

vi.mock('../../config/prisma.js', () => ({
  prisma: {
    review: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

const mockedPrisma = vi.mocked(prisma, true);

// A clean review that's long enough to clear the min-length check and
// contains none of the flagged patterns — the baseline every test tweaks.
const CLEAN_BODY =
  'My time here has genuinely shaped how I think about my field. Faculty are approachable during office hours and most labs are well-equipped, though a few classrooms could use better air conditioning.';

beforeEach(() => {
  mockedPrisma.review.count.mockResolvedValue(0);
  mockedPrisma.review.findMany.mockResolvedValue([]);
});

describe('moderateReview', () => {
  it('approves a clean, substantive review with no flags', async () => {
    const result = await moderateReview({ userId: 'u1', institutionId: 'i1', body: CLEAN_BODY });
    expect(result.decision).toBe('APPROVE');
    expect(result.riskScore).toBe(0);
    expect(result.flags).toEqual([]);
  });

  it('flags but does not reject a too-short review', async () => {
    const result = await moderateReview({ userId: 'u1', institutionId: 'i1', body: 'Great college, would recommend.' });
    expect(result.flags).toContain('Too short');
    expect(result.decision).toBe('APPROVE');
  });

  it('rejects a review containing an email address', async () => {
    const body = `${CLEAN_BODY} Contact me at student@example.com for details.`;
    const result = await moderateReview({ userId: 'u1', institutionId: 'i1', body });
    expect(result.flags).toContain('Personal information');
    expect(result.decision).toBe('REJECT');
  });

  it('rejects a review containing a phone number', async () => {
    const body = `${CLEAN_BODY} Call me on 9876543210 if you want to know more.`;
    const result = await moderateReview({ userId: 'u1', institutionId: 'i1', body });
    expect(result.flags).toContain('Personal information');
    expect(result.decision).toBe('REJECT');
  });

  it('rejects a review with 2+ links as spam, but only flags a single link', async () => {
    const oneLink = await moderateReview({ userId: 'u1', institutionId: 'i1', body: `${CLEAN_BODY} See https://example.com for more.` });
    expect(oneLink.flags).toContain('Contains link');
    expect(oneLink.decision).not.toBe('REJECT');

    const twoLinks = await moderateReview({
      userId: 'u1',
      institutionId: 'i1',
      body: `${CLEAN_BODY} See https://example.com and https://spam.example.net now.`,
    });
    expect(twoLinks.flags).toContain('Spam pattern');
    expect(twoLinks.decision).toBe('REJECT');
  });

  it('rejects a review containing a threat', async () => {
    const body = `${CLEAN_BODY} I will hunt you down if this is published.`;
    const result = await moderateReview({ userId: 'u1', institutionId: 'i1', body });
    expect(result.flags).toContain('Threat / harassment');
    expect(result.decision).toBe('REJECT');
  });

  it('flags (never auto-rejects) an unsupported allegation, protecting legitimate criticism', async () => {
    const body = `${CLEAN_BODY} Honestly this place feels like a total scam sometimes.`;
    const result = await moderateReview({ userId: 'u1', institutionId: 'i1', body });
    expect(result.flags).toContain('Unsupported allegation');
    expect(result.decision).not.toBe('REJECT');
  });

  it('flags for moderator review once combined risk crosses the threshold', async () => {
    // Abusive language (30) alone crosses the FLAG threshold (30) without
    // triggering any hard-reject condition.
    const body = `${CLEAN_BODY} This place is honestly such shit.`;
    const result = await moderateReview({ userId: 'u1', institutionId: 'i1', body });
    expect(result.flags).toContain('Abusive language');
    expect(result.decision).toBe('FLAG');
  });

  it('flags rapid submission when the user has posted 3+ reviews in the last 10 minutes', async () => {
    mockedPrisma.review.count.mockResolvedValue(3);
    const result = await moderateReview({ userId: 'u1', institutionId: 'i1', body: CLEAN_BODY });
    expect(result.flags).toContain('Rapid submission');
    expect(result.decision).toBe('FLAG');
  });

  it('flags near-duplicate content against a recent review', async () => {
    mockedPrisma.review.findMany.mockResolvedValue([{ body: CLEAN_BODY }] as never);
    const result = await moderateReview({ userId: 'u1', institutionId: 'i1', body: CLEAN_BODY });
    expect(result.flags).toContain('Duplicate content');
    expect(result.decision).toBe('FLAG');
  });

  it('does not flag two reviews that merely share common words', async () => {
    mockedPrisma.review.findMany.mockResolvedValue([
      { body: 'The hostel food was disappointing but the library hours were generous and staff were kind.' },
    ] as never);
    const result = await moderateReview({ userId: 'u1', institutionId: 'i1', body: CLEAN_BODY });
    expect(result.flags).not.toContain('Duplicate content');
  });

  it('caps riskScore at 100 even when many signals stack', async () => {
    mockedPrisma.review.count.mockResolvedValue(5);
    mockedPrisma.review.findMany.mockResolvedValue([{ body: CLEAN_BODY }] as never);
    const body = `hi you scam fraud shit ${'A'.repeat(30)}`;
    const result = await moderateReview({ userId: 'u1', institutionId: 'i1', body });
    expect(result.riskScore).toBeLessThanOrEqual(100);
  });
});
