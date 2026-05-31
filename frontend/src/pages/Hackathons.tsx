import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Plus, Search, Trophy, ChevronLeft, ChevronRight, ImageIcon, Flame } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

interface Hackathon {
  id: string;
  title: string;
  organizationName?: string;
  shortDescription: string;
  bannerImage?: string;
  status: string;
  tags: string[];
  participantCount: number;
  teamsCount: number;
  prizePool?: string;
  registrationEndDate: string;
  hackathonStartDate: string;
  submissionDeadline: string;
  mySubmission?: any;
}

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVars = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'REGISTRATION_OPEN': return { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: 'Registration Open' };
    case 'ACTIVE':
    case 'ONGOING':           return { bg: 'rgba(37,99,235,0.15)',  color: '#3b82f6', label: 'Active' };
    case 'JUDGING':           return { bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6', label: 'Judging' };
    case 'COMPLETED':         return { bg: 'rgba(107,114,128,0.15)',color: '#9ca3af', label: 'Completed' };
    case 'UPCOMING':          return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: 'Upcoming' };
    default:                  return { bg: 'rgba(107,114,128,0.15)',color: '#9ca3af', label: status };
  }
};

const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// ─── Hackathon Card ──────────────────────────────────────────────────────────
const HackathonCard: React.FC<{ h: Hackathon; featured?: boolean }> = ({ h, featured }) => {
  const s = getStatusInfo(h.status);
  const [imgErr, setImgErr] = useState(false);

  return (
    <motion.div
      variants={itemVars}
      whileHover={{ y: -6, boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px ${s.color}40` }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '18px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
    >
      {/* ── Banner ── */}
      <div style={{ position: 'relative', paddingTop: '56.25%', background: 'rgba(255,255,255,0.03)', overflow: 'hidden' }}>
        {h.bannerImage && !imgErr ? (
          <img
            src={h.bannerImage}
            alt={h.title}
            onError={() => setImgErr(true)}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}>
            <ImageIcon size={40} color="rgba(255,255,255,0.1)" />
          </div>
        )}
        {/* gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(17,19,27,0.95) 0%, rgba(17,19,27,0.2) 60%, transparent 100%)' }} />
        {/* Status badge */}
        <span style={{ position: 'absolute', top: '12px', right: '12px', padding: '4px 12px', background: s.bg, color: s.color, borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, backdropFilter: 'blur(8px)', border: `1px solid ${s.color}40` }}>
          {s.label}
        </span>
        {featured && (
          <span style={{ position: 'absolute', top: '12px', left: '12px', padding: '4px 12px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, backdropFilter: 'blur(8px)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Flame size={11} /> Trending
          </span>
        )}
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Title & Org */}
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '2px', lineHeight: 1.3 }}>{h.title}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '10px' }}>{h.organizationName || 'Independent Organization'}</p>

        {/* Description */}
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginBottom: '14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
          {h.shortDescription}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
          {(h.tags && h.tags.length > 0 ? h.tags : []).slice(0, 4).map((tag, i) => (
            <span key={i} style={{ fontSize: '0.7rem', padding: '3px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {tag}
            </span>
          ))}
          {h.tags && h.tags.length > 4 && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>+{h.tags.length - 4} more</span>}
        </div>

        {/* Timeline */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '16px', background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: '10px' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>Reg Ends</div>
            <div style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}>{fmt(h.registrationEndDate)}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>Starts</div>
            <div style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}>{fmt(h.hackathonStartDate)}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>Submission</div>
            <div style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}>{fmt(h.submissionDeadline)}</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
            <Users size={14} /> <span style={{ fontWeight: 600, color: '#fff' }}>{h.participantCount || 0}</span> participants
          </div>
          {h.prizePool && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#f59e0b', fontSize: '0.82rem', fontWeight: 600 }}>
              <Trophy size={14} /> {h.prizePool}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <Link to={`/hackathons/${h.id}`} style={{ padding: '10px', background: 'rgba(255,255,255,0.06)', color: '#fff', textAlign: 'center', borderRadius: '10px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)' }}>
            Details
          </Link>
          <Link
            to={`/hackathons/${h.id}`}
            style={{ padding: '10px', background: h.status === 'COMPLETED' ? 'rgba(107,114,128,0.2)' : 'var(--accent-primary)', color: '#fff', textAlign: 'center', borderRadius: '10px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, pointerEvents: h.status === 'COMPLETED' ? 'none' : 'auto', opacity: h.status === 'COMPLETED' ? 0.5 : 1 }}
          >
            Register
          </Link>
        </div>

        {/* User Submission Highlight */}
        {h.mySubmission && (
          <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Submitted as <strong style={{ color: '#fff' }}>{h.mySubmission.team?.teamName || 'Team'}</strong>
              </span>
            </div>
            <Link to={`/projects/${h.mySubmission.projectId}`} style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>
              View Project →
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── Trending Carousel ───────────────────────────────────────────────────────
const TrendingCarousel: React.FC<{ items: Hackathon[] }> = ({ items }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir === 'left' ? -360 : 360, behavior: 'smooth' });
  };
  if (!items.length) return null;
  return (
    <div style={{ marginBottom: '56px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Flame size={22} color="#f59e0b" /> Trending Hackathons
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => scroll('left')} style={{ padding: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}><ChevronLeft size={18} /></button>
          <button onClick={() => scroll('right')} style={{ padding: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}><ChevronRight size={18} /></button>
        </div>
      </div>
      <div ref={scrollRef} style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none' }}>
        {items.map(h => (
          <div key={h.id} style={{ minWidth: '340px', width: '340px', flexShrink: 0 }}>
            <HackathonCard h={h} featured />
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
const Hackathons: React.FC = () => {
  const { user } = useAuth();

  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [trending, setTrending] = useState<Hackathon[]>([]);
  const [myHackathons, setMyHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'all' | 'my'>('all');

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(searchQuery); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Trending
  useEffect(() => {
    api.get('/hackathons/trending').then(r => setTrending(r.data || [])).catch(() => {});
  }, []);

  // My hackathons
  useEffect(() => {
    if (!user) return;
    api.get('/hackathons/my').then(r => setMyHackathons(r.data || [])).catch(() => {});
  }, [user]);

  // All hackathons list
  const fetchHackathons = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (selectedStatus) params.append('status', selectedStatus);
      params.append('sortBy', sortBy);
      params.append('sortOrder', 'desc');
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      const res = await api.get(`/hackathons?${params.toString()}`);
      setHackathons(res.data.data || []);
      setTotalPages(res.data.meta?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedStatus, sortBy, page]);

  useEffect(() => { fetchHackathons(); }, [fetchHackathons]);

  const displayList = activeSection === 'my' ? myHackathons : hackathons;

  return (
    <div style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '6px', letterSpacing: '-0.03em' }}>Discover Hackathons</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>Compete, build, and win in world-class hackathons.</p>
        </div>
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Link to="/hackathons/new" style={{ padding: '12px 24px', background: 'var(--accent-primary)', color: '#fff', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 20px var(--accent-glow)', whiteSpace: 'nowrap' }}>
            <Plus size={18} /> Host a Hackathon
          </Link>
        </motion.div>
      </motion.div>

      {/* Trending Carousel */}
      {trending.length > 0 && activeSection === 'all' && !debouncedSearch && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <TrendingCarousel items={trending} />
        </motion.div>
      )}

      {/* Tab switcher */}
      {user && (
        <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '12px', width: 'fit-content' }}>
          {(['all', 'my'] as const).map(sec => (
            <button
              key={sec}
              onClick={() => setActiveSection(sec)}
              style={{ padding: '8px 20px', borderRadius: '9px', border: 'none', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', background: activeSection === sec ? 'var(--accent-primary)' : 'transparent', color: activeSection === sec ? '#fff' : 'var(--text-secondary)' }}
            >
              {sec === 'all' ? 'All Hackathons' : `My Hackathons (${myHackathons.length})`}
            </button>
          ))}
        </div>
      )}

      {/* Search + Sort + Filter row */}
      {activeSection === 'all' && (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '28px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search hackathons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '12px 16px 12px 42px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '10px', outline: 'none', cursor: 'pointer', minWidth: '160px' }}>
            <option value="" style={{ background: '#11131b' }}>All Statuses</option>
            <option value="REGISTRATION_OPEN" style={{ background: '#11131b' }}>Registration Open</option>
            <option value="UPCOMING" style={{ background: '#11131b' }}>Upcoming</option>
            <option value="ONGOING" style={{ background: '#11131b' }}>Active</option>
            <option value="JUDGING" style={{ background: '#11131b' }}>Judging</option>
            <option value="COMPLETED" style={{ background: '#11131b' }}>Completed</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '10px', outline: 'none', cursor: 'pointer', minWidth: '180px' }}>
            <option value="createdAt" style={{ background: '#11131b' }}>Newest First</option>
            <option value="participantCount" style={{ background: '#11131b' }}>Most Participants</option>
            <option value="registrationEndDate" style={{ background: '#11131b' }}>Closing Soon</option>
            <option value="startDate" style={{ background: '#11131b' }}>Starting Soon</option>
          </select>
        </div>
      )}

      {/* Grid */}
      <AnimatePresence mode="wait">
        {loading && activeSection === 'all' ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(37,99,235,0.2)', borderTop: '3px solid var(--accent-primary)', margin: '0 auto 16px' }} />
            Loading hackathons...
          </div>
        ) : displayList.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <Search size={48} style={{ opacity: 0.15, margin: '0 auto 16px', display: 'block' }} />
            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '8px' }}>{activeSection === 'my' ? "You haven't joined any hackathons yet" : 'No hackathons found'}</h3>
            <p style={{ fontSize: '0.9rem' }}>{activeSection === 'my' ? 'Register for a hackathon to see it here.' : 'Try adjusting your search or filters.'}</p>
          </motion.div>
        ) : (
          <motion.div key="grid" variants={containerVars} initial="hidden" animate="show" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {displayList.map(h => <HackathonCard key={h.id} h={h} />)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {activeSection === 'all' && totalPages > 1 && !loading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '48px' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', color: '#fff', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1, fontWeight: 600 }}>
            ← Previous
          </button>
          <span style={{ color: 'var(--text-secondary)' }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', color: '#fff', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1, fontWeight: 600 }}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default Hackathons;
