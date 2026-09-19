import crypto from 'node:crypto';
import { publicCutoff, publicReviewWhere, MIN_BUCKET_SIZE } from '../utils/publishing.js';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { hashToken } from '../utils/jwt.js';
import { extractEmailDomain, GENERIC_EMAIL_DOMAINS } from '../utils/emailDomain.js';
import { notify } from './notification.service.js';
import { sendEmail } from './email.service.js';
import { getOrCreateRole } from './role.util.js';

export async function submitClaim(
  userId: string,
  institutionId: string,
  input: { organizationName: string; officialEmail: string; website?: string; designation?: string; documentUrl?: string },
) {
  const institution = await prisma.institution.findUnique({ where: { id: institutionId } });
  if (!institution) throw AppError.notFound('Institution not found');
  if (institution.claimed) throw AppError.conflict('This institution has already been claimed');

  // A claim hands over control of the institution's public profile — require
  // proof it's really coming from the institution, not just a claimed email.
  // Two independent signals, since neither alone is trustworthy: the email
  // domain (easy to check, but an institution may not have its domains
  // curated yet) and a human-reviewed authorization letter (spec: document
  // must show the claimant's name, designation and the official email
  // address on institutional letterhead — reviewed by an admin, never
  // auto-approved on domain match alone).
  if (!input.documentUrl) {
    throw AppError.badRequest(
      'An official authorization letter is required — a signed letter on institutional letterhead naming you, your designation, and this official email address',
    );
  }

  const domain = extractEmailDomain(input.officialEmail);
  if (!domain || GENERIC_EMAIL_DOMAINS.has(domain)) {
    throw AppError.badRequest('Please use your official institution email address, not a personal email provider');
  }
  const registeredDomainCount = await prisma.institutionEmailDomain.count({ where: { institutionId } });
  if (registeredDomainCount > 0) {
    const match = await prisma.institutionEmailDomain.findUnique({ where: { domain } });
    if (!match || match.institutionId !== institutionId) {
      throw AppError.badRequest('This email domain is not recognized as an official email for this institution');
    }
  }

  const existingPending = await prisma.organizationClaim.findFirst({
    where: { institutionId, userId, status: 'PENDING' },
  });
  if (existingPending) throw AppError.conflict('You already have a pending claim for this institution');

  return prisma.organizationClaim.create({
    data: { institutionId, userId, ...input },
  });
}

export async function listClaims(status?: 'PENDING' | 'APPROVED' | 'REJECTED') {
  const claims = await prisma.organizationClaim.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    include: { institution: { select: { name: true, slug: true } }, user: { select: { username: true, email: true } } },
  });
  // documentUrl is an internal storage key — admins get a hasDocument flag
  // and download it through the dedicated route rather than seeing the path.
  return claims.map(({ documentUrl, ...claim }) => ({ ...claim, hasDocument: Boolean(documentUrl) }));
}

export async function getClaimDocumentPath(claimId: string): Promise<{ path: string; mimeHint: string } | null> {
  const claim = await prisma.organizationClaim.findUnique({ where: { id: claimId }, select: { documentUrl: true } });
  if (!claim?.documentUrl) return null;
  return { path: claim.documentUrl, mimeHint: claim.documentUrl };
}

export async function decideClaim(claimId: string, adminUserId: string, decision: 'APPROVED' | 'REJECTED', reason?: string) {
  const claim = await prisma.organizationClaim.findUnique({ where: { id: claimId } });
  if (!claim) throw AppError.notFound('Claim not found');
  if (claim.status !== 'PENDING') throw AppError.conflict('This claim has already been decided');

  const updated = await prisma.organizationClaim.update({
    where: { id: claimId },
    data: { status: decision, reviewedByAdminId: adminUserId, reviewedAt: new Date() },
  });

  await prisma.adminAction.create({
    data: {
      adminUserId,
      targetType: 'OrganizationClaim',
      targetId: claimId,
      action: decision === 'APPROVED' ? 'APPROVE' : 'REJECT',
      reason,
    },
  });

  if (decision === 'APPROVED') {
    const orgRole = await getOrCreateRole('ORGANIZATION');
    const orgProfile = await prisma.organizationProfile.upsert({
      where: { institutionId: claim.institutionId },
      create: { institutionId: claim.institutionId, contactEmail: claim.officialEmail },
      update: {},
    });
    await prisma.institution.update({ where: { id: claim.institutionId }, data: { claimed: true, verified: true } });
    await prisma.organizationMember.upsert({
      where: { organizationProfileId_userId: { organizationProfileId: orgProfile.id, userId: claim.userId } },
      create: { organizationProfileId: orgProfile.id, userId: claim.userId, role: 'OWNER', status: 'ACTIVE' },
      update: { status: 'ACTIVE', role: 'OWNER' },
    });
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: claim.userId, roleId: orgRole.id } },
      create: { userId: claim.userId, roleId: orgRole.id },
      update: {},
    });
    await notify(
      claim.userId,
      'CLAIM_APPROVED',
      'Your institution claim was approved',
      'You now have organization dashboard access.',
      '/organization/dashboard',
    );
  } else {
    await notify(claim.userId, 'CLAIM_REJECTED', 'Your institution claim was not approved', reason);
  }

  return updated;
}

