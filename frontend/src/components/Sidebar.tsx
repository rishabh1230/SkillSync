import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, FolderPlus, User, Zap, Trophy, MessageSquare, LogOut, Heart, Calendar, Diamond, Settings, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/hackathons',     icon: Trophy,          label: 'Hackathons' },
  { to: '/chat',           icon: MessageSquare,   label: 'Messages' },
  { to: '/profile',        icon: User,            label: 'Profile' },
];

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside
      style={{
        width: '90px',
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem 0',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div 
        onClick={() => navigate('/dashboard')}
        style={{ 
          width: '46px', 
          height: '46px', 
          borderRadius: '50%', 
          background: '#ffffff', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          cursor: 'pointer',
          marginBottom: '3rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <span style={{ color: '#000', fontWeight: 900, fontSize: '1.2rem', letterSpacing: '-1px' }}>INI</span>
      </div>

      {/* Nav Items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname.startsWith(to) || (to === '/dashboard' && location.pathname === '/');
          
          return (
            <div key={to} style={{ position: 'relative' }}>
              <NavLink
                to={to}
                title={label}
                style={{
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '16px',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  background: isActive ? 'var(--bg-secondary)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)';
                  }
                }}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </NavLink>
            </div>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: 'auto' }}>
        <button
          onClick={logout}
          title="Sign Out"
          style={{
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '16px',
            color: 'var(--text-muted)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
          }}
        >
          <LogOut size={22} />
        </button>

        <button
          onClick={() => navigate('/create-project')}
          title="New Project"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
          }}
        >
          <Plus size={24} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

