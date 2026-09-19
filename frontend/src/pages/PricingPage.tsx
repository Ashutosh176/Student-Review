import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { organizationApi } from '@/api/organization.api';

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export function PricingPage() {
  const prices = useQuery({ queryKey: ['public-plan-prices'], queryFn: organizationApi.publicPlanPrices, staleTime: 5 * 60 * 1000 });

  const plans = [
    { name: 'Free', price: '₹0', period: 'forever', features: ['Claim your official profile', 'Basic profile management', 'Publish official responses to reviews'] },
    {
      name: 'Pro',
      price: prices.data ? inr(prices.data.pro) : '…',
      period: 'per 30 days',
      features: ['Everything in Free', 'Advanced analytics', 'Sentiment analysis by topic', 'Competitor comparison'],
    },
    {
      name: 'Business',
      price: prices.data ? inr(prices.data.business) : '…',
      period: 'per 30 days',
      features: ['Everything in Pro', 'Job & internship listings', 'Featured placement in search'],
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-7">
      <Helmet>
        <title>Pricing — StudentReview</title>
        <meta name="description" content="StudentReview is free for students. Institutions can claim a free profile or upgrade to Pro or Business." />
      </Helmet>
      <h1 className="mb-2 text-2xl">Pricing</h1>
      <p className="mb-6 max-w-2xl text-sm text-sub">
        StudentReview is <strong>free for students</strong> — reading and writing reviews never costs anything. The plans below are for institutions
        that want to manage their profile. No plan, at any price, can remove a legitimate review.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        {plans.map((p) => (
          <div key={p.name} className="card flex flex-col">
            <h2 className="text-base">{p.name}</h2>
            <p className="mt-2 text-2xl font-bold">{p.price}</p>
            <p className="mb-3 text-xs text-sub">{p.period} · INR, incl. applicable taxes</p>
            <ul className="mb-4 ml-4 list-disc text-[13px] text-sub">
              {p.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <Link to="/colleges" className="btn btn-primary mt-auto justify-center">
              {p.name === 'Free' ? 'Claim your profile' : `Get ${p.name}`}
            </Link>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-sub">
        Paid plans are a one-time payment for 30 days through Razorpay and do not renew automatically. See our{' '}
        <Link to="/refund-policy" className="font-semibold text-brand">Refund &amp; Cancellation Policy</Link>.
      </p>
    </div>
  );
}
