import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Badge, type BadgeKind } from './Badge';
import { Stars } from './Stars';
import { ReportModal } from './ReportModal';
import { reviewsApi } from '@/api/reviews.api';
import { useAuthStore } from '@/store/authStore';
import { timeAgo, relationshipLabel, admissionOutcomeLabel } from '@/utils/formatDate';
import type { AdmissionOutcome, PublicReview } from '@/types';

const OUTCOME_BADGE_KIND: Record<AdmissionOutcome, BadgeKind> = {
  ADMITTED: 'verified',
  REJECTED: 'flagged',
  WAITLISTED: 'pending',
  WITHDREW: 'org',
};

export function ReviewCard({ review, institutionName }: { review: PublicReview; institutionName?: string }) {
  const overall = review.ratings.find((r) => r.category === 'OVERALL')?.value ?? 0;
  const [reportOpen, setReportOpen] = useState(false);
  const [reported, setReported] = useState(false);
  const isLoggedIn = useAuthStore((s) => Boolean(s.accessToken));
  const qc = useQueryClient();

  const voteMutation = useMutation({
    mutationFn: () => reviewsApi.vote(review.id),
    // Reviews render from several differently-keyed lists (institution page,
    // org dashboard, homepage's "latest reviews" feed) — invalidate all of
    // them rather than hardcoding one prefix that misses the others.
    onSuccess: () =>
      qc.invalidateQueries({ predicate: (query) => query.queryKey[0] === 'institution-reviews' || query.queryKey[0] === 'reviews' }),
  });

  const reportMutation = useMutation({
    mutationFn: (input: { reason: string; details?: string }) => reviewsApi.report(review.id, input.reason, input.details),
    onSuccess: () => {
      setReported(true);
      setReportOpen(false);
    },
  });

  if (review.status === 'FLAGGED') {
    return (
      <div className="review-card rounded-card border border-line bg-white p-4 opacity-60">
        <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold">
          {review.author.label} <Badge kind="pending">Under review</Badge>
        </div>
        <p className="select-none text-sm blur-[2px]">This review has been reported and is being checked against community guidelines.</p>
      </div>
    );
  }

  return (
    <div className="review-card rounded-card border border-line bg-white p-4">
      <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs font-semibold">
        {review.author.verified ? (
          <Link to="/trust" title="This student confirmed their official college email or ID — learn how verification works">
            <Badge kind="verified">Verified Student</Badge>
          </Link>
        ) : (
          <span title={review.type === 'ADMISSION_PROCESS' ? "Admission-process reviews aren't verified — they're open to rejected/waitlisted applicants too" : "This student hasn't completed college verification — still a real, moderated account"}>
            {review.author.label}
          </span>
        )}
        {review.admissionOutcome && <Badge kind={OUTCOME_BADGE_KIND[review.admissionOutcome]}>{admissionOutcomeLabel(review.admissionOutcome)}</Badge>}
        <span className="font-normal text-sub">
          · {relationshipLabel(review.relationship)}{review.batchYear ? ` · ${review.batchYear}` : ""}
        </span>
      </div>
      {review.type === 'EXPERIENCE' && <Stars value={overall} size="text-base" />}
      {review.title && <p className="mt-1.5 text-sm font-semibold">{review.title}</p>}
      <p className="my-2 text-[13.5px] leading-relaxed text-ink">"{review.body}"</p>

      {review.officialResponse && (
        <div className="mt-2 rounded-md bg-brand-light p-3 text-[12.5px]">
          <span className="mb-0.5 block text-[11.5px] font-bold text-brand">Official Response{institutionName ? ` — ${institutionName}` : ''}</span>
          {review.officialResponse.body}
        </div>
      )}

      <div className="mt-2.5 flex items-center justify-between text-xs text-sub">
        <span>{timeAgo(review.createdAt)}</span>
        <span className="flex items-center gap-3">
          <button
            type="button"
            disabled={!isLoggedIn}
            onClick={() => voteMutation.mutate()}
            className="hover:text-brand disabled:cursor-not-allowed"
            title={isLoggedIn ? 'Mark as helpful' : 'Log in to vote'}
          >
            👍 Helpful ({review.helpfulCount})
          </button>
          <button
            type="button"
            disabled={!isLoggedIn || reported}
            onClick={() => setReportOpen(true)}
            className="hover:text-danger disabled:cursor-not-allowed"
          >
            {reported ? 'Reported' : 'Report'}
          </button>
        </span>
      </div>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        submitting={reportMutation.isPending}
        onSubmit={(reason, details) => reportMutation.mutate({ reason, details })}
      />
    </div>
  );
}
