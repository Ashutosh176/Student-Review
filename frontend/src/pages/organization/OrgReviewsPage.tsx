import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { institutionsApi } from '@/api/institutions.api';
import { reviewsApi } from '@/api/reviews.api';
import { DashboardTopbar } from '@/layouts/DashboardLayout';
import { ReviewCard } from '@/components/ReviewCard';
import { EmptyState } from '@/components/LoadingSkeleton';
import { useOrgContext } from './OrgLayout';

export function OrgReviewsPage() {
  const org = useOrgContext();
  const qc = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const query = useQuery({
    queryKey: ['institution-reviews', org.institution.slug, 'org-view'],
    queryFn: () => institutionsApi.reviews(org.institution.slug, { sort: 'recent', page: 1, pageSize: 20 }),
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => reviewsApi.respond(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['institution-reviews', org.institution.slug, 'org-view'] }),
  });

  const unanswered = query.data?.items.filter((r) => !r.officialResponse) ?? [];
  const answered = query.data?.items.filter((r) => r.officialResponse) ?? [];

  return (
    <div>
      <Helmet>
        <title>Reviews — Organization — StudentReview</title>
      </Helmet>
      <DashboardTopbar crumb="Organization" title="Reviews" />

      <h4 className="mb-2.5 text-sm font-semibold text-sub">Awaiting response</h4>
      {unanswered.length === 0 && <EmptyState icon="✅" title="You're all caught up — no reviews awaiting a response." />}
      <div className="mb-6 flex flex-col gap-3">
        {unanswered.map((r) => (
          <div key={r.id}>
            <ReviewCard review={r} institutionName={org.institution.name} />
            <div className="card mt-1.5">
              <h4 className="mb-2 text-xs font-semibold">Write an official response</h4>
              <textarea
                value={drafts[r.id] ?? ''}
                onChange={(e) => setDrafts((d) => ({ ...d, [r.id]: e.target.value }))}
                className="mb-2.5 w-full rounded-md border border-line p-2.5 text-[13.5px] outline-none focus:border-brand"
                placeholder="Thank you for the feedback..."
              />
              <button
                className="btn btn-primary btn-sm"
                disabled={!drafts[r.id]?.trim() || respondMutation.isPending}
                onClick={() => respondMutation.mutate({ id: r.id, body: drafts[r.id] })}
              >
                {respondMutation.isPending ? 'Submitting…' : 'Submit response'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {answered.length > 0 && (
        <>
          <h4 className="mb-2.5 text-sm font-semibold text-sub">Already responded</h4>
          <div className="flex flex-col gap-3">
            {answered.map((r) => (
              <ReviewCard key={r.id} review={r} institutionName={org.institution.name} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
