import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { organizationApi } from '@/api/organization.api';
import { DashboardTopbar } from '@/layouts/DashboardLayout';
import { KpiCard } from '@/components/KpiCard';
import { EmptyState } from '@/components/LoadingSkeleton';

function trendPath(values: number[]): string {
  if (values.length === 0) return '';
  const max = Math.max(...values, 5);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = 480 / Math.max(1, values.length - 1);
  return values.map((v, i) => `${i * stepX},${130 - ((v - min) / range) * 120 - 5}`).join(' ');
}

export function OrgAnalyticsPage() {
  const query = useQuery({ queryKey: ['organization', 'analytics'], queryFn: organizationApi.analytics });

  return (
    <div>
      <Helmet>
        <title>Analytics — Organization — StudentReview</title>
      </Helmet>
      <DashboardTopbar crumb="Organization" title="Analytics" />
      <div className="mb-4.5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Total reviews" value={query.data?.totalReviews ?? '—'} />
        <KpiCard label="Verified reviews" value={query.data?.verifiedReviews ?? '—'} />
        <KpiCard label="Sentiment (positive)" value={`${query.data?.sentimentBreakdown.positive ?? 0}%`} trend="of classified reviews" trendKind="up" />
        <KpiCard label="Response rate" value={`${query.data?.responseRate ?? 0}%`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="card">
          <h4 className="mb-3 text-sm">Overall rating over time</h4>
          {query.data && query.data.ratingTrend.length > 1 ? (
            <>
              <svg viewBox="0 0 480 130" className="h-[130px] w-full">
                <polyline points={trendPath(query.data.ratingTrend.map((t) => t.average))} fill="none" stroke="#2A3B7C" strokeWidth={3} />
              </svg>
              <p className="mt-2 text-xs text-sub">
                Your overall rating {query.data.ratingTrend[query.data.ratingTrend.length - 1].average >= query.data.ratingTrend[0].average ? 'increased' : 'decreased'} from{' '}
                {query.data.ratingTrend[0].average.toFixed(1)} to {query.data.ratingTrend[query.data.ratingTrend.length - 1].average.toFixed(1)} over the last 6 months.
              </p>
            </>
          ) : (
            <EmptyState icon="📈" title="Not enough data yet" description="Rating trends appear once reviews span multiple months." />
          )}
        </div>
        <div className="card">
          <h4 className="mb-3 text-sm">Sentiment</h4>
          {query.data && (
            <>
              <div className="mb-2.5 flex h-2.5 overflow-hidden rounded-full">
                <div className="bg-success" style={{ width: `${query.data.sentimentBreakdown.positive}%` }} />
                <div className="bg-line" style={{ width: `${query.data.sentimentBreakdown.neutral}%` }} />
                <div className="bg-danger" style={{ width: `${query.data.sentimentBreakdown.negative}%` }} />
              </div>
              <div className="text-xs text-sub">
                Positive {query.data.sentimentBreakdown.positive}% · Neutral {query.data.sentimentBreakdown.neutral}% · Negative{' '}
                {query.data.sentimentBreakdown.negative}%
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
