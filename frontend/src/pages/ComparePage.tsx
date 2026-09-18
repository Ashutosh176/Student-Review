import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { institutionsApi } from '@/api/institutions.api';
import { categoryLabel } from '@/components/RatingBar';
import { EmptyState } from '@/components/LoadingSkeleton';
import type { RatingCategory } from '@/types';

const COMPARE_CATEGORIES: RatingCategory[] = ['OVERALL', 'PLACEMENT', 'FACULTY', 'INFRASTRUCTURE', 'CAMPUS_LIFE', 'VALUE_FOR_MONEY'];

export function ComparePage() {
  const [params, setParams] = useSearchParams();
  const slugs = (params.get('slugs') ?? '').split(',').filter(Boolean);
  const [q, setQ] = useState('');

  const searchQuery = useQuery({
    queryKey: ['institutions', 'compare-search', q],
    queryFn: () => institutionsApi.search(q, 6),
    enabled: q.length > 1,
  });

  const compareQuery = useQuery({
    queryKey: ['institutions', 'compare', slugs],
    queryFn: () => institutionsApi.compare(slugs),
    enabled: slugs.length >= 2,
  });

  function addSlug(slug: string) {
    if (slugs.includes(slug) || slugs.length >= 3) return;
    setParams({ slugs: [...slugs, slug].join(',') });
    setQ('');
  }
  function removeSlug(slug: string) {
    setParams({ slugs: slugs.filter((s) => s !== slug).join(',') });
  }

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard');
  }

  return (
    <div className="px-4 py-6 sm:px-7 print:p-0">
      <Helmet>
        <title>Compare Colleges — StudentReview</title>
      </Helmet>

      {/* Print-only report header — the live site chrome (nav/search/footer) is hidden via print:hidden, so a printed page needs its own title/context. */}
      {compareQuery.data && compareQuery.data.length >= 2 && (
        <div className="hidden print:mb-5 print:block">
          <h1 className="text-lg font-bold">StudentReview — College Comparison</h1>
          <p className="text-[12px] text-sub">
            {compareQuery.data.map((inst) => inst.name).join(' vs. ')} — generated {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      )}

      <h2 className="mb-1 text-xl print:hidden">Compare colleges</h2>
      <p className="mb-5 text-[13px] text-sub print:hidden">Comparing up to 3 institutions side by side.</p>

      {slugs.length < 3 && (
        <div className="relative mb-5 max-w-md print:hidden">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Add a college to compare..."
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand"
          />
          {searchQuery.data && searchQuery.data.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-line bg-white shadow-card">
              {searchQuery.data.map((inst) => (
                <button
                  key={inst.id}
                  onClick={() => addSlug(inst.slug)}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-surface"
                  type="button"
                >
                  {inst.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {slugs.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2 print:hidden">
          {slugs.map((s) => (
            <span key={s} className="badge badge-official">
              {s.replace(/-/g, ' ')}
              <button onClick={() => removeSlug(s)} className="ml-1" type="button" aria-label="Remove">
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {slugs.length < 2 && <EmptyState icon="⚖️" title="Add at least 2 colleges to compare" description="Search above to add institutions." />}

      {compareQuery.data && compareQuery.data.length >= 2 && (
        <>
          <div className="overflow-x-auto rounded-card border border-line bg-white print:overflow-visible print:border-0">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr>
                  <th className="w-44 px-3 py-2.5" />
                  {compareQuery.data.map((inst) => (
                    <th key={inst.id} className="border-b border-line px-3 py-2.5 text-left font-semibold">
                      {inst.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_CATEGORIES.map((cat) => {
                  const values = compareQuery.data.map((inst) => inst.summary.ratings.find((r) => r.category === cat)?.average ?? 0);
                  const max = Math.max(...values);
                  return (
                    <tr key={cat} className="border-b border-line">
                      <td className="px-3 py-2.5 text-sub">{categoryLabel(cat)}</td>
                      {values.map((v, i) => (
                        <td key={i} className={v === max && v > 0 ? 'px-3 py-2.5 font-bold' : 'px-3 py-2.5'}>
                          {v ? v.toFixed(1) : '—'}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                <tr className="border-b border-line">
                  <td className="px-3 py-2.5 text-sub">Review Count</td>
                  {compareQuery.data.map((inst) => (
                    <td key={inst.id} className="px-3 py-2.5">
                      {inst.summary.reviewCount.toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-3 py-2.5 text-sub">Verified Reviews</td>
                  {compareQuery.data.map((inst) => (
                    <td key={inst.id} className="px-3 py-2.5">
                      {inst.summary.verifiedCount.toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-3 py-2.5 align-top text-sub">Entrance Exams Accepted</td>
                  {compareQuery.data.map((inst) => (
                    <td key={inst.id} className="px-3 py-2.5">
                      {inst.entranceExams.length > 0 ? inst.entranceExams.join(', ') : '—'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {compareQuery.data.some((inst) => inst.aiSummary) && (
            <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-1">
              {compareQuery.data
                .filter((inst) => inst.aiSummary)
                .map((inst) => (
                  <div key={inst.id} className="card border-brand/20 bg-brand-light">
                    <h4 className="mb-1.5 text-sm">✨ {inst.name} — students say</h4>
                    <p className="text-[12.5px] leading-relaxed text-ink">{inst.aiSummary}</p>
                  </div>
                ))}
            </div>
          )}
          <p className="mt-2 text-[11px] text-sub">
            {compareQuery.data.some((inst) => inst.aiSummary) && 'AI-summarized from recent verified reviews — not a review itself. '}
            Read the full reviews on each college's page for the complete picture.
          </p>

          <div className="mt-3.5 flex gap-2 print:hidden">
            <button onClick={copyLink} className="btn btn-ghost" type="button">
              Share comparison
            </button>
            <button onClick={() => window.print()} className="btn btn-ghost" type="button">
              Download / Print PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}
