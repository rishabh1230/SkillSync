import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderPlus, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const { logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="mb-8">
        <h2 className="h2 text-center" style={{ color: 'var(--accent-primary)' }}>SkillSync</h2>
      </div>

      <nav className="flex flex-col gap-2" style={{ flex: 1 }}>
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'} flex justify-start items-center`}
          style={{ width: '100%', border: 'none' }}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        <NavLink
          to="/create-project"
          className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'} flex justify-start items-center`}
          style={{ width: '100%', border: 'none' }}
        >
          <FolderPlus size={20} />
          Create Project
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-secondary'} flex justify-start items-center`}
          style={{ width: '100%', border: 'none' }}
        >
          <User size={20} />
          Profile
        </NavLink>
      </nav>

      <button
        onClick={logout}
        className="btn btn-secondary flex justify-start items-center"
        style={{ width: '100%', border: 'none', color: 'var(--danger)' }}
      >
        <LogOut size={20} />
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
