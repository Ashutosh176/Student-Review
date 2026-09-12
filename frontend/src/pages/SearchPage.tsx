import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { institutionsApi } from '@/api/institutions.api';
import { CollegeCard } from '@/components/CollegeCard';
import { SearchBar } from '@/components/SearchBar';
import { CardSkeletonGrid, EmptyState, ErrorState } from '@/components/LoadingSkeleton';
import { INSTITUTION_TYPES, INSTITUTION_TYPE_LABELS } from '@/utils/institutionTypes';

const EMPTY_FILTERS = { state: '', city: '', course: '', type: '', categorySlug: '', verifiedOnly: false };

export function SearchPage() {
  const [params] = useSearchParams();
  const initialQ = params.get('q') ?? '';
  const [sort, setSort] = useState<'relevant' | 'rating' | 'reviews' | 'name'>('relevant');
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const filterOptionsQuery = useQuery({ queryKey: ['institutions', 'filters'], queryFn: institutionsApi.filters, staleTime: 5 * 60 * 1000 });

  const query = useQuery({
    queryKey: ['institutions', 'search-page', initialQ, sort, filters],
    queryFn: () =>
      institutionsApi.list({
        q: initialQ || undefined,
        sort,
        pageSize: 20,
        state: filters.state || undefined,
        city: filters.city || undefined,
        course: filters.course || undefined,
        type: filters.type || undefined,
        categorySlug: filters.categorySlug || undefined,
        verifiedOnly: filters.verifiedOnly || undefined,
      }),
  });

  const activeFilterCount = Object.values(filters).filter((v) => v !== '' && v !== false).length;

  function update<K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className="px-4 py-5 sm:px-7">
      <Helmet>
        <title>{initialQ ? `"${initialQ}" — Search — StudentReview` : 'Search — StudentReview'}</title>
      </Helmet>
      <SearchBar variant="page" initialValue={initialQ} className="mb-5" />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-[220px_1fr]">
        <aside className="card hidden h-max md:block">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-[13px] font-semibold">Filters</h4>
            {activeFilterCount > 0 && (
              <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="text-[11.5px] text-brand hover:underline">
                Clear ({activeFilterCount})
              </button>
            )}
          </div>

          <div className="field mb-3">
            <label className="mb-1 block text-[11.5px] font-semibold text-sub">State</label>
            <select value={filters.state} onChange={(e) => update('state', e.target.value)} className="w-full text-[12.5px]">
              <option value="">All states</option>
              {filterOptionsQuery.data?.states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="field mb-3">
            <label className="mb-1 block text-[11.5px] font-semibold text-sub">City</label>
            <select value={filters.city} onChange={(e) => update('city', e.target.value)} className="w-full text-[12.5px]">
              <option value="">All cities</option>
              {filterOptionsQuery.data?.cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="field mb-3">
            <label className="mb-1 block text-[11.5px] font-semibold text-sub">Course</label>
            <input
              value={filters.course}
              onChange={(e) => update('course', e.target.value)}
              placeholder="e.g. Computer Science"
              className="w-full text-[12.5px]"
            />
          </div>

          <div className="field mb-3">
            <label className="mb-1 block text-[11.5px] font-semibold text-sub">Category</label>
            <select value={filters.categorySlug} onChange={(e) => update('categorySlug', e.target.value)} className="w-full text-[12.5px]">
              <option value="">All categories</option>
              {filterOptionsQuery.data?.categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field mb-3">
            <label className="mb-1 block text-[11.5px] font-semibold text-sub">Institution type</label>
            <select value={filters.type} onChange={(e) => update('type', e.target.value)} className="w-full text-[12.5px]">
              <option value="">All types</option>
              {INSTITUTION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {INSTITUTION_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-[12.5px] text-ink">
            <input type="checkbox" checked={filters.verifiedOnly} onChange={(e) => update('verifiedOnly', e.target.checked)} />
            Verified presence only
          </label>
        </aside>

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
            <EmptyState title="No colleges found" description="Try a different search term or clear your filters." />
          )}
          {query.data && query.data.items.length > 0 && (
            <div className="flex flex-col gap-3">
              {query.data.items.map((inst) => (
                <CollegeCard key={inst.id} institution={inst} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
