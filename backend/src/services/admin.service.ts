import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { toSlug } from '../utils/slug.js';
import { notify, notifySavedCollegeReviewers } from './notification.service.js';
import { getOrCreateRole } from './role.util.js';
import { getPlatformSettings, updatePlatformSettings, type PlatformSettingsInput } from './settings.service.js';
import type { AdminActionType, InstitutionType, ReviewStatus, RoleName } from '@prisma/client';

export async function dashboardStats() {
  const [totalUsers, totalReviews, pendingModeration, pendingInstitutions, reportsLast24h, topInstitutions] = await Promise.all([
    prisma.user.count(),
    prisma.review.count(),
    prisma.review.count({ where: { status: { in: ['PENDING', 'FLAGGED'] } } }),
    prisma.institution.count({ where: { status: 'PENDING' } }),
    prisma.reviewReport.count({ where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
    prisma.review.groupBy({ by: ['institutionId'], where: { status: 'APPROVED' }, _count: { _all: true }, orderBy: { _count: { institutionId: 'desc' } }, take: 5 }),
  ]);

  const institutions = await prisma.institution.findMany({
    where: { id: { in: topInstitutions.map((t) => t.institutionId) } },
    select: { id: true, name: true },
  });
  const nameOf = new Map(institutions.map((i) => [i.id, i.name]));

  return {
    totalUsers,
    totalReviews,
    pendingModeration,
    pendingInstitutions,
    reportsLast24h,
    topInstitutions: topInstitutions.map((t) => ({ name: nameOf.get(t.institutionId), reviews: t._count._all })),
  };
}

export async function platformAnalytics() {
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [dau, newUsers7d, approved7d, rejected7d] = await Promise.all([
    prisma.user.count({ where: { lastLoginAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
    prisma.user.count({ where: { createdAt: { gte: since7d } } }),
    prisma.review.count({ where: { status: 'APPROVED', createdAt: { gte: since7d } } }),
    prisma.review.count({ where: { status: 'REJECTED', createdAt: { gte: since7d } } }),
  ]);
  return { dailyActiveUsers: dau, newUsers7d, reviewsApproved7d: approved7d, reviewsRejected7d: rejected7d };
}

export async function listUsers(params: { q?: string; page: number; pageSize: number }) {
  const where = params.q
    ? { OR: [{ username: { contains: params.q, mode: 'insensitive' as const } }, { email: { contains: params.q, mode: 'insensitive' as const } }] }
    : {};
  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
        roles: { select: { role: { select: { name: true } } } },
        _count: { select: { reviews: true } },
      },
    }),
  ]);
  return { total, page: params.page, pageSize: params.pageSize, items };
}

export async function setUserStatus(adminUserId: string, targetUserId: string, status: 'ACTIVE' | 'SUSPENDED' | 'BANNED', reason?: string) {
  const user = await prisma.user.update({ where: { id: targetUserId }, data: { status } });
  const action: AdminActionType = status === 'BANNED' ? 'BAN' : status === 'SUSPENDED' ? 'SUSPEND' : 'APPROVE';
  await prisma.adminAction.create({ data: { adminUserId, targetType: 'User', targetId: targetUserId, action, reason } });
  return user;
}

export async function moderationQueue(page = 1, pageSize = 20) {
  const where = { status: { in: ['PENDING', 'FLAGGED'] as ReviewStatus[] } };
  const [total, items] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      orderBy: [{ riskScore: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { institution: { select: { name: true, slug: true } }, _count: { select: { reports: true } } },
    }),
  ]);
  return { total, page, pageSize, items };
}

