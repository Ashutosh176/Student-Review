import crypto from 'node:crypto';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { hashToken } from '../utils/jwt.js';
import { extractEmailDomain, GENERIC_EMAIL_DOMAINS } from '../utils/emailDomain.js';
import { sendEmail } from './email.service.js';
import { notify } from './notification.service.js';
import type { RelationshipType } from '@prisma/client';

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

// Generic providers can never satisfy "official university email" no matter
// what an institution's domain list contains — checked before the curated
// per-institution list, not instead of it.
const extractDomain = extractEmailDomain;

// "Currently verified for this institution?" — the one check review.service.ts
// and question.service.ts both gate on. Deliberately a status query, not a
// unique-row lookup: StudentVerification keeps every attempt as history (see
// schema comment), so there can be several rows per (userId, institutionId).
export async function isVerified(userId: string, institutionId: string): Promise<boolean> {
  const row = await prisma.studentVerification.findFirst({
    where: { userId, institutionId, status: 'VERIFIED' },
  });
  return Boolean(row);
}

async function assertNoActiveAttempt(userId: string, institutionId: string) {
  const active = await prisma.studentVerification.findFirst({
    where: { userId, institutionId, status: { in: ['PENDING', 'VERIFIED'] } },
  });
  if (active?.status === 'VERIFIED') {
    throw AppError.conflict('You are already verified for this institution');
  }
  if (active) {
    throw AppError.conflict('You already have a pending verification for this institution');
  }
}

// A garbage/nonexistent institutionId would otherwise hit a raw FK-violation
// on studentVerification.create and surface as an unhandled 500 — and
// verifying against a not-yet-approved institution would just produce an
// orphaned admin-queue entry, since review.service.ts's own APPROVED check
// would still block the review anyway.
async function assertInstitutionVerifiable(institutionId: string) {
  const institution = await prisma.institution.findUnique({ where: { id: institutionId } });
  if (!institution) throw AppError.notFound('Institution not found');
  if (institution.status !== 'APPROVED') throw AppError.badRequest('This institution is not yet approved — it cannot be verified against yet');
}

export async function startEmailVerification(
  userId: string,
  institutionId: string,
  relationship: RelationshipType,
  email: string,
) {
  await assertInstitutionVerifiable(institutionId);
  await assertNoActiveAttempt(userId, institutionId);

  const domain = extractDomain(email);
  if (!domain || GENERIC_EMAIL_DOMAINS.has(domain)) {
    throw AppError.badRequest('Please use your official university email address, not a personal email provider');
  }
  const allowed = await prisma.institutionEmailDomain.findUnique({ where: { domain } });
  if (!allowed || allowed.institutionId !== institutionId) {
    throw AppError.badRequest('This email domain is not recognized as an official email for the selected institution');
  }

  const verification = await prisma.studentVerification.create({
    data: { userId, institutionId, relationship, method: 'EMAIL_OTP', status: 'PENDING', universityEmail: email.toLowerCase(), domain },
  });

  await issueOtp(verification.id, email);
  return { id: verification.id, status: verification.status };
}

async function issueOtp(studentVerificationId: string, email: string) {
  const code = crypto.randomInt(100000, 1000000).toString();
  await prisma.verificationOtp.create({
    data: { studentVerificationId, codeHash: hashToken(code), expiresAt: new Date(Date.now() + OTP_TTL_MS) },
  });
  await sendEmail({
    to: email,
    subject: 'Your StudentReview verification code',
    text: `Your StudentReview verification code is ${code}. It expires in 10 minutes. Use it to confirm you can submit a review for this institution — never share this code with anyone.`,
    template: { key: 'collegeOtp', variables: { OTP: code } },
  });
}

