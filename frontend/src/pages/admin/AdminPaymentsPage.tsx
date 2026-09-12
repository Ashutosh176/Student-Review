import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { adminApi } from '@/api/admin.api';
import { DashboardTopbar } from '@/layouts/DashboardLayout';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/LoadingSkeleton';
import { timeAgo } from '@/utils/formatDate';

const STATUS_BADGE: Record<string, 'verified' | 'flagged' | 'pending'> = {
  PAID: 'verified',
  FAILED: 'flagged',
  REFUNDED: 'flagged',
  PENDING: 'pending',
};

export function AdminPaymentsPage() {
  const query = useQuery({ queryKey: ['admin', 'payments'], queryFn: () => adminApi.payments({ pageSize: 50 }) });

  return (
    <div>
      <Helmet>
        <title>Payments — Admin — StudentReview</title>
      </Helmet>
      <DashboardTopbar crumb="Admin" title="Payments" />
      <div className="card mb-3.5 bg-warning-bg text-[12.5px] text-warning">
        ⚠ Razorpay is wired in <strong>test mode</strong> — transactions below use test cards/UPI, no real money moves.
      </div>
      {query.data && query.data.items.length === 0 && <EmptyState icon="🧾" title="No transactions yet" />}
      {query.data && query.data.items.length > 0 && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-line text-left text-[11.5px] text-sub">
                <th className="px-3 py-2.5">Organization</th>
                <th className="px-3 py-2.5">Plan</th>
                <th className="px-3 py-2.5">Amount</th>
                <th className="px-3 py-2.5">Provider</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Date</th>
              </tr>
            </thead>
            <tbody>
              {query.data.items.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="px-3 py-2.5">{p.subscription.organizationProfile.institution.name}</td>
                  <td className="px-3 py-2.5">{p.subscription.plan}</td>
                  <td className="px-3 py-2.5">
                    ₹{(p.amount / 100).toLocaleString('en-IN')} {p.currency}
                  </td>
                  <td className="px-3 py-2.5 capitalize">{p.provider}</td>
                  <td className="px-3 py-2.5">
                    <Badge kind={STATUS_BADGE[p.status] ?? 'pending'}>{p.status}</Badge>
                  </td>
                  <td className="px-3 py-2.5">{timeAgo(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
