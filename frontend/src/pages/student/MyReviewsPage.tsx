import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiErrorMessage } from '@/api/client';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { reviewsApi } from '@/api/reviews.api';
import { DashboardTopbar } from '@/layouts/DashboardLayout';
import { Badge, type BadgeKind } from '@/components/Badge';
import { Stars } from '@/components/Stars';
import { EmptyState } from '@/components/LoadingSkeleton';

const STATUS_BADGE: Record<string, { kind: BadgeKind; label: string }> = {
  APPROVED: { kind: 'verified', label: 'Approved' },
  PENDING: { kind: 'pending', label: 'Pending' },
  FLAGGED: { kind: 'flagged', label: 'Flagged' },
  REJECTED: { kind: 'flagged', label: 'Rejected' },
  REMOVED: { kind: 'flagged', label: 'Removed' },
};

export function MyReviewsPage() {
  const query = useQuery({ queryKey: ['reviews', 'mine'], queryFn: reviewsApi.mine });
  const qc = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: (id: string) => reviewsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews', 'mine'] }),
  });

  // Inline editor, used to answer a moderator's clarification request.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const editMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => reviewsApi.update(id, { body }),
    onSuccess: () => {
      setEditingId(null);
      qc.invalidateQueries({ queryKey: ['reviews', 'mine'] });
    },
  });
  const pendingClarifications = query.data?.filter((r) => r.clarificationRequest) ?? [];

  return (
    <div>
      <Helmet>
        <title>My Reviews — StudentReview</title>
      </Helmet>
      <DashboardTopbar
        crumb="Account"
        title="My Reviews"
        right={
          <Link to="/write-review" className="btn btn-primary btn-sm">
            Write a review
          </Link>
        }
      />
      {query.data && query.data.length === 0 && <EmptyState icon="📝" title="You haven't written any reviews yet" />}
      {pendingClarifications.map((r) => (
        <div key={r.id} className="card mb-4 border-warning">
          <div className="mb-1.5 flex flex-wrap items-center gap-2 text-sm font-semibold">
            A moderator has a question about your review of {r.institution.name}
          </div>
          <p className="mb-3 rounded-md bg-surface p-2.5 text-[13px]">"{r.clarificationRequest}"</p>
          {editingId === r.id ? (
            <div>
              <textarea
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="min-h-[160px] w-full rounded-md border border-line p-3 text-sm outline-none focus:border-brand"
              />
              <div className="mt-1 text-right text-xs text-sub">{draft.trim().length}/120 minimum</div>
              {editMutation.isError && <p className="mt-1 text-xs text-danger">{apiErrorMessage(editMutation.error)}</p>}
              <div className="mt-2 flex gap-2">
                <button
                  className="btn btn-primary btn-sm"
                  disabled={draft.trim().length < 120 || editMutation.isPending}
                  onClick={() => editMutation.mutate({ id: r.id, body: draft.trim() })}
                >
                  {editMutation.isPending ? 'Saving…' : 'Save and send back to moderator'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setEditingId(r.id);
                setDraft(r.body ?? '');
                editMutation.reset();
              }}
            >
              Edit your review
            </button>
          )}
        </div>
      ))}
      {query.data && query.data.length > 0 && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-line text-left text-[11.5px] text-sub">
                <th className="px-3 py-2.5">College</th>
                <th className="px-3 py-2.5">Rating</th>
                <th className="px-3 py-2.5">Submitted</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {query.data.map((r) => {
                const overall = r.ratings.find((x) => x.category === 'OVERALL')?.value ?? 0;
                const statusInfo = STATUS_BADGE[r.status] ?? { kind: 'pending' as BadgeKind, label: r.status };
                return (
                  <tr key={r.id} className="border-b border-line last:border-0">
                    <td className="px-3 py-2.5">
                      <Link to={`/college/${r.institution.slug}`} className="hover:text-brand">
                        {r.institution.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5">
                      <Stars value={overall} />
                    </td>
                    <td className="px-3 py-2.5">{new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</td>
                    <td className="px-3 py-2.5">
                      {r.clarificationRequest ? <Badge kind="pending">Needs your input</Badge> : <Badge kind={statusInfo.kind}>{statusInfo.label}</Badge>}
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => confirm('Delete this review permanently?') && deleteMutation.mutate(r.id)}
                        className="text-danger hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
