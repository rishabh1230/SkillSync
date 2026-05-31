import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Users, Target, ArrowLeft, Trophy, Clock,
  CheckCircle, AlertCircle, Eye, EyeOff, ExternalLink,
  Crown, User, Folder, Lightbulb, Search, Handshake,
  UserPlus, ChevronDown, ChevronUp, X, Check, AlertTriangle
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

type Tab = 'overview' | 'participants' | 'projects';
type RegStep = 'idle' | 'choose_path' | 'team_form' | 'solo_form' | 'registered' | 'registered_solo';

type ParticipantType = 'LOOKING_FOR_TEAM' | 'HAVE_IDEA_LOOKING_FOR_TEAM' | 'OPEN_TO_ANYTHING';

const PARTICIPANT_TYPES: { value: ParticipantType; label: string; desc: string; icon: React.ReactNode; color: string; bg: string }[] = [
  {
    value: 'LOOKING_FOR_TEAM',
    label: 'Looking for a Team',
    desc: "I'm skilled and searching for a team to join",
    icon: <Search size={16} />,
    color: 'var(--accent-primary)',
    bg: 'rgba(37,99,235,0.1)',
  },
  {
    value: 'HAVE_IDEA_LOOKING_FOR_TEAM',
    label: 'Have an Idea',
    desc: "I have a project idea and need teammates",
    icon: <Lightbulb size={16} />,
    color: 'var(--accent-secondary)',
    bg: 'rgba(245,158,11,0.1)',
  },
  {
    value: 'OPEN_TO_ANYTHING',
    label: 'Open to Anything',
    desc: "Flexible — happy to join or form a team",
    icon: <Handshake size={16} />,
    color: 'var(--success)',
    bg: 'rgba(16,185,129,0.1)',
  },
];

const ParticipantTypePill: React.FC<{ type: ParticipantType }> = ({ type }) => {
  const t = PARTICIPANT_TYPES.find(p => p.value === type) || PARTICIPANT_TYPES[0];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', background: t.bg, color: t.color, borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, border: `1px solid ${t.color}40` }}>
      {t.icon} {t.label}
    </span>
  );
};

const HackathonDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [hackathon, setHackathon] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Registration
  const [step, setStep] = useState<RegStep>('idle');
  const [participantType, setParticipantType] = useState<ParticipantType>('LOOKING_FOR_TEAM');
  const [teamName, setTeamName] = useState('');
  const [registering, setRegistering] = useState(false);
  const [regError, setRegError] = useState('');
  const [registeredTeamId, setRegisteredTeamId] = useState<string | null>(null);

  // Participants tab
  const [teams, setTeams] = useState<any[]>([]);
  const [soloParticipants, setSoloParticipants] = useState<any[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set());
  const [joinRequests, setJoinRequests] = useState<Record<string, any[]>>({});
  const [loadingRequests, setLoadingRequests] = useState<Set<string>>(new Set());
  const [requestingTeamId, setRequestingTeamId] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestingTo, setRequestingTo] = useState<string | null>(null);

  // Projects tab
  const [projectsData, setProjectsData] = useState<any>(null);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/hackathons/${id}`);
      const data = response.data;
      setHackathon(data);

      if (user && data.teams && Array.isArray(data.teams)) {
        const userTeam = data.teams.find((t: any) =>
          Array.isArray(t.members) && t.members.some((m: any) => m.userId === user.id)
        );
        if (userTeam) {
          setRegisteredTeamId(userTeam.id);
          setStep('registered');
        }
      }
    } catch {
      setError('Failed to load hackathon details.');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  const fetchParticipants = useCallback(async () => {
    setParticipantsLoading(true);
    try {
      const [teamsRes, soloRes] = await Promise.all([
        api.get(`/hackathons/${id}/participants`),
        api.get(`/hackathons/${id}/solo-participants`),
      ]);
      setTeams(teamsRes.data);
      setSoloParticipants(soloRes.data);
    } catch {
      setTeams([]);
      setSoloParticipants([]);
    } finally {
      setParticipantsLoading(false);
    }
  }, [id]);

  const fetchProjects = useCallback(async () => {
    setProjectsLoading(true);
    try {
      const res = await api.get(`/hackathons/${id}/projects`);
      setProjectsData(res.data);
    } catch {
      setProjectsData(null);
    } finally {
      setProjectsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchDetails(); }, [fetchDetails]);

  useEffect(() => {
    if (activeTab === 'participants') fetchParticipants();
    if (activeTab === 'projects') fetchProjects();
  }, [activeTab, fetchParticipants, fetchProjects]);

  // Check if user is already registered (even solo)
  useEffect(() => {
    if (!hackathon || !user || step === 'registered') return;
    // Check solo registrations would require an extra API call; 
    // we'll handle by checking if registerSolo returns conflict
  }, [hackathon, user, step]);

  const handleCreateTeam = async () => {
    if (!teamName.trim()) { setRegError('Please enter a team name.'); return; }
    setRegistering(true); setRegError('');
    try {
      const response = await api.post(`/teams/${id}`, { teamName: teamName.trim() });
      setRegisteredTeamId(response.data.id);
      setStep('registered');
      setTeams([]); setSoloParticipants([]); // invalidate cache
    } catch (err: any) {
      setRegError(err?.response?.data?.message || 'Failed to create team.');
    } finally {
      setRegistering(false);
    }
  };

  const handleRegisterSolo = async () => {
    setRegistering(true); setRegError('');
    try {
      await api.post(`/hackathons/${id}/register-solo`, { participantType });
      setStep('registered_solo');
      setSoloParticipants([]); // invalidate cache
    } catch (err: any) {
      setRegError(err?.response?.data?.message || 'Failed to register.');
    } finally {
      setRegistering(false);
    }
  };

  const handleSendJoinRequest = async (teamId: string) => {
    setRequestingTeamId(teamId);
    try {
      await api.post(`/teams/${teamId}/join-request`, { message: requestMessage });
      setRequestingTo(null);
      setRequestMessage('');
      alert('Join request sent! The team leader will review it.');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to send join request.');
    } finally {
      setRequestingTeamId(null);
    }
  };

  const handleToggleRequests = async (teamId: string) => {
    const isExpanded = expandedRequests.has(teamId);
    const newSet = new Set(expandedRequests);
    if (isExpanded) {
      newSet.delete(teamId);
      setExpandedRequests(newSet);
      return;
    }
    newSet.add(teamId);
    setExpandedRequests(newSet);

    if (joinRequests[teamId]) return; // cached
    setLoadingRequests(prev => new Set(prev).add(teamId));
    try {
      const res = await api.get(`/teams/${teamId}/join-requests`);
      setJoinRequests(prev => ({ ...prev, [teamId]: res.data }));
    } catch {
      setJoinRequests(prev => ({ ...prev, [teamId]: [] }));
    } finally {
      setLoadingRequests(prev => { const s = new Set(prev); s.delete(teamId); return s; });
    }
  };

  const handleRespondToRequest = async (requestId: string, teamId: string, accept: boolean) => {
    setRespondingId(requestId);
    try {
      await api.patch(`/teams/join-requests/${requestId}/respond`, { accept });
      // Update local state
      setJoinRequests(prev => ({
        ...prev,
        [teamId]: (prev[teamId] || []).filter(r => r.id !== requestId),
      }));
      // Update badge count
      setTeams(prev => prev.map(t => {
        if (t.id !== teamId) return t;
        return { ...t, joinRequests: (t.joinRequests || []).filter((r: any) => r.id !== requestId) };
      }));
      if (accept) {
        setSoloParticipants([]); // solo list may have changed
        fetchParticipants();
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to respond.');
    } finally {
      setRespondingId(null);
    }
  };

  const handleToggleVisibility = async (submissionId: string) => {
    setTogglingId(submissionId);
    try {
      await api.patch(`/hackathons/${id}/submissions/${submissionId}/visibility`);
      fetchProjects();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to toggle visibility.');
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(37,99,235,0.2)', borderTop: '3px solid var(--accent-primary)' }} />
      </div>
    );
  }

  if (error || !hackathon) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#f87171' }}>
        <AlertCircle size={40} style={{ marginBottom: '16px' }} />
        <p>{error || 'Hackathon not found.'}</p>
      </div>
    );
  }

  const isHost = !!(user && hackathon.organizerId && hackathon.organizerId === user.id);
  const isCompleted = hackathon.status === 'COMPLETED';
  const isRegistered = step === 'registered' || step === 'registered_solo';

  // Check if current user is in any team (to show/hide Request to Join)
  const userTeamId = hackathon.teams?.find((t: any) =>
    t.members?.some((m: any) => m.userId === user?.id)
  )?.id || registeredTeamId;

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: <Target size={15} /> },
    { id: 'participants' as Tab, label: 'Participants', icon: <Users size={15} /> },
    { id: 'projects' as Tab, label: 'Projects', icon: <Folder size={15} /> },
  ];

  // ── Registration Section ────────────────────────────────────────────────────
  const renderRegistration = () => {
    if (isHost) {
      return (
        <div style={{ padding: '12px', background: 'rgba(37,99,235,0.07)', borderRadius: '10px', border: '1px solid rgba(37,99,235,0.2)', textAlign: 'center' }}>
          <p style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Crown size={14} /> You are the organizer
          </p>
        </div>
      );
    }

    if (step === 'registered') {
      return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          style={{ padding: '14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.35)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <CheckCircle size={16} color="var(--success)" />
            <p style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.9rem' }}>Registered with a team!</p>
          </div>
          <button onClick={() => navigate(`/teams/${registeredTeamId}/submit`)}
            style={{ width: '100%', padding: '10px', background: 'var(--success)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}>
            Submit Project
          </button>
        </motion.div>
      );
    }

    if (step === 'registered_solo') {
      return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          style={{ padding: '14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.35)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <CheckCircle size={16} color="var(--success)" />
            <p style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.9rem' }}>Registered as Solo!</p>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Browse teams in the Participants tab and request to join.</p>
        </motion.div>
      );
    }

    // Idle: show two side-by-side entry buttons
    if (step === 'idle') {
      return (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => { if (!user) { navigate('/login'); return; } setStep('team_form'); }}
            style={{ flex: 1, padding: '12px 8px', background: 'linear-gradient(135deg, var(--accent-primary), #8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}
          >
            <Crown size={18} />
            Create a Team
          </button>
          <button
            onClick={() => { if (!user) { navigate('/login'); return; } setStep('solo_form'); }}
            style={{ flex: 1, padding: '12px 8px', background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}
          >
            <UserPlus size={18} />
            Join as Solo
          </button>
        </div>
      );
    }

    // Team creation form
    if (step === 'team_form') {
      return (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          style={{ padding: '16px', background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: '12px' }}>
          <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '14px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Crown size={15} color="var(--accent-primary)" /> Create Your Team
          </h4>

          {/* Participant type selector */}
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Role</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
            {PARTICIPANT_TYPES.map(pt => (
              <button key={pt.value} onClick={() => setParticipantType(pt.value)}
                style={{ padding: '8px 12px', background: participantType === pt.value ? pt.bg : 'rgba(255,255,255,0.03)', border: `1px solid ${participantType === pt.value ? pt.color : 'rgba(255,255,255,0.08)'}`, borderRadius: '8px', color: participantType === pt.value ? pt.color : 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.83rem', fontWeight: participantType === pt.value ? 600 : 400, transition: 'all 0.15s' }}>
                {pt.icon} {pt.label}
              </button>
            ))}
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Team Name</p>
          <input type="text" placeholder="Enter team name..." value={teamName} autoFocus
            onChange={(e) => { setTeamName(e.target.value); setRegError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateTeam()}
            style={{ width: '100%', padding: '10px 13px', background: 'rgba(0,0,0,0.4)', border: `1px solid ${regError ? '#f87171' : 'rgba(37,99,235,0.35)'}`, borderRadius: '8px', color: '#fff', fontSize: '0.88rem', outline: 'none', marginBottom: regError ? '6px' : '12px', boxSizing: 'border-box' }}
          />
          {regError && <p style={{ color: '#f87171', fontSize: '0.78rem', marginBottom: '10px' }}>{regError}</p>}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => { setStep('idle'); setTeamName(''); setRegError(''); }}
              style={{ flex: 1, padding: '9px', background: 'rgba(255,255,255,0.06)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.83rem' }}>
              Cancel
            </button>
            <button onClick={handleCreateTeam} disabled={registering || !teamName.trim()}
              style={{ flex: 2, padding: '9px', background: registering || !teamName.trim() ? 'rgba(37,99,235,0.3)' : 'var(--accent-primary)', color: '#fff', border: 'none', borderRadius: '8px', cursor: registering || !teamName.trim() ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.88rem' }}>
              {registering ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </motion.div>
      );
    }

    // Solo registration form
    if (step === 'solo_form') {
      return (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          style={{ padding: '16px', background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '12px' }}>
          <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '14px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserPlus size={15} color="#8b5cf6" /> Join as Solo Participant
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>What best describes you?</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {PARTICIPANT_TYPES.map(pt => (
              <button key={pt.value} onClick={() => setParticipantType(pt.value)}
                style={{ padding: '10px 14px', background: participantType === pt.value ? pt.bg : 'rgba(255,255,255,0.03)', border: `1px solid ${participantType === pt.value ? pt.color : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', color: participantType === pt.value ? pt.color : 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: participantType === pt.value ? 700 : 500, fontSize: '0.88rem', marginBottom: '3px' }}>
                  {pt.icon} {pt.label}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.76rem', marginLeft: '24px' }}>{pt.desc}</p>
              </button>
            ))}
          </div>
          {regError && <p style={{ color: '#f87171', fontSize: '0.78rem', marginBottom: '10px' }}>{regError}</p>}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => { setStep('idle'); setRegError(''); }}
              style={{ flex: 1, padding: '9px', background: 'rgba(255,255,255,0.06)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.83rem' }}>
              Cancel
            </button>
            <button onClick={handleRegisterSolo} disabled={registering}
              style={{ flex: 2, padding: '9px', background: registering ? 'rgba(139,92,246,0.3)' : '#8b5cf6', color: '#fff', border: 'none', borderRadius: '8px', cursor: registering ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.88rem' }}>
              {registering ? 'Registering...' : 'Register as Solo'}
            </button>
          </div>
        </motion.div>
      );
    }

    return null;
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)}
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '24px', fontSize: '0.9rem' }}>
        <ArrowLeft size={16} /> Back to Hackathons
      </button>

      {/* Banner */}
      <div style={{ 
        height: '260px', borderRadius: '20px 20px 0 0', 
        backgroundImage: hackathon.bannerImage ? `url(${hackathon.bannerImage})` : 'linear-gradient(135deg, #0f172a 0%, #1e1a3a 50%, #0f172a 100%)', 
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
        position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', borderBottom: 'none' 
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.85))' }} />
        <div style={{ position: 'absolute', bottom: '24px', left: '28px', right: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <span style={{ display: 'inline-block', padding: '4px 12px', background: isCompleted ? 'rgba(16,185,129,0.2)' : 'rgba(37,99,235,0.2)', color: isCompleted ? 'var(--success)' : 'var(--accent-primary)', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, border: `1px solid ${isCompleted ? 'var(--success)' : 'var(--accent-primary)'}`, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
              {hackathon.status}
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.5)', margin: 0, marginBottom: '6px' }}>{hackathon.title}</h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', fontWeight: 500, marginBottom: '12px', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
              Hosted by {hackathon.organizationName || 'Independent Organization'}
            </p>
            {/* Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(hackathon.tags || []).map((tag: string, i: number) => (
                <span key={i} style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', color: '#fff', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.2)' }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
          {hackathon.prizePool && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.4)', borderRadius: '12px', padding: '8px 16px' }}>
              <Trophy size={18} color="#fbbf24" />
              <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '1.1rem' }}>{hackathon.prizePool}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderTop: 'none', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', padding: '6px', marginBottom: '28px' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ flex: 1, padding: '10px 16px', background: activeTab === tab.id ? 'rgba(37,99,235,0.12)' : 'transparent', color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-muted)', border: activeTab === tab.id ? '1px solid rgba(37,99,235,0.25)' : '1px solid transparent', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', fontWeight: activeTab === tab.id ? 600 : 400, fontSize: '0.88rem', transition: 'all 0.2s' }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            
            {/* Timeline */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '28px 36px', marginBottom: '28px', position: 'relative', overflow: 'hidden' }}>
              <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="var(--accent-primary)" /> Hackathon Timeline
              </h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                {[
                  { label: 'Registration Starts', date: hackathon.registrationStartDate, step: 1 },
                  { label: 'Registration Ends', date: hackathon.registrationEndDate, step: 2 },
                  { label: 'Hackathon Starts', date: hackathon.hackathonStartDate, step: 3 },
                  { label: 'Submission Deadline', date: hackathon.submissionDeadline, step: 4 },
                ].map((item, index, arr) => {
                  const now = new Date().getTime();
                  const itemDate = new Date(item.date).getTime();
                  const isPast = now > itemDate;
                  const isCurrent = (index === 0 && now < new Date(arr[1].date).getTime()) || 
                                    (index > 0 && now >= itemDate && (index === arr.length - 1 || now < new Date(arr[index + 1].date).getTime()));

                  return (
                    <div key={item.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                      {/* Connecting Line */}
                      {index < arr.length - 1 && (
                        <div style={{ position: 'absolute', top: '12px', left: '50%', width: '100%', height: '2px', background: isPast ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)', zIndex: -1 }} />
                      )}
                      
                      {/* Node */}
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: isPast || isCurrent ? 'var(--accent-primary)' : '#11131b', border: `2px solid ${isPast || isCurrent ? 'var(--accent-primary)' : 'rgba(255,255,255,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', position: 'relative' }}>
                        {isCurrent && (
                          <motion.div animate={{ scale: [1, 1.6, 1], opacity: [0.7, 0, 0.7] }} transition={{ repeat: Infinity, duration: 2 }} style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '2px solid var(--accent-primary)' }} />
                        )}
                        {(isPast && !isCurrent) && <CheckCircle size={14} color="#fff" />}
                        {isCurrent && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />}
                      </div>
                      
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ color: isCurrent ? '#fff' : 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: isCurrent ? 700 : 500, marginBottom: '4px' }}>{item.label}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '28px', alignItems: 'start' }}>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '28px' }}>{hackathon.shortDescription}</p>
                
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '14px', padding: '22px', border: '1px solid rgba(255,255,255,0.07)', marginBottom: '20px' }}>
                  <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>About</h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.92rem', whiteSpace: 'pre-wrap' }}>{hackathon.fullDescription}</p>
                </div>

                {hackathon.rules && (
                  <div style={{ background: 'rgba(245,158,11,0.03)', borderRadius: '14px', padding: '22px', border: '1px solid rgba(245,158,11,0.1)', marginBottom: '20px' }}>
                    <h3 style={{ color: '#fbbf24', fontSize: '1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={16} /> Rules & Guidelines
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.92rem', whiteSpace: 'pre-wrap' }}>{hackathon.rules}</p>
                  </div>
                )}

                {hackathon.eligibility && (
                  <div style={{ background: 'rgba(16,185,129,0.03)', borderRadius: '14px', padding: '22px', border: '1px solid rgba(16,185,129,0.1)', marginBottom: '20px' }}>
                    <h3 style={{ color: 'var(--success)', fontSize: '1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={16} /> Eligibility
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.92rem', whiteSpace: 'pre-wrap' }}>{hackathon.eligibility}</p>
                  </div>
                )}

                {hackathon.problemStatements?.length > 0 && (
                  <div>
                    <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: '14px' }}>Problem Statements</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {hackathon.problemStatements.map((p: any, i: number) => (
                        <div key={p.id || i} style={{ padding: '16px', background: 'rgba(37,99,235,0.04)', borderRadius: '12px', border: '1px solid rgba(37,99,235,0.12)' }}>
                          <h4 style={{ color: 'var(--accent-primary)', marginBottom: '6px', fontWeight: 600 }}>{p.title}</h4>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>{p.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '22px' }}>
                  <h3 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '18px' }}>Details</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '13px', marginBottom: '22px' }}>
                    {[
                      { icon: <Calendar size={15} />, color: 'var(--accent-primary)', bg: 'rgba(37,99,235,0.1)', label: 'Starts', value: new Date(hackathon.hackathonStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                      { icon: <Clock size={15} />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', label: 'Deadline', value: new Date(hackathon.submissionDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
                      { icon: <Users size={15} />, color: 'var(--success)', bg: 'rgba(16,185,129,0.1)', label: 'Team Size', value: `${hackathon.minTeamSize}–${hackathon.maxTeamSize} members` },
                      ...(hackathon.theme ? [{ icon: <Target size={15} />, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', label: 'Theme', value: hackathon.theme }] : []),
                    ].map(({ icon, color, bg, label, value }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ padding: '7px', background: bg, borderRadius: '8px', color }}>{icon}</div>
                        <div>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                          <p style={{ color: '#fff', fontWeight: 500, fontSize: '0.88rem' }}>{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {renderRegistration()}
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '18px' }}>
                  <h3 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, marginBottom: '14px' }}>Stats</h3>
                  {[
                    { label: 'Teams', value: hackathon.teams?.length ?? 0 },
                    { label: 'Submissions', value: hackathon._count?.submissions ?? 0 },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.83rem' }}>{label}</span>
                      <span style={{ color: '#fff', fontWeight: 700 }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── PARTICIPANTS ── */}
        {activeTab === 'participants' && (
          <motion.div key="participants" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {participantsLoading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading participants...</div>
            ) : (
              <>
                {/* Teams Section */}
                <div style={{ marginBottom: '36px' }}>
                  <h2 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={18} color="var(--accent-primary)" /> Teams <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.9rem' }}>({teams.length})</span>
                  </h2>

                  {teams.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', padding: '20px', textAlign: 'center' }}>No teams registered yet.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                      {teams.map((team: any, i: number) => {
                        const isLeader = user && team.leaderId === user.id;
                        const isMember = user && team.members?.some((m: any) => m.userId === user.id);
                        const pendingCount = team.joinRequests?.length || 0;
                        const isExpanded = expandedRequests.has(team.id);
                        const isRequestingThis = requestingTo === team.id;

                        return (
                          <motion.div key={team.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', overflow: 'hidden' }}>
                            <div style={{ padding: '18px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>{team.teamName}</h3>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '3px 9px', borderRadius: '20px' }}>
                                    {team.members?.length || 0}/{team.maxMembers} members
                                  </span>
                                  {/* Leader: pending requests badge */}
                                  {isLeader && pendingCount > 0 && (
                                    <button onClick={() => handleToggleRequests(team.id)}
                                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 9px', background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.4)', borderRadius: '20px', color: '#fbbf24', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}>
                                      {pendingCount} request{pendingCount !== 1 ? 's' : ''} {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Members */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                                {team.members?.map((m: any) => (
                                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: m.role === 'LEADER' ? 'linear-gradient(135deg, var(--accent-primary), #8b5cf6)' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                      {m.role === 'LEADER' ? <Crown size={12} color="#fff" /> : <User size={12} color="var(--text-muted)" />}
                                    </div>
                                    <span style={{ color: m.role === 'LEADER' ? '#fff' : 'var(--text-secondary)', fontSize: '0.83rem' }}>
                                      {m.userId.slice(0, 8)}...
                                      {m.role === 'LEADER' && <span style={{ marginLeft: '6px', fontSize: '0.68rem', color: 'var(--accent-primary)', fontWeight: 600 }}>Leader</span>}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              {/* Request to Join button (shown to registered non-members) */}
                              {user && !isMember && !isHost && isRegistered && !userTeamId && (
                                isRequestingThis ? (
                                  <div>
                                    <textarea
                                      placeholder="Optional message to the team leader..."
                                      value={requestMessage}
                                      onChange={(e) => setRequestMessage(e.target.value)}
                                      style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: '8px', color: '#fff', fontSize: '0.83rem', outline: 'none', resize: 'none', height: '60px', marginBottom: '8px', boxSizing: 'border-box' }}
                                    />
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                      <button onClick={() => { setRequestingTo(null); setRequestMessage(''); }}
                                        style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', borderRadius: '7px', cursor: 'pointer', fontSize: '0.8rem' }}>
                                        Cancel
                                      </button>
                                      <button onClick={() => handleSendJoinRequest(team.id)} disabled={requestingTeamId === team.id}
                                        style={{ flex: 2, padding: '8px', background: requestingTeamId === team.id ? 'rgba(37,99,235,0.3)' : 'var(--accent-primary)', color: '#fff', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>
                                        {requestingTeamId === team.id ? 'Sending...' : 'Send Request'}
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button onClick={() => setRequestingTo(team.id)}
                                    style={{ width: '100%', padding: '8px', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '8px', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.83rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                    <UserPlus size={14} /> Request to Join
                                  </button>
                                )
                              )}
                            </div>

                            {/* Join Requests Panel (leader only) */}
                            <AnimatePresence>
                              {isLeader && isExpanded && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(251,191,36,0.03)' }}>
                                  <div style={{ padding: '14px 18px' }}>
                                    <p style={{ color: '#fbbf24', fontSize: '0.78rem', fontWeight: 700, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pending Join Requests</p>
                                    {loadingRequests.has(team.id) ? (
                                      <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem' }}>Loading...</p>
                                    ) : (joinRequests[team.id] || []).length === 0 ? (
                                      <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem' }}>No pending requests.</p>
                                    ) : (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {(joinRequests[team.id] || []).map((req: any) => (
                                          <div key={req.id} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.07)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: req.message ? '6px' : '0' }}>
                                              <span style={{ color: '#fff', fontSize: '0.83rem', fontWeight: 600 }}>{req.requesterId.slice(0, 12)}...</span>
                                              <div style={{ display: 'flex', gap: '6px' }}>
                                                <button onClick={() => handleRespondToRequest(req.id, team.id, true)} disabled={respondingId === req.id}
                                                  style={{ padding: '4px 10px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '6px', color: 'var(--success)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                  <Check size={12} /> Accept
                                                </button>
                                                <button onClick={() => handleRespondToRequest(req.id, team.id, false)} disabled={respondingId === req.id}
                                                  style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', color: '#f87171', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                  <X size={12} /> Reject
                                                </button>
                                              </div>
                                            </div>
                                            {req.message && <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontStyle: 'italic' }}>"{req.message}"</p>}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Solo Participants Section */}
                <div>
                  <h2 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserPlus size={18} color="#8b5cf6" /> Solo Participants
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.9rem' }}>({soloParticipants.length})</span>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.78rem', marginLeft: '4px' }}>— looking to join a team</span>
                  </h2>

                  {soloParticipants.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', padding: '20px', textAlign: 'center' }}>No solo participants yet.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                      {soloParticipants.map((reg: any, i: number) => (
                        <motion.div key={reg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                          style={{ padding: '16px', background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, var(--accent-primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <User size={16} color="#fff" />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem', marginBottom: '5px' }}>
                              {reg.userId.slice(0, 10)}...
                            </p>
                            <ParticipantTypePill type={reg.participantType as ParticipantType} />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ── PROJECTS ── */}
        {activeTab === 'projects' && (
          <motion.div key="projects" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {projectsLoading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading projects...</div>
            ) : !projectsData ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#f87171' }}>Failed to load projects.</div>
            ) : (
              <>
                <div style={{ marginBottom: '20px', padding: '14px 18px', borderRadius: '12px', background: projectsData.isCompleted ? 'rgba(16,185,129,0.08)' : 'rgba(251,191,36,0.08)', border: `1px solid ${projectsData.isCompleted ? 'rgba(16,185,129,0.2)' : 'rgba(251,191,36,0.2)'}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {projectsData.isCompleted
                    ? <><CheckCircle size={16} color="var(--success)" /><span style={{ color: 'var(--success)', fontSize: '0.88rem', fontWeight: 600 }}>Hackathon complete — all projects are publicly visible, ordered by submission time.</span></>
                    : projectsData.isHost
                    ? <><Eye size={16} color="#fbbf24" /><span style={{ color: '#fbbf24', fontSize: '0.88rem', fontWeight: 600 }}>Toggle visibility per project to share with participants during the hackathon.</span></>
                    : <><Clock size={16} color="#fbbf24" /><span style={{ color: '#fbbf24', fontSize: '0.88rem' }}>Projects are restricted during the hackathon. The host controls visibility.</span></>
                  }
                </div>

                {projectsData.submissions?.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                    <Folder size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
                    <p>{projectsData.isHost ? 'No submissions yet.' : 'No visible projects yet.'}</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {projectsData.submissions.map((sub: any, i: number) => (
                      <motion.div key={sub.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        style={{ background: sub.isMine ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.03)', border: `1px solid ${sub.isMine ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '14px', padding: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: sub.isMine ? 'linear-gradient(135deg, #10b981, #059669)' : i === 0 ? 'linear-gradient(135deg, #fbbf24, var(--accent-secondary))' : i === 1 ? 'linear-gradient(135deg, #9ca3af, #6b7280)' : i === 2 ? 'linear-gradient(135deg, #d97706, #b45309)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: (sub.isMine || i < 3) ? '#fff' : 'var(--text-muted)', fontSize: '0.9rem', flexShrink: 0 }}>
                            {sub.isMine ? '★' : `#${i + 1}`}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                              <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>{sub.team?.teamName || 'Unknown Team'}</p>
                              {sub.isMine && <span style={{ padding: '2px 6px', background: 'rgba(16,185,129,0.15)', color: 'var(--success)', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>Your Project</span>}
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                              Submitted {new Date(sub.submittedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                          {projectsData.isHost && !projectsData.isCompleted && (
                            <button onClick={() => handleToggleVisibility(sub.id)} disabled={togglingId === sub.id} title={sub.isVisible ? 'Hide from participants' : 'Show to participants'}
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 13px', background: sub.isVisible ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.05)', border: `1px solid ${sub.isVisible ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '8px', color: sub.isVisible ? 'var(--success)' : 'var(--text-muted)', cursor: togglingId === sub.id ? 'not-allowed' : 'pointer', fontSize: '0.78rem', fontWeight: 600, opacity: togglingId === sub.id ? 0.5 : 1 }}>
                              {sub.isVisible ? <><Eye size={13} /> Visible</> : <><EyeOff size={13} /> Hidden</>}
                            </button>
                          )}
                          <button onClick={() => navigate(`/projects/${sub.projectId}`)}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 13px', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: '8px', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                            <ExternalLink size={13} /> View
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HackathonDetails;
