import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { reviewsApi } from '@/api/reviews.api';
import { usersApi } from '@/api/users.api';
import { DashboardTopbar } from '@/layouts/DashboardLayout';
import { KpiCard } from '@/components/KpiCard';
import { useAuthStore } from '@/store/authStore';
import { timeAgo } from '@/utils/formatDate';

export function StudentDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const reviewsQuery = useQuery({ queryKey: ['reviews', 'mine'], queryFn: reviewsApi.mine });
  const savedQuery = useQuery({ queryKey: ['saved-institutions'], queryFn: usersApi.savedInstitutions });
  const notificationsQuery = useQuery({ queryKey: ['notifications'], queryFn: usersApi.notifications });

  const pendingReviews = reviewsQuery.data?.filter((r) => r.status === 'PENDING').length ?? 0;
  const unreadNotifications = notificationsQuery.data?.filter((n) => !n.isRead).length ?? 0;

  return (
    <div>
      <Helmet>
        <title>Dashboard — StudentReview</title>
      </Helmet>
      <DashboardTopbar crumb="Account" title={`Welcome back${user ? `, ${user.username}` : ''}`} />
      <div className="mb-4.5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="My Reviews" value={reviewsQuery.data?.length ?? 0} trend={pendingReviews ? `${pendingReviews} pending` : undefined} trendKind="warn" />
        <KpiCard label="Saved Colleges" value={savedQuery.data?.length ?? 0} />
        <KpiCard label="Notifications" value={notificationsQuery.data?.length ?? 0} trend={unreadNotifications ? `${unreadNotifications} unread` : undefined} trendKind="warn" />
        <KpiCard label="Account status" value={user?.emailVerified ? 'Verified' : 'Unverified'} />
      </div>
      <div className="card">
        <h4 className="mb-3 text-sm">Recent activity</h4>
        {notificationsQuery.data?.slice(0, 5).map((n) => (
          <div key={n.id} className="border-b border-line py-2.5 text-[12.5px] last:border-0">
            {n.title} <span className="text-sub">· {timeAgo(n.createdAt)}</span>
          </div>
        ))}
        {notificationsQuery.data?.length === 0 && <p className="text-[12.5px] text-sub">No recent activity yet.</p>}
      </div>
    </div>
  );
}
