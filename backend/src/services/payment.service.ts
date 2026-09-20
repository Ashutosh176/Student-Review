import crypto from 'node:crypto';
import type { SubscriptionPlan } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { razorpay, razorpayEnabled, razorpayMode } from '../config/razorpay.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../config/logger.js';
import { notify } from './notification.service.js';
import { getPlatformSettings } from './settings.service.js';

type PaidPlan = 'PRO' | 'BUSINESS';

// Admin-configurable (AdminSettingsPage → Pricing, backed by
// PlatformSettings.{pro,business}PlanPriceInr — plain rupees). Converted to
// paise (Razorpay's smallest INR unit) only here, at the order boundary.
async function planAmountPaise(plan: PaidPlan): Promise<number> {
  const settings = await getPlatformSettings();
  const rupees = plan === 'PRO' ? settings.proPlanPriceInr : settings.businessPlanPriceInr;
  return rupees * 100;
}

const BILLING_PERIOD_DAYS = 30;

function requireRazorpay() {
  if (!razorpayEnabled || !razorpay) {
    throw AppError.badRequest(
      'Payments are not configured on this server. Add RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET (test mode) to backend/.env.',
    );
  }
  return razorpay;
}

export async function createCheckoutOrder(organizationProfileId: string, plan: PaidPlan) {
  const client = requireRazorpay();
  const amount = await planAmountPaise(plan);

  // Razorpay caps `receipt` at 40 chars — a full UUID + timestamp is 54.
  const receipt = `org_${organizationProfileId.replace(/-/g, '').slice(0, 20)}_${Date.now()}`;
  let order;
  try {
    order = await client.orders.create({ amount, currency: 'INR', receipt, notes: { organizationProfileId, plan } });
  } catch (err) {
    // The Razorpay SDK rejects with a plain object ({ statusCode, error: { code, description } }),
    // not an Error — surface its reason instead of an anonymous 500.
    const e = err as { statusCode?: number; error?: { code?: string; description?: string; reason?: string } };
    logger.error({ statusCode: e?.statusCode, code: e?.error?.code, description: e?.error?.description, reason: e?.error?.reason }, 'Razorpay order creation failed');
    throw new AppError(`Payment provider error: ${e?.error?.description ?? 'could not create the order'}`, 502);
  }

  return { orderId: order.id, amount, currency: 'INR', keyId: env.razorpay.keyId, plan };
}

