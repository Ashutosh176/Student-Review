import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { institutionsApi } from '@/api/institutions.api';
import { INSTITUTION_TYPES, INSTITUTION_TYPE_LABELS } from '@/utils/institutionTypes';

export interface CollegeFilterValues {
  state: string;
  city: string;
  course: string;
  type: string;
  categorySlug: string;
  verifiedOnly: boolean;
}

export const EMPTY_FILTERS: CollegeFilterValues = { state: '', city: '', course: '', type: '', categorySlug: '', verifiedOnly: false };

export function countActiveFilters(f: CollegeFilterValues) {
  return Object.values(f).filter((v) => v !== '' && v !== false).length;
}

// Shared by the search page and the colleges listing. The city list follows
// the chosen state, and the panel collapses behind a button on small screens
// (previously it was simply hidden below the md breakpoint, so phones had no
// filters at all).
export function CollegeFilters({ value, onChange }: { value: CollegeFilterValues; onChange: (next: CollegeFilterValues) => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const optionsQuery = useQuery({
    queryKey: ['institutions', 'filters', value.state],
    queryFn: () => institutionsApi.filters(value.state || undefined),
    staleTime: 5 * 60 * 1000,
  });
  const active = countActiveFilters(value);

  function update<K extends keyof CollegeFilterValues>(key: K, v: CollegeFilterValues[K]) {
    // Changing state invalidates a previously picked city from another state.
    onChange({ ...value, [key]: v, ...(key === 'state' ? { city: '' } : {}) });
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setMobileOpen((o) => !o)}
        className="btn btn-ghost btn-sm mb-3 w-full justify-center md:hidden"
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? 'Hide filters' : `Filters${active ? ` (${active})` : ''}`}
      </button>
      <aside className={`card h-max ${mobileOpen ? 'block' : 'hidden'} md:block`}>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-[13px] font-semibold">Filters</h4>
          {active > 0 && (
            <button type="button" onClick={() => onChange(EMPTY_FILTERS)} className="text-[11.5px] text-brand hover:underline">
              Clear ({active})
            </button>
          )}
        </div>

        <div className="field mb-3">
          <label className="mb-1 block text-[11.5px] font-semibold text-sub">State</label>
          <select value={value.state} onChange={(e) => update('state', e.target.value)} className="w-full text-[12.5px]">
            <option value="">All states</option>
            {optionsQuery.data?.states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="field mb-3">
          <label className="mb-1 block text-[11.5px] font-semibold text-sub">City</label>
          <select value={value.city} onChange={(e) => update('city', e.target.value)} className="w-full text-[12.5px]">
            <option value="">All cities</option>
            {optionsQuery.data?.cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="field mb-3">
          <label className="mb-1 block text-[11.5px] font-semibold text-sub">Course</label>
          <input value={value.course} onChange={(e) => update('course', e.target.value)} placeholder="e.g. Computer Science" className="w-full text-[12.5px]" />
        </div>

        <div className="field mb-3">
          <label className="mb-1 block text-[11.5px] font-semibold text-sub">Category</label>
          <select value={value.categorySlug} onChange={(e) => update('categorySlug', e.target.value)} className="w-full text-[12.5px]">
            <option value="">All categories</option>
            {optionsQuery.data?.categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field mb-3">
          <label className="mb-1 block text-[11.5px] font-semibold text-sub">Institution type</label>
          <select value={value.type} onChange={(e) => update('type', e.target.value)} className="w-full text-[12.5px]">
            <option value="">All types</option>
            {INSTITUTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {INSTITUTION_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-[12.5px] text-ink">
          <input type="checkbox" checked={value.verifiedOnly} onChange={(e) => update('verifiedOnly', e.target.checked)} />
          Verified presence only
        </label>
      </aside>
    </div>
  );
}
