import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, MessageSquare, Trophy, Users, Check, X } from 'lucide-react';
import { useNotifications, type Notification, type NotificationType } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const TYPE_CONFIG: Record<NotificationType, { icon: React.FC<any>; color: string; bg: string }> = {
  DM: { icon: MessageSquare, color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  HACKATHON_CREATED: { icon: Trophy, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  HACKATHON_ANNOUNCEMENT: { icon: Trophy, color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  TEAM_INVITE: { icon: Users, color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  TEAM_ACCEPTED: { icon: Users, color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const NotificationItem: React.FC<{ n: Notification; onMarkRead: () => void }> = ({ n, onMarkRead }) => {
  const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.DM;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        padding: '1rem',
        background: n.isRead ? 'transparent' : 'rgba(163, 230, 53, 0.06)',
        border: n.isRead ? '1px solid transparent' : '1px solid rgba(163,230,53,0.15)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        transition: 'all 0.2s',
        position: 'relative',
        display: 'flex',
        gap: '12px',
      }}
      onClick={!n.isRead ? onMarkRead : undefined}
      whileHover={{ background: 'rgba(255,255,255,0.04)' }}
    >
      {/* Icon */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '10px',
          background: config.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={16} color={config.color} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: '0.8rem',
            fontWeight: n.isRead ? 500 : 600,
            color: n.isRead ? 'var(--text-secondary)' : 'var(--text-primary)',
            marginBottom: '2px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {n.title}
        </p>
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {n.message}
        </p>
        <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          {timeAgo(n.createdAt)}
        </p>
      </div>

      {/* Unread dot */}
      {!n.isRead && (
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--accent-primary)',
            flexShrink: 0,
            marginTop: 4,
            boxShadow: '0 0 6px var(--accent-glow)',
          }}
        />
      )}
    </motion.div>
  );
};

const NotificationDropdown: React.FC<Props> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markRead, markAllRead, isLoading } = useNotifications();
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 9998,
            }}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 380,
              background: 'var(--bg-primary)',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={16} color="var(--accent-primary)" />
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: 'var(--accent-primary)',
                    color: '#fff',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '99px',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: '0.72rem',
                    color: 'var(--accent-primary)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(163,230,53,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  }}
                >
                  <Check size={12} />
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  padding: 4,
                  borderRadius: 6,
                }}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
            {isLoading ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  padding: '8px',
                }}
              >
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      height: 64,
                      borderRadius: 10,
                      background: 'rgba(255,255,255,0.04)',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                  />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '40px 16px',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '14px',
                    background: 'rgba(255,255,255,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Bell size={24} color="var(--text-muted)" />
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  No notifications yet
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {notifications.map((n) => (
                  <NotificationItem key={n.id} n={n} onMarkRead={() => markRead(n.id)} />
                ))}
              </div>
            )}
          </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdown;
