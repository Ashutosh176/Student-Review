import { describe, expect, it } from 'vitest';
import {
  coarsenDate,
  serializePublicAnswer,
  serializePublicInstitution,
  serializePublicQuestion,
  serializePublicReview,
  stripIdentity,
} from './serializers.js';

const USER_ID = 'user-secret-id-123';
const at = new Date('2026-03-04T14:32:11.123Z');

const reviewRow = {
  id: 'r1', userId: USER_ID, institutionId: 'i1', courseId: 'course-1', type: 'EXPERIENCE', relationship: 'ALUMNI',
  admissionOutcome: null, batchYear: 2024, title: 't', body: 'b', recommend: true, status: 'APPROVED',
  verifiedStudent: true, sentiment: 'POSITIVE', sentimentTopics: [], helpfulCount: 0, riskScore: 0, moderationNotes: 'x',
  createdAt: at, editedAt: at, ratings: [],
} as never;

describe('anonymity boundary', () => {
  it('never leaks author id, course, moderation data or exact time in a public review', () => {
    const json = JSON.stringify(serializePublicReview(reviewRow));
    for (const bad of [USER_ID, 'course-1', 'moderationNotes', 'riskScore', '14:32']) expect(json).not.toContain(bad);
  });

  it('withholds batch year for small cohorts and shows it for large ones', () => {
    expect(serializePublicReview(reviewRow, false).batchYear).toBeNull();
    expect(serializePublicReview(reviewRow, true).batchYear).toBe(2024);
  });

  it('never leaks the author id in answers or questions', () => {
    const a = serializePublicAnswer({ id: 'a', questionId: 'q', userId: USER_ID, body: 'b', status: 'APPROVED', verifiedStudent: false, upvoteCount: 0, createdAt: at } as never);
    const q = serializePublicQuestion({ id: 'q', institutionId: 'i', userId: USER_ID, title: 't', body: 'b', status: 'APPROVED', createdAt: at } as never);
    expect(JSON.stringify(a)).not.toContain(USER_ID);
    expect(JSON.stringify(q)).not.toContain(USER_ID);
  });

  it('strips the submitter and org contact email from public institutions', () => {
    const out = serializePublicInstitution({
      id: 'i', name: 'X', submittedByUserId: USER_ID, submittedBy: { username: 'u' }, rejectionReason: 'r',
      organizationProfile: { id: 'o', plan: 'FREE', contactEmail: 'dean@college.edu' },
    });
    const json = JSON.stringify(out);
    for (const bad of [USER_ID, 'submittedBy', 'rejectionReason', 'dean@college.edu']) expect(json).not.toContain(bad);
    expect(out.name).toBe('X');
  });

  it('strips author and reporter ids from admin rows', () => {
    const out = stripIdentity({ id: 'x', userId: USER_ID, reporterUserId: USER_ID, body: 'b' });
    expect(out).toEqual({ id: 'x', body: 'b' });
  });

  it('truncates timestamps to the day', () => {
    expect(coarsenDate(at)?.toISOString()).toBe('2026-03-04T00:00:00.000Z');
  });
});
