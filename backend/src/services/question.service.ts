import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { notify } from './notification.service.js';
import { isVerified } from './verification.service.js';
import { getPlatformSettings } from './settings.service.js';
import type { ReportReason } from '@prisma/client';

export async function createQuestion(userId: string, institutionId: string, title: string, body?: string) {
  const institution = await prisma.institution.findUnique({ where: { id: institutionId } });
  if (!institution) throw AppError.notFound('Institution not found');
  return prisma.question.create({ data: { userId, institutionId, title, body } });
}

export async function listQuestions(institutionId: string, page = 1, pageSize = 20) {
  const [total, items] = await Promise.all([
    prisma.question.count({ where: { institutionId, status: 'APPROVED' } }),
    prisma.question.findMany({
      where: { institutionId, status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { _count: { select: { answers: true } } },
    }),
  ]);
  return { total, page, pageSize, items };
}

export async function getQuestionWithAnswers(questionId: string) {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { answers: { where: { status: { in: ['APPROVED', 'FLAGGED'] } }, orderBy: { upvoteCount: 'desc' } } },
  });
  if (!question || !['APPROVED', 'FLAGGED'].includes(question.status)) throw AppError.notFound('Question not found');
  return question;
}

export async function createAnswer(userId: string, questionId: string, body: string) {
  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) throw AppError.notFound('Question not found');

  const verifiedStudent = await isVerified(userId, question.institutionId);
  const answer = await prisma.answer.create({ data: { questionId, userId, body, verifiedStudent } });
  await notify(question.userId, 'QUESTION_ANSWERED', 'Your question received a new answer', undefined, undefined);
  return answer;
}

export async function listOwnQuestions(userId: string) {
  return prisma.question.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { institution: { select: { name: true, slug: true } }, _count: { select: { answers: true } } },
  });
}

export async function listOwnAnswers(userId: string) {
  return prisma.answer.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { question: { select: { title: true, id: true, institution: { select: { slug: true } } } } },
  });
}

// Mirrors review.service.ts's reportReview: same auto-flag-on-threshold
// behavior (reuses the platform's single reportAutoFlagThreshold setting),
// same "notify the author" pattern.
export async function reportQuestion(questionId: string, reporterUserId: string, reason: ReportReason, details?: string) {
  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) throw AppError.notFound('Question not found');

  const report = await prisma.questionReport.create({ data: { questionId, reporterUserId, reason, details } });

  const openReportCount = await prisma.questionReport.count({ where: { questionId, status: { in: ['OPEN', 'INVESTIGATING'] } } });
  const settings = await getPlatformSettings();
  if (openReportCount >= settings.reportAutoFlagThreshold && question.status === 'APPROVED') {
    await prisma.question.update({ where: { id: questionId }, data: { status: 'FLAGGED' } });
  }

  await notify(question.userId, 'QUESTION_REPORTED', 'Your question has been reported and is under review', undefined, undefined);
  return report;
}

export async function reportAnswer(answerId: string, reporterUserId: string, reason: ReportReason, details?: string) {
  const answer = await prisma.answer.findUnique({ where: { id: answerId } });
  if (!answer) throw AppError.notFound('Answer not found');

  const report = await prisma.answerReport.create({ data: { answerId, reporterUserId, reason, details } });

  const openReportCount = await prisma.answerReport.count({ where: { answerId, status: { in: ['OPEN', 'INVESTIGATING'] } } });
  const settings = await getPlatformSettings();
  if (openReportCount >= settings.reportAutoFlagThreshold && answer.status === 'APPROVED') {
    await prisma.answer.update({ where: { id: answerId }, data: { status: 'FLAGGED' } });
  }

  await notify(answer.userId, 'ANSWER_REPORTED', 'Your answer has been reported and is under review', undefined, undefined);
  return report;
}

export async function toggleAnswerUpvote(answerId: string, userId: string) {
  const existing = await prisma.answerVote.findUnique({ where: { answerId_userId: { answerId, userId } } });
  if (existing) {
    await prisma.$transaction([
      prisma.answerVote.delete({ where: { id: existing.id } }),
      prisma.answer.update({ where: { id: answerId }, data: { upvoteCount: { decrement: 1 } } }),
    ]);
    return { voted: false };
  }
  const answer = await prisma.answer.update({
    where: { id: answerId },
    data: { upvoteCount: { increment: 1 }, votes: { create: { userId } } },
  });
  await notify(answer.userId, 'ANSWER_UPVOTED', 'Your answer received an upvote', undefined, undefined);
  return { voted: true };
}
