import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { guidesApi } from '@/api/guides.api';
import { apiErrorMessage } from '@/api/client';
import { CardSkeletonGrid, ErrorState } from '@/components/LoadingSkeleton';
import { guidesIndexSeo } from '@/lib/seo/siteSeo';

export function GuidesIndexPage() {
  const query = useQuery({ queryKey: ['guides'], queryFn: guidesApi.list, staleTime: 60 * 60 * 1000 });
  const origin = window.location.origin;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-7">
      <Helmet>
        <title>{guidesIndexSeo.title}</title>
        <meta name="description" content={guidesIndexSeo.description} />
        <link rel="canonical" href={`${origin}/guides`} />
      </Helmet>
      <h1 className="mb-2 text-2xl">Guides</h1>
      <p className="mb-8 text-sm leading-relaxed text-sub">
        Practical, no-nonsense guides to choosing a college in India: what to check, what to ask, and how to read what you find.
      </p>

      {query.isLoading && <CardSkeletonGrid count={4} />}
      {query.isError && <ErrorState message={apiErrorMessage(query.error)} onRetry={() => query.refetch()} />}
      {query.data && (
        <div className="flex flex-col gap-3">
          {query.data.map((g) => (
            <Link key={g.slug} to={`/guides/${g.slug}`} className="card block transition-shadow hover:shadow-card">
              <h2 className="mb-1 text-base font-bold text-ink">{g.title}</h2>
              <p className="text-[13px] leading-relaxed text-sub">{g.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
