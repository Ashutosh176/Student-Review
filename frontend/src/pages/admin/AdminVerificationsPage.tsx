import { Fragment, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { adminApi } from '@/api/admin.api';
import { apiErrorMessage } from '@/api/client';
import { DashboardTopbar } from '@/layouts/DashboardLayout';
import { Badge, type BadgeKind } from '@/components/Badge';
import { EmptyState } from '@/components/LoadingSkeleton';

const STATUS_BADGE: Record<string, BadgeKind> = {
  VERIFIED: 'verified',
  PENDING: 'pending',
  REJECTED: 'flagged',
  EXPIRED: 'flagged',
  REVOKED: 'flagged',
};

const RELATIONSHIP_LABEL: Record<string, string> = {
  CURRENT_STUDENT: 'Current Student',
  ALUMNI: 'Alumni',
  FORMER_STUDENT: 'Former Student',
};

export function AdminVerificationsPage() {
  const qc = useQueryClient();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const query = useQuery({ queryKey: ['admin', 'verifications'], queryFn: () => adminApi.verifications() });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'verifications'] });

  const decideMutation = useMutation({
    mutationFn: ({ id, decision, reason }: { id: string; decision: 'APPROVED' | 'REJECTED'; reason?: string }) =>
      adminApi.decideVerification(id, decision, reason),
    onSuccess: () => {
      setRejectingId(null);
      setRejectReason('');
      invalidate();
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => adminApi.revokeVerification(id, 'Revoked by admin'),
    onSuccess: invalidate,
  });

  return (
    <div>
      <Helmet>
        <title>Verification Queue — Admin — StudentReview</title>
      </Helmet>
      <DashboardTopbar crumb="Admin" title="Verification Queue" />
      {(decideMutation.isError || revokeMutation.isError) && (
        <p className="mb-3 text-xs text-danger">{apiErrorMessage(decideMutation.error ?? revokeMutation.error)}</p>
      )}
      {query.data && query.data.length === 0 && <EmptyState icon="✅" title="No verification requests yet" />}
      {query.data && query.data.length > 0 && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-line text-left text-[11.5px] text-sub">
                <th className="px-3 py-2.5">Applicant</th>
                <th className="px-3 py-2.5">Institution</th>
                <th className="px-3 py-2.5">Relationship</th>
                <th className="px-3 py-2.5">Method</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {query.data.map((v) => (
                <Fragment key={v.id}>
                  <tr className="border-b border-line last:border-0">
                    <td className="px-3 py-2.5">{v.user.username}</td>
                    <td className="px-3 py-2.5">{v.institution.name}</td>
                    <td className="px-3 py-2.5">{RELATIONSHIP_LABEL[v.relationship] ?? v.relationship}</td>
                    <td className="px-3 py-2.5">
                      {v.method === 'EMAIL_OTP' ? (
                        'University email'
                      ) : v.hasDocument ? (
                        <button onClick={() => adminApi.downloadVerificationDocument(v.id)} className="text-brand hover:underline">
                          View document
                        </button>
                      ) : (
                        'Document'
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge kind={STATUS_BADGE[v.status] ?? 'pending'}>{v.status}</Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      {v.status === 'PENDING' && v.method === 'DOCUMENT_UPLOAD' && (
                        <>
                          <button onClick={() => decideMutation.mutate({ id: v.id, decision: 'APPROVED' })} className="text-brand hover:underline">
                            Approve
                          </button>{' '}
                          <button onClick={() => setRejectingId(v.id)} className="text-danger hover:underline">
                            Reject
                          </button>
                        </>
                      )}
                      {v.status === 'VERIFIED' && (
                        <button onClick={() => revokeMutation.mutate(v.id)} className="text-danger hover:underline">
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                  {rejectingId === v.id && (
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
                            onClick={() => decideMutation.mutate({ id: v.id, decision: 'REJECTED', reason: rejectReason || undefined })}
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
      )}
    </div>
  );
}
