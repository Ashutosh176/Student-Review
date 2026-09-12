import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { authApi } from '@/api/auth.api';
import { reviewsApi } from '@/api/reviews.api';
import { questionsApi } from '@/api/questions.api';
import { usersApi } from '@/api/users.api';
import { DashboardTopbar } from '@/layouts/DashboardLayout';
import { Badge } from '@/components/Badge';

export function ProfilePage() {
  const meQuery = useQuery({ queryKey: ['auth', 'me'], queryFn: authApi.me });
  const reviewsQuery = useQuery({ queryKey: ['reviews', 'mine'], queryFn: reviewsApi.mine });
  const questionsQuery = useQuery({ queryKey: ['questions', 'mine'], queryFn: questionsApi.mine });
  const savedQuery = useQuery({ queryKey: ['saved-institutions'], queryFn: usersApi.savedInstitutions });

  const user = meQuery.data;

  return (
    <div>
      <Helmet>
        <title>Profile — StudentReview</title>
      </Helmet>
      <DashboardTopbar
        crumb="Account"
        title="Profile"
        right={
          <Link to="/settings" className="btn btn-ghost btn-sm">
            Edit settings
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <div className="card">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-light font-heading text-lg font-bold text-brand">
            {user?.username.slice(0, 2).toUpperCase()}
          </div>
          <h4 className="text-base">{user?.username}</h4>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {user?.emailVerified ? <Badge kind="verified">Email verified</Badge> : <Badge kind="pending">Email unverified</Badge>}
            <Badge kind={user?.publicProfileOptIn ? 'official' : 'pending'}>{user?.publicProfileOptIn ? 'Public profile' : 'Private profile'}</Badge>
          </div>
          <p className="mt-3 text-xs text-sub">
            Your identity is never shown on reviews or answers — those always display as "Anonymous Student" or "Verified
            Student" to everyone else.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link to="/my-reviews" className="card flex items-center justify-between hover:shadow-card">
            <div>
              <h4 className="text-sm font-semibold">Reviews</h4>
              <p className="text-xs text-sub">Reviews you've submitted</p>
            </div>
            <span className="font-heading text-xl font-extrabold">{reviewsQuery.data?.length ?? '—'}</span>
          </Link>
          <Link to="/my-questions" className="card flex items-center justify-between hover:shadow-card">
            <div>
              <h4 className="text-sm font-semibold">Questions &amp; Answers</h4>
              <p className="text-xs text-sub">Questions asked and answers given</p>
            </div>
            <span className="font-heading text-xl font-extrabold">
              {questionsQuery.data ? questionsQuery.data.questions.length + questionsQuery.data.answers.length : '—'}
            </span>
          </Link>
          <Link to="/saved-colleges" className="card flex items-center justify-between hover:shadow-card">
            <div>
              <h4 className="text-sm font-semibold">Saved Colleges</h4>
              <p className="text-xs text-sub">Colleges you're tracking</p>
            </div>
            <span className="font-heading text-xl font-extrabold">{savedQuery.data?.length ?? '—'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