export async function moderateReviewAction(
  adminUserId: string,
  reviewId: string,
  action: 'APPROVE' | 'HIDE' | 'REMOVE' | 'REQUEST_CLARIFICATION',
  reason?: string,
) {
  const review = await prisma.review.findUnique({ where: { id: reviewId }, include: { institution: { select: { id: true, name: true, slug: true } } } });
  if (!review) throw AppError.notFound('Review not found');

  const statusMap: Record<typeof action, ReviewStatus> = {
    APPROVE: 'APPROVED',
    HIDE: 'FLAGGED',
    REMOVE: 'REMOVED',
    REQUEST_CLARIFICATION: 'PENDING',
  };
  const updated = await prisma.review.update({ where: { id: reviewId }, data: { status: statusMap[action], moderationNotes: reason } });

  await prisma.adminAction.create({
    data: { adminUserId, targetType: 'Review', targetId: reviewId, action: action as AdminActionType, reason },
  });

  await notify(
    review.userId,
    action === 'APPROVE' ? 'REVIEW_APPROVED' : 'REVIEW_REJECTED',
    action === 'APPROVE' ? 'Your review was approved' : 'Your review required moderator action',
    reason,
    undefined,
  );

  if (action === 'APPROVE' && review.status !== 'APPROVED') {
    await notifySavedCollegeReviewers(review.institution.id, review.institution.name, review.institution.slug, review.userId);
  }

  return updated;
}

export async function listReports(status?: string, page = 1, pageSize = 20) {
  const where = status ? { status: status as never } : {};
  const [total, items] = await Promise.all([
    prisma.reviewReport.count({ where }),
    prisma.reviewReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { review: { select: { id: true, body: true, institution: { select: { name: true } } } } },
    }),
  ]);
  return { total, page, pageSize, items };
}

export async function dismissReport(adminUserId: string, reportId: string) {
  const report = await prisma.reviewReport.update({ where: { id: reportId }, data: { status: 'DISMISSED', resolvedAt: new Date() } });
  await prisma.adminAction.create({ data: { adminUserId, targetType: 'ReviewReport', targetId: reportId, action: 'DISMISS' } });
  return report;
}

// Q&A reports have no separate moderation-queue page the way reviews do
// (AdminReviewsPage) — so unlike dismissReport above, moderateQuestionAction/
// moderateAnswerAction below let an admin act on the underlying content
// directly from the same reports row, not just dismiss the complaint.
export async function listQuestionReports(status?: string, page = 1, pageSize = 20) {
  const where = status ? { status: status as never } : {};
  const [total, items] = await Promise.all([
    prisma.questionReport.count({ where }),
    prisma.questionReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { question: { select: { id: true, title: true, status: true, institution: { select: { name: true } } } } },
    }),
  ]);
  return { total, page, pageSize, items };
}

export async function dismissQuestionReport(adminUserId: string, reportId: string) {
  const report = await prisma.questionReport.update({ where: { id: reportId }, data: { status: 'DISMISSED', resolvedAt: new Date() } });
  await prisma.adminAction.create({ data: { adminUserId, targetType: 'QuestionReport', targetId: reportId, action: 'DISMISS' } });
  return report;
}

export async function moderateQuestionAction(adminUserId: string, questionId: string, action: 'APPROVE' | 'REMOVE', reason?: string) {
  const updated = await prisma.question.update({
    where: { id: questionId },
    data: { status: action === 'APPROVE' ? 'APPROVED' : 'REMOVED' },
  });
  await prisma.adminAction.create({ data: { adminUserId, targetType: 'Question', targetId: questionId, action, reason } });
  return updated;
}

export async function listAnswerReports(status?: string, page = 1, pageSize = 20) {
  const where = status ? { status: status as never } : {};
  const [total, items] = await Promise.all([
    prisma.answerReport.count({ where }),
    prisma.answerReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { answer: { select: { id: true, body: true, status: true, question: { select: { title: true } } } } },
    }),
  ]);
  return { total, page, pageSize, items };
}

export async function dismissAnswerReport(adminUserId: string, reportId: string) {
  const report = await prisma.answerReport.update({ where: { id: reportId }, data: { status: 'DISMISSED', resolvedAt: new Date() } });
  await prisma.adminAction.create({ data: { adminUserId, targetType: 'AnswerReport', targetId: reportId, action: 'DISMISS' } });
  return report;
}

export async function moderateAnswerAction(adminUserId: string, answerId: string, action: 'APPROVE' | 'REMOVE', reason?: string) {
  const updated = await prisma.answer.update({
    where: { id: answerId },
    data: { status: action === 'APPROVE' ? 'APPROVED' : 'REMOVED' },
  });
  await prisma.adminAction.create({ data: { adminUserId, targetType: 'Answer', targetId: answerId, action, reason } });
  return updated;
}

