import type { SubscriptionPlan } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

// What a college's organization can use, by plan:
//   FREE      claim + edit the profile, reply to reviews, answer questions,
//             basic dashboard (review count, rating, unanswered reviews)
//   PRO       + Analytics (response rate, verified share, rating trend,
//             sentiment) and Sentiment by topic
//   BUSINESS  + job & internship listings, and listed first in the default
//             college listing order (institution.service listInstitutions)
//
// The plan is read from an ACTIVE subscription whose period hasn't ended,
// never from OrganizationProfile.plan alone: paid subscriptions have no
// expiry job, so the stored plan would otherwise outlive what was paid for.

const RANK: Record<SubscriptionPlan, number> = { FREE: 0, PRO: 1, BUSINESS: 2 };
const LABEL: Record<SubscriptionPlan, string> = { FREE: 'Free', PRO: 'Pro', BUSINESS: 'Business' };

function liveSubscriptionWhere(now: Date) {
  return {
    status: 'ACTIVE' as const,
    plan: { not: 'FREE' as const },
    OR: [{ currentPeriodEnd: null }, { currentPeriodEnd: { gt: now } }],
  };
}

export function planAtLeast(plan: SubscriptionPlan, minimum: SubscriptionPlan): boolean {
  return RANK[plan] >= RANK[minimum];
}

export function highestPlan(plans: SubscriptionPlan[]): SubscriptionPlan {
  return plans.reduce<SubscriptionPlan>((best, p) => (RANK[p] > RANK[best] ? p : best), 'FREE');
}

export async function effectivePlan(organizationProfileId: string, now = new Date()): Promise<SubscriptionPlan> {
  const subscriptions = await prisma.subscription.findMany({
    where: { organizationProfileId, ...liveSubscriptionWhere(now) },
    select: { plan: true },
  });
  return highestPlan(subscriptions.map((s) => s.plan));
}

// Throws a 403 the dashboard recognises (details.code PLAN_REQUIRED) and
// turns into an upgrade prompt.
export async function requirePlan(organizationProfileId: string, minimum: SubscriptionPlan, feature: string): Promise<SubscriptionPlan> {
  const plan = await effectivePlan(organizationProfileId);
  if (!planAtLeast(plan, minimum)) {
    throw new AppError(`${feature} is available on the ${LABEL[minimum]} plan.`, 403, {
      code: 'PLAN_REQUIRED',
      requiredPlan: minimum,
      currentPlan: plan,
    });
  }
  return plan;
}

export async function businessInstitutionIds(now = new Date()): Promise<Set<string>> {
  const subscriptions = await prisma.subscription.findMany({
    where: { ...liveSubscriptionWhere(now), plan: 'BUSINESS' },
    select: { organizationProfile: { select: { institutionId: true } } },
  });
  return new Set(subscriptions.map((s) => s.organizationProfile.institutionId));
}