export async function getOrgMembershipForUser(userId: string) {
  const membership = await prisma.organizationMember.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: { organizationProfile: { include: { institution: true } } },
  });
  if (!membership) throw AppError.forbidden('You are not part of a verified organization');
  return membership;
}

export async function updateOrgProfile(
  orgProfileId: string,
  input: { description?: string; contactEmail?: string; website?: string },
) {
  const { description, website, ...rest } = input;
  const institutionUpdate = description !== undefined || website !== undefined ? { description, website } : undefined;
  const org = await prisma.organizationProfile.update({ where: { id: orgProfileId }, data: rest });
  if (institutionUpdate) {
    await prisma.institution.update({ where: { id: org.institutionId }, data: institutionUpdate });
  }
  return prisma.organizationProfile.findUnique({ where: { id: orgProfileId }, include: { institution: true } });
}

export async function listMembers(orgProfileId: string) {
  return prisma.organizationMember.findMany({
    where: { organizationProfileId: orgProfileId },
    include: { user: { select: { username: true, email: true } } },
  });
}

export async function inviteMember(orgProfileId: string, email: string, role: 'ADMIN' | 'EDITOR') {
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    return prisma.organizationMember.upsert({
      where: { organizationProfileId_userId: { organizationProfileId: orgProfileId, userId: user.id } },
      create: { organizationProfileId: orgProfileId, userId: user.id, role, status: 'INVITED' },
      update: { role, status: 'INVITED' },
    });
  }

  // No account yet — hold a placeholder member row (userId null, keyed by
  // email) and email a token-bearing accept-invite link. The row becomes a
  // real membership once someone with a matching account email accepts it.
  const org = await prisma.organizationProfile.findUniqueOrThrow({
    where: { id: orgProfileId },
    include: { institution: true },
  });

  const rawToken = crypto.randomBytes(32).toString('hex');
  const inviteTokenHash = hashToken(rawToken);
  const inviteTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const existingInvite = await prisma.organizationMember.findFirst({
    where: { organizationProfileId: orgProfileId, userId: null, invitedEmail: email },
  });

  const member = existingInvite
    ? await prisma.organizationMember.update({
        where: { id: existingInvite.id },
        data: { role, status: 'INVITED', inviteTokenHash, inviteTokenExpiresAt },
      })
    : await prisma.organizationMember.create({
        data: { organizationProfileId: orgProfileId, invitedEmail: email, role, status: 'INVITED', inviteTokenHash, inviteTokenExpiresAt },
      });

  await sendEmail({
    to: email,
    subject: `You've been invited to manage ${org.institution.name} on StudentReview`,
    text: `You've been invited to join the ${org.institution.name} organization team as ${role === 'ADMIN' ? 'an Admin' : 'an Editor'}. Accept the invite (register or log in with this email first if you haven't already): ${env.clientOrigin}/accept-invite?token=${rawToken}`,
  });

  return member;
}

export async function getInviteByToken(token: string) {
  const member = await prisma.organizationMember.findUnique({
    where: { inviteTokenHash: hashToken(token) },
    include: { organizationProfile: { include: { institution: true } } },
  });
  if (!member || member.status !== 'INVITED' || !member.inviteTokenExpiresAt || member.inviteTokenExpiresAt < new Date()) {
    throw AppError.notFound('This invite link is invalid or has expired');
  }
  return {
    institutionName: member.organizationProfile.institution.name,
    institutionSlug: member.organizationProfile.institution.slug,
    role: member.role,
    email: member.invitedEmail,
  };
}

export async function acceptInvite(token: string, userId: string) {
  const member = await prisma.organizationMember.findUnique({ where: { inviteTokenHash: hashToken(token) } });
  if (!member || member.status !== 'INVITED' || !member.inviteTokenExpiresAt || member.inviteTokenExpiresAt < new Date()) {
    throw AppError.notFound('This invite link is invalid or has expired');
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!member.invitedEmail || member.invitedEmail.toLowerCase() !== user.email.toLowerCase()) {
    throw AppError.forbidden('This invite was sent to a different email address — log in with that email to accept it.');
  }

  const orgRole = await getOrCreateRole('ORGANIZATION');
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId, roleId: orgRole.id } },
    create: { userId, roleId: orgRole.id },
    update: {},
  });

  return prisma.organizationMember.update({
    where: { id: member.id },
    data: { userId, status: 'ACTIVE', inviteTokenHash: null, inviteTokenExpiresAt: null },
    include: { organizationProfile: { include: { institution: true } } },
  });
}

