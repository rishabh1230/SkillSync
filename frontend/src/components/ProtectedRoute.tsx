import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Search } from 'lucide-react';
import Sidebar from './Sidebar';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isInitializing, user } = useAuth();

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
            gap: '1rem',
          }}
        >
          {/* Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                background: 'var(--bg-secondary)',
                padding: '0.6rem 1.25rem',
                borderRadius: '999px',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
              }}
            >
              <div style={{ width: 14, height: 14, border: '1.5px solid #fff', borderRadius: 3 }} />
              Check Box
            </div>
            <div
              style={{
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '0.6rem 1.25rem',
                borderRadius: '999px',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
              Monitoring
            </div>
            <div
              style={{
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '0.6rem 1.25rem',
                borderRadius: '999px',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Support
            </div>
            <div
              style={{
                background: 'var(--bg-secondary)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                marginLeft: '0.5rem'
              }}
            >
              <Search size={18} />
            </div>
          </div>

          {/* Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.2 }}>
                {(user as any)?.username ?? 'User'}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                @{(user as any)?.username?.toLowerCase() ?? 'user'}
              </p>
            </div>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '1rem',
                  border: '2px solid rgba(255,255,255,0.1)'
                }}
              >
                {(user as any)?.username?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: 'var(--danger)',
                  border: '2px solid var(--bg-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                }}
              >
                2
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
    </div>
  );
};

export default ProtectedRoute;
