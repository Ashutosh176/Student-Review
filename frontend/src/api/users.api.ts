import { api, unwrap } from './client';
import type { ApiSuccess } from './client';
import type { InstitutionSummary } from '@/types';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export const usersApi = {
  savedInstitutions: async () => {
    const res = await api.get<ApiSuccess<{ institution: InstitutionSummary }[]>>('/users/saved-institutions');
    return res.data.data;
  },
  save: (institutionId: string) => unwrap(api.post('/users/saved-institutions', { institutionId })),
  unsave: (institutionId: string) => unwrap(api.delete(`/users/saved-institutions/${institutionId}`)),
  updateSettings: (input: {
    publicProfileOptIn?: boolean;
    notifyReviewActivity?: boolean;
    notifyCommunityActivity?: boolean;
    notifySubmissionUpdates?: boolean;
    notifySystem?: boolean;
  }) => unwrap(api.patch('/users/settings', input)),
  changePassword: (input: { currentPassword: string; newPassword: string }) =>
    unwrap<{ message: string }>(api.patch('/users/password', input)),
  deactivate: (password: string) => unwrap<{ message: string }>(api.post('/users/deactivate', { password })),
  notifications: async () => {
    const res = await api.get<ApiSuccess<NotificationItem[]>>('/users/notifications');
    return res.data.data;
  },
  markRead: (id: string) => unwrap(api.post(`/users/notifications/${id}/read`)),
  markAllRead: () => unwrap(api.post('/users/notifications/read-all')),
};

export type { NotificationItem };
