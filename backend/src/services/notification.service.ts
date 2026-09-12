import { prisma } from '../config/prisma.js';
import type { NotificationType } from '@prisma/client';

// Which per-user preference column gates each notification type. Toggling a
// preference off in Settings → Notifications actually stops these rows from
// being written, not just from being displayed.
const PREFERENCE_FIELD: Record<NotificationType, 'notifyReviewActivity' | 'notifyCommunityActivity' | 'notifySubmissionUpdates' | 'notifySystem'> = {
  REVIEW_APPROVED: 'notifyReviewActivity',
  REVIEW_REJECTED: 'notifyReviewActivity',
  REVIEW_REPORTED: 'notifyReviewActivity',
  ORG_RESPONSE: 'notifyCommunityActivity',
  QUESTION_ANSWERED: 'notifyCommunityActivity',
  ANSWER_UPVOTED: 'notifyCommunityActivity',
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
