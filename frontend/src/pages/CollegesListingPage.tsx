import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { institutionsApi } from '@/api/institutions.api';
import { CollegeCard } from '@/components/CollegeCard';
import { CardSkeletonGrid, EmptyState } from '@/components/LoadingSkeleton';
import { collegesListingSeo } from '@/lib/seo/siteSeo';

export function CollegesListingPage() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<'relevant' | 'rating' | 'reviews' | 'name'>('reviews');
  const pageSize = 16;

  const query = useQuery({
    queryKey: ['institutions', 'listing', page, sort],
    queryFn: () => institutionsApi.list({ page, pageSize, sort }),
  });

  const totalPages = query.data ? Math.max(1, Math.ceil(query.data.total / pageSize)) : 1;

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

      {query.isLoading && <CardSkeletonGrid count={12} />}
      {query.data && query.data.items.length === 0 && <EmptyState title="No colleges yet" />}
      {query.data && query.data.items.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
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
  );
}
