import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { adminApi, type AdminModerationRow } from '@/api/admin.api';
import { apiErrorMessage } from '@/api/client';
import { DashboardTopbar } from '@/layouts/DashboardLayout';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/LoadingSkeleton';

type ModerationAction = 'APPROVE' | 'HIDE' | 'REMOVE' | 'REQUEST_CLARIFICATION';

export function AdminReviewsPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<AdminModerationRow | null>(null);
  const [clarifying, setClarifying] = useState(false);
  const [clarification, setClarification] = useState('');
  const query = useQuery({ queryKey: ['admin', 'moderation-queue'], queryFn: () => adminApi.moderationQueue({ pageSize: 30 }) });

  const actionMutation = useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: ModerationAction; reason?: string }) => adminApi.moderateAction(id, action, reason),
    onSuccess: () => {
      closeDetail();
      qc.invalidateQueries({ queryKey: ['admin', 'moderation-queue'] });
    },
  });

  function openDetail(row: AdminModerationRow) {
    setSelected(row);
    setClarifying(false);
    setClarification('');
    actionMutation.reset();
  }
  function closeDetail() {
    setSelected(null);
    setClarifying(false);
    setClarification('');
  }

  return (
    <div>
      <Helmet>
        <title>Review Moderation — Admin — StudentReview</title>
      </Helmet>
      <DashboardTopbar crumb="Admin" title="Review Moderation" />

      {query.data && query.data.items.length === 0 && <EmptyState icon="✅" title="Moderation queue is empty" />}

      {query.data && query.data.items.length > 0 && (
        <div className="card mb-4 overflow-x-auto p-0">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-line text-left text-[11.5px] text-sub">
                <th className="px-3 py-2.5">Review</th>
                <th className="px-3 py-2.5">Institution</th>
                <th className="px-3 py-2.5">Reports</th>
                <th className="px-3 py-2.5">Risk</th>
                <th className="px-3 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {query.data.items.map((row) => (
                <tr key={row.id} className="border-b border-line last:border-0">
                  <td className="max-w-[240px] truncate px-3 py-2.5">"{row.body}"</td>
                  <td className="px-3 py-2.5">{row.institution.name}</td>
                  <td className="px-3 py-2.5">{row._count.reports}</td>
                  <td className="px-3 py-2.5">
                    <Badge kind={row.riskScore >= 50 ? 'flagged' : 'pending'}>{row.riskScore >= 50 ? 'High' : 'Medium'}</Badge>{' '}
                    {row.status === 'REJECTED' && <Badge kind="flagged">Auto-rejected</Badge>}
                    {row.clarificationRequest && <Badge kind="org">Awaiting author</Badge>}
                  </td>
                  <td className="px-3 py-2.5">
                    <button className="btn btn-sm" onClick={() => openDetail(row)}>
                      Review
                    </button>{' '}
                    <button className="btn btn-sm btn-primary" onClick={() => actionMutation.mutate({ id: row.id, action: 'APPROVE' })}>
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="card">
          <h4 className="mb-2.5 text-sm">Moderation detail</h4>
          <p className="mb-2.5 text-[13px] text-sub">"{selected.body}"</p>
          {selected.clarificationRequest ? (
            <p className="mb-3.5 text-[11.5px] text-sub">
              <span className="font-semibold">Clarification requested — waiting on the author:</span> {selected.clarificationRequest}
            </p>
          ) : (
            selected.moderationNotes && <p className="mb-3.5 text-[11.5px] text-sub">{selected.moderationNotes}</p>
          )}

          {clarifying ? (
            <div>
              <label className="mb-1 block text-[12px] font-semibold">What should the author clarify?</label>
              <textarea
                autoFocus
                rows={3}
                maxLength={500}
                value={clarification}
                onChange={(e) => setClarification(e.target.value)}
                placeholder="e.g. Can you add which year these placement figures are from?"
                className="w-full rounded-md border border-line p-2.5 text-[13px] outline-none focus:border-brand"
              />
              <p className="mb-2.5 text-[11.5px] text-sub">The author gets this by email and on My Reviews. Their edit comes back to this queue.</p>
              <div className="flex flex-wrap gap-2">
                <button
                  className="btn btn-sm btn-primary"
                  disabled={!clarification.trim() || actionMutation.isPending}
                  onClick={() => actionMutation.mutate({ id: selected.id, action: 'REQUEST_CLARIFICATION', reason: clarification.trim() })}
                >
                  {actionMutation.isPending ? 'Sending…' : 'Send request'}
                </button>
                <button className="btn btn-sm btn-ghost" onClick={() => setClarifying(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-sm btn-primary" onClick={() => actionMutation.mutate({ id: selected.id, action: 'APPROVE' })}>
                Approve
              </button>
              <button className="btn btn-sm" onClick={() => setClarifying(true)}>
                Request clarification
              </button>
              <button className="btn btn-sm btn-danger" onClick={() => actionMutation.mutate({ id: selected.id, action: 'HIDE' })}>
                Hide
              </button>
              <button className="btn btn-sm btn-danger" onClick={() => actionMutation.mutate({ id: selected.id, action: 'REMOVE' })}>
                Remove
              </button>
            </div>
          )}
          {actionMutation.isError && <p className="mt-2.5 text-xs text-danger">{apiErrorMessage(actionMutation.error)}</p>}
        </div>
      )}
    </div>
  );
}
