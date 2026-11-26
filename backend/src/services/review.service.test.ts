import { beforeEach, describe, expect, it, vi } from 'vitest';
// vi.mock calls below are hoisted above this import by vitest.
import { createReview, releaseReviewsAwaitingVerification } from './review.service.js';

// "Write first, verify to publish": an unverified student's EXPERIENCE review
// is held (never moderated or published) until they verify at that college.

const db = vi.hoisted(() => ({
  institution: { findUnique: vi.fn(), findUniqueOrThrow: vi.fn() },
  review: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), findUniqueOrThrow: vi.fn(), findMany: vi.fn() },
  auditLog: { create: vi.fn() },
}));
const moderateReview = vi.hoisted(() => vi.fn());
const isVerified = vi.hoisted(() => vi.fn());

vi.mock('../config/prisma.js', () => ({ prisma: db }));
vi.mock('../modules/moderation/moderation.service.js', () => ({ moderateReview }));
vi.mock('../modules/moderation/sentiment.service.js', () => ({ classifySentiment: () => 'POSITIVE', extractTopics: () => [] }));
vi.mock('./notification.service.js', () => ({ notify: vi.fn(), notifyWithEmail: vi.fn(), notifySavedCollegeReviewers: vi.fn() }));
vi.mock('./settings.service.js', () => ({ getPlatformSettings: async () => ({ rapidSubmissionWindowMinutes: 10, rapidSubmissionCount: 3 }) }));
vi.mock('./verification.service.js', () => ({ isVerified }));


const college = { id: 'inst-1', name: 'Test College', slug: 'test-college', status: 'APPROVED' };
const input = {
  institutionId: 'inst-1',
  type: 'EXPERIENCE' as const,
  relationship: 'CURRENT_STUDENT' as const,
  batchYear: 2025,
  body: 'x'.repeat(150),
  recommend: true,
  ratings: [{ category: 'OVERALL' as const, value: 4 }],
};

beforeEach(() => {
  vi.clearAllMocks();
  db.institution.findUnique.mockResolvedValue(college);
  db.institution.findUniqueOrThrow.mockResolvedValue(college);
  db.review.findFirst.mockResolvedValue(null);
  db.review.create.mockImplementation(async ({ data }) => ({ id: 'rev-1', ...data }));
  db.review.update.mockImplementation(async ({ data }) => ({ id: 'rev-1', ...data }));
  db.review.findUniqueOrThrow.mockResolvedValue({ id: 'rev-1', userId: 'user-1', institutionId: 'inst-1', body: input.body });
  moderateReview.mockResolvedValue({ decision: 'APPROVE', riskScore: 0, notes: null, flags: [] });
});

describe('createReview', () => {
  it('holds an unverified student\'s experience review without moderating it', async () => {
    isVerified.mockResolvedValue(false);
    await createReview('user-1', input);
    expect(db.review.create.mock.calls[0][0].data).toMatchObject({ verifiedStudent: false, awaitingVerification: true, status: 'PENDING' });
    expect(moderateReview).not.toHaveBeenCalled();
    expect(db.review.update).not.toHaveBeenCalled();
  });

  it('moderates a verified student\'s review straight away', async () => {
    isVerified.mockResolvedValue(true);
    const result = await createReview('user-1', input);
    expect(db.review.create.mock.calls[0][0].data).toMatchObject({ verifiedStudent: true, awaitingVerification: false });
    expect(moderateReview).toHaveBeenCalledOnce();
    expect(result).toMatchObject({ status: 'APPROVED' });
  });

  it('never holds admission-process reviews, which need no verification', async () => {
    await createReview('user-1', { ...input, type: 'ADMISSION_PROCESS', admissionOutcome: 'ADMITTED' });
    expect(isVerified).not.toHaveBeenCalled();
    expect(db.review.create.mock.calls[0][0].data).toMatchObject({ awaitingVerification: false });
    expect(moderateReview).toHaveBeenCalledOnce();
  });
});

describe('releaseReviewsAwaitingVerification', () => {
  it('marks held reviews verified and sends them through moderation', async () => {
    db.review.findMany.mockResolvedValue([{ id: 'rev-1' }]);
    const released = await releaseReviewsAwaitingVerification('user-1', 'inst-1');
    expect(released).toBe(1);
    expect(db.review.findMany.mock.calls[0][0].where).toEqual({ userId: 'user-1', institutionId: 'inst-1', awaitingVerification: true });
    expect(db.review.update.mock.calls[0][0]).toMatchObject({ where: { id: 'rev-1' }, data: { awaitingVerification: false, verifiedStudent: true } });
    expect(moderateReview).toHaveBeenCalledOnce();
  });

  it('does nothing when there is nothing held', async () => {
    db.review.findMany.mockResolvedValue([]);
    expect(await releaseReviewsAwaitingVerification('user-1', 'inst-1')).toBe(0);
    expect(moderateReview).not.toHaveBeenCalled();
  });
});
