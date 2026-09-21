import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { institutionsApi } from '@/api/institutions.api';
import { CollegeCard } from '@/components/CollegeCard';
import { CollegeFilters, EMPTY_FILTERS } from '@/components/CollegeFilters';
import { SearchBar } from '@/components/SearchBar';
import { CardSkeletonGrid, EmptyState, ErrorState } from '@/components/LoadingSkeleton';

const PAGE_SIZE = 20;

export function SearchPage() {
  const [params] = useSearchParams();
  const initialQ = params.get('q') ?? '';
  const [sort, setSort] = useState<'relevant' | 'rating' | 'reviews' | 'name'>('relevant');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  // Any change to what is being searched goes back to the first page.
  useEffect(() => setPage(1), [initialQ, sort, filters]);

  const query = useQuery({
    queryKey: ['institutions', 'search-page', initialQ, sort, filters, page],
    queryFn: () =>
      institutionsApi.list({
        q: initialQ || undefined,
        sort,
        page,
        pageSize: PAGE_SIZE,
        state: filters.state || undefined,
        city: filters.city || undefined,
        course: filters.course || undefined,
        type: filters.type || undefined,
        categorySlug: filters.categorySlug || undefined,
        verifiedOnly: filters.verifiedOnly || undefined,
      }),
  });
  const totalPages = query.data ? Math.max(1, Math.ceil(query.data.total / PAGE_SIZE)) : 1;

  return (
    <div className="px-4 py-5 sm:px-7">
      <Helmet>
        <title>{initialQ ? `"${initialQ}" — Search — StudentReview` : 'Search — StudentReview'}</title>
      </Helmet>
      <SearchBar key={initialQ} variant="page" initialValue={initialQ} className="mb-5" />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-[220px_1fr]">
        <CollegeFilters value={filters} onChange={setFilters} />

        <div>
          <div className="mb-3.5 flex items-center justify-between text-[12.5px] text-sub">
            <span>{query.data?.total ?? 0} results</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as never)} className="rounded-md border border-line px-2 py-1">
              <option value="relevant">Sort: Most relevant</option>
              <option value="rating">Sort: Highest rated</option>
              <option value="reviews">Sort: Most reviewed</option>
              <option value="name">Sort: Name (A-Z)</option>
            </select>
          </div>

          {query.isLoading && <CardSkeletonGrid count={6} />}
          {query.isError && <ErrorState />}
          {query.data && query.data.items.length === 0 && (
            <EmptyState
              title="No colleges found"
              description="Try a different search term or clear your filters — or add it yourself and write the first review."
              action={
                <Link to={`/write-review${initialQ ? `?q=${encodeURIComponent(initialQ)}` : ''}`} className="btn btn-primary btn-sm">
                  Can't find your college? Add it
                </Link>
              }
            />
          )}
          {query.data && query.data.items.length > 0 && (
            <div className="flex flex-col gap-3">
              {query.data.items.map((inst) => (
                <CollegeCard key={inst.id} institution={inst} />
              ))}
              <div className="mt-3 flex items-center justify-center gap-3 text-[12.5px] text-sub">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