export async function removeMember(orgProfileId: string, memberId: string) {
  const member = await prisma.organizationMember.findUnique({ where: { id: memberId } });
  if (!member || member.organizationProfileId !== orgProfileId) throw AppError.notFound('Member not found');
  if (member.role === 'OWNER') throw AppError.badRequest('Cannot remove the organization owner');
  await prisma.organizationMember.update({ where: { id: memberId }, data: { status: 'REMOVED' } });
}

export async function getOrgAnalytics(institutionId: string) {
  const [totalReviews, verifiedReviews, respondedCount, sentimentGroups, monthlyRatings] = await Promise.all([
    prisma.review.count({ where: { institutionId, ...publicReviewWhere() } }),
    prisma.review.count({ where: { institutionId, ...publicReviewWhere(), verifiedStudent: true } }),
    prisma.review.count({ where: { institutionId, ...publicReviewWhere(), response: { isNot: null } } }),
    prisma.review.groupBy({ by: ['sentiment'], where: { institutionId, ...publicReviewWhere() }, _count: { _all: true } }),
    prisma.$queryRaw<{ month: string; avg: number; n: number }[]>`
      SELECT to_char(date_trunc('month', r."createdAt"), 'YYYY-MM') as month, AVG(rr.value) as avg, COUNT(*)::int as n
      FROM reviews r
      JOIN review_ratings rr ON rr."reviewId" = r.id AND rr.category = 'OVERALL'
      WHERE r."institutionId" = ${institutionId} AND r.status = 'APPROVED'
        AND r."createdAt" >= NOW() - INTERVAL '6 months' AND r."createdAt" < ${publicCutoff()}
      GROUP BY 1 HAVING COUNT(*) >= ${MIN_BUCKET_SIZE} ORDER BY 1 ASC
    `,
  ]);

  const unansweredCount = totalReviews - respondedCount;
  const responseRate = totalReviews === 0 ? 0 : Math.round((respondedCount / totalReviews) * 100);
  const sentimentTotal = sentimentGroups.reduce((sum, g) => sum + g._count._all, 0) || 1;
  const sentimentBreakdown = {
    positive: Math.round(((sentimentGroups.find((g) => g.sentiment === 'POSITIVE')?._count._all ?? 0) / sentimentTotal) * 100),
    neutral: Math.round(((sentimentGroups.find((g) => g.sentiment === 'NEUTRAL')?._count._all ?? 0) / sentimentTotal) * 100),
    negative: Math.round(((sentimentGroups.find((g) => g.sentiment === 'NEGATIVE')?._count._all ?? 0) / sentimentTotal) * 100),
  };

  return {
    totalReviews,
    verifiedReviews,
    responseRate,
    unansweredCount,
    sentimentBreakdown,
    ratingTrend: monthlyRatings.map((m) => ({ month: m.month, average: Math.round(Number(m.avg) * 10) / 10 })),
  };
}

const TOPICS = ['Placement', 'Faculty', 'Hostel', 'Fees', 'Infrastructure', 'Administration', 'Campus Life'];

// Per-topic sentiment breakdown (spec §19: "Identify topics: Placement, Faculty,
// Hostel, Fees, Infrastructure, Administration, Campus Life"). Reviews are
// tagged with topics at submission time by the lexicon-based extractor in
// sentiment.service.ts; this just aggregates by topic + sentiment label.
export async function getSentimentByTopic(institutionId: string) {
  const reviews = await prisma.review.findMany({
    where: { institutionId, ...publicReviewWhere(), sentimentTopics: { isEmpty: false } },
    select: { sentiment: true, sentimentTopics: true },
  });

  return TOPICS.map((topic) => {
    const matching = reviews.filter((r) => r.sentimentTopics.includes(topic));
    const total = matching.length || 1;
    const countOf = (s: string) => matching.filter((r) => r.sentiment === s).length;
    return {
      topic,
      mentionCount: matching.length,
      positive: Math.round((countOf('POSITIVE') / total) * 100),
      neutral: Math.round((countOf('NEUTRAL') / total) * 100),
      negative: Math.round((countOf('NEGATIVE') / total) * 100),
    };
  }).filter((t) => t.mentionCount >= MIN_BUCKET_SIZE);
}
