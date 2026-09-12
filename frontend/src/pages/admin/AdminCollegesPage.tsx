import { Fragment, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import { Helmet } from 'react-helmet-async';
import { adminApi, type CreateInstitutionInput } from '@/api/admin.api';
import { apiErrorMessage } from '@/api/client';
import { DashboardTopbar } from '@/layouts/DashboardLayout';
import { Badge } from '@/components/Badge';
import { AddInstitutionModal } from '@/components/AddInstitutionModal';

const STATUS_TABS = [
  { value: undefined, label: 'All' },
  { value: 'PENDING' as const, label: 'Pending' },
  { value: 'APPROVED' as const, label: 'Approved' },
  { value: 'REJECTED' as const, label: 'Rejected' },
];

function EmailDomainsPanel({ institutionId }: { institutionId: string }) {
  const qc = useQueryClient();
  const [domain, setDomain] = useState('');
  const query = useQuery({ queryKey: ['admin', 'email-domains', institutionId], queryFn: () => adminApi.emailDomains(institutionId) });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'email-domains', institutionId] });

  const addMutation = useMutation({
    mutationFn: () => adminApi.addEmailDomain(institutionId, domain),
    onSuccess: () => {
      setDomain('');
      invalidate();
    },
  });

  const removeMutation = useMutation({
    mutationFn: (domainId: string) => adminApi.removeEmailDomain(institutionId, domainId),
    onSuccess: invalidate,
  });

  return (
    <div>
      <p className="mb-2 text-[11.5px] text-sub">
        Official email domains for this institution — only these can be used to verify a student/alumni review submission.
      </p>
      <div className="mb-2 flex flex-wrap gap-2">
        {query.data?.map((d) => (
          <span key={d.id} className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[12px]">
            {d.domain}
            <button onClick={() => removeMutation.mutate(d.id)} className="text-danger hover:underline">
              ✕
            </button>
          </span>
        ))}
        {query.data?.length === 0 && <span className="text-[12px] text-sub">No domains added yet.</span>}
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (domain.trim()) addMutation.mutate();
        }}
      >
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="university.edu.in"
          className="flex-1 rounded-md border border-line px-2.5 py-1.5 text-[12.5px] outline-none focus:border-brand"
        />
        <button type="submit" className="btn btn-primary btn-sm" disabled={!domain.trim() || addMutation.isPending}>
          Add
        </button>
      </form>
      {addMutation.isError && <p className="mt-2 text-xs text-danger">{apiErrorMessage(addMutation.error)}</p>}
    </div>
  );
}

