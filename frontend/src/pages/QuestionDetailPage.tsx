import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { questionsApi } from '@/api/questions.api';
import { Badge } from '@/components/Badge';
import { ReportModal } from '@/components/ReportModal';
import { ErrorState } from '@/components/LoadingSkeleton';
import { timeAgo } from '@/utils/formatDate';
import { useAuthStore } from '@/store/authStore';

export function QuestionDetailPage() {
  const { slug, id } = useParams();
  const isLoggedIn = useAuthStore((s) => Boolean(s.accessToken));
  const [answer, setAnswer] = useState('');
  const [reportTarget, setReportTarget] = useState<{ kind: 'question' | 'answer'; id: string } | null>(null);
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());
  const qc = useQueryClient();

  const query = useQuery({ queryKey: ['question', id], queryFn: () => questionsApi.getOne(id!), enabled: Boolean(id) });

  const answerMutation = useMutation({
    mutationFn: () => questionsApi.answer(id!, answer),
    onSuccess: () => {
      setAnswer('');
      qc.invalidateQueries({ queryKey: ['question', id] });
    },
  });

  const upvoteMutation = useMutation({
    mutationFn: (answerId: string) => questionsApi.upvote(answerId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['question', id] }),
  });

  const reportMutation = useMutation({
    mutationFn: (input: { reason: string; details?: string }) =>
      reportTarget?.kind === 'question' ? questionsApi.report(reportTarget.id, input.reason, input.details) : questionsApi.reportAnswer(reportTarget!.id, input.reason, input.details),
    onSuccess: () => {
      if (reportTarget) setReportedIds((prev) => new Set(prev).add(reportTarget.id));
      setReportTarget(null);
    },
  });

  if (query.isError) return <div className="px-4 py-6 sm:px-7"><ErrorState /></div>;
  if (!query.data) return <div className="px-4 py-6 sm:px-7">Loading…</div>;

  const question = query.data;
  const questionFlagged = question.status === 'FLAGGED';

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-7">
      <Link to={`/college/${slug}/questions`} className="mb-3 inline-block text-xs text-sub hover:text-brand">
        ← Back to questions
      </Link>

      {questionFlagged ? (
        <div className="mb-4 rounded-card border border-line bg-white p-4 opacity-60">
          <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold">
            <h1 className="text-lg">{question.title}</h1>
            <Badge kind="pending">Under review</Badge>
          </div>
          <p className="select-none text-sm blur-[2px]">This question has been reported and is being checked against community guidelines.</p>
        </div>
      ) : (
        <>
          <div className="mb-1 flex items-center gap-2">
            <h1 className="text-lg">{question.title}</h1>
            {isLoggedIn && (
              <button
                type="button"
                disabled={reportedIds.has(question.id)}
                onClick={() => setReportTarget({ kind: 'question', id: question.id })}
                className="text-xs text-sub hover:text-danger disabled:cursor-not-allowed"
              >
                {reportedIds.has(question.id) ? 'Reported' : 'Report'}
              </button>
            )}
          </div>
          {question.body && <p className="mb-4 text-sm text-sub">{question.body}</p>}
        </>
      )}

      <h4 className="mb-2.5 text-sm font-semibold">{question.answers.length} Answers</h4>
      <div className="mb-5 flex flex-col gap-2.5">
        {question.answers.map((a) =>
          a.status === 'FLAGGED' ? (
            <div key={a.id} className="card opacity-60">
              <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold">
                Anonymous Student <Badge kind="pending">Under review</Badge>
              </div>
              <p className="select-none text-sm blur-[2px]">This answer has been reported and is being checked against community guidelines.</p>
            </div>
          ) : (
            <div key={a.id} className="card">
              <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold">
                {a.author.verified ? <Badge kind="verified">Verified Student</Badge> : <span>Anonymous Student</span>}
                <span className="font-normal text-sub">· {timeAgo(a.createdAt)}</span>
              </div>
              <p className="text-sm">{a.body}</p>
              <div className="mt-2 flex items-center justify-between text-xs">
                <button
                  type="button"
                  disabled={!isLoggedIn}
                  onClick={() => upvoteMutation.mutate(a.id)}
                  className="text-sub hover:text-brand disabled:cursor-not-allowed"
                >
                  ▲ {a.upvoteCount} upvotes
                </button>
                {isLoggedIn && (
                  <button
                    type="button"
                    disabled={reportedIds.has(a.id)}
                    onClick={() => setReportTarget({ kind: 'answer', id: a.id })}
                    className="text-sub hover:text-danger disabled:cursor-not-allowed"
                  >
                    {reportedIds.has(a.id) ? 'Reported' : 'Report'}
                  </button>
                )}
              </div>
            </div>
          ),
        )}
      </div>

      {isLoggedIn ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (answer.trim().length >= 5) answerMutation.mutate();
          }}
          className="card"
        >
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Share what you know..."
            className="mb-3 w-full rounded-md border border-line p-2.5 text-sm outline-none focus:border-brand"
            required
            minLength={5}
          />
          <button type="submit" disabled={answerMutation.isPending} className="btn btn-primary btn-sm">
            {answerMutation.isPending ? 'Posting…' : 'Post answer'}
          </button>
        </form>
      ) : (
        <Link to="/login" className="btn btn-ghost">
          Log in to answer
        </Link>
      )}

      <ReportModal
        open={reportTarget !== null}
        onClose={() => setReportTarget(null)}
        submitting={reportMutation.isPending}
        onSubmit={(reason, details) => reportMutation.mutate({ reason, details })}
      />
    </div>
  );
}
