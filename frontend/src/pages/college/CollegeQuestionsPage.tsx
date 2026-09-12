import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { institutionsApi } from '@/api/institutions.api';
import { questionsApi } from '@/api/questions.api';
import { EmptyState, ErrorState } from '@/components/LoadingSkeleton';
import { timeAgo } from '@/utils/formatDate';
import { useAuthStore } from '@/store/authStore';
import { useCollegeContext } from './CollegeLayout';

export function CollegeQuestionsPage() {
  const inst = useCollegeContext();
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((s) => Boolean(s.accessToken));
  const [asking, setAsking] = useState(false);
  const [title, setTitle] = useState('');
  const qc = useQueryClient();

  const query = useQuery({ queryKey: ['institution-questions', inst.slug], queryFn: () => institutionsApi.questions(inst.slug) });

  const askMutation = useMutation({
    mutationFn: () => questionsApi.create(inst.id, title),
    onSuccess: () => {
      setTitle('');
      setAsking(false);
      qc.invalidateQueries({ queryKey: ['institution-questions', inst.slug] });
    },
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-base">Questions &amp; Answers</h4>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => (isLoggedIn ? setAsking((v) => !v) : navigate('/login'))}
        >
          Ask a question
        </button>
      </div>

      {asking && (
        <form
          className="card mb-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (title.trim().length >= 10) askMutation.mutate();
          }}
        >
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you want to ask current or former students?"
            className="mb-3 w-full rounded-md border border-line p-2.5 text-sm outline-none focus:border-brand"
            minLength={10}
            required
          />
          <button type="submit" disabled={askMutation.isPending} className="btn btn-primary btn-sm">
            {askMutation.isPending ? 'Posting…' : 'Post question'}
          </button>
        </form>
      )}

      {query.isError && <ErrorState />}
      {query.data && query.data.length === 0 && <EmptyState icon="❓" title="No questions yet" description="Ask the first question about this college." />}
      {query.data && query.data.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {query.data.map((q) => (
            <Link to={`/college/${inst.slug}/questions/${q.id}`} key={q.id} className="card block hover:shadow-card">
              <h4 className="text-sm font-semibold">{q.title}</h4>
              <div className="mt-1.5 text-xs text-sub">
                Anonymous · {q._count.answers} answer{q._count.answers === 1 ? '' : 's'} · {timeAgo(q.createdAt)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
