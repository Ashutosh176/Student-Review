import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { sendEmail } from './email.service.js';
import { noticeEmail } from './emailTemplates.js';
import type { NotificationType } from '@prisma/client';

// Which per-user preference column gates each notification type. Toggling a
// preference off in Settings → Notifications actually stops these rows from
// being written, not just from being displayed.
const PREFERENCE_FIELD: Record<NotificationType, 'notifyReviewActivity' | 'notifyCommunityActivity' | 'notifySubmissionUpdates' | 'notifySystem'> = {
  REVIEW_APPROVED: 'notifyReviewActivity',
  REVIEW_REJECTED: 'notifyReviewActivity',
  REVIEW_REPORTED: 'notifyReviewActivity',
  SAVED_COLLEGE_REVIEW: 'notifyReviewActivity',
  ORG_RESPONSE: 'notifyCommunityActivity',
  QUESTION_ANSWERED: 'notifyCommunityActivity',
  ANSWER_UPVOTED: 'notifyCommunityActivity',
  QUESTION_REPORTED: 'notifyCommunityActivity',
  ANSWER_REPORTED: 'notifyCommunityActivity',
  CLAIM_APPROVED: 'notifySubmissionUpdates',
  CLAIM_REJECTED: 'notifySubmissionUpdates',
  INSTITUTION_APPROVED: 'notifySubmissionUpdates',
  INSTITUTION_REJECTED: 'notifySubmissionUpdates',
  VERIFICATION_APPROVED: 'notifySubmissionUpdates',
  VERIFICATION_REJECTED: 'notifySubmissionUpdates',
  VERIFICATION_REVOKED: 'notifySubmissionUpdates',
  SYSTEM: 'notifySystem',
};

export async function notify(userId: string, type: NotificationType, title: string, body?: string, link?: string) {
  const prefs = await prisma.user.findUnique({
    where: { id: userId },
    select: { notifyReviewActivity: true, notifyCommunityActivity: true, notifySubmissionUpdates: true, notifySystem: true },
  });
  if (!prefs || prefs[PREFERENCE_FIELD[type]] === false) return null;
  return prisma.notification.create({ data: { userId, type, title, body, link } });
}

// notify() + an email for status changes the user is actively waiting on
// (document verified, college approved, review approved / needs
// clarification). Same preference gate as notify(): no in-app row, no email.
// `link` is a site path; the email CTA points at the absolute URL.
export async function notifyWithEmail(input: {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  email: { paragraphs: string[]; ctaLabel?: string };
}) {
  const created = await notify(input.userId, input.type, input.title, input.body, input.link);
  if (!created) return null;

  const user = await prisma.user.findUnique({ where: { id: input.userId }, select: { email: true, username: true } });
  if (!user) return created;

  const ctaUrl = input.link ? `${env.clientOrigin}${input.link}` : undefined;
  const { html, text } = noticeEmail({
    heading: input.title,
    paragraphs: [`Hi ${user.username},`, ...input.email.paragraphs],
    ctaLabel: input.email.ctaLabel,
    ctaUrl,
  });
  try {
    await sendEmail({
      to: user.email,
      subject: input.title,
      text,
      html,
      template: { key: 'notice', variables: { HEADING: input.title, MESSAGE: input.email.paragraphs.join('\n\n'), LINK: ctaUrl ?? env.clientOrigin } },
    });
  } catch (err) {
    // The status change itself already happened — a mail failure must not
    // turn the admin's approve/reject into an error.
    logger.warn({ err, userId: input.userId, type: input.type }, 'Failed to send notification email');
  }
  return created;
}

export async function listNotifications(userId: string, page = 1, pageSize = 20) {
  const [total, items] = await Promise.all([
    prisma.notification.count({ where: { userId } }),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  return { total, page, pageSize, items };
}

export async function markRead(userId: string, id: string) {
  return prisma.notification.updateMany({ where: { id, userId }, data: { isRead: true } });
}

export async function markAllRead(userId: string) {
  return prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
}

// Fires once a review actually becomes publicly visible (auto-approved on
// submission, or approved later out of the moderation queue) — never for
// PENDING/FLAGGED, so a saver is never alerted to a review nobody else can
// see yet. Unlike every other notify() call site, this one also emails,
// since "a review appeared while I wasn't looking" is exactly what a saved
// college is for — an in-app-only badge would go unseen for weeks.
export async function notifySavedCollegeReviewers(institutionId: string, institutionName: string, institutionSlug: string, reviewAuthorUserId: string) {
  const savers = await prisma.savedInstitution.findMany({
    where: { institutionId, userId: { not: reviewAuthorUserId } },
    select: { user: { select: { id: true, email: true } } },
  });
  if (savers.length === 0) return;

  const link = `/college/${institutionSlug}/reviews`;
  await Promise.all(
    savers.map(async ({ user }) => {
      const created = await notify(user.id, 'SAVED_COLLEGE_REVIEW', `New review posted for ${institutionName}`, undefined, link);
      if (!created) return; // notifyReviewActivity is off for this user

      try {
        await sendEmail({
          to: user.email,
          subject: `New review posted for ${institutionName}`,
          text: `A new review was just published for ${institutionName}, a college you saved.\n\nRead it: ${env.clientOrigin}${link}\n\nYou're getting this because you saved this college — turn it off anytime in Settings → Notifications.`,
          template: { key: 'savedCollegeReview', variables: { INSTITUTION: institutionName, LINK: `${env.clientOrigin}${link}` } },
        });
      } catch (err) {
        // One bad email (or an unset MSG91 template) must never break review
        // submission/moderation for everyone else in this batch.
        logger.warn({ err, userId: user.id, institutionId }, 'Failed to send saved-college review email');
      }
    }),
  );
}
