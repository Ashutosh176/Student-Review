import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { organizationApi } from '@/api/organization.api';
import { apiErrorMessage } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { DashboardTopbar } from '@/layouts/DashboardLayout';
import { useOrgContext } from './OrgLayout';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/LoadingSkeleton';
import { timeAgo } from '@/utils/formatDate';
import { loadRazorpayScript } from '@/utils/razorpay';

// Prices come from the server (admin-configurable — AdminSettingsPage →
// Pricing) rather than being hardcoded here, so what's displayed always
// matches what Razorpay actually charges at checkout.
function plansFor(prices?: { pro: number; business: number }) {
  return [
    { id: 'FREE' as const, name: 'Free', price: '₹0', features: 'Claim profile · Basic management · Official responses' },
    {
      id: 'PRO' as const,
      name: 'Pro',
      price: prices ? `₹${prices.pro.toLocaleString('en-IN')}/mo` : '…',
      features: '+ Advanced analytics · Sentiment analysis · Competitor comparison',
    },
    {
      id: 'BUSINESS' as const,
      name: 'Business',
      price: prices ? `₹${prices.business.toLocaleString('en-IN')}/mo` : '…',
      features: '+ Job & internship listings · Featured placement',
    },
  ];
}

const STATUS_BADGE: Record<string, 'verified' | 'flagged' | 'pending'> = {
  PAID: 'verified',
  FAILED: 'flagged',
  REFUNDED: 'flagged',
  PENDING: 'pending',
};

export function OrgSettingsPage() {
  const org = useOrgContext();
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [pendingPlan, setPendingPlan] = useState<'PRO' | 'BUSINESS' | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const billingQuery = useQuery({ queryKey: ['organization', 'billing'], queryFn: organizationApi.billing });
  const planPricesQuery = useQuery({ queryKey: ['organization', 'plan-prices'], queryFn: organizationApi.planPrices, staleTime: 5 * 60 * 1000 });
  const PLANS = plansFor(planPricesQuery.data);

  const verifyMutation = useMutation({
    mutationFn: organizationApi.verifyPayment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['organization', 'me'] });
      qc.invalidateQueries({ queryKey: ['organization', 'billing'] });
    },
  });

  async function upgrade(plan: 'PRO' | 'BUSINESS') {
    setCheckoutError(null);
    setPendingPlan(plan);
    try {
      const [order, scriptLoaded] = await Promise.all([organizationApi.checkout(plan), loadRazorpayScript()]);
      if (!scriptLoaded) throw new Error('Could not load the Razorpay checkout script.');

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'StudentReview',
        description: `${plan} plan — ${org.institution.name}`,
        order_id: order.orderId,
        prefill: { email: user?.email },
        theme: { color: '#2f3a8f' },
        handler: (response) => {
          verifyMutation.mutate({
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });
        },
        modal: { ondismiss: () => setPendingPlan(null) },
      });
      checkout.open();
    } catch (err) {
      setCheckoutError(apiErrorMessage(err));
      setPendingPlan(null);
    }
  }

  const razorpayEnabled = billingQuery.data?.razorpayEnabled ?? true;

  return (
    <div>
      <Helmet>
        <title>Settings — Organization — StudentReview</title>
      </Helmet>
      <DashboardTopbar crumb="Organization" title="Settings — Subscription" />

      {!razorpayEnabled && (
        <div className="card mb-3.5 bg-warning-bg text-[12.5px] text-warning">
          ⚠ Razorpay test keys aren't configured on this server yet. Add RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET to backend/.env to
          enable checkout.
        </div>
      )}
      {checkoutError && <p className="mb-3 text-xs text-danger">{checkoutError}</p>}

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        {PLANS.map((p) => {
          const isCurrent = org.organization.plan === p.id;
          const isPaid = p.id !== 'FREE';
          const canUpgrade = isPaid && !isCurrent && org.role !== 'EDITOR';
          return (
            <div key={p.id} className={isCurrent ? 'card border-brand ring-2 ring-brand-light' : 'card'}>
              <h4 className="mb-1.5 text-sm">
                {p.name} {isCurrent && <span className="text-[10.5px] text-brand">Current plan</span>}
              </h4>
              <div className="mb-2.5 font-heading text-xl font-extrabold">{p.price}</div>
              <p className="mb-3 text-xs text-sub">{p.features}</p>
              {canUpgrade && (
                <button
                  className="btn btn-primary btn-sm w-full justify-center"
                  disabled={!razorpayEnabled || pendingPlan === p.id}
                  onClick={() => upgrade(p.id as 'PRO' | 'BUSINESS')}
                >
                  {pendingPlan === p.id ? 'Opening checkout…' : `Upgrade to ${p.name}`}
                </button>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-3.5 text-[11.5px] text-sub">No plan can remove or hide legitimate reviews. Moderation is only for policy violations.</p>
      {billingQuery.data?.razorpayMode === 'test' && (
        <p className="mt-1 mb-4.5 text-[11.5px] text-sub">
          Checkout runs on Razorpay <strong>test mode</strong> — use their published test card/UPI credentials, no real money moves.
        </p>
      )}

      <div className="card">
        <h4 className="mb-3 text-sm">Billing history</h4>
        {billingQuery.data?.payments.length === 0 && <EmptyState icon="🧾" title="No payments yet" />}
        {billingQuery.data && billingQuery.data.payments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-line text-left text-[11.5px] text-sub">
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Amount</th>
                  <th className="py-2 pr-3">Provider</th>
                  <th className="py-2 pr-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {billingQuery.data.payments.map((p) => (
                  <tr key={p.id} className="border-b border-line last:border-0">
                    <td className="py-2 pr-3">{timeAgo(p.createdAt)}</td>
                    <td className="py-2 pr-3">
                      ₹{(p.amount / 100).toLocaleString('en-IN')} {p.currency}
                    </td>
                    <td className="py-2 pr-3 capitalize">{p.provider}</td>
                    <td className="py-2 pr-3">
                      <Badge kind={STATUS_BADGE[p.status] ?? 'pending'}>{p.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
