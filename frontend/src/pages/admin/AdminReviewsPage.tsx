import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { adminApi, type AdminModerationRow } from '@/api/admin.api';
import { DashboardTopbar } from '@/layouts/DashboardLayout';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/LoadingSkeleton';

export function AdminReviewsPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<AdminModerationRow | null>(null);
  const query = useQuery({ queryKey: ['admin', 'moderation-queue'], queryFn: () => adminApi.moderationQueue({ pageSize: 30 }) });

  const actionMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'APPROVE' | 'HIDE' | 'REMOVE' | 'REQUEST_CLARIFICATION' }) => adminApi.moderateAction(id, action),
    onSuccess: () => {
      setSelected(null);
      qc.invalidateQueries({ queryKey: ['admin', 'moderation-queue'] });
    },
  });

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
                    <Badge kind={row.riskScore >= 50 ? 'flagged' : 'pending'}>{row.riskScore >= 50 ? 'High' : 'Medium'}</Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    <button className="btn btn-sm" onClick={() => setSelected(row)}>
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
          {selected.moderationNotes && <p className="mb-3.5 text-[11.5px] text-sub">{selected.moderationNotes}</p>}
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-sm btn-primary" onClick={() => actionMutation.mutate({ id: selected.id, action: 'APPROVE' })}>
              Approve
            </button>
            <button className="btn btn-sm" onClick={() => actionMutation.mutate({ id: selected.id, action: 'REQUEST_CLARIFICATION' })}>
              Request clarification
            </button>
            <button className="btn btn-sm btn-danger" onClick={() => actionMutation.mutate({ id: selected.id, action: 'HIDE' })}>
              Hide
            </button>
            <button className="btn btn-sm btn-danger" onClick={() => actionMutation.mutate({ id: selected.id, action: 'REMOVE' })}>
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
