import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { organizationApi } from '@/api/organization.api';
import { apiErrorMessage } from '@/api/client';
import { DashboardTopbar } from '@/layouts/DashboardLayout';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/LoadingSkeleton';

export function OrgTeamPage() {
  const qc = useQueryClient();
  const [inviting, setInviting] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'EDITOR'>('EDITOR');

  const query = useQuery({ queryKey: ['organization', 'members'], queryFn: organizationApi.members });

  const inviteMutation = useMutation({
    mutationFn: () => organizationApi.invite(email, role),
    onSuccess: () => {
      setEmail('');
      setInviting(false);
      qc.invalidateQueries({ queryKey: ['organization', 'members'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => organizationApi.removeMember(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['organization', 'members'] }),
  });

  return (
    <div>
      <Helmet>
        <title>Team — Organization — StudentReview</title>
      </Helmet>
      <DashboardTopbar
        crumb="Organization"
        title="Team"
        right={
          <button className="btn btn-primary btn-sm" onClick={() => setInviting((v) => !v)}>
            + Invite member
          </button>
        }
      />
      {inviting && (
        <form
          className="card mb-4 flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            inviteMutation.mutate();
          }}
        >
          <div className="field mb-0 flex-1">
            <label>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field mb-0">
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value as never)}>
              <option value="EDITOR">Editor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button type="submit" disabled={inviteMutation.isPending} className="btn btn-primary btn-sm">
            {inviteMutation.isPending ? 'Inviting…' : 'Send invite'}
          </button>
          <p className="w-full text-[11.5px] text-sub">If they don't have an account yet, we'll email them a link to join once they register or log in.</p>
          {inviteMutation.isError && <p className="w-full text-xs text-danger">{apiErrorMessage(inviteMutation.error)}</p>}
        </form>
      )}
      {query.data && query.data.length === 0 && <EmptyState icon="👥" title="No team members yet" />}
      {query.data && query.data.length > 0 && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-line text-left text-[11.5px] text-sub">
                <th className="px-3 py-2.5">Member</th>
                <th className="px-3 py-2.5">Role</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {query.data.map((m) => (
                <tr key={m.id} className="border-b border-line last:border-0">
                  <td className="px-3 py-2.5">
                    {m.user ? m.user.username : <span className="text-sub">{m.invitedEmail} (not registered yet)</span>}
                  </td>
                  <td className="px-3 py-2.5">{m.role}</td>
                  <td className="px-3 py-2.5">
                    <Badge kind={m.status === 'ACTIVE' ? 'verified' : 'pending'}>{m.status === 'ACTIVE' ? 'Active' : 'Invitation sent'}</Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    {m.role !== 'OWNER' && (
                      <button onClick={() => removeMutation.mutate(m.id)} className="text-danger hover:underline">
                        Remove
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
