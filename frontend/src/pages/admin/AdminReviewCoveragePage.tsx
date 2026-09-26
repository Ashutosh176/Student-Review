import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import clsx from 'clsx';
import { adminApi, type ReviewCoverageRow } from '@/api/admin.api';
import { apiErrorMessage } from '@/api/client';
import { DashboardTopbar } from '@/layouts/DashboardLayout';
import { KpiCard } from '@/components/KpiCard';
import { CardSkeletonGrid, EmptyState, ErrorState } from '@/components/LoadingSkeleton';
import { ShareCollegeModal } from '@/components/ShareCollegeModal';
import { timeAgo } from '@/utils/formatDate';

// Outreach tracker: how far each college is from the target number of real,
// public student reviews, with a one-click invite link / QR for each. Counts
// are the same public numbers students see — nothing here creates reviews.
export function AdminReviewCoveragePage() {
  const [q, setQ] = useState('');
  const [belowOnly, setBelowOnly] = useState(true);
  const [sharing, setSharing] = useState<ReviewCoverageRow | null>(null);

  const query = useQuery({ queryKey: ['admin', 'review-coverage'], queryFn: () => adminApi.reviewCoverage() });

  const target = query.data?.target ?? 7;
  const needle = q.trim().toLowerCase();
  const rows = (query.data?.items ?? []).filter(
    (r) => (!belowOnly || r.reviewCount < target) && (!needle || r.name.toLowerCase().includes(needle) || r.location?.city.toLowerCase().includes(needle)),
  );

  return (
    <div>
      <Helmet>
        <title>Review coverage — Admin — StudentReview</title>
      </Helmet>
      <DashboardTopbar crumb="Admin" title="Review coverage" />

      <p className="mb-4 max-w-2xl text-[12.5px] text-sub">
        Real, publicly visible student reviews per college, against a target of {target}. Share a college's invite link or QR code
        with its students (class groups, alumni networks, campus ambassadors) to collect verified reviews where they're missing.
      </p>

      {query.data && (
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <KpiCard label="Colleges" value={query.data.totals.institutions.toLocaleString('en-IN')} />
          <KpiCard label={`At ${target}+ reviews`} value={query.data.totals.atTarget.toLocaleString('en-IN')} />
          <KpiCard label="No reviews yet" value={query.data.totals.withNoReviews.toLocaleString('en-IN')} />
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter by college or city…"
          className="w-full max-w-xs rounded-md border border-line px-2.5 py-1.5 text-[12.5px]"
        />
        <label className="flex items-center gap-1.5 text-[12.5px] text-sub">
          <input type="checkbox" checked={belowOnly} onChange={(e) => setBelowOnly(e.target.checked)} />
          Only colleges below target
        </label>
      </div>

      {query.isLoading && <CardSkeletonGrid count={4} />}
      {query.isError && <ErrorState message={apiErrorMessage(query.error)} onRetry={() => query.refetch()} />}
      {query.data && rows.length === 0 && (
        <EmptyState icon="🎯" title={belowOnly ? 'Every matching college has reached the target' : 'No colleges match'} />
      )}
      {rows.length > 0 && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-line text-left text-[11.5px] text-sub">
                <th className="px-3 py-2.5">College</th>
                <th className="px-3 py-2.5">Progress</th>
                <th className="px-3 py-2.5">Verified</th>
                <th className="px-3 py-2.5">Last review</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const pct = Math.min(100, Math.round((r.reviewCount / target) * 100));
                return (
                  <tr key={r.id} className="border-b border-line last:border-0">
                    <td className="px-3 py-2.5">
                      <Link to={`/college/${r.slug}`} className="font-semibold hover:text-brand">
                        {r.name}
                      </Link>
                      {r.location && <div className="text-[11.5px] text-sub">{r.location.city}, {r.location.state}</div>}
                    </td>
                    <td className="min-w-[160px] px-3 py-2.5">
                      <div className="mb-1 text-[11.5px]">
                        {r.reviewCount} / {target}
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-line">
                        <div
                          className={clsx('h-1.5 rounded-full', r.reviewCount >= target ? 'bg-success' : 'bg-brand')}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2.5">{r.verifiedCount}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-sub">{r.lastReviewAt ? timeAgo(r.lastReviewAt) : '—'}</td>
                    <td className="px-3 py-2.5 text-right">
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSharing(r)}>
                        Invite link / QR
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {sharing && <ShareCollegeModal open onClose={() => setSharing(null)} slug={sharing.slug} name={sharing.name} />}
    </div>
  );
}
