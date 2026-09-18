import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { moderateReview } from '../modules/moderation/moderation.service.js';
import { classifySentiment, extractTopics } from '../modules/moderation/sentiment.service.js';
import { notify, notifySavedCollegeReviewers } from './notification.service.js';
import { getPlatformSettings } from './settings.service.js';
import { isVerified } from './verification.service.js';
import type { RatingCategory, ReviewStatus } from '@prisma/client';

export interface CreateReviewInput {
  institutionId: string;
  courseId?: string;
  relationship: 'CURRENT_STUDENT' | 'ALUMNI' | 'FORMER_STUDENT';
  batchYear: number;
  title?: string;
  body: string;
  recommend: boolean;
  ratings: { category: RatingCategory; value: number }[];
}

export async function createReview(userId: string, input: CreateReviewInput) {
  const institution = await prisma.institution.findUnique({ where: { id: input.institutionId } });
  if (!institution) throw AppError.notFound('Institution not found');
  if (institution.status !== 'APPROVED') throw AppError.badRequest('This college is awaiting admin approval and cannot be reviewed yet');

  if (!(await isVerified(userId, input.institutionId))) {
    throw AppError.forbidden('You need a verified university email or an approved document for this institution before you can submit a review.');
  }

  const sentiment = classifySentiment(input.body);
  const topics = extractTopics(input.body);

  const review = await prisma.review.create({
    data: {
      userId,
      institutionId: input.institutionId,
      courseId: input.courseId,
      relationship: input.relationship,
      batchYear: input.batchYear,
      title: input.title,
      body: input.body,
      recommend: input.recommend,
      verifiedStudent: true,
      status: 'PENDING',
      sentiment,
      sentimentTopics: topics,
      ratings: { create: input.ratings.map((r) => ({ category: r.category, value: r.value })) },
    },
    include: { ratings: true },
  });

  const settings = await getPlatformSettings();
  const moderation = await moderateReview(
    { userId, institutionId: input.institutionId, body: input.body },
    { rapidSubmissionWindowMinutes: settings.rapidSubmissionWindowMinutes, rapidSubmissionCount: settings.rapidSubmissionCount },
  );
  const status: ReviewStatus = moderation.decision === 'APPROVE' ? 'APPROVED' : moderation.decision === 'FLAG' ? 'FLAGGED' : 'REJECTED';

  const updated = await prisma.review.update({
    where: { id: review.id },
    data: { status, riskScore: moderation.riskScore, moderationNotes: moderation.notes },
    include: { ratings: true },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: userId,
      action: 'REVIEW_MODERATED',
      entityType: 'Review',
      entityId: review.id,
      metadata: { decision: moderation.decision, flags: moderation.flags, riskScore: moderation.riskScore },
    },
  });

  await notify(
    userId,
    status === 'APPROVED' ? 'REVIEW_APPROVED' : status === 'REJECTED' ? 'REVIEW_REJECTED' : 'SYSTEM',
    status === 'APPROVED'
      ? 'Your review was approved and is now live'
      : status === 'REJECTED'
        ? 'Your review could not be published'
        : 'Your review is under moderation review',
    status === 'REJECTED' ? moderation.notes : undefined,
    `/college/${institution.slug}/reviews`,
  );

  if (status === 'APPROVED') {
    await notifySavedCollegeReviewers(institution.id, institution.name, institution.slug, userId);
  }

  return updated;
}

export async function getReviewById(id: string) {
  const review = await prisma.review.findUnique({
    where: { id },
    include: { ratings: true, response: true },
  });
  if (!review) throw AppError.notFound('Review not found');
  return review;
}

export async function listInstitutionReviews(
  institutionId: string,
  params: { sort: 'recent' | 'helpful' | 'highest' | 'lowest'; verifiedOnly?: boolean; page: number; pageSize: number },
) {
  const where: Record<string, unknown> = { institutionId, status: 'APPROVED' };
  if (params.verifiedOnly) where.verifiedStudent = true;

  let orderBy: Record<string, unknown> = { createdAt: 'desc' };
  if (params.sort === 'helpful') orderBy = { helpfulCount: 'desc' };

  const [total, rows] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      orderBy,
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      include: { ratings: true, response: true },
    }),
  ]);

  let items = rows;
  if (params.sort === 'highest' || params.sort === 'lowest') {
    const overallOf = (r: (typeof rows)[number]) => r.ratings.find((x) => x.category === 'OVERALL')?.value ?? 0;
    items = [...rows].sort((a, b) => (params.sort === 'highest' ? overallOf(b) - overallOf(a) : overallOf(a) - overallOf(b)));
  }

  return { total, page: params.page, pageSize: params.pageSize, items };
}

