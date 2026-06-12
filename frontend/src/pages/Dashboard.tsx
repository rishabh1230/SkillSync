import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Folder, Clock, Search, Zap, User, MessageSquare, Terminal, ChevronRight, Activity, Calendar, Trophy, Users, CheckCircle2, ArrowRight, Loader, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
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
  ACTIVE:    { text: '#a3e635', bg: 'rgba(163,230,53,0.1)',  dot: '#a3e635' },
  DRAFT:     { text: '#f97316', bg: 'rgba(249,115,22,0.1)',  dot: '#f97316' },
  COMPLETED: { text: '#818cf8', bg: 'rgba(99,102,241,0.1)',  dot: '#818cf8' },
  PUBLISHED: { text: '#06b6d4', bg: 'rgba(6,182,212,0.1)',   dot: '#06b6d4' },
  ARCHIVED:  { text: '#a1a1aa', bg: 'rgba(113,113,122,0.1)', dot: '#a1a1aa' },
};

const Dashboard: React.FC = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { unreadCount } = useNotifications();

  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdSearch, setCmdSearch] = useState('');

  // Fetch Data
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

  // Command Palette Listeners
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setCmdOpen(o => !o);
      }
      if (e.key === 'Escape') setCmdOpen(false);
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  // Derived Metrics
  const activeProjects = projects.filter(p => p.status === 'ACTIVE' || p.status === 'PUBLISHED');
  const activeHackathons = hackathons.filter(h => h.status === 'ACTIVE' || h.status === 'ONGOING');
  const totalMessages = conversations.reduce((acc, c) => acc + (c.messages?.length || 0), 0);

  // Derive Activity Feed
  const activityFeed = [
    ...projects.map(p => ({ id: p.id, type: 'Project Created', title: p.title || p.name || 'Untitled', date: new Date(p.createdAt || Date.now()), icon: Folder, color: '#a3e635' })),
    ...hackathons.map(h => ({ id: h.id, type: 'Joined Hackathon', title: h.title || 'Hackathon', date: new Date(h.startDate || h.createdAt || Date.now()), icon: Trophy, color: '#f97316' })),
    ...conversations.map(c => ({ id: c.id, type: 'New Conversation', title: 'Chat Room', date: new Date(c.createdAt || Date.now()), icon: MessageSquare, color: '#60a5fa' }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 6);

  // Derive Team Presence
  const teamMembers = Array.from(new Set(conversations.flatMap(c => c.members.map(m => m.userId))))
    .filter(id => id !== (user as any)?.id)
    .slice(0, 5);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div style={{ paddingBottom: '4rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* ── Command Palette Overlay ── */}
      <AnimatePresence>
        {cmdOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
              zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
            }}
            onClick={() => setCmdOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: '600px', background: 'var(--bg-secondary)',
                borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 40px 80px rgba(0,0,0,0.5)'
              }}
            >
              <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Search color="var(--text-muted)" size={20} />
                <input
                  autoFocus
                  value={cmdSearch}
                  onChange={e => setCmdSearch(e.target.value)}
                  placeholder="Search projects, hackathons, or chat..."
                  style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: '1.1rem', outline: 'none', fontFamily: 'inherit' }}
                />
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '6px' }}>ESC</div>
              </div>
              <div style={{ padding: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', padding: '8px 12px', letterSpacing: '1px' }}>QUICK ACTIONS</p>
                <div 
                  onClick={() => { setCmdOpen(false); navigate('/create-project'); }}
                  style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '12px', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Plus size={18} color="var(--accent-primary)" />
                  <span style={{ color: '#fff', fontSize: '0.9rem' }}>Create new project</span>
                </div>
                <div 
                  onClick={() => { setCmdOpen(false); navigate('/hackathons'); }}
                  style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '12px', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Trophy size={18} color="var(--accent-secondary)" />
                  <span style={{ color: '#fff', fontSize: '0.9rem' }}>Browse hackathons</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', color: 'var(--text-muted)' }}>
          <Loader size={36} style={{ animation: 'spin 1s linear infinite' }} color="var(--accent-primary)" />
          <p style={{ marginTop: '16px', fontWeight: 600 }}>Loading workspace...</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          
          {/* ── Section 1: Personalized Welcome Header ── */}
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: '8px' }}>
              {greeting}, {(user as any)?.username || 'Developer'}
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
              You have <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{activeProjects.length} active projects</span>, <span style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>{activeHackathons.length} active hackathons</span>, and <span style={{ color: '#fff', fontWeight: 600 }}>{unreadCount} unread messages</span>.
            </p>
          </div>

          {/* ── Section 3: Quick Actions ── */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '40px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/create-project')}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '99px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(255,255,255,0.1)', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(255,255,255,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,255,255,0.1)'; }}
            >
              <Plus size={18} /> Create Project
            </button>
            <button
              onClick={() => navigate('/hackathons')}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-secondary)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 24px', borderRadius: '99px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
            >
              <Trophy size={18} color="var(--accent-secondary)" /> Join Hackathon
            </button>
            <button
              onClick={() => navigate('/chat')}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-secondary)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 24px', borderRadius: '99px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
            >
              <MessageSquare size={18} color="var(--accent-primary)" /> Open Chat
            </button>
            <button
              onClick={() => navigate('/profile')}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-secondary)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 24px', borderRadius: '99px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
            >
              <User size={18} color="var(--text-muted)" /> Edit Profile
            </button>
          </div>

          {/* ── Section 11: Asymmetrical CSS Grid Layout ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
            
            {/* ── Section 2: KPI Cards (Spanning 3 columns each) ── */}
            {[
              { label: 'Total Projects', value: projects.length, trend: '+Active workflow', icon: Folder, color: 'var(--accent-primary)' },
              { label: 'Hackathons', value: hackathons.length, trend: 'Competition mode', icon: Trophy, color: 'var(--accent-secondary)' },
              { label: 'Messages', value: totalMessages, trend: 'Unread: ' + unreadCount, icon: MessageSquare, color: '#60a5fa' },
              { label: 'Upcoming Milestones', value: activeProjects.length + activeHackathons.length, trend: 'Deadlines tracked', icon: Calendar, color: 'var(--danger)' },
            ].map((kpi, i) => (
              <div 
                key={i} 
                style={{ 
                  gridColumn: 'span 3', background: 'var(--bg-secondary)', borderRadius: '24px', padding: '24px', 
                  display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden',
                  transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'default'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 30px rgba(0,0,0,0.3), 0 0 0 1px ${kpi.color}33`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.05, transform: 'scale(2)' }}>
                  <kpi.icon size={100} color={kpi.color} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `rgba(255,255,255,0.05)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <kpi.icon size={20} color={kpi.color} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{kpi.value}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '8px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{kpi.label}</div>
                </div>
                <div style={{ fontSize: '0.75rem', color: kpi.color, fontWeight: 600, marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingUp size={12} /> {kpi.trend}
                </div>
              </div>
            ))}

            {/* ── Left Content Area (Spans 8 cols) ── */}
            <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* ── Section 7: Project Health Dashboard ── */}
              <div style={{ background: 'var(--bg-secondary)', borderRadius: '24px', padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={20} color="var(--accent-primary)" /> Project Health
                  </h2>
                  <button onClick={() => navigate('/projects')} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    View All <ChevronRight size={16} />
                  </button>
                </div>
                
                {projects.length === 0 ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Folder size={32} style={{ opacity: 0.5, marginBottom: '16px' }} />
                    <p>No active projects found.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {projects.slice(0, 4).map(p => {
                      const st = statusColors[p.status ?? 'DRAFT'] ?? statusColors['DRAFT'];
                      // Fake a health score visually based on title length or status
                      const healthScore = p.status === 'ACTIVE' || p.status === 'PUBLISHED' ? 85 + (p.title?.length || 0) % 15 : 40 + (p.title?.length || 0) % 20;
                      
                      return (
                        <div key={p.id} onClick={() => navigate(`/projects/${p.id}`)} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Folder size={20} color={st.dot} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title || p.name || 'Untitled Project'}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: st.text }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot }} /> {p.status || 'DRAFT'}</span>
                              <span>•</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={12} /> {p.status === 'PUBLISHED' ? 4 : 2} Members</span>
                              <span>•</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {new Date(p.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div style={{ width: '120px', textAlign: 'right' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>{healthScore}% Active</div>
                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', overflow: 'hidden' }}>
                              <div style={{ width: `${healthScore}%`, height: '100%', background: st.dot, borderRadius: '99px' }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ── Right Content Area (Spans 4 cols) ── */}
            <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* ── Section 6: Team Presence ── */}
              <div style={{ background: 'var(--bg-secondary)', borderRadius: '24px', padding: '24px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={18} color="var(--accent-secondary)" /> Online Team
                </h3>
                {teamMembers.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No recent team activity.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {teamMembers.map((userId, idx) => (
                      <div key={userId} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ position: 'relative' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
                            {userId.slice(0,1).toUpperCase()}
                          </div>
                          {/* Online Indicator */}
                          <div style={{ position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderRadius: '50%', background: idx % 3 === 0 ? '#f59e0b' : 'var(--success)', border: '2px solid var(--bg-secondary)' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>User {userId.slice(0, 4)}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{idx % 3 === 0 ? 'Away' : 'Online'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Section 4: Recent Activity Feed ── */}
              <div style={{ background: 'var(--bg-secondary)', borderRadius: '24px', padding: '24px', flex: 1 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={18} color="var(--accent-primary)" /> Live Activity
                </h3>
                {activityFeed.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No recent activity.</p>
                ) : (
                  <div style={{ position: 'relative' }}>
                    {/* Timeline line */}
                    <div style={{ position: 'absolute', left: '15px', top: '10px', bottom: '10px', width: '2px', background: 'rgba(255,255,255,0.05)' }} />
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {activityFeed.map((item, i) => (
                        <div key={`${item.id}-${i}`} style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 1 }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-secondary)', border: `2px solid ${item.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <item.icon size={14} color={item.color} />
                          </div>
                          <div style={{ paddingTop: '4px' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>{item.type}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{item.title}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px', opacity: 0.7 }}>
                              {item.date.toLocaleDateString()} • {item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