export async function createInstitution(input: {
  name: string;
  type: InstitutionType;
  city: string;
  state: string;
  establishedYear?: number;
  website?: string;
  description?: string;
  categoryId?: string;
}) {
  const slug = toSlug(input.name);
  const existing = await prisma.institution.findUnique({ where: { slug } });
  if (existing) throw AppError.conflict(`An institution with a matching slug ("${slug}") already exists`);

  return prisma.institution.create({
    data: {
      slug,
      name: input.name,
      type: input.type,
      establishedYear: input.establishedYear,
      website: input.website || undefined,
      description: input.description,
      categoryId: input.categoryId || undefined,
      locations: { create: { city: input.city, state: input.state, isPrimary: true } },
    },
    include: { locations: { where: { isPrimary: true }, take: 1 }, _count: { select: { reviews: true } } },
  });
}

export async function updateInstitution(
  institutionId: string,
  input: {
    name: string;
    type: InstitutionType;
    city: string;
    state: string;
    establishedYear?: number | null;
    website?: string;
    description?: string;
    admissionProcess?: string;
    categoryId?: string | null;
  },
) {
  const existing = await prisma.institution.findUnique({ where: { id: institutionId }, include: { locations: { where: { isPrimary: true }, take: 1 } } });
  if (!existing) throw AppError.notFound('Institution not found');

  const primary = existing.locations[0];
  return prisma.institution.update({
    where: { id: institutionId },
    data: {
      name: input.name,
      type: input.type,
      establishedYear: input.establishedYear ?? null,
      website: input.website || null,
      description: input.description || null,
      admissionProcess: input.admissionProcess || null,
      categoryId: input.categoryId || null,
      locations: primary
        ? { update: { where: { id: primary.id }, data: { city: input.city, state: input.state } } }
        : { create: { city: input.city, state: input.state, isPrimary: true } },
    },
    include: { locations: { where: { isPrimary: true }, take: 1 }, _count: { select: { reviews: true } } },
  });
}

export async function listCategories() {
  return prisma.institutionCategory.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { institutions: true } } },
  });
}

export async function createCategory(name: string) {
  const slug = toSlug(name);
  const existing = await prisma.institutionCategory.findUnique({ where: { slug } });
  if (existing) throw AppError.conflict(`A category with a matching slug ("${slug}") already exists`);
  return prisma.institutionCategory.create({ data: { name, slug } });
}

export async function listInstitutionsAdmin(page = 1, pageSize = 20, status?: 'PENDING' | 'APPROVED' | 'REJECTED') {
  const where = status ? { status } : undefined;
  const [total, items] = await Promise.all([
    prisma.institution.count({ where }),
    prisma.institution.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        locations: { where: { isPrimary: true }, take: 1 },
        _count: { select: { reviews: true } },
        submittedBy: { select: { username: true, email: true } },
      },
    }),
  ]);
  return { total, page, pageSize, items };
}

export async function setInstitutionFeatured(institutionId: string, featured: boolean) {
  return prisma.institution.update({ where: { id: institutionId }, data: { featured } });
}

export async function decideInstitutionSubmission(
  institutionId: string,
  adminUserId: string,
  decision: 'APPROVED' | 'REJECTED',
  reason?: string,
) {
  const institution = await prisma.institution.findUnique({ where: { id: institutionId } });
  if (!institution) throw AppError.notFound('Institution not found');
  if (institution.status !== 'PENDING') throw AppError.conflict('This submission has already been decided');

  const updated = await prisma.institution.update({
    where: { id: institutionId },
    data: { status: decision, rejectionReason: decision === 'REJECTED' ? reason : null },
  });

  await prisma.adminAction.create({
    data: {
      adminUserId,
      targetType: 'Institution',
      targetId: institutionId,
      action: decision === 'APPROVED' ? 'APPROVE' : 'REJECT',
      reason,
    },
  });

  if (institution.submittedByUserId) {
    if (decision === 'APPROVED') {
      await notify(
        institution.submittedByUserId,
        'INSTITUTION_APPROVED',
        'Your college submission was approved',
        `${institution.name} is now live on StudentReview — you can write your review now.`,
        `/college/${institution.slug}`,
      );
    } else {
      await notify(institution.submittedByUserId, 'INSTITUTION_REJECTED', 'Your college submission was not approved', reason);
    }
  }

  return updated;
}

