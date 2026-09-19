import { env } from '../config/env.js';

// Publication batching (anonymity). An approved review is NOT visible the
// instant it is submitted: it becomes public at the next batch boundary
// (default every 12h, UTC-aligned), so "a review appeared at 14:32" can't be
// matched to who was on campus wifi at 14:32. Every public read — lists,
// counts, averages, org analytics — must use this same cutoff, otherwise a
// count/average that moves early would leak the same timing.
export function publicCutoff(now: Date = new Date()): Date {
  const batchMs = env.reviewPublishBatchHours * 60 * 60 * 1000;
  if (batchMs <= 0) return new Date(now.getTime() + 1);
  return new Date(Math.floor(now.getTime() / batchMs) * batchMs);
}

/** Prisma `where` fragment for "publicly visible review". */
export function publicReviewWhere(now?: Date) {
  return { status: 'APPROVED' as const, createdAt: { lt: publicCutoff(now) } };
}

// Below this many reviews in a bucket we don't publish per-bucket figures
// (monthly averages, topic splits, cohort fields): a bucket of one or two is
// effectively an individual's rating/answers.
export const MIN_BUCKET_SIZE = 3;
export const MIN_COHORT_FOR_BATCH_YEAR = 10;
