// Anonymous-identity boundary (spec §24). Every function here defines what is
// safe to send to a public API response. Controllers must serialize through
// these helpers instead of returning raw Prisma rows for review/question/answer
// authorship — this is the single place that decides what "anonymous" means.
import type { Review, ReviewRating, ReviewReport, ReviewResponse, User, Answer } from '@prisma/client';

export function publicReviewAuthor(_user: Pick<User, 'id'>, verifiedStudent: boolean) {
  return {
    // Never expose username/email/id here. A stable-but-opaque per-review
    // handle is unnecessary for MVP; "Anonymous Student" / "Verified Student"
    // is the entire identity surface shown publicly, per spec.
    label: verifiedStudent ? 'Verified Student' : 'Anonymous Student',
    verified: verifiedStudent,
  };
}

type ReviewWithRelations = Review & {
  ratings?: ReviewRating[];
  response?: (ReviewResponse & { organizationMember?: { organizationProfile?: { institution?: { name: string } } } }) | null;
  _count?: { votes?: number; reports?: number };
};

export function serializePublicReview(review: ReviewWithRelations) {
  return {
    id: review.id,
    institutionId: review.institutionId,
    courseId: review.courseId,
    relationship: review.relationship,
    batchYear: review.batchYear,
    title: review.title,
    body: review.status === 'FLAGGED' ? undefined : review.body,
    recommend: review.recommend,
    status: review.status,
    author: publicReviewAuthor({ id: review.userId }, review.verifiedStudent),
    ratings: review.ratings?.map((r) => ({ category: r.category, value: r.value })) ?? [],
    sentiment: review.sentiment,
    helpfulCount: review.helpfulCount,
    officialResponse: review.response
      ? { body: review.response.body, createdAt: review.response.createdAt }
      : null,
    createdAt: review.createdAt,
    editedAt: review.editedAt,
  };
}

export function serializePublicAnswer(answer: Answer) {
  return {
    id: answer.id,
    questionId: answer.questionId,
    body: answer.body,
    author: publicReviewAuthor({ id: answer.userId }, answer.verifiedStudent),
    upvoteCount: answer.upvoteCount,
    createdAt: answer.createdAt,
  };
}

// Safe subset of a user's own account for /me-style endpoints. Still excludes
// passwordHash and any verification evidence.
export function serializeSelfUser(user: User & { roles?: { role: { name: string } }[] }) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    status: user.status,
    emailVerified: Boolean(user.emailVerifiedAt),
    publicProfileOptIn: user.publicProfileOptIn,
    notifyReviewActivity: user.notifyReviewActivity,
    notifyCommunityActivity: user.notifyCommunityActivity,
    notifySubmissionUpdates: user.notifySubmissionUpdates,
    notifySystem: user.notifySystem,
    roles: user.roles?.map((r) => r.role.name) ?? [],
    createdAt: user.createdAt,
  };
}

export function serializeReportForAdmin(report: ReviewReport) {
  return {
    id: report.id,
    reviewId: report.reviewId,
    reason: report.reason,
    details: report.details,
    status: report.status,
    createdAt: report.createdAt,
    // reporterUserId intentionally omitted from admin list views; resolved
    // only in the single-report detail endpoint that requires MODERATOR+.
  };
}
