import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { adminApi } from '@/api/admin.api';
import { DashboardTopbar } from '@/layouts/DashboardLayout';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/LoadingSkeleton';

export function AdminOrganizationsPage() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['admin', 'claims'], queryFn: () => adminApi.claims() });
  const decideMutation = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: 'APPROVED' | 'REJECTED' }) => adminApi.decideClaim(id, decision),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'claims'] }),
  });

  return (
    <div>
      <Helmet>
        <title>Organizations — Admin — StudentReview</title>
      </Helmet>
      <DashboardTopbar crumb="Admin" title="Organizations & Claims" />
      {query.data && query.data.length === 0 && <EmptyState icon="🏢" title="No claims submitted yet" />}
      {query.data && query.data.length > 0 && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-line text-left text-[11.5px] text-sub">
                <th className="px-3 py-2.5">Organization</th>
                <th className="px-3 py-2.5">Institution</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Document</th>
                <th className="px-3 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {query.data.map((c) => (
                <tr key={c.id} className="border-b border-line last:border-0">
                  <td className="px-3 py-2.5">{c.organizationName}</td>
                  <td className="px-3 py-2.5">{c.institution.name}</td>
                  <td className="px-3 py-2.5">
                    <Badge kind={c.status === 'APPROVED' ? 'verified' : c.status === 'REJECTED' ? 'flagged' : 'pending'}>{c.status}</Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    {c.hasDocument ? (
                      <button onClick={() => adminApi.downloadClaimDocument(c.id)} className="text-brand hover:underline">
                        View
                      </button>
                    ) : (
                      <span className="text-sub">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    {c.status === 'PENDING' && (
                      <>
                        <button onClick={() => decideMutation.mutate({ id: c.id, decision: 'APPROVED' })} className="text-brand hover:underline">
                          Approve
                        </button>{' '}
                        <button onClick={() => decideMutation.mutate({ id: c.id, decision: 'REJECTED' })} className="text-danger hover:underline">
                          Reject
                        </button>
                      </>
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
