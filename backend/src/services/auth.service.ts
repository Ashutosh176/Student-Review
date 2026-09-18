import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { logger } from '../config/logger.js';
import { AppError } from '../utils/AppError.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { hashToken, refreshTtlToDate, signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { sendEmail } from './email.service.js';
import { verifyAccountEmail, resetPasswordEmail } from './emailTemplates.js';
import { getOrCreateRole } from './role.util.js';
import type { RoleName } from '@prisma/client';

async function loadUserWithRoles(userId: string) {
  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: { roles: { include: { role: true } } },
  });
}

function rolesOf(user: Awaited<ReturnType<typeof loadUserWithRoles>>): RoleName[] {
  return user.roles.map((r) => r.role.name);
}

export async function issueTokenPair(userId: string) {
  const user = await loadUserWithRoles(userId);
  const roles = rolesOf(user);
  const accessToken = signAccessToken({ sub: user.id, roles, username: user.username });
  const refreshToken = signRefreshToken(user.id);
  await prisma.refreshToken.create({
    data: { userId: user.id, tokenHash: hashToken(refreshToken), expiresAt: refreshTtlToDate() },
  });
  return { accessToken, refreshToken, user, roles };
}

export async function register(input: { username: string; email: string; password: string }) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: input.email }, { username: input.username }] },
  });
  if (existing) throw AppError.conflict('An account with that email or username already exists');

  const studentRole = await getOrCreateRole('STUDENT');
  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      username: input.username,
      email: input.email,
      passwordHash,
      roles: { create: [{ roleId: studentRole.id }] },
    },
  });

  const verificationToken = crypto.randomBytes(32).toString('hex');
  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(verificationToken),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });
  const verifyLink = `${env.clientOrigin}/verify-email?token=${verificationToken}`;
  const verifyEmailContent = verifyAccountEmail({ username: user.username, link: verifyLink });
  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify your StudentReview account',
      text: verifyEmailContent.text,
      html: verifyEmailContent.html,
      template: { key: 'verifyEmail', variables: { USERNAME: user.username, LINK: verifyLink } },
    });
  } catch (err) {
    // The account and its verification token are already committed — an
    // email outage must never turn into a half-created, unrecoverable
    // account. The token stays valid until its expiry either way; nothing
    // here should ever log err.message if it could echo SMTP credentials,
    // and it can't — sendEmail() only ever throws its own sanitized message.
    logger.warn({ err, userId: user.id }, 'Failed to send account verification email — registration still succeeded');
  }

  return issueTokenPair(user.id);
}

export async function login(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw AppError.unauthorized('Invalid email or password');
  if (user.status !== 'ACTIVE') throw AppError.forbidden('This account is not active');

  const valid = await verifyPassword(user.passwordHash, input.password);
  if (!valid) throw AppError.unauthorized('Invalid email or password');

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  return issueTokenPair(user.id);
}

export async function refresh(refreshToken: string) {
  let payload: { sub: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw AppError.unauthorized('Invalid refresh token');
  }

  const tokenHash = hashToken(refreshToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw AppError.unauthorized('Refresh token expired or revoked');
  }

  // Rotate: revoke the used token and issue a new pair.
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
  return issueTokenPair(payload.sub);
}

export async function logout(refreshToken: string) {
  const tokenHash = hashToken(refreshToken);
  await prisma.refreshToken.updateMany({ where: { tokenHash, revokedAt: null }, data: { revokedAt: new Date() } });
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Always respond success-shaped to avoid leaking which emails are registered.
  if (!user) return;

  const token = crypto.randomBytes(32).toString('hex');
  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
  });
  const resetLink = `${env.clientOrigin}/reset-password?token=${token}`;
  const resetEmailContent = resetPasswordEmail({ username: user.username, link: resetLink });
  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset your StudentReview password',
      text: resetEmailContent.text,
      html: resetEmailContent.html,
      template: { key: 'resetPassword', variables: { USERNAME: user.username, LINK: resetLink } },
    });
  } catch (err) {
    // Letting this throw would turn into a 500 here but not for an
    // unregistered email (which returns early above) — an outage would
    // leak which emails are registered on top of breaking the flow.
    logger.warn({ err, userId: user.id }, 'Failed to send password reset email');
  }
}

export async function resetPassword(token: string, newPassword: string) {
  const tokenHash = hashToken(token);
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw AppError.badRequest('This reset link is invalid or has expired');
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    // Revoke all existing sessions on password change.
    prisma.refreshToken.updateMany({ where: { userId: record.userId, revokedAt: null }, data: { revokedAt: new Date() } }),
  ]);
}

export async function verifyEmail(token: string) {
  const tokenHash = hashToken(token);
  const record = await prisma.emailVerificationToken.findUnique({ where: { tokenHash } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw AppError.badRequest('This verification link is invalid or has expired');
  }
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } }),
    prisma.emailVerificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);
}

export async function getSelf(userId: string) {
  return loadUserWithRoles(userId);
}
