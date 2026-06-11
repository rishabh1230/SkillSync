import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import api from '../api';

export type NotificationType = 'DM' | 'HACKATHON_CREATED' | 'HACKATHON_ANNOUNCEMENT' | 'TEAM_INVITE' | 'TEAM_ACCEPTED';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  addNotification: (n: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  markRead: async () => {},
  markAllRead: async () => {},
  addNotification: () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch on mount
  useEffect(() => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    api
      .get('/notifications')
      .then((res) => {
        const data: Notification[] = res.data || [];
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.isRead).length);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [isAuthenticated]);

  // Real-time socket events
  useEffect(() => {
    if (!socket) return;

    const handleNotification = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((c) => c + 1);
    };

    const handleUnreadCount = ({ count }: { count: number }) => {
      setUnreadCount(count);
    };

    socket.on('notification', handleNotification);
    socket.on('unread_count', handleUnreadCount);

    return () => {
      socket.off('notification', handleNotification);
      socket.off('unread_count', handleUnreadCount);
    };
  }, [socket]);

  const addNotification = useCallback((n: Notification) => {
    setNotifications((prev) => [n, ...prev]);
    if (!n.isRead) setUnreadCount((c) => c + 1);
  }, []);

  const markRead = useCallback(async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read', err);
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, isLoading, markRead, markAllRead, addNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
