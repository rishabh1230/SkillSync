import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Folder, LayoutGrid, Clock, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  status?: string;
}

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVars = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const Dashboard: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProjects(Array.isArray(res.data) ? res.data : (res.data?.data || []));
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [token]);

  return (
    <div className="container">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="h1 flex items-center gap-3">
            <LayoutGrid color="var(--accent-primary)" />
            Dashboard
          </h1>
          <p className="text-secondary" style={{ marginTop: '0.25rem' }}>
            Manage your active projects and tasks.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/create-project')}>
          <Plus size={20} />
          New Project
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center" style={{ height: '16rem', color: 'var(--text-secondary)' }}>
          Loading your workspace...
        </div>
      ) : projects.length === 0 ? (
        <div
          className="glass-panel flex flex-col items-center justify-center text-center"
          style={{ minHeight: '400px', padding: '3rem' }}
        >
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <Folder size={48} color="var(--text-muted)" />
          </div>
          <h2 className="h2" style={{ marginBottom: '0.5rem' }}>No projects yet</h2>
          <p className="text-secondary" style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
            Get started by creating your first project to organize your work and collaborate with your team.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/create-project')}>
            <Plus size={20} />
            Create Project
          </button>
        </div>
      ) : (
        <motion.div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}
          variants={containerVars}
          initial="hidden"
          animate="show"
        >
          {projects.map((project) => (
            <motion.div
              key={project.id}
              variants={itemVars}
              className="glass-panel flex flex-col cursor-pointer"
              style={{ padding: '1.5rem' }}
              whileHover={{ y: -5, transition: { duration: 0.2 }, boxShadow: 'var(--shadow-glow)' }}
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div className="flex justify-between items-start mb-4">
                <div style={{ backgroundColor: 'var(--accent-glow)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <Folder size={24} color="var(--accent-primary)" />
                </div>
                <button className="btn btn-secondary" style={{ padding: '0.4rem', border: 'none' }} onClick={(e) => { e.stopPropagation(); /* Add menu logic later */ }}>
                  <MoreVertical size={18} color="var(--text-muted)" />
                </button>
              </div>

              <h3 className="h3" style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{project.name || 'Untitled Project'}</h3>
              <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '1.5rem', flex: 1 }}>
                {project.description || 'No description provided.'}
              </p>

              <div
                className="flex justify-between items-center"
                style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}
              >
                <span className="flex items-center gap-1" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <Clock size={14} />
                  {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
                </span>
                <span
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: 'var(--success)'
                  }}
                >
                  {project.status || 'DRAFT'}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