// timingSafeEqual throws RangeError on mismatched buffer lengths rather than
// returning false — an attacker-controlled signature of the "wrong" length
// would otherwise surface as an unhandled 500 instead of a clean rejection.
function safeEqualHex(expectedHex: string, actualHex: string): boolean {
  const expected = Buffer.from(expectedHex);
  const actual = Buffer.from(actualHex);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function verifySignature(orderId: string, paymentId: string, signature: string): boolean {
  if (!env.razorpay.keySecret) return false; // an empty HMAC key is forgeable
  const expected = crypto.createHmac('sha256', env.razorpay.keySecret).update(`${orderId}|${paymentId}`).digest('hex');
  return safeEqualHex(expected, signature);
}

// The client tells us which order/payment/signature to check, but never the
// plan or org — those are read back from the order we created on Razorpay's
// side (via `notes`), so a tampered request body can't buy a different plan.
async function readOrderContext(orderId: string): Promise<{ organizationProfileId: string; plan: PaidPlan; amount: number }> {
  const client = requireRazorpay();
  const order = await client.orders.fetch(orderId);
  const organizationProfileId = order.notes?.organizationProfileId as string | undefined;
  const plan = order.notes?.plan as PaidPlan | undefined;
  if (!organizationProfileId || !plan) throw AppError.badRequest('Unrecognized order');
  // The order's own amount, not a fresh planAmountPaise() read — the price
  // may have changed in admin settings between order creation and this
  // verify call, but what actually got charged on Razorpay's side hasn't.
  return { organizationProfileId, plan, amount: Number(order.amount) };
}

async function activateSubscription(organizationProfileId: string, plan: SubscriptionPlan, amount: number, razorpayPaymentId: string) {
  // A webhook and the client's post-checkout verify call can both race to
  // report the same payment — the provider+providerRef check keeps this idempotent.
  const existing = await prisma.payment.findFirst({ where: { provider: 'razorpay', providerRef: razorpayPaymentId } });
  if (existing) return prisma.subscription.findUniqueOrThrow({ where: { id: existing.subscriptionId } });

  const current = await prisma.subscription.findFirst({ where: { organizationProfileId }, orderBy: { createdAt: 'desc' } });
  const periodEnd = new Date(Date.now() + BILLING_PERIOD_DAYS * 24 * 60 * 60 * 1000);

  const subscription =
    current && current.plan === plan && current.status === 'ACTIVE'
      ? await prisma.subscription.update({ where: { id: current.id }, data: { currentPeriodEnd: periodEnd } })
      : await prisma.subscription.create({ data: { organizationProfileId, plan, status: 'ACTIVE', currentPeriodEnd: periodEnd } });

  if (current && current.id !== subscription.id && current.status === 'ACTIVE') {
    await prisma.subscription.update({ where: { id: current.id }, data: { status: 'CANCELED' } });
  }

  await prisma.payment.create({
    data: { subscriptionId: subscription.id, amount, currency: 'INR', status: 'PAID', provider: 'razorpay', providerRef: razorpayPaymentId },
  });
  await prisma.organizationProfile.update({ where: { id: organizationProfileId }, data: { plan } });

  const owner = await prisma.organizationMember.findFirst({ where: { organizationProfileId, role: 'OWNER' } });
  if (owner?.userId) {
    await notify(owner.userId, 'SYSTEM', 'Payment successful', `Your organization is now on the ${plan} plan.`, '/organization/settings');
  }

  return subscription;
}

export async function verifyCheckoutPayment(input: { orderId: string; paymentId: string; signature: string }) {
  if (!verifySignature(input.orderId, input.paymentId, input.signature)) {
    throw AppError.badRequest('Payment signature verification failed');
  }
  const { organizationProfileId, plan, amount } = await readOrderContext(input.orderId);
  const subscription = await activateSubscription(organizationProfileId, plan, amount, input.paymentId);
  return { subscription, plan };
}

// Reconciliation safety net for cases where the browser never calls /verify
// (tab closed mid-checkout, network drop). Requires a public HTTPS URL
// registered in the Razorpay dashboard — not reachable from plain localhost.
export async function handleWebhookEvent(rawBody: Buffer, signatureHeader: string | undefined) {
  if (!env.razorpay.webhookSecret) throw AppError.badRequest('Webhook secret not configured');
  if (!signatureHeader) throw AppError.badRequest('Missing webhook signature');

  const expected = crypto.createHmac('sha256', env.razorpay.webhookSecret).update(rawBody).digest('hex');
  if (!safeEqualHex(expected, signatureHeader)) {
    throw AppError.badRequest('Invalid webhook signature');
  }

  const event = JSON.parse(rawBody.toString('utf8'));
  if (event.event !== 'payment.captured') return { handled: false };

  const payment = event.payload?.payment?.entity;
  if (!payment?.order_id || !payment?.id) return { handled: false };

  const { organizationProfileId, plan } = await readOrderContext(payment.order_id);
  await activateSubscription(organizationProfileId, plan, payment.amount, payment.id);
  return { handled: true };
}

// Rupees, not paise — for display on OrgSettingsPage's plan cards, so the
// price shown before checkout always matches what createCheckoutOrder will
// actually charge (both read the same PlatformSettings row).
export async function planPrices() {
  const settings = await getPlatformSettings();
  return { pro: settings.proPlanPriceInr, business: settings.businessPlanPriceInr };
}

export async function getBillingInfo(organizationProfileId: string) {
  const [subscription, payments] = await Promise.all([
    prisma.subscription.findFirst({ where: { organizationProfileId, status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } }),
    prisma.payment.findMany({
      where: { subscription: { organizationProfileId } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);
  return { subscription, payments, razorpayEnabled, razorpayMode };
}
