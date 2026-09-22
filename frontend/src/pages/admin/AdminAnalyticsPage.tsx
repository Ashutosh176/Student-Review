import { useMutation, useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { adminApi } from '@/api/admin.api';
import { apiErrorMessage } from '@/api/client';
import { DashboardTopbar } from '@/layouts/DashboardLayout';
import { KpiCard } from '@/components/KpiCard';

export function AdminAnalyticsPage() {
  const query = useQuery({ queryKey: ['admin', 'analytics'], queryFn: adminApi.analytics });
  const recomputeMutation = useMutation({ mutationFn: adminApi.recomputeRankings });

  return (
    <div>
      <Helmet>
        <title>Platform Analytics — Admin — StudentReview</title>
      </Helmet>
      <DashboardTopbar
        crumb="Admin"
        title="Platform Analytics"
        right={
          <div className="flex flex-col items-end gap-1">
            <button className="btn btn-ghost btn-sm" onClick={() => recomputeMutation.mutate()} disabled={recomputeMutation.isPending}>
              {recomputeMutation.isPending ? 'Recomputing…' : recomputeMutation.isSuccess ? 'Rankings updated ✓' : 'Recompute rankings'}
            </button>
            {recomputeMutation.isError && (
              <p className="text-[11.5px] text-danger">{apiErrorMessage(recomputeMutation.error)}</p>
            )}
          </div>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Daily Active Users" value={query.data?.dailyActiveUsers ?? '—'} />
        <KpiCard label="New Users (7d)" value={query.data?.newUsers7d ?? '—'} />
        <KpiCard label="Reviews Approved (7d)" value={query.data?.reviewsApproved7d ?? '—'} />
        <KpiCard label="Reviews Rejected (7d)" value={query.data?.reviewsRejected7d ?? '—'} />
      </div>
    </div>
  );
}
