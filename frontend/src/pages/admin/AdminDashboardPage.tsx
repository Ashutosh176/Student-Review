import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { adminApi } from '@/api/admin.api';
import { DashboardTopbar } from '@/layouts/DashboardLayout';
import { KpiCard } from '@/components/KpiCard';

export function AdminDashboardPage() {
  const query = useQuery({ queryKey: ['admin', 'dashboard'], queryFn: adminApi.dashboard });

  return (
    <div>
      <Helmet>
        <title>Admin Dashboard — StudentReview</title>
      </Helmet>
      <DashboardTopbar crumb="Admin" title="Platform Dashboard" />
      <div className="mb-4.5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <KpiCard label="Total Users" value={query.data?.totalUsers.toLocaleString('en-IN') ?? '—'} />
        <KpiCard label="Total Reviews" value={query.data?.totalReviews.toLocaleString('en-IN') ?? '—'} />
        <KpiCard label="Pending Moderation" value={query.data?.pendingModeration ?? '—'} trend={query.data?.pendingModeration ? 'Needs review' : undefined} trendKind="warn" />
        <Link to="/admin/colleges?status=PENDING">
          <KpiCard
            label="Pending Colleges"
            value={query.data?.pendingInstitutions ?? '—'}
            trend={query.data?.pendingInstitutions ? 'Needs review' : undefined}
            trendKind="warn"
          />
        </Link>
        <KpiCard label="Reports (24h)" value={query.data?.reportsLast24h ?? '—'} />
      </div>
      <div className="card">
        <h4 className="mb-3 text-sm">Top institutions by reviews</h4>
        {query.data && query.data.topInstitutions.length === 0 && <p className="text-[12.5px] text-sub">No institutions yet.</p>}
        {query.data?.topInstitutions.map((t, i) => (
          <div key={i} className="flex justify-between border-b border-line py-2 text-[12.5px] last:border-0">
            <span>{t.name}</span>
            <b>{t.reviews}</b>
          </div>
        ))}
      </div>
    </div>
  );
}