export async function resendOtp(userId: string, institutionId: string) {
  const verification = await prisma.studentVerification.findFirst({
    where: { userId, institutionId, method: 'EMAIL_OTP', status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
  });
  if (!verification || !verification.universityEmail) {
    throw AppError.notFound('No pending email verification found for this institution');
  }

  const lastOtp = await prisma.verificationOtp.findFirst({
    where: { studentVerificationId: verification.id },
    orderBy: { createdAt: 'desc' },
  });
  if (lastOtp && Date.now() - lastOtp.createdAt.getTime() < OTP_RESEND_COOLDOWN_MS) {
    throw AppError.tooMany('Please wait a moment before requesting another code');
  }

  await issueOtp(verification.id, verification.universityEmail);
  return { id: verification.id, status: verification.status };
}

export async function verifyOtp(userId: string, institutionId: string, code: string) {
  const verification = await prisma.studentVerification.findFirst({
    where: { userId, institutionId, method: 'EMAIL_OTP', status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
  });
  if (!verification) throw AppError.notFound('No pending email verification found for this institution');

  const otp = await prisma.verificationOtp.findFirst({
    where: { studentVerificationId: verification.id, consumedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  if (!otp) throw AppError.badRequest('No active verification code — request a new one');
  if (otp.expiresAt < new Date()) throw AppError.badRequest('This code has expired — request a new one');
  if (otp.attempts >= OTP_MAX_ATTEMPTS) throw AppError.tooMany('Too many attempts — request a new code');

  if (hashToken(code) !== otp.codeHash) {
    await prisma.verificationOtp.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    throw AppError.unauthorized('Incorrect verification code');
  }

  const [, updated] = await prisma.$transaction([
    prisma.verificationOtp.update({ where: { id: otp.id }, data: { consumedAt: new Date() } }),
    prisma.studentVerification.update({ where: { id: verification.id }, data: { status: 'VERIFIED', verifiedAt: new Date() } }),
  ]);
  return updated;
}

// Lets a user back out of a PENDING attempt (e.g. they typo'd their email or
// want to switch methods) instead of being stuck for the resend cooldown / an
// admin decision — the only other way out of PENDING before this existed.
export async function cancelPendingVerification(userId: string, institutionId: string) {
  const active = await prisma.studentVerification.findFirst({
    where: { userId, institutionId, status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
  });
  if (!active) throw AppError.notFound('No pending verification found for this institution');
  return prisma.studentVerification.update({ where: { id: active.id }, data: { status: 'EXPIRED' } });
}

export async function startDocumentVerification(
  userId: string,
  institutionId: string,
  relationship: RelationshipType,
  documentUrl: string,
  note?: string,
) {
  await assertInstitutionVerifiable(institutionId);
  await assertNoActiveAttempt(userId, institutionId);
  return prisma.studentVerification.create({
    data: { userId, institutionId, relationship, method: 'DOCUMENT_UPLOAD', status: 'PENDING', documentUrl, documentNote: note },
  });
}

export async function getMyVerifications(userId: string) {
  const rows = await prisma.studentVerification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { institution: { select: { name: true, slug: true } } },
  });
  return rows.map(({ documentUrl: _doc, ...row }) => ({ ...row, hasDocument: Boolean(_doc) }));
}

export async function listVerificationsAdmin(status?: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED' | 'REVOKED') {
  const rows = await prisma.studentVerification.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { username: true, email: true } }, institution: { select: { name: true, slug: true } } },
  });
  return rows.map(({ documentUrl: _doc, ...row }) => ({ ...row, hasDocument: Boolean(_doc) }));
}

export async function getVerificationDocumentPath(verificationId: string): Promise<string | null> {
  const row = await prisma.studentVerification.findUnique({ where: { id: verificationId }, select: { documentUrl: true } });
  return row?.documentUrl ?? null;
}

export async function decideDocumentVerification(
  adminUserId: string,
  verificationId: string,
  decision: 'APPROVED' | 'REJECTED',
  reason?: string,
) {
  const verification = await prisma.studentVerification.findUnique({ where: { id: verificationId } });
  if (!verification) throw AppError.notFound('Verification request not found');
  if (verification.status !== 'PENDING') throw AppError.conflict('This request has already been decided');

  const status = decision === 'APPROVED' ? 'VERIFIED' : 'REJECTED';
  const updated = await prisma.studentVerification.update({
    where: { id: verificationId },
    data: {
      status,
      reviewedByAdminId: adminUserId,
      reviewedAt: new Date(),
      rejectionReason: status === 'REJECTED' ? reason : null,
      verifiedAt: status === 'VERIFIED' ? new Date() : null,
    },
  });

  await prisma.adminAction.create({
    data: {
      adminUserId,
      targetType: 'StudentVerification',
      targetId: verificationId,
      action: decision === 'APPROVED' ? 'APPROVE' : 'REJECT',
      reason,
    },
  });

  if (decision === 'APPROVED') {
    await notify(verification.userId, 'VERIFICATION_APPROVED', 'Your university verification was approved', 'You can now write a review for this institution.');
  } else {
    await notify(verification.userId, 'VERIFICATION_REJECTED', 'Your university verification was not approved', reason);
  }

  return updated;
}

export async function revokeVerification(adminUserId: string, verificationId: string, reason?: string) {
  const verification = await prisma.studentVerification.findUnique({ where: { id: verificationId } });
  if (!verification) throw AppError.notFound('Verification request not found');
  if (verification.status !== 'VERIFIED') throw AppError.conflict('Only a verified record can be revoked');

  const [updated] = await prisma.$transaction([
    prisma.studentVerification.update({ where: { id: verificationId }, data: { status: 'REVOKED' } }),
    prisma.review.updateMany({
      where: { userId: verification.userId, institutionId: verification.institutionId, verifiedStudent: true },
      data: { verifiedStudent: false },
    }),
  ]);

  await prisma.adminAction.create({
    data: { adminUserId, targetType: 'StudentVerification', targetId: verificationId, action: 'REVOKE', reason },
  });
  await notify(verification.userId, 'VERIFICATION_REVOKED', 'Your university verification was revoked', reason);

  return updated;
}

// ───────────────────────── Admin: institution email domains ─────────────────────────

export async function listEmailDomains(institutionId: string) {
  return prisma.institutionEmailDomain.findMany({ where: { institutionId }, orderBy: { domain: 'asc' } });
}

export async function addEmailDomain(institutionId: string, domain: string) {
  const normalized = domain.trim().toLowerCase();
  if (GENERIC_EMAIL_DOMAINS.has(normalized)) {
    throw AppError.badRequest('Generic email providers cannot be used as an official institution domain');
  }
  const existing = await prisma.institutionEmailDomain.findUnique({ where: { domain: normalized } });
  if (existing) throw AppError.conflict('This domain is already registered to an institution');
  return prisma.institutionEmailDomain.create({ data: { institutionId, domain: normalized } });
}

export async function removeEmailDomain(id: string) {
  await prisma.institutionEmailDomain.delete({ where: { id } });
}
