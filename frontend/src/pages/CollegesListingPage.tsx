import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { institutionsApi } from '@/api/institutions.api';
import { apiErrorMessage } from '@/api/client';
import { CollegeCard } from '@/components/CollegeCard';
import { CollegeFilters, EMPTY_FILTERS } from '@/components/CollegeFilters';
import { SearchBar } from '@/components/SearchBar';
import { CardSkeletonGrid, EmptyState, ErrorState } from '@/components/LoadingSkeleton';
import { collegesListingSeo } from '@/lib/seo/siteSeo';

export function CollegesListingPage() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<'relevant' | 'rating' | 'reviews' | 'name'>('reviews');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [slowLoad, setSlowLoad] = useState(false);
  const pageSize = 16;

  useEffect(() => setPage(1), [sort, filters]);

  const query = useQuery({
    queryKey: ['institutions', 'listing', page, sort, filters],
    queryFn: () =>
      institutionsApi.list({
        page,
        pageSize,
        sort,
        state: filters.state || undefined,
        city: filters.city || undefined,
        course: filters.course || undefined,
        type: filters.type || undefined,
        categorySlug: filters.categorySlug || undefined,
        verifiedOnly: filters.verifiedOnly || undefined,
      }),
  });

  const totalPages = query.data ? Math.max(1, Math.ceil(query.data.total / pageSize)) : 1;

  // The backend can be cold (Render free tier spins down when idle) and take
  // a while to answer the very first request — after a few seconds, say so
  // instead of leaving a bare skeleton that looks stuck or broken.
  useEffect(() => {
    if (!query.isLoading) {
      setSlowLoad(false);
      return;
    }
    const timer = setTimeout(() => setSlowLoad(true), 4000);
    return () => clearTimeout(timer);
  }, [query.isLoading]);

  return (
    <div className="px-4 py-6 sm:px-7">
      <Helmet>
        <title>{collegesListingSeo.title}</title>
        <meta name="description" content={collegesListingSeo.description} />
        <link rel="canonical" href={`${window.location.origin}/colleges`} />
      </Helmet>
      <div className="mb-4.5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl">College Reviews — All Colleges</h1>
          <p className="mt-1 text-[13px] text-sub">Browse institutions across India</p>
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value as never)} className="rounded-md border border-line px-2 py-1.5 text-[12.5px]">
          <option value="reviews">Sort: Most reviewed</option>
          <option value="rating">Sort: Highest rated</option>
          <option value="name">Sort: Name (A-Z)</option>
        </select>
      </div>

      <SearchBar variant="page" className="mb-5" />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-[220px_1fr]">
        <CollegeFilters value={filters} onChange={setFilters} />

        <div>
          <p className="mb-3 text-[12.5px] text-sub">{query.data?.total ?? 0} colleges</p>
          {query.isLoading && (
            <>
              {slowLoad && (
                <p className="mb-3 text-[12.5px] text-sub">
                  Still loading — the server may be waking up after being idle, this can take up to a minute.
                </p>
              )}
              <CardSkeletonGrid count={12} />
            </>
          )}
          {query.isError && <ErrorState message={apiErrorMessage(query.error)} onRetry={() => query.refetch()} />}
          {query.data && query.data.items.length === 0 && <EmptyState title="No colleges match these filters" description="Try clearing some filters." />}
          {query.data && query.data.items.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
                {query.data.items.map((inst) => (
                  <CollegeCard key={inst.id} institution={inst} />
                ))}
              </div>
              <div className="mt-6 flex items-center justify-center gap-3 text-[12.5px] text-sub">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="disabled:opacity-40">
                  ← Prev
                </button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="disabled:opacity-40">
                  Next →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
