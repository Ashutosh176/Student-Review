import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import clsx from 'clsx';
import { institutionsApi } from '@/api/institutions.api';
import { verificationApi } from '@/api/verification.api';
import { ReviewCard } from '@/components/ReviewCard';
import { CardSkeletonGrid, EmptyState, ErrorState } from '@/components/LoadingSkeleton';
import { useAuthStore } from '@/store/authStore';
import { collegeSeoMeta } from '@/lib/seo/collegeSeo';
import { useCollegeContext } from './CollegeLayout';
import type { ReviewKind } from '@/types';

const SORTS: { value: 'recent' | 'helpful' | 'highest' | 'lowest'; label: string }[] = [
  { value: 'recent', label: 'Most recent' },
  { value: 'helpful', label: 'Most helpful' },
  { value: 'highest', label: 'Highest rated' },
  { value: 'lowest', label: 'Lowest rated' },
];

const KINDS: { value: ReviewKind; label: string }[] = [
  { value: 'EXPERIENCE', label: 'Student Experience' },
  { value: 'ADMISSION_PROCESS', label: 'Admission Process' },
];

export function CollegeReviewsPage() {
  const inst = useCollegeContext();
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((s) => Boolean(s.accessToken));
  const [kind, setKind] = useState<ReviewKind>('EXPERIENCE');
  const [sort, setSort] = useState<'recent' | 'helpful' | 'highest' | 'lowest'>('recent');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ['institution-reviews', inst.slug, kind, sort, verifiedOnly, page],
    queryFn: () => institutionsApi.reviews(inst.slug, { sort, verifiedOnly: kind === 'EXPERIENCE' ? verifiedOnly : undefined, type: kind, page, pageSize: 10 }),
  });

  const verificationsQuery = useQuery({ queryKey: ['verifications', 'mine'], queryFn: verificationApi.mine, enabled: isLoggedIn });
  const isVerifiedHere = verificationsQuery.data?.some((v) => v.institutionId === inst.id && v.status === 'VERIFIED') ?? false;
  // Admission-process reviews have no verification gate — anyone logged in
  // can write one, rejected/waitlisted applicants included.
  const writeReviewLabel =
    kind === 'ADMISSION_PROCESS'
      ? !isLoggedIn
        ? 'Sign in to write a review'
        : 'Share your admission experience'
      : !isLoggedIn
        ? 'Sign in to write a review'
        : isVerifiedHere
          ? 'Write a review'
          : 'Verify your student identity to write a review';

  const seo = collegeSeoMeta(inst, 'reviews');

  return (
    <div>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <link rel="canonical" href={`${window.location.origin}${seo.path}`} />
      </Helmet>
      <div className="mb-3 flex gap-1 overflow-x-auto rounded-card border border-line bg-white p-1">
        {KINDS.map((k) => (
          <button
            key={k.value}
            onClick={() => {
              setKind(k.value);
              setPage(1);
            }}
            className={clsx(
              'flex-1 whitespace-nowrap rounded-md px-3 py-2 text-center text-[12.5px] font-semibold',
              kind === k.value ? 'bg-brand text-white' : 'text-sub',
            )}
            type="button"
          >
            {k.label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(kind === 'EXPERIENCE' ? SORTS : SORTS.filter((s) => s.value === 'recent' || s.value === 'helpful')).map((s) => (
            <button
              key={s.value}
              onClick={() => setSort(s.value)}
              className={clsx('btn btn-sm', sort === s.value ? 'btn-primary' : 'btn-ghost')}
              type="button"
            >
              {s.label}
            </button>
          ))}
          {kind === 'EXPERIENCE' && (
            <button
              onClick={() => setVerifiedOnly((v) => !v)}
              className={clsx('btn btn-sm', verifiedOnly ? 'btn-primary' : 'btn-ghost')}
              type="button"
            >
              Verified only
            </button>
          )}
        </div>
        <button
          onClick={() => navigate(`/write-review?college=${inst.slug}&type=${kind}`)}
          className="btn btn-primary btn-sm"
          type="button"
        >
          {writeReviewLabel}
        </button>
      </div>

      {query.isLoading && <CardSkeletonGrid count={4} />}
      {query.isError && <ErrorState />}
      {query.data && query.data.items.length === 0 && (
        <EmptyState
          icon="📝"
          title={kind === 'ADMISSION_PROCESS' ? 'No admission-process reviews yet' : 'No reviews yet'}
          description={
            kind === 'ADMISSION_PROCESS'
              ? 'Share what your interview or application process was like — admitted, waitlisted, or rejected, it all helps future applicants.'
              : 'Be the first to share your honest experience at this college.'
          }
        />
      )}
      {query.data && query.data.items.length > 0 && (
        <div className="flex flex-col gap-3">
          {query.data.items.map((r) => (
            <ReviewCard key={r.id} review={r} institutionName={inst.name} />
          ))}
        </div>
      )}

      {query.data && query.data.total > 10 && (
        <div className="mt-5 flex items-center justify-center gap-3 text-[12.5px] text-sub">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="disabled:opacity-40">
            ← Prev
          </button>
          <span>Page {page}</span>
          <button disabled={page * 10 >= query.data.total} onClick={() => setPage((p) => p + 1)} className="disabled:opacity-40">
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