export async function updateOwnReview(
  userId: string,
  reviewId: string,
  input: { title?: string; body?: string; recommend?: boolean; ratings?: { category: RatingCategory; value: number }[] },
) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw AppError.notFound('Review not found');
  if (review.userId !== userId) throw AppError.forbidden('You can only edit your own review');

  const data: Record<string, unknown> = { editedAt: new Date() };
  if (input.title !== undefined) data.title = input.title;
  if (input.recommend !== undefined) data.recommend = input.recommend;
  if (input.body !== undefined) {
    data.body = input.body;
    data.sentiment = classifySentiment(input.body);
    data.sentimentTopics = extractTopics(input.body);
    data.status = 'PENDING'; // edited content is re-moderated before it re-publishes
  }

  const updated = await prisma.review.update({ where: { id: reviewId }, data });

  if (input.ratings) {
    await prisma.$transaction(
      input.ratings.map((r) =>
        prisma.reviewRating.upsert({
          where: { reviewId_category: { reviewId, category: r.category } },
          create: { reviewId, category: r.category, value: r.value },
          update: { value: r.value },
        }),
      ),
    );
  }

  if (input.body !== undefined) {
    const moderation = await moderateReview({ userId, institutionId: review.institutionId, body: input.body });
    const status: ReviewStatus =
      moderation.decision === 'APPROVE' ? 'APPROVED' : moderation.decision === 'FLAG' ? 'FLAGGED' : 'REJECTED';
    await prisma.review.update({ where: { id: reviewId }, data: { status, riskScore: moderation.riskScore } });
  }

  return updated;
}

export async function deleteOwnReview(userId: string, reviewId: string) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw AppError.notFound('Review not found');
  if (review.userId !== userId) throw AppError.forbidden('You can only delete your own review');
  await prisma.review.delete({ where: { id: reviewId } });
  await prisma.auditLog.create({
    data: { actorUserId: userId, action: 'REVIEW_DELETED_BY_OWNER', entityType: 'Review', entityId: reviewId },
  });
}

export async function reportReview(reviewId: string, reporterUserId: string, reason: string, details?: string) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw AppError.notFound('Review not found');

  const report = await prisma.reviewReport.create({
    data: { reviewId, reporterUserId, reason: reason as never, details },
  });

  const openReportCount = await prisma.reviewReport.count({ where: { reviewId, status: { in: ['OPEN', 'INVESTIGATING'] } } });
  const settings = await getPlatformSettings();
  if (openReportCount >= settings.reportAutoFlagThreshold && review.status === 'APPROVED') {
    await prisma.review.update({ where: { id: reviewId }, data: { status: 'FLAGGED' } });
  }

  await notify(review.userId, 'REVIEW_REPORTED', 'Your review has been reported and is under review', undefined, undefined);
  return report;
}

export async function toggleHelpfulVote(reviewId: string, userId: string) {
  const existing = await prisma.reviewVote.findUnique({ where: { reviewId_userId: { reviewId, userId } } });
  if (existing) {
    await prisma.$transaction([
      prisma.reviewVote.delete({ where: { id: existing.id } }),
      prisma.review.update({ where: { id: reviewId }, data: { helpfulCount: { decrement: 1 } } }),
    ]);
    return { voted: false };
  }
  await prisma.$transaction([
    prisma.reviewVote.create({ data: { reviewId, userId } }),
    prisma.review.update({ where: { id: reviewId }, data: { helpfulCount: { increment: 1 } } }),
  ]);
  return { voted: true };
}

export async function respondToReview(reviewId: string, organizationMemberId: string, body: string) {
  const review = await prisma.review.findUnique({ where: { id: reviewId }, include: { response: true } });
  if (!review) throw AppError.notFound('Review not found');
  if (review.response) throw AppError.conflict('This review already has an official response');

  const response = await prisma.reviewResponse.create({ data: { reviewId, organizationMemberId, body } });
  await notify(review.userId, 'ORG_RESPONSE', 'The institution responded to your review', undefined, `/college/${review.institutionId}/reviews`);
  return response;
}

export async function listLatestReviews(limit = 6) {
  return prisma.review.findMany({
    where: { status: 'APPROVED' },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { ratings: true, response: true, institution: { select: { name: true, slug: true } } },
  });
}

export async function listOwnReviews(userId: string) {
  return prisma.review.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { ratings: true, institution: { select: { name: true, slug: true } } },
  });
}
