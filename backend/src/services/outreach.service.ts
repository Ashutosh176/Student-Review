import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { publicReviewWhere } from '../utils/publishing.js';
import { sendEmail } from './email.service.js';
import { firstReviewOutreachEmail } from './emailTemplates.js';
import { notifyWithEmail } from './notification.service.js';
import { getPlatformSettings } from './settings.service.js';

// First-review outreach. Runs hourly from server.ts, next to the rankings
// recompute. A college qualifies once its first review is PUBLICLY visible —
// i.e. approved (by moderation or an admin) and past its 12h publication batch
// — never at submission time, so a review that's later rejected never triggers
// an email. Each college is emailed at most once (status SENT is terminal).

export function parseOutreachEmails(raw: string | null | undefined): string[] {
  return (raw ?? '')
    .split(/[,;\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s));
}

async function notifyAdmins(title: string, body: string, link: string) {
  const admins = await prisma.user.findMany({ where: { roles: { some: { role: { name: 'ADMIN' } } } }, select: { id: true } });
  await Promise.all(
    admins.map((a) =>
      notifyWithEmail({ userId: a.id, type: 'SYSTEM', title, body, link, email: { paragraphs: [body], ctaLabel: 'Open in admin' } }).catch((err) =>
        logger.warn({ err, userId: a.id }, 'Failed to notify admin about outreach'),
      ),
    ),
  );
}

export async function runFirstReviewOutreach(): Promise<{ sent: number; needsContact: number; failed: number }> {
  const result = { sent: 0, needsContact: 0, failed: 0 };
  const settings = await getPlatformSettings();
  if (!settings.outreachEnabled) return result;

  const candidates = await prisma.institution.findMany({
    where: {
      status: 'APPROVED',
      claimed: false,
      OR: [{ firstReviewOutreachStatus: null }, { firstReviewOutreachStatus: 'NEEDS_CONTACT' }],
      reviews: { some: publicReviewWhere() },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      website: true,
      verified: true,
      outreachEmail: true,
      firstReviewOutreachStatus: true,
      reviews: {
        where: publicReviewWhere(),
        orderBy: { createdAt: 'asc' },
        take: 1,
        select: { type: true, relationship: true, verifiedStudent: true, recommend: true },
      },
    },
  });

  for (const inst of candidates) {
    const recipients = parseOutreachEmails(inst.outreachEmail);
    const firstReview = inst.reviews[0];
    if (!firstReview) continue;

    if (recipients.length === 0) {
      // Ask the admin once, then keep waiting silently until an address is added.
      if (inst.firstReviewOutreachStatus !== 'NEEDS_CONTACT') {
        await prisma.institution.update({ where: { id: inst.id }, data: { firstReviewOutreachStatus: 'NEEDS_CONTACT' } });
        await notifyAdmins(
          `First review is live for ${inst.name}: add an outreach email`,
          `${inst.name} just got its first public review. Add its official contact email in Admin → Colleges → Edit → "Outreach email" and the invitation (QR poster link and free Pro offer) will be sent automatically within the hour.`,
          `/admin/colleges`,
        );
        result.needsContact++;
      }
      continue;
    }

    const email = firstReviewOutreachEmail({
      institution: inst,
      firstReview,
      siteOrigin: env.clientOrigin,
      proOfferMonths: settings.outreachProOfferMonths,
      proPriceInr: settings.proPlanPriceInr,
      contact: { phone: settings.outreachContactPhone, email: settings.outreachContactEmail },
    });

    try {
      await sendEmail({
        to: recipients.join(', '),
        replyTo: settings.outreachContactEmail ?? undefined,
        subject: email.subject,
        text: email.text,
        html: email.html,
      });
    } catch (err) {
      // Leave the status as-is so the next hourly run retries.
      logger.error({ err, institutionId: inst.id }, 'First-review outreach email failed');
      result.failed++;
      continue;
    }

    await prisma.institution.update({
      where: { id: inst.id },
      data: {
        firstReviewOutreachStatus: 'SENT',
        firstReviewOutreachAt: new Date(),
        proOfferMonths: settings.outreachProOfferMonths > 0 ? settings.outreachProOfferMonths : null,
      },
    });
    await prisma.auditLog.create({
      data: { action: 'FIRST_REVIEW_OUTREACH_SENT', entityType: 'Institution', entityId: inst.id, metadata: { to: recipients, subject: email.subject } },
    });
    await notifyAdmins(
      `Outreach email sent to ${inst.name}`,
      `${inst.name}'s first review went live, so the invitation email (QR poster link and ${settings.outreachProOfferMonths} months of Pro free) was sent to ${recipients.join(', ')}.`,
      `/college/${inst.slug}`,
    );
    result.sent++;
  }

  return result;
}

// Called when an admin approves a claim. If that college was promised free Pro
// in its outreach email, activate it now (no payment) and consume the offer.
export async function grantOfferedPro(institutionId: string, organizationProfileId: string, claimantUserId: string) {
  const inst = await prisma.institution.findUnique({ where: { id: institutionId }, select: { name: true, proOfferMonths: true } });
  if (!inst?.proOfferMonths || inst.proOfferMonths <= 0) return null;

  const active = await prisma.subscription.findFirst({ where: { organizationProfileId, status: 'ACTIVE' } });
  if (active && active.plan !== 'FREE') return null; // already on a paid/complimentary plan

  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + inst.proOfferMonths);

  const subscription = await prisma.subscription.create({
    data: { organizationProfileId, plan: 'PRO', status: 'ACTIVE', currentPeriodEnd: periodEnd },
  });
  await prisma.organizationProfile.update({ where: { id: organizationProfileId }, data: { plan: 'PRO' } });
  await prisma.institution.update({ where: { id: institutionId }, data: { proOfferMonths: null } });

  const until = periodEnd.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  await notifyWithEmail({
    userId: claimantUserId,
    type: 'SYSTEM',
    title: `Your free Pro plan is active until ${until}`,
    body: `As promised, ${inst.name} is on the Pro plan free for ${inst.proOfferMonths} months.`,
    link: '/organization/settings',
    email: {
      paragraphs: [
        `As promised, ${inst.name} is now on the StudentReview Pro plan, free until ${until}. No payment is needed.`,
        'Pro adds advanced analytics and sentiment analysis to your organization dashboard. After the free period your profile simply continues on the Free plan.',
      ],
      ctaLabel: 'Open your dashboard',
    },
  }).catch((err) => logger.warn({ err, institutionId }, 'Failed to notify claimant about complimentary Pro'));

  return subscription;
}

// Complimentary subscriptions (no payment attached) end on their own when
// their period is over. Paid subscriptions are left alone here on purpose.
export async function expireComplimentarySubscriptions(): Promise<number> {
  const expired = await prisma.subscription.findMany({
    where: { status: 'ACTIVE', plan: { not: 'FREE' }, currentPeriodEnd: { lt: new Date() }, payments: { none: {} } },
    select: { id: true, organizationProfileId: true },
  });
  for (const s of expired) {
    await prisma.subscription.update({ where: { id: s.id }, data: { status: 'CANCELED' } });
    const stillActive = await prisma.subscription.count({ where: { organizationProfileId: s.organizationProfileId, status: 'ACTIVE', plan: { not: 'FREE' } } });
    if (stillActive === 0) await prisma.organizationProfile.update({ where: { id: s.organizationProfileId }, data: { plan: 'FREE' } });
  }
  return expired.length;
}
