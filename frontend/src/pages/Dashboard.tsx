import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Folder, LayoutGrid, Clock, TrendingUp, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

interface Project {
  id: string;
  name?: string;
  title?: string;
  description: string;
  createdAt: string;
  status?: string;
}

const statusColors: Record<string, { text: string; bg: string; dot: string }> = {
  ACTIVE:    { text: '#10b981', bg: 'rgba(16,185,129,0.1)',  dot: '#10b981' },
  DRAFT:     { text: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  dot: '#f59e0b' },
  COMPLETED: { text: '#818cf8', bg: 'rgba(99,102,241,0.1)',  dot: '#818cf8' },
  PUBLISHED: { text: '#06b6d4', bg: 'rgba(6,182,212,0.1)',   dot: '#06b6d4' },
  ARCHIVED:  { text: '#a1a1aa', bg: 'rgba(113,113,122,0.1)', dot: '#a1a1aa' },
};

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVars = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

const Dashboard: React.FC = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(Array.isArray(res.data) ? res.data : res.data?.data ?? []);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [token]);

  const displayName = (user as any)?.username ?? 'there';

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '2.5rem',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.25rem' }}>
            <LayoutGrid size={22} color="var(--accent-primary)" />
            <h1
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Hey, {displayName} 👋
            </h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginLeft: '32px' }}>
            {projects.length > 0
              ? `You have ${projects.length} project${projects.length !== 1 ? 's' : ''} in your workspace.`
              : 'Your workspace is empty. Create your first project!'}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/create-project')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.7rem 1.4rem',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
            color: '#fff',
            fontFamily: 'inherit',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(6,182,212,0.35)',
            flexShrink: 0,
          }}
        >
          <Plus size={18} />
          New Project
        </motion.button>
      </motion.div>

      {/* ── Stats strip ── */}
      {projects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
            marginBottom: '2rem',
          }}
        >
          {[
            { label: 'Total Projects', value: projects.length, icon: Layers, color: '#06b6d4' },
            {
              label: 'Active',
              value: projects.filter((p) => p.status === 'ACTIVE' || p.status === 'PUBLISHED').length,
              icon: TrendingUp,
              color: '#10b981',
            },
            {
              label: 'Drafts',
              value: projects.filter((p) => !p.status || p.status === 'DRAFT').length,
              icon: Folder,
              color: '#f59e0b',
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: `${color}18`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={18} color={color} />
              </div>
              <div>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                  {value}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {label}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '16rem', gap: '14px', color: 'var(--text-muted)' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid rgba(6,182,212,0.2)', borderTop: '3px solid var(--accent-primary)' }}
          />
          Loading your workspace…
        </div>
      ) : projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(255,255,255,0.08)',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '380px',
            padding: '3rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: 'rgba(6,182,212,0.08)',
              border: '1px solid rgba(6,182,212,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <Folder size={36} color="var(--accent-primary)" />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
            No projects yet
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '360px', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            Get started by creating your first project to organize your work and showcase your skills.
          </p>
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/create-project')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '0.75rem 1.5rem', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              color: '#fff', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 600,
              cursor: 'pointer', boxShadow: '0 4px 20px rgba(6,182,212,0.35)',
            }}
          >
            <Plus size={18} />
            Create Project
          </motion.button>
        </motion.div>
      ) : (
        <>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            All Projects
          </p>
          <motion.div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: '16px',
            }}
            variants={containerVars}
            initial="hidden"
            animate="show"
          >
            {projects.map((project) => {
              const st = statusColors[project.status ?? 'DRAFT'] ?? statusColors['DRAFT'];
              const displayTitle = project.title ?? project.name ?? 'Untitled Project';
              return (
                <motion.div
                  key={project.id}
                  variants={itemVars}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '18px',
                    padding: '1.4rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  whileHover={{
                    y: -4,
                    boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
                    borderColor: 'rgba(6,182,212,0.25)',
                  }}
                >
                  {/* Top accent line */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: 'linear-gradient(90deg, #06b6d4, #8b5cf6)',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                    }}
                    className="project-card-accent"
                  />

                  {/* Icon + status */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '11px',
                        background: 'rgba(6,182,212,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Folder size={20} color="var(--accent-primary)" />
                    </div>

                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                        background: st.bg,
                        color: st.text,
                      }}
                    >
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: st.dot }} />
                      {project.status ?? 'DRAFT'}
                    </span>
                  </div>

                  {/* Title + desc */}
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontSize: '0.975rem',
                        fontWeight: 700,
                        color: '#fff',
                        marginBottom: '5px',
                        lineHeight: 1.3,
                      }}
                    >
                      {displayTitle}
                    </h3>
                    <p
                      style={{
                        fontSize: '0.825rem',
                        color: 'var(--text-muted)',
                        lineHeight: 1.55,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {project.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Footer */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      paddingTop: '10px',
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <Clock size={12} />
                    {project.createdAt
                      ? new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'N/A'}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
