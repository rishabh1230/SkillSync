import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Search } from 'lucide-react';
import Sidebar from './Sidebar';
import NotificationDropdown from './NotificationDropdown';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isInitializing, user } = useAuth();
  const { unreadCount } = useNotifications();
  const [notifOpen, setNotifOpen] = React.useState(false);

  if (isInitializing) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          background: 'var(--bg-primary)',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '3px solid rgba(6,182,212,0.15)',
            borderTop: '3px solid var(--accent-primary)',
          }}
        />
        Loading SkillSync…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        {/* Topbar */}
        <header
          style={{
            padding: '2rem 3rem 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '2rem',
          }}
        >
          {/* Global Search Center */}
          <div style={{ flex: 1, maxWidth: '600px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'var(--bg-secondary)',
                padding: '0.75rem 1.25rem',
                borderRadius: '16px',
                width: '100%',
                color: 'var(--text-muted)',
                cursor: 'text',
                border: '1px solid rgba(255,255,255,0.04)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                transition: 'all 0.2s ease'
              }}
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
            >
              <Search size={18} />
              <span style={{ fontSize: '0.875rem', flex: 1, letterSpacing: '0.5px' }}>Search projects, users, hackathons...</span>
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '1px'
              }}>
                CTRL K
              </div>
            </div>
          </div>

          {/* Profile / Notifications */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setNotifOpen(true)}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.05)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              </div>
              {unreadCount > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: 'var(--danger)',
                    border: '2px solid var(--bg-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                  }}
                >
                  {unreadCount}
                </div>
              )}
            </div>

            <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />

            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.2 }}>
                {(user as any)?.username ?? 'User'}
              </p>
              <p style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 600 }}>
                @{(user as any)?.username?.toLowerCase() ?? 'user'}
              </p>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Profile Avatar */}
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '1.2rem',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                {(user as any)?.username?.[0]?.toUpperCase() ?? 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div
          style={{
            flex: 1,
            padding: '2.5rem 3rem',
            overflowY: 'auto',
          }}
        >
          <Outlet />
        </div>
      </main>

      <NotificationDropdown isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
};

export default ProtectedRoute;
