import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { usersApi, type NotificationItem } from '@/api/users.api';
import { DashboardTopbar } from '@/layouts/DashboardLayout';
import { EmptyState } from '@/components/LoadingSkeleton';
import { timeAgo } from '@/utils/formatDate';
import clsx from 'clsx';

export function NotificationsPage() {
  const navigate = useNavigate();
  const query = useQuery({ queryKey: ['notifications'], queryFn: usersApi.notifications });
  const qc = useQueryClient();
  const markAllMutation = useMutation({
    mutationFn: usersApi.markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
  const markOneMutation = useMutation({
    mutationFn: (id: string) => usersApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  function handleOpen(n: NotificationItem) {
    if (!n.isRead) markOneMutation.mutate(n.id);
    if (n.link) navigate(n.link);
  }

  return (
    <div>
      <Helmet>
        <title>Notifications — StudentReview</title>
      </Helmet>
      <DashboardTopbar
        crumb="Account"
        title="Notifications"
        right={
          <button className="btn btn-ghost btn-sm" onClick={() => markAllMutation.mutate()}>
            Mark all read
          </button>
        }
      />
      {query.data && query.data.length === 0 && <EmptyState icon="🔔" title="You're all caught up" />}
      {query.data && query.data.length > 0 && (
        <div className="card divide-y divide-line p-0">
          {query.data.map((n) => (
            <button
              key={n.id}
              onClick={() => handleOpen(n)}
              className={clsx('flex w-full items-start gap-2.5 px-4 py-3.5 text-left', !n.isRead && 'bg-brand-light')}
            >
              <span className={clsx('mt-1 h-2 w-2 flex-none rounded-full', !n.isRead && 'bg-brand')} />
              <div>
                <div className={clsx('text-[13px]', !n.isRead ? 'font-bold' : 'font-medium')}>{n.title}</div>
                {n.body && <div className="mt-0.5 text-xs text-sub">{n.body}</div>}
                <div className="mt-0.5 text-xs text-sub">{timeAgo(n.createdAt)}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
