import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, FolderPlus, User, LogOut, Zap, Trophy, Bell, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';

const navItems = [
  { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/hackathons',     icon: Trophy,          label: 'Hackathons' },
  { to: '/chat',           icon: MessageSquare,   label: 'Messages' },
  { to: '/create-project', icon: FolderPlus,      label: 'New Project' },
  { to: '/profile',        icon: User,            label: 'Profile' },
];

const Sidebar: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        width: '260px',
        minHeight: '100vh',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid rgba(255,255,255,0.04)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.75rem 1.25rem',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
        boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
      }}
    >
      {/* Logo / Brand + Notification Bell */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', position: 'relative' }}>
        <motion.div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '0.5rem 0.75rem',
            cursor: 'pointer',
            flex: 1,
          }}
          onClick={() => navigate('/dashboard')}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 0 20px var(--accent-glow)',
            }}
          >
            <Zap size={20} color="#fff" />
          </div>
          <span
            style={{
              fontWeight: 700,
              fontSize: '1.05rem',
              background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.01em',
            }}
          >
            SkillSync
          </span>
        </motion.div>

        {/* 🔔 Notification Bell */}
        <div style={{ position: 'relative' }}>
          <motion.button
            id="notification-bell"
            whileTap={{ scale: 0.9 }}
            onClick={() => setNotifOpen((v) => !v)}
            style={{
              background: notifOpen ? 'rgba(37,99,235,0.15)' : 'transparent',
              border: '1px solid ' + (notifOpen ? 'rgba(37,99,235,0.3)' : 'transparent'),
              borderRadius: '10px',
              padding: '7px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: notifOpen ? 'var(--accent-primary)' : 'var(--text-muted)',
              transition: 'all 0.2s',
              position: 'relative',
            }}
          >
            <Bell size={18} />
            {/* Badge */}
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  key="badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: '#fff',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    minWidth: '16px',
                    height: '16px',
                    borderRadius: '99px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    boxShadow: '0 0 8px rgba(239,68,68,0.5)',
                  }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Dropdown */}
          <NotificationDropdown isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        <p
          style={{
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            padding: '0 0.75rem',
            marginBottom: '0.5rem',
          }}
        >
          Navigation
        </p>

        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '0.65rem 0.75rem',
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#fff' : 'var(--text-secondary)',
              background: isActive
                ? 'rgba(37, 99, 235, 0.15)'
                : 'transparent',
              border: isActive
                ? '1px solid rgba(37, 99, 235, 0.3)'
                : '1px solid transparent',
              textDecoration: 'none',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isActive ? '0 0 15px var(--accent-glow)' : 'none',
            })}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.transform = 'translateX(4px)';
              if (!el.classList.contains('active')) {
                el.style.background = 'rgba(255,255,255,0.03)';
                el.style.color = '#fff';
              }
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.transform = 'translateX(0px)';
              if (!el.classList.contains('active')) {
                el.style.background = 'transparent';
                el.style.color = 'var(--text-secondary)';
              }
            }}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          paddingTop: '1rem',
          marginTop: '1rem',
        }}
      >
        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              padding: '0.5rem 0.75rem',
              marginBottom: '6px',
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
              }}
            >
              {(user as any).username?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#fff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {(user as any).username ?? 'User'}
              </p>
              <p
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {(user as any).email ?? ''}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '0.65rem 0.75rem',
            borderRadius: '10px',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#f87171',
            background: 'transparent',
            border: '1px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)';
            (e.currentTarget as HTMLButtonElement).style.border = '1px solid rgba(239,68,68,0.2)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.border = '1px solid transparent';
          }}
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
