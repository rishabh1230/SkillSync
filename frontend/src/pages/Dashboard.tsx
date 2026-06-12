import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Folder, LayoutGrid, Clock, TrendingUp, Layers, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationDropdown from '../components/NotificationDropdown';
import { chatApi } from '../api/chat';
import type { Conversation } from '../api/chat';

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
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
};

const Dashboard: React.FC = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { unreadCount } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [projRes, hackRes, convRes] = await Promise.allSettled([
          api.get('/projects', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/hackathons/my', { headers: { Authorization: `Bearer ${token}` } }),
          chatApi.getConversations()
        ]);

        if (projRes.status === 'fulfilled') {
          const pd = projRes.value.data;
          setProjects(Array.isArray(pd) ? pd : pd?.data ?? []);
        }
        if (hackRes.status === 'fulfilled') {
          const hd = hackRes.value.data;
          setHackathons(Array.isArray(hd) ? hd : hd?.data ?? []);
        }
        if (convRes.status === 'fulfilled') {
          const cd = convRes.value.data;
          setConversations(Array.isArray(cd) ? cd : cd?.data ?? []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [token]);

  const displayName = (user as any)?.username ?? 'there';

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      {/* ── Mockup Charts (Image Replication) ── */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '3rem', flexWrap: 'wrap' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: '1 1 600px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', margin: '0' }}>
            CHECK BOX
          </h1>
          
          {/* Row 1 */}
          <div style={{ display: 'flex', gap: '24px' }}>
            {/* Hackathons */}
            <div style={{ flex: 1, background: 'var(--bg-secondary)', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', letterSpacing: '1px' }}>HACKATHONS</span>
                <span style={{ color: 'var(--text-muted)' }}>...</span>
              </div>
              <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l8 16H4z"/></svg>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{hackathons.length}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Joined</div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-secondary)' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" transform="rotate(180)"><path d="M12 4l8 16H4z"/></svg>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{hackathons.filter(h => h.status === 'ACTIVE' || h.status === 'ONGOING').length}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Active Now</div>
                </div>
              </div>
              <div style={{ marginTop: 'auto', height: '60px', position: 'relative' }}>
                <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 40">
                  <path d="M0,20 Q10,5 20,20 T40,25 T60,10 T80,30 T100,15" fill="none" stroke="var(--success)" strokeWidth="2" />
                  <path d="M0,30 Q15,40 30,20 T50,35 T70,25 T90,10 T100,20" fill="none" stroke="var(--accent-secondary)" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* Projects */}
            <div style={{ flex: 1, background: 'var(--bg-secondary)', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', letterSpacing: '1px' }}>PROJECTS</span>
                <span style={{ color: 'var(--text-muted)' }}>...</span>
              </div>
              <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l8 16H4z"/></svg>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{projects.length}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Projects</div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-secondary)' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" transform="rotate(180)"><path d="M12 4l8 16H4z"/></svg>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{projects.filter(p => p.status === 'ACTIVE' || p.status === 'PUBLISHED').length}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Active/Published</div>
                </div>
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {Array.from({ length: 40 }).map((_, i) => (
                  <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: Math.random() > 0.7 ? 'var(--success)' : Math.random() > 0.4 ? 'var(--accent-secondary)' : 'rgba(255,255,255,0.2)' }} />
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Communication Bar Chart */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '24px', padding: '24px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', letterSpacing: '1px' }}>COMMUNICATION</span>
              <span style={{ color: 'var(--text-muted)' }}>...</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '160px', padding: '0 10px' }}>
              {[
                { v1: 52, v2: 81, c1: '#fff', c2: 'var(--accent-secondary)' },
                { v1: 96, v2: 25, c1: 'var(--success)', c2: 'var(--accent-secondary)' },
                { v1: 48, v2: 51, c1: 'var(--success)', c2: '#fff' },
                { v1: 80, v2: 49, c1: 'var(--success)', c2: 'var(--accent-secondary)' },
                { v1: 34, v2: 67, c1: 'var(--accent-secondary)', c2: 'var(--success)' },
                { v1: 92, v2: 28, c1: 'var(--success)', c2: '#fff' },
                { v1: 58, v2: 20, c1: 'var(--success)', c2: 'var(--accent-secondary)' },
                { v1: 84, v2: 39, c1: 'var(--accent-secondary)', c2: 'var(--success)' },
                { v1: 36, v2: 72, c1: '#fff', c2: 'var(--accent-secondary)' },
              ].map((bar, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative' }}>
                  {/* Vertical track line */}
                  <div style={{ position: 'absolute', top: -20, bottom: -20, width: '1px', background: 'rgba(255,255,255,0.05)', zIndex: 0 }} />
                  
                  <div style={{ width: '32px', height: `${bar.v1}px`, background: bar.c1, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, fontSize: '0.65rem', fontWeight: 700, color: bar.c1 === '#fff' ? '#000' : '#111' }}>
                    {bar.v1}
                  </div>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', zIndex: 1 }} />
                  <div style={{ width: '32px', height: `${bar.v2}px`, background: bar.c2, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, fontSize: '0.65rem', fontWeight: 700, color: bar.c2 === '#fff' ? '#000' : '#111' }}>
                    {bar.v2}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: '2px solid #fff' }} /> Direct Messages
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: '2px solid var(--success)' }} /> Team Chats
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: '2px solid var(--accent-secondary)' }} /> Announcements
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Total Chats: <span style={{ color: '#fff', fontWeight: 600 }}>{conversations.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Projects Timeline */}
        <div style={{ flex: '1 1 350px', background: 'var(--bg-secondary)', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', letterSpacing: '1px' }}>PROJECTS TIMELINE</span>
            <span style={{ color: 'var(--text-muted)' }}>...</span>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
            {/* Grid Lines */}
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '60px', right: 0, display: 'flex', justifyContent: 'space-between', zIndex: 0 }}>
              {[0, 1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{ width: '1px', background: 'rgba(255,255,255,0.05)' }} />
              ))}
            </div>

            {/* Rows */}
            {projects.slice(0, 8).map((p, i) => {
              const dateObj = new Date(p.createdAt || Date.now());
              const dateStr = `${dateObj.getDate().toString().padStart(2, '0')}.${(dateObj.getMonth() + 1).toString().padStart(2, '0')}`;
              
              // Generate visually distinct layout properties for each row to match the design style
              const layouts = [
                { w: '40%', l: '60px', c: 'var(--success)' },
                { w: '35%', l: '65%', c: 'var(--accent-secondary)' },
                { w: '45%', l: '20%', c: '#fff' },
                { w: '48%', l: '30%', c: 'var(--success)' },
                { w: '28%', l: '60px', c: '#fff' },
                { w: '28%', l: '35%', c: 'var(--accent-secondary)' },
                { w: '55%', l: '45%', c: 'var(--success)' },
                { w: '28%', l: '40%', c: '#fff' },
              ];
              const layout = layouts[i % layouts.length];
              const iconChar = (p.title || p.name || 'P').charAt(0).toUpperCase();

              return (
                <div key={p.id || i} style={{ display: 'flex', alignItems: 'center', height: '32px', zIndex: 1 }}>
                  <div style={{ width: '50px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{dateStr}</div>
                  <div style={{ flex: 1, position: 'relative', height: '100%' }}>
                    <div style={{ position: 'absolute', left: layout.l, width: layout.w, top: '4px', bottom: '4px', background: layout.c, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px', color: layout.c === '#fff' ? '#000' : '#111' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 800 }}>
                        {iconChar}
                      </div>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, marginRight: '8px' }}>
                        {p.status === 'ACTIVE' || p.status === 'PUBLISHED' ? 'Live' : 'Draft'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Pad with mock data if less than 8 projects to preserve layout */}
            {projects.length < 8 && Array.from({ length: 8 - projects.length }).map((_, i) => (
              <div key={`mock-${i}`} style={{ display: 'flex', alignItems: 'center', height: '32px', zIndex: 1, opacity: 0.3 }}>
                <div style={{ width: '50px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>--.--</div>
                <div style={{ flex: 1, position: 'relative', height: '100%' }}>
                  <div style={{ position: 'absolute', left: '20%', width: '30%', top: '4px', bottom: '4px', background: 'var(--text-muted)', borderRadius: '16px' }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingLeft: '60px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
               <span>0</span><span>5</span><span>10</span><span>15</span><span>20</span><span>25</span><span>30</span>
             </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: '2px solid var(--success)' }} /> Active
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: '2px solid var(--accent-secondary)' }} /> Draft
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: '2px solid #fff' }} /> Archived
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Total Projects: <span style={{ color: '#fff', fontWeight: 600 }}>{projects.length}</span>
              </div>
            </div>
        </div>
      </div>

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
            background: 'var(--bg-secondary)',
            borderRadius: '24px',
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
              borderRadius: '24px',
              background: 'rgba(163,230,53,0.08)',
              border: '1px solid rgba(163,230,53,0.15)',
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
            whileHover={{ scale: 1.03, y: -2, boxShadow: '0 8px 25px var(--accent-glow)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/create-project')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '0.75rem 1.5rem', borderRadius: '12px', border: 'none',
              background: '#fff',
              color: '#000', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 4px 15px rgba(255,255,255,0.1)',
            }}
          >
            <Plus size={18} />
            Create Project
          </motion.button>
        </motion.div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>
              Your Projects
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/create-project')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.6rem 1.2rem',
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Plus size={16} /> New Project
            </motion.button>
          </div>
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
                    background: 'var(--bg-secondary)',
                    borderRadius: '24px',
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
                    y: -6,
                    scale: 1.02,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    borderColor: 'rgba(255,255,255,0.1)',
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
                      background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                      opacity: 0,
                      transition: 'opacity 0.3s',
                    }}
                    className="project-card-accent"
                  />

                  {/* Icon + status */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Folder size={20} color="#fff" />
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
                      paddingTop: '16px',
                      marginTop: 'auto',
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