export function AdminCollegesPage() {
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [domainsOpenId, setDomainsOpenId] = useState<string | null>(null);
  const [params, setParams] = useSearchParams();
  const status = (params.get('status') as 'PENDING' | 'APPROVED' | 'REJECTED' | null) ?? undefined;

  const query = useQuery({
    queryKey: ['admin', 'institutions', status],
    queryFn: () => adminApi.institutions({ pageSize: 30, status }),
  });
  const featureMutation = useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) => adminApi.setFeatured(id, featured),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'institutions'] }),
  });
  const createMutation = useMutation({
    mutationFn: (input: CreateInstitutionInput) => adminApi.createInstitution(input),
    onSuccess: () => {
      setAddOpen(false);
      qc.invalidateQueries({ queryKey: ['admin', 'institutions'] });
    },
  });
  const decideMutation = useMutation({
    mutationFn: ({ id, decision, reason }: { id: string; decision: 'APPROVED' | 'REJECTED'; reason?: string }) =>
      adminApi.decideInstitution(id, decision, reason),
    onSuccess: () => {
      setRejectingId(null);
      setRejectReason('');
      qc.invalidateQueries({ queryKey: ['admin', 'institutions'] });
    },
  });

  return (
    <div>
      <Helmet>
        <title>Colleges — Admin — StudentReview</title>
      </Helmet>
      <DashboardTopbar
        crumb="Admin"
        title="Colleges"
        right={
          <button className="btn btn-primary btn-sm" onClick={() => setAddOpen(true)}>
            + Add institution
          </button>
        }
      />

      <div className="mb-3 flex gap-2">
        {STATUS_TABS.map((t) => (
          <button
            key={t.label}
            onClick={() => setParams(t.value ? { status: t.value } : {})}
            className={clsx('btn btn-sm', status === t.value ? 'btn-primary' : 'btn-ghost')}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      {decideMutation.isError && <p className="mb-3 text-xs text-danger">{apiErrorMessage(decideMutation.error)}</p>}

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="border-b border-line text-left text-[11.5px] text-sub">
              <th className="px-3 py-2.5">College</th>
              <th className="px-3 py-2.5">Location</th>
              <th className="px-3 py-2.5">Submitted by</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Reviews</th>
              <th className="px-3 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {query.data && query.data.items.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-sub" colSpan={6}>
                  No colleges here yet.
                </td>
              </tr>
            )}
            {query.data?.items.map((inst) => (
              <Fragment key={inst.id}>
                <tr className="border-b border-line last:border-0">
                  <td className="px-3 py-2.5">
                    {inst.status === 'APPROVED' ? (
                      <Link to={`/college/${inst.slug}`} className="hover:text-brand">
                        {inst.name}
                      </Link>
                    ) : (
                      inst.name
                    )}
                  </td>
                  <td className="px-3 py-2.5">{inst.locations[0] ? `${inst.locations[0].city}` : '—'}</td>
                  <td className="px-3 py-2.5">{inst.submittedBy ? inst.submittedBy.username : <span className="text-sub">Admin</span>}</td>
                  <td className="px-3 py-2.5">
                    <Badge kind={inst.status === 'APPROVED' ? 'verified' : inst.status === 'REJECTED' ? 'flagged' : 'pending'}>
                      {inst.status === 'APPROVED' ? (inst.verified ? 'Verified' : 'Approved') : inst.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5">{inst._count.reviews}</td>
                  <td className="px-3 py-2.5">
                    {inst.status === 'PENDING' ? (
                      rejectingId === inst.id ? (
                        <span className="text-sub">Add a reason below</span>
                      ) : (
                        <>
                          <button onClick={() => decideMutation.mutate({ id: inst.id, decision: 'APPROVED' })} className="text-brand hover:underline">
                            Approve
                          </button>{' '}
                          <button onClick={() => setRejectingId(inst.id)} className="text-danger hover:underline">
                            Reject
                          </button>
                        </>
                      )
                    ) : (
                      <>
                        <button onClick={() => featureMutation.mutate({ id: inst.id, featured: !inst.featured })} className="text-brand hover:underline">
                          {inst.featured ? 'Unfeature' : 'Feature'}
                        </button>{' '}
                        <button
                          onClick={() => setDomainsOpenId(domainsOpenId === inst.id ? null : inst.id)}
                          className="text-brand hover:underline"
                        >
                          {domainsOpenId === inst.id ? 'Hide domains' : 'Email domains'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
                {domainsOpenId === inst.id && (
                  <tr className="border-b border-line bg-surface last:border-0">
                    <td className="px-3 py-3" colSpan={6}>
                      <EmailDomainsPanel institutionId={inst.id} />
                    </td>
                  </tr>
                )}
                {rejectingId === inst.id && (
                  <tr className="border-b border-line bg-surface last:border-0">
                    <td className="px-3 py-2.5" colSpan={6}>
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Reason for rejecting (optional)"
                          className="flex-1 rounded-md border border-line px-2.5 py-1.5 text-[12.5px] outline-none focus:border-brand"
                        />
                        <button
                          onClick={() => decideMutation.mutate({ id: inst.id, decision: 'REJECTED', reason: rejectReason || undefined })}
                          className="btn btn-primary btn-sm"
                          disabled={decideMutation.isPending}
                        >
                          Confirm reject
                        </button>
                        <button
                          onClick={() => {
                            setRejectingId(null);
                            setRejectReason('');
                          }}
                          className="btn btn-ghost btn-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <AddInstitutionModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={(input) => createMutation.mutate(input)}
        submitting={createMutation.isPending}
        error={createMutation.error}
      />
    </div>
  );
}
