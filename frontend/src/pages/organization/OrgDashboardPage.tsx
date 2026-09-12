import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { organizationApi } from '@/api/organization.api';
import { DashboardTopbar } from '@/layouts/DashboardLayout';
import { KpiCard } from '@/components/KpiCard';
import { Stars } from '@/components/Stars';
import { useOrgContext } from './OrgLayout';
import { Link } from 'react-router-dom';

export function OrgDashboardPage() {
  const org = useOrgContext();
  const analyticsQuery = useQuery({ queryKey: ['organization', 'analytics'], queryFn: organizationApi.analytics });
  const overall = org.institution.summary.ratings.find((r) => r.category === 'OVERALL');

  return (
    <div>
      <Helmet>
        <title>Organization Dashboard — StudentReview</title>
      </Helmet>
      <DashboardTopbar crumb="Organization" title="Dashboard" />
      <div className="mb-4.5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Total Reviews" value={analyticsQuery.data?.totalReviews ?? '—'} />
        <KpiCard label="Average Rating" value={(overall?.average ?? 0).toFixed(1)} />
        <KpiCard label="Response Rate" value={`${analyticsQuery.data?.responseRate ?? 0}%`} />
        <KpiCard
          label="Unanswered Reviews"
          value={analyticsQuery.data?.unansweredCount ?? '—'}
          trend={analyticsQuery.data?.unansweredCount ? 'Needs attention' : undefined}
          trendKind="warn"
        />
      </div>
      <div className="card">
        <h4 className="mb-3 text-sm">Institution summary</h4>
        <div className="flex items-center gap-3">
          <Stars value={overall?.average ?? 0} size="text-base" />
          <span>{(overall?.average ?? 0).toFixed(1)}</span>
          <span className="text-xs text-sub">· {org.institution.summary.reviewCount} reviews</span>
        </div>
        <Link to="/organization/reviews" className="mt-3 inline-block text-[12.5px] font-semibold text-brand">
          Respond to reviews →
        </Link>
      </div>
    </div>
  );
}
