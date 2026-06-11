import api from './index';
import type { Notification } from '../context/NotificationContext';

export const notificationsApi = {
  getAll: () => api.get<Notification[]>('/notifications'),
  markRead: (id: string) => api.patch<Notification>(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};
