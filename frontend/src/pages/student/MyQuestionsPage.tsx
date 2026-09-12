import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { questionsApi } from '@/api/questions.api';
import { DashboardTopbar } from '@/layouts/DashboardLayout';
import { EmptyState } from '@/components/LoadingSkeleton';
import { timeAgo } from '@/utils/formatDate';

export function MyQuestionsPage() {
  const query = useQuery({ queryKey: ['questions', 'mine'], queryFn: questionsApi.mine });

  return (
    <div>
      <Helmet>
        <title>My Questions — StudentReview</title>
      </Helmet>
      <DashboardTopbar crumb="Account" title="My Questions" />

      <h4 className="mb-2.5 mt-1 text-sm font-semibold text-sub">Questions I've asked</h4>
      {query.data?.questions.length === 0 && <EmptyState icon="❓" title="You haven't asked any questions yet" />}
      <div className="mb-6 flex flex-col gap-2.5">
        {query.data?.questions.map((q) => (
          <Link key={q.id} to={`/college/${q.institution.slug}/questions/${q.id}`} className="card block hover:shadow-card">
            <h4 className="text-sm font-semibold">{q.title}</h4>
            <div className="mt-1 text-xs text-sub">
              {q.institution.name} · {q._count.answers} answers · {timeAgo(q.createdAt)}
            </div>
          </Link>
        ))}
      </div>

      <h4 className="mb-2.5 text-sm font-semibold text-sub">My answers</h4>
      {query.data?.answers.length === 0 && <EmptyState icon="💬" title="You haven't answered any questions yet" />}
      <div className="flex flex-col gap-2.5">
        {query.data?.answers.map((a) => (
          <Link key={a.id} to={`/college/${a.question.institution.slug}/questions/${a.question.id}`} className="card block hover:shadow-card">
            <div className="mb-1 text-xs text-sub">On: {a.question.title}</div>
            <p className="text-sm">{a.body}</p>
            <div className="mt-1.5 text-xs text-sub">
              ▲ {a.upvoteCount} upvotes · {timeAgo(a.createdAt)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
