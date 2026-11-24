import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { organizationApi } from '@/api/organization.api';
import { DashboardTopbar } from '@/layouts/DashboardLayout';
import { KpiCard } from '@/components/KpiCard';
import { EmptyState } from '@/components/LoadingSkeleton';
import { PRO_FEATURES, UpgradePrompt } from '@/components/UpgradePrompt';

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
  const data = query.data && !query.data.locked ? query.data : undefined;

  if (query.data?.locked) {
    return (
      <div>
        <Helmet>
          <title>Analytics — Organization — StudentReview</title>
        </Helmet>
        <DashboardTopbar crumb="Organization" title="Analytics" />
        <UpgradePrompt plan="Pro" title="See how students feel about your college, and how that changes over time" features={PRO_FEATURES} />
      </div>
    );
  }

  return (
    <div>
      <Helmet>
        <title>Analytics — Organization — StudentReview</title>
      </Helmet>
      <DashboardTopbar crumb="Organization" title="Analytics" />
      <div className="mb-4.5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Total reviews" value={data?.totalReviews ?? '—'} />
        <KpiCard label="Verified reviews" value={data?.verifiedReviews ?? '—'} />
        <KpiCard label="Sentiment (positive)" value={`${data?.sentimentBreakdown?.positive ?? 0}%`} trend="of classified reviews" trendKind="up" />
        <KpiCard label="Response rate" value={`${data?.responseRate ?? 0}%`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="card">
          <h4 className="mb-3 text-sm">Overall rating over time</h4>
          {data?.ratingTrend && data.ratingTrend.length > 1 ? (
            <>
              <svg viewBox="0 0 480 130" className="h-[130px] w-full">
                <polyline points={trendPath(data.ratingTrend.map((t) => t.average))} fill="none" stroke="#2A3B7C" strokeWidth={3} />
              </svg>
              <p className="mt-2 text-xs text-sub">
                Your overall rating {data.ratingTrend[data.ratingTrend.length - 1].average >= data.ratingTrend[0].average ? 'increased' : 'decreased'} from{' '}
                {data.ratingTrend[0].average.toFixed(1)} to {data.ratingTrend[data.ratingTrend.length - 1].average.toFixed(1)} over the last 6 months.
              </p>
            </>
          ) : (
            <EmptyState icon="📈" title="Not enough data yet" description="Rating trends appear once reviews span multiple months." />
          )}
        </div>
        <div className="card">
          <h4 className="mb-3 text-sm">Sentiment</h4>
          {data?.sentimentBreakdown && (
            <>
              <div className="mb-2.5 flex h-2.5 overflow-hidden rounded-full">
                <div className="bg-success" style={{ width: `${data.sentimentBreakdown.positive}%` }} />
                <div className="bg-line" style={{ width: `${data.sentimentBreakdown.neutral}%` }} />
                <div className="bg-danger" style={{ width: `${data.sentimentBreakdown.negative}%` }} />
              </div>
              <div className="text-xs text-sub">
                Positive {data.sentimentBreakdown.positive}% · Neutral {data.sentimentBreakdown.neutral}% · Negative{' '}
                {data.sentimentBreakdown.negative}%
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
