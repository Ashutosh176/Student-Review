import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { ratingSummaryFor } from './institution.service.js';

export async function saveInstitution(userId: string, institutionId: string) {
  const institution = await prisma.institution.findUnique({ where: { id: institutionId } });
  if (!institution) throw AppError.notFound('Institution not found');
  return prisma.savedInstitution.upsert({
    where: { userId_institutionId: { userId, institutionId } },
    create: { userId, institutionId },
    update: {},
  });
}

export async function unsaveInstitution(userId: string, institutionId: string) {
  await prisma.savedInstitution.deleteMany({ where: { userId, institutionId } });
}

export async function listSavedInstitutions(userId: string) {
  const saved = await prisma.savedInstitution.findMany({
    where: { userId },
    include: { institution: { include: { locations: { where: { isPrimary: true }, take: 1 } } } },
    orderBy: { createdAt: 'desc' },
  });
  // CollegeCard (reused here from every other institution listing) expects
  // institution.summary.{ratings,reviewCount} — attach it the same way
  // institution.service.ts's own list/search/compare endpoints do.
  return Promise.all(
    saved.map(async (s) => ({ ...s, institution: { ...s.institution, summary: await ratingSummaryFor(s.institutionId) } })),
  );
}

export async function updateSettings(
  userId: string,
  input: {
    publicProfileOptIn?: boolean;
    notifyReviewActivity?: boolean;
    notifyCommunityActivity?: boolean;
    notifySubmissionUpdates?: boolean;
    notifySystem?: boolean;
  },
) {
  return prisma.user.update({ where: { id: userId }, data: input });
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const valid = await verifyPassword(user.passwordHash, currentPassword);
  if (!valid) throw AppError.unauthorized('Current password is incorrect');

  const passwordHash = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
    // Same posture as a token-based reset: revoke every refresh token. The
    // cookie is scoped to /api/auth so this endpoint can't see (and thus
    // can't spare) the caller's own session — it naturally expires with the
    // 15-minute access token instead of an abrupt mid-session logout.
    prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }),
  ]);
}

export async function deactivateAccount(userId: string, password: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const valid = await verifyPassword(user.passwordHash, password);
  if (!valid) throw AppError.unauthorized('Incorrect password');

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { status: 'DEACTIVATED' } }),
    prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }),
  ]);
}
