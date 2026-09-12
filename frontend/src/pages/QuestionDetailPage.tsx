import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { questionsApi } from '@/api/questions.api';
import { Badge } from '@/components/Badge';
import { ErrorState } from '@/components/LoadingSkeleton';
import { timeAgo } from '@/utils/formatDate';
import { useAuthStore } from '@/store/authStore';

export function QuestionDetailPage() {
  const { slug, id } = useParams();
  const isLoggedIn = useAuthStore((s) => Boolean(s.accessToken));
  const [answer, setAnswer] = useState('');
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

  if (query.isError) return <div className="px-4 py-6 sm:px-7"><ErrorState /></div>;
  if (!query.data) return <div className="px-4 py-6 sm:px-7">Loading…</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-7">
      <Link to={`/college/${slug}/questions`} className="mb-3 inline-block text-xs text-sub hover:text-brand">
        ← Back to questions
      </Link>
      <h1 className="mb-1 text-lg">{query.data.title}</h1>
      {query.data.body && <p className="mb-4 text-sm text-sub">{query.data.body}</p>}

      <h4 className="mb-2.5 text-sm font-semibold">{query.data.answers.length} Answers</h4>
      <div className="mb-5 flex flex-col gap-2.5">
        {query.data.answers.map((a) => (
          <div key={a.id} className="card">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold">
              {a.author.verified ? <Badge kind="verified">Verified Student</Badge> : <span>Anonymous Student</span>}
              <span className="font-normal text-sub">· {timeAgo(a.createdAt)}</span>
            </div>
            <p className="text-sm">{a.body}</p>
            <button
              type="button"
              disabled={!isLoggedIn}
              onClick={() => upvoteMutation.mutate(a.id)}
              className="mt-2 text-xs text-sub hover:text-brand disabled:cursor-not-allowed"
            >
              ▲ {a.upvoteCount} upvotes
            </button>
          </div>
        ))}
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
    </div>
  );
}
