import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import clsx from 'clsx';
import { Helmet } from 'react-helmet-async';
import { rankingsApi, type RankingMetric } from '@/api/rankings.api';
import { EmptyState, ErrorState } from '@/components/LoadingSkeleton';

const TABS: { slug: string; metric: RankingMetric; label: string }[] = [
  { slug: '', metric: 'OVERALL', label: 'Top Rated' },
  { slug: 'placements', metric: 'PLACEMENT', label: 'Best Placement' },
  { slug: 'faculty', metric: 'FACULTY', label: 'Best Faculty' },
  { slug: 'campus-life', metric: 'CAMPUS_LIFE', label: 'Best Campus Life' },
  { slug: 'value-for-money', metric: 'VALUE_FOR_MONEY', label: 'Best Value for Money' },
  { slug: 'most-reviewed', metric: 'MOST_REVIEWED', label: 'Most Reviewed' },
  { slug: 'trending', metric: 'TRENDING', label: 'Trending' },
];

export function RankingsPage() {
  const { metric: metricSlug } = useParams();
  const active = TABS.find((t) => t.slug === (metricSlug ?? '')) ?? TABS[0];

  const query = useQuery({ queryKey: ['rankings', active.metric], queryFn: () => rankingsApi.get(active.metric, 25) });

  return (
    <div className="px-4 py-6 sm:px-7">
      <Helmet>
        <title>{active.label} Colleges in India — Rankings & Reviews — StudentReview</title>
        <meta
          name="description"
          content={`${active.label} colleges in India, ranked from verified student reviews. See which institutions students rate highest for ${active.label.toLowerCase()}.`}
        />
        <link rel="canonical" href={`${window.location.origin}/rankings${metricSlug ? `/${metricSlug}` : ''}`} />
      </Helmet>
      <div className="mb-1.5 flex flex-wrap items-end justify-between gap-2">
        <h1 className="text-xl">{active.label} Colleges — India</h1>
        <Link to="/about" className="text-[12.5px] font-semibold text-brand">
          How rankings work →
        </Link>
      </div>
      <p className="mb-4.5 text-[13px] text-sub">Weighted by verified-review volume and recency, not a raw average.</p>

      <div className="mb-5 flex gap-1.5 overflow-x-auto">
        {TABS.map((t) => (
          <Link
            key={t.slug}
            to={t.slug ? `/rankings/${t.slug}` : '/rankings'}
            className={clsx(
              'flex-none whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold',
              t.metric === active.metric ? 'border-brand bg-brand text-white' : 'border-line text-sub',
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {query.isError && <ErrorState />}
      {query.data && query.data.length === 0 && (
        <EmptyState title="Not enough data yet" description="This ranking needs more reviews before institutions become eligible." />
      )}
      {query.data && query.data.length > 0 && (
        <div className="overflow-x-auto rounded-card border border-line bg-white">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-line text-left text-[11.5px] font-semibold text-sub">
                <th className="w-10 px-2 py-2.5">#</th>
                <th className="px-2 py-2.5">College</th>
                <th className="px-2 py-2.5">Location</th>
                <th className="px-2 py-2.5">Score</th>
              </tr>
            </thead>
            <tbody>
              {query.data.map((row) => (
                <tr key={row.institution.id} className="border-b border-line last:border-0">
                  <td className="px-2 py-2.5 font-semibold">{row.rank}</td>
                  <td className="px-2 py-2.5">
                    <Link to={`/college/${row.institution.slug}`} className="flex items-center gap-2 font-semibold hover:text-brand">
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-light font-heading text-[10px] font-bold text-brand">
                        {row.institution.name.slice(0, 2).toUpperCase()}
                      </span>
                      {row.institution.name}
                    </Link>
                  </td>
                  <td className="px-2 py-2.5 text-sub">{row.institution.location ? `${row.institution.location.city}, ${row.institution.location.state}` : '—'}</td>
                  <td className="px-2 py-2.5 font-semibold">{row.score.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
