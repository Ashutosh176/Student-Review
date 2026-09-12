import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { institutionsApi } from '@/api/institutions.api';
import { verificationApi } from '@/api/verification.api';
import { ReviewCard } from '@/components/ReviewCard';
import { CardSkeletonGrid, EmptyState, ErrorState } from '@/components/LoadingSkeleton';
import { useAuthStore } from '@/store/authStore';
import { useCollegeContext } from './CollegeLayout';

const SORTS: { value: 'recent' | 'helpful' | 'highest' | 'lowest'; label: string }[] = [
  { value: 'recent', label: 'Most recent' },
  { value: 'helpful', label: 'Most helpful' },
  { value: 'highest', label: 'Highest rated' },
  { value: 'lowest', label: 'Lowest rated' },
];

export function CollegeReviewsPage() {
  const inst = useCollegeContext();
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((s) => Boolean(s.accessToken));
  const [sort, setSort] = useState<'recent' | 'helpful' | 'highest' | 'lowest'>('recent');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ['institution-reviews', inst.slug, sort, verifiedOnly, page],
    queryFn: () => institutionsApi.reviews(inst.slug, { sort, verifiedOnly, page, pageSize: 10 }),
  });

  const verificationsQuery = useQuery({ queryKey: ['verifications', 'mine'], queryFn: verificationApi.mine, enabled: isLoggedIn });
  const isVerifiedHere = verificationsQuery.data?.some((v) => v.institutionId === inst.id && v.status === 'VERIFIED') ?? false;
  const writeReviewLabel = !isLoggedIn ? 'Sign in to write a review' : isVerifiedHere ? 'Write a review' : 'Verify your university email to write a review';

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {SORTS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSort(s.value)}
              className={clsx('btn btn-sm', sort === s.value ? 'btn-primary' : 'btn-ghost')}
              type="button"
            >
              {s.label}
            </button>
          ))}
          <button
            onClick={() => setVerifiedOnly((v) => !v)}
            className={clsx('btn btn-sm', verifiedOnly ? 'btn-primary' : 'btn-ghost')}
            type="button"
          >
            Verified only
          </button>
        </div>
        <button onClick={() => navigate(`/write-review?college=${inst.slug}`)} className="btn btn-primary btn-sm" type="button">
          {writeReviewLabel}
        </button>
      </div>

      {query.isLoading && <CardSkeletonGrid count={4} />}
      {query.isError && <ErrorState />}
      {query.data && query.data.items.length === 0 && (
        <EmptyState icon="📝" title="No reviews yet" description="Be the first to share your honest experience at this college." />
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