export async function listJobsAdmin(page = 1, pageSize = 20) {
  const [total, items] = await Promise.all([
    prisma.job.count(),
    prisma.job.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: { institution: { select: { name: true, slug: true } } },
    }),
  ]);
  return { total, page, pageSize, items };
}

export async function listPaymentsAdmin(page = 1, pageSize = 20) {
  const [total, items] = await Promise.all([
    prisma.payment.count(),
    prisma.payment.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: { subscription: { include: { organizationProfile: { include: { institution: { select: { name: true, slug: true } } } } } } },
    }),
  ]);
  return { total, page, pageSize, items };
}

// Admin can take an inappropriate listing down (CLOSED), independent of the
// organization's own draft/publish workflow — this is a moderation action,
// not something the org dashboard exposes.
export async function setJobStatus(adminUserId: string, jobId: string, status: 'PUBLISHED' | 'CLOSED') {
  const job = await prisma.job.update({ where: { id: jobId }, data: { status } });
  await prisma.adminAction.create({
    data: { adminUserId, targetType: 'Job', targetId: jobId, action: status === 'CLOSED' ? 'HIDE' : 'APPROVE' },
  });
  return job;
}

// ───────────────────────── FAQs ─────────────────────────

export async function listFaqsAdmin() {
  return prisma.faq.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] });
}

export async function listPublishedFaqs() {
  return prisma.faq.findMany({ where: { published: true }, orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] });
}

export async function createFaq(input: { question: string; answer: string; order?: number; published?: boolean }) {
  return prisma.faq.create({ data: input });
}

export async function updateFaq(id: string, input: { question?: string; answer?: string; order?: number; published?: boolean }) {
  const faq = await prisma.faq.findUnique({ where: { id } });
  if (!faq) throw AppError.notFound('FAQ not found');
  return prisma.faq.update({ where: { id }, data: input });
}

export async function deleteFaq(id: string) {
  const faq = await prisma.faq.findUnique({ where: { id } });
  if (!faq) throw AppError.notFound('FAQ not found');
  await prisma.faq.delete({ where: { id } });
}

// ───────────────────────── Roles ─────────────────────────

export async function setUserRole(adminUserId: string, targetUserId: string, role: RoleName, grant: boolean) {
  if (targetUserId === adminUserId && role === 'ADMIN' && !grant) {
    throw AppError.badRequest('You cannot revoke your own ADMIN role');
  }

  const roleRow = await getOrCreateRole(role);
  if (grant) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: targetUserId, roleId: roleRow.id } },
      create: { userId: targetUserId, roleId: roleRow.id },
      update: {},
    });
  } else {
    await prisma.userRole.deleteMany({ where: { userId: targetUserId, roleId: roleRow.id } });
  }

  await prisma.adminAction.create({
    data: { adminUserId, targetType: 'User', targetId: targetUserId, action: grant ? 'APPROVE' : 'REMOVE', reason: `${grant ? 'Granted' : 'Revoked'} ${role}` },
  });

  return prisma.user.findUniqueOrThrow({
    where: { id: targetUserId },
    select: { id: true, username: true, email: true, roles: { select: { role: { select: { name: true } } } } },
  });
}

// ───────────────────────── Platform settings ─────────────────────────

export async function readPlatformSettings() {
  return getPlatformSettings();
}

export async function writePlatformSettings(adminUserId: string, input: PlatformSettingsInput) {
  const updated = await updatePlatformSettings(input);
  await prisma.adminAction.create({
    data: {
      adminUserId,
      targetType: 'PlatformSettings',
      targetId: 'singleton',
      action: 'APPROVE',
      reason: `Updated: ${Object.entries(input).map(([k, v]) => `${k}=${v}`).join(', ')}`,
    },
  });
  return updated;
}
