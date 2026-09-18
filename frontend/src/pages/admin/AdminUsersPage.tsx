import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { adminApi } from '@/api/admin.api';
import { DashboardTopbar } from '@/layouts/DashboardLayout';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/LoadingSkeleton';

export function AdminUsersPage() {
  const [q, setQ] = useState('');
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['admin', 'users', q], queryFn: () => adminApi.users({ q: q || undefined, pageSize: 30 }) });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'SUSPENDED' | 'BANNED' }) => adminApi.setUserStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  return (
    <div>
      <Helmet>
        <title>Users — Admin — StudentReview</title>
      </Helmet>
      <DashboardTopbar crumb="Admin" title="Users" />
      <div className="mb-3.5 flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users..." className="flex-1 rounded-md border border-line px-3 py-2 text-[12.5px]" />
      </div>
      {query.data && query.data.items.length === 0 && <EmptyState icon="👤" title="No users found" />}
      {query.data && query.data.items.length > 0 && (
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="border-b border-line text-left text-[11.5px] text-sub">
              <th className="px-3 py-2.5">User</th>
              <th className="px-3 py-2.5">Role</th>
              <th className="px-3 py-2.5">Reviews</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {query.data?.items.map((u) => (
              <tr key={u.id} className="border-b border-line last:border-0">
                <td className="px-3 py-2.5">{u.username}</td>
                <td className="px-3 py-2.5">{u.roles.map((r) => r.role.name).join(', ')}</td>
                <td className="px-3 py-2.5">{u._count.reviews}</td>
                <td className="px-3 py-2.5">
                  <Badge kind={u.status === 'ACTIVE' ? 'verified' : 'flagged'}>{u.status}</Badge>
                </td>
                <td className="px-3 py-2.5">
                  {u.status === 'ACTIVE' && (
                    <span className="flex gap-2.5">
                      <button onClick={() => statusMutation.mutate({ id: u.id, status: 'SUSPENDED' })} className="text-warning hover:underline">
                        Suspend
                      </button>
                      <button onClick={() => statusMutation.mutate({ id: u.id, status: 'BANNED' })} className="text-danger hover:underline">
                        Ban
                      </button>
                    </span>
                  )}
                  {u.status !== 'ACTIVE' && (
                    <button onClick={() => statusMutation.mutate({ id: u.id, status: 'ACTIVE' })} className="text-brand hover:underline">
                      Restore
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
