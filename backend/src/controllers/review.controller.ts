import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { serializePublicReview } from '../utils/serializers.js';
import { AppError } from '../utils/AppError.js';
import { prisma } from '../config/prisma.js';
import * as reviewService from '../services/review.service.js';

export const create = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(req.user!.id, req.body);
  ok(res, serializePublicReview(review), 201);
});

export const update = asyncHandler(async (req, res) => {
  const review = await reviewService.updateOwnReview(req.user!.id, req.params.id, req.body);
  ok(res, serializePublicReview(review));
});

export const remove = asyncHandler(async (req, res) => {
  await reviewService.deleteOwnReview(req.user!.id, req.params.id);
  ok(res, { deleted: true });
});

export const report = asyncHandler(async (req, res) => {
  const result = await reviewService.reportReview(req.params.id, req.user!.id, req.body.reason, req.body.details);
  ok(res, { id: result.id, status: result.status }, 201);
});

export const vote = asyncHandler(async (req, res) => {
  const result = await reviewService.toggleHelpfulVote(req.params.id, req.user!.id);
  ok(res, result);
});

export const respond = asyncHandler(async (req, res) => {
  const membership = await prisma.organizationMember.findFirst({
    where: { userId: req.user!.id, status: 'ACTIVE' },
  });
  if (!membership) throw AppError.forbidden('You are not an active member of a verified organization');

  const review = await prisma.review.findUnique({ where: { id: req.params.id } });
  if (!review) throw AppError.notFound('Review not found');

  const org = await prisma.organizationProfile.findUnique({ where: { id: membership.organizationProfileId } });
  if (!org || org.institutionId !== review.institutionId) {
    throw AppError.forbidden('You can only respond to reviews of your own institution');
  }

  const response = await reviewService.respondToReview(req.params.id, membership.id, req.body.body);
  ok(res, response, 201);
});

export const latest = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 6, 20);
  const reviews = await reviewService.listLatestReviews(limit);
  const revealed = await reviewService.institutionsWithRevealedCohort([...new Set(reviews.map((r) => r.institutionId))]);
  ok(
    res,
    reviews.map((r) => ({ ...serializePublicReview(r, revealed.has(r.institutionId)), institution: { name: r.institution.name, slug: r.institution.slug } })),
  );
});

export const myReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewService.listOwnReviews(req.user!.id);
  ok(res, reviews);
});
