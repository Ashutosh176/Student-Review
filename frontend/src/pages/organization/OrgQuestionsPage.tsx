import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { institutionsApi } from '@/api/institutions.api';
import { DashboardTopbar } from '@/layouts/DashboardLayout';
import { EmptyState } from '@/components/LoadingSkeleton';
import { timeAgo } from '@/utils/formatDate';
import { useOrgContext } from './OrgLayout';

export function OrgQuestionsPage() {
  const org = useOrgContext();
  const query = useQuery({ queryKey: ['institution-questions', org.institution.slug], queryFn: () => institutionsApi.questions(org.institution.slug) });

  return (
    <div>
      <Helmet>
        <title>Questions — Organization — StudentReview</title>
      </Helmet>
      <DashboardTopbar crumb="Organization" title="Questions" />
      {query.data && query.data.length === 0 && <EmptyState icon="❓" title="No student questions yet" />}
      <div className="flex flex-col gap-2.5">
        {query.data?.map((q) => (
          <Link key={q.id} to={`/college/${org.institution.slug}/questions/${q.id}`} className="card block hover:shadow-card">
            <h4 className="text-sm font-semibold">{q.title}</h4>
            <div className="mt-1 text-xs text-sub">
              {q._count.answers} answers · {timeAgo(q.createdAt)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
