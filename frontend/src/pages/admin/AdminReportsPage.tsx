import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { adminApi } from '@/api/admin.api';
import { DashboardTopbar } from '@/layouts/DashboardLayout';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/LoadingSkeleton';

export function AdminReportsPage() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['admin', 'reports'], queryFn: () => adminApi.reports({ pageSize: 30 }) });
  const dismissMutation = useMutation({
    mutationFn: (id: string) => adminApi.dismissReport(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'reports'] }),
  });

  return (
    <div>
      <Helmet>
        <title>Reports — Admin — StudentReview</title>
      </Helmet>
      <DashboardTopbar crumb="Admin" title="Reports" />
      {query.data && query.data.items.length === 0 && <EmptyState icon="🚩" title="No open reports" />}
      {query.data && query.data.items.length > 0 && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-line text-left text-[11.5px] text-sub">
                <th className="px-3 py-2.5">Content</th>
                <th className="px-3 py-2.5">Reason</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {query.data.items.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0">
                  <td className="max-w-[220px] truncate px-3 py-2.5">
                    Review on {r.review.institution.name}
                  </td>
                  <td className="px-3 py-2.5">{r.reason.replace(/_/g, ' ')}</td>
                  <td className="px-3 py-2.5">
                    <Badge kind={r.status === 'OPEN' ? 'flagged' : r.status === 'DISMISSED' ? 'verified' : 'pending'}>{r.status}</Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    {r.status !== 'DISMISSED' && (
                      <button onClick={() => dismissMutation.mutate(r.id)} className="text-brand hover:underline">
                        Dismiss
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
