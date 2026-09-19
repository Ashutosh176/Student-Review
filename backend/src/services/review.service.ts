import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { moderateReview } from '../modules/moderation/moderation.service.js';
import { classifySentiment, extractTopics } from '../modules/moderation/sentiment.service.js';
import { notify, notifySavedCollegeReviewers } from './notification.service.js';
import { getPlatformSettings } from './settings.service.js';
import { isVerified } from './verification.service.js';
import { MIN_COHORT_FOR_BATCH_YEAR, publicReviewWhere } from '../utils/publishing.js';
import type { AdmissionOutcome, RatingCategory, ReviewStatus, ReviewType } from '@prisma/client';

export interface CreateReviewInput {
  institutionId: string;
  courseId?: string;
  type?: ReviewType;
  relationship?: 'CURRENT_STUDENT' | 'ALUMNI' | 'FORMER_STUDENT';
  admissionOutcome?: AdmissionOutcome;
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

  const type = input.type ?? 'EXPERIENCE';

  // ADMISSION_PROCESS reviews are deliberately NOT gated by StudentVerification
  // — a rejected/waitlisted applicant structurally cannot pass a college-email
  // or ID check, since they never enrolled. They're labeled "Anonymous
  // Applicant" (serializers.ts publicReviewAuthor), never "Verified Student",
  // so this never blurs the verified-review trust story for EXPERIENCE
  // reviews, which keep the exact same gate as before.
  let verifiedStudent = false;
  if (type === 'EXPERIENCE') {
    if (!(await isVerified(userId, input.institutionId))) {
      throw AppError.forbidden('You need a verified university email or an approved document for this institution before you can submit a review.');
    }
    verifiedStudent = true;
  }

  // One live review per person per college per type. Editing (PATCH) is the
  // way to change it; a removed/rejected review doesn't block a fresh one.
  const existing = await prisma.review.findFirst({
    where: { userId, institutionId: input.institutionId, type, status: { in: ['PENDING', 'APPROVED', 'FLAGGED'] } },
    select: { id: true },
  });
  if (existing) throw AppError.conflict('You have already reviewed this college — edit your existing review instead.');

  const sentiment = classifySentiment(input.body);
  const topics = extractTopics(input.body);

  const review = await prisma.review.create({
    data: {
      userId,
      institutionId: input.institutionId,
      courseId: input.courseId,
      type,
      relationship: type === 'ADMISSION_PROCESS' ? 'APPLICANT' : input.relationship!,
      admissionOutcome: type === 'ADMISSION_PROCESS' ? input.admissionOutcome : null,
      batchYear: input.batchYear,
      title: input.title,
      body: input.body,
      recommend: input.recommend,
      verifiedStudent,
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
      ? 'Your review was approved and will be published shortly'
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
  params: { sort: 'recent' | 'helpful' | 'highest' | 'lowest'; verifiedOnly?: boolean; type?: ReviewType; page: number; pageSize: number },
) {
  const where: Record<string, unknown> = { institutionId, ...publicReviewWhere(), type: params.type ?? 'EXPERIENCE' };
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
  if (!review || review.status !== 'APPROVED') throw AppError.notFound('Review not found');

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
  const target = await prisma.review.findUnique({ where: { id: reviewId }, select: { status: true } });
  if (!target || target.status !== 'APPROVED') throw AppError.notFound('Review not found');
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
  if (!review || review.status !== 'APPROVED') throw AppError.notFound('Review not found');
  if (review.response) throw AppError.conflict('This review already has an official response');

  const response = await prisma.reviewResponse.create({ data: { reviewId, organizationMemberId, body } });
  await notify(review.userId, 'ORG_RESPONSE', 'The institution responded to your review', undefined, `/college/${review.institutionId}/reviews`);
  return response;
}

export async function listLatestReviews(limit = 6) {
  // type: 'EXPERIENCE' — the homepage feed's "verified reviews" framing
  // doesn't fit ADMISSION_PROCESS reviews, which are never verified by
  // design; those live on a college's own Reviews tab instead.
  return prisma.review.findMany({
    where: { ...publicReviewWhere(), type: 'EXPERIENCE' },
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

// Institutions with enough public reviews that cohort fields (batch year)
// can be shown without singling anyone out.
export async function institutionsWithRevealedCohort(institutionIds: string[]): Promise<Set<string>> {
  if (institutionIds.length === 0) return new Set();
  const grouped = await prisma.review.groupBy({
    by: ['institutionId'],
    where: { institutionId: { in: institutionIds }, ...publicReviewWhere() },
    _count: { _all: true },
  });
  return new Set(grouped.filter((g) => g._count._all >= MIN_COHORT_FOR_BATCH_YEAR).map((g) => g.institutionId));
}
