import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { Helmet } from 'react-helmet-async';
import { adminApi } from '@/api/admin.api';
import { DashboardTopbar } from '@/layouts/DashboardLayout';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/LoadingSkeleton';

const TABS = ['Reviews', 'Questions', 'Answers'] as const;
type Tab = (typeof TABS)[number];

function statusBadgeKind(status: string) {
  return status === 'OPEN' ? 'flagged' : status === 'DISMISSED' ? 'verified' : 'pending';
}

function ReviewReportsTable() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['admin', 'reports'], queryFn: () => adminApi.reports({ pageSize: 30 }) });
  const dismissMutation = useMutation({
    mutationFn: (id: string) => adminApi.dismissReport(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'reports'] }),
  });

  if (query.data && query.data.items.length === 0) return <EmptyState icon="🚩" title="No open reports" />;
  if (!query.data) return null;

  return (
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
              <td className="max-w-[220px] truncate px-3 py-2.5">Review on {r.review.institution.name}</td>
              <td className="px-3 py-2.5">{r.reason.replace(/_/g, ' ')}</td>
              <td className="px-3 py-2.5">
                <Badge kind={statusBadgeKind(r.status)}>{r.status}</Badge>
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
  );
}

// Questions/answers have no separate moderation-queue page the way reviews
// do (AdminReviewsPage) — so these two tables let an admin act on the
// underlying content (restore it, or remove it) right from the report row,
// in addition to just dismissing the complaint.
function QuestionReportsTable() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['admin', 'question-reports'], queryFn: () => adminApi.questionReports({ pageSize: 30 }) });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'question-reports'] });
  const dismissMutation = useMutation({ mutationFn: (id: string) => adminApi.dismissQuestionReport(id), onSuccess: invalidate });
  const moderateMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'APPROVE' | 'REMOVE' }) => adminApi.moderateQuestion(id, action),
    onSuccess: invalidate,
  });

  if (query.data && query.data.items.length === 0) return <EmptyState icon="🚩" title="No open question reports" />;
  if (!query.data) return null;

  return (
    <div className="card overflow-x-auto p-0">
      <table className="w-full text-[12.5px]">
        <thead>
          <tr className="border-b border-line text-left text-[11.5px] text-sub">
            <th className="px-3 py-2.5">Question</th>
            <th className="px-3 py-2.5">Reason</th>
            <th className="px-3 py-2.5">Content status</th>
            <th className="px-3 py-2.5">Report status</th>
            <th className="px-3 py-2.5">Actions</th>
          </tr>
        </thead>
        <tbody>
          {query.data.items.map((r) => (
            <tr key={r.id} className="border-b border-line last:border-0">
              <td className="max-w-[220px] truncate px-3 py-2.5">
                {r.question.title} <span className="text-sub">({r.question.institution.name})</span>
              </td>
              <td className="px-3 py-2.5">{r.reason.replace(/_/g, ' ')}</td>
              <td className="px-3 py-2.5">
                <Badge kind={r.question.status === 'FLAGGED' ? 'flagged' : r.question.status === 'REMOVED' ? 'flagged' : 'verified'}>{r.question.status}</Badge>
              </td>
              <td className="px-3 py-2.5">
                <Badge kind={statusBadgeKind(r.status)}>{r.status}</Badge>
              </td>
              <td className="px-3 py-2.5">
                {r.question.status === 'FLAGGED' && (
                  <>
                    <button onClick={() => moderateMutation.mutate({ id: r.question.id, action: 'APPROVE' })} className="text-brand hover:underline">
                      Restore
                    </button>{' '}
                    <button onClick={() => moderateMutation.mutate({ id: r.question.id, action: 'REMOVE' })} className="text-danger hover:underline">
                      Remove
                    </button>{' '}
                  </>
                )}
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
  );
}

function AnswerReportsTable() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['admin', 'answer-reports'], queryFn: () => adminApi.answerReports({ pageSize: 30 }) });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'answer-reports'] });
  const dismissMutation = useMutation({ mutationFn: (id: string) => adminApi.dismissAnswerReport(id), onSuccess: invalidate });
  const moderateMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'APPROVE' | 'REMOVE' }) => adminApi.moderateAnswer(id, action),
    onSuccess: invalidate,
  });

  if (query.data && query.data.items.length === 0) return <EmptyState icon="🚩" title="No open answer reports" />;
  if (!query.data) return null;

  return (
    <div className="card overflow-x-auto p-0">
      <table className="w-full text-[12.5px]">
        <thead>
          <tr className="border-b border-line text-left text-[11.5px] text-sub">
            <th className="px-3 py-2.5">Answer</th>
            <th className="px-3 py-2.5">Reason</th>
            <th className="px-3 py-2.5">Content status</th>
            <th className="px-3 py-2.5">Report status</th>
            <th className="px-3 py-2.5">Actions</th>
          </tr>
        </thead>
        <tbody>
          {query.data.items.map((r) => (
            <tr key={r.id} className="border-b border-line last:border-0">
              <td className="max-w-[220px] truncate px-3 py-2.5">
                {r.answer.body} <span className="text-sub">(on "{r.answer.question.title}")</span>
              </td>
              <td className="px-3 py-2.5">{r.reason.replace(/_/g, ' ')}</td>
              <td className="px-3 py-2.5">
                <Badge kind={r.answer.status === 'FLAGGED' ? 'flagged' : r.answer.status === 'REMOVED' ? 'flagged' : 'verified'}>{r.answer.status}</Badge>
              </td>
              <td className="px-3 py-2.5">
                <Badge kind={statusBadgeKind(r.status)}>{r.status}</Badge>
              </td>
              <td className="px-3 py-2.5">
                {r.answer.status === 'FLAGGED' && (
                  <>
                    <button onClick={() => moderateMutation.mutate({ id: r.answer.id, action: 'APPROVE' })} className="text-brand hover:underline">
                      Restore
                    </button>{' '}
                    <button onClick={() => moderateMutation.mutate({ id: r.answer.id, action: 'REMOVE' })} className="text-danger hover:underline">
                      Remove
                    </button>{' '}
                  </>
                )}
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
  );
}

export function AdminReportsPage() {
  const [tab, setTab] = useState<Tab>('Reviews');

  return (
    <div>
      <Helmet>
        <title>Reports — Admin — StudentReview</title>
      </Helmet>
      <DashboardTopbar crumb="Admin" title="Reports" />
      <div className="mb-3 flex gap-2">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={clsx('btn btn-sm', tab === t ? 'btn-primary' : 'btn-ghost')} type="button">
            {t}
          </button>
        ))}
      </div>
      {tab === 'Reviews' && <ReviewReportsTable />}
      {tab === 'Questions' && <QuestionReportsTable />}
      {tab === 'Answers' && <AnswerReportsTable />}
    </div>
  );
}
