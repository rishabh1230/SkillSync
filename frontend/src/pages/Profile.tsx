import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Lock, Save, Shield, CheckCircle,
  AlertCircle, Edit2, X, FolderGit2, Code, Link as LinkIcon,
  Plus, Trash2, GraduationCap, Award, MessageSquare
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

/* ── shared input style ── */
const inputStyle = (disabled = false): React.CSSProperties => ({
  width: '100%',
  padding: '0.7rem 1rem 0.7rem 2.6rem',
  background: disabled ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
  border: `1px solid ${disabled ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)'}`,
  borderRadius: '11px',
  color: disabled ? 'var(--text-secondary)' : '#fff',
  fontSize: '0.875rem',
  fontFamily: 'inherit',
  outline: 'none',
  cursor: disabled ? 'default' : 'text',
  transition: 'border-color 0.2s, box-shadow 0.2s',
});

interface EducationEntry {
  degree: string;
  institution: string;
  year: string;
}

const Profile: React.FC = () => {
  const { token, user: authUser } = useAuth();
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();

  const isOwnProfile = !userId || userId === (authUser as any)?.id || userId === (authUser as any)?.sub;

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [profMsg, setProfMsg] = useState('');
  const [profErr, setProfErr] = useState('');
  const [savingProf, setSavingProf] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  /* profile data from user-service */
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    phone_no: '',
    githubUrl: '',
    leetcodeUrl: '',
    portfolioUrl: '',
    skills: [] as string[],
    education: [] as EducationEntry[],
  });

  /* editable copy */
  const [editData, setEditData] = useState({
    username: '',
    phone_no: '',
    githubUrl: '',
    leetcodeUrl: '',
    portfolioUrl: '',
    skills: [] as string[],
    education: [] as EducationEntry[],
  });

  const [skillInput, setSkillInput] = useState('');

  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
  });

  /* ── fetch profile ── */
  useEffect(() => {
    (async () => {
      try {
        const url = isOwnProfile ? '/users/profile' : `/users/${userId}`;
        const res = await api.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d = res.data;
        const mappedData = {
          username: d.username ?? '',
          email: d.email ?? (isOwnProfile ? (authUser as any)?.email : '') ?? '',
          phone_no: d.phone_no ?? '',
          githubUrl: d.githubUrl ?? '',
          leetcodeUrl: d.leetcodeUrl ?? '',
          portfolioUrl: d.portfolioUrl ?? '',
          skills: d.skills ?? [],
          education: d.education ?? [],
        };
        setProfile(mappedData);
        setEditData(mappedData);
      } catch (err) {
        console.error('Failed to fetch profile', err);
        if (isOwnProfile) {
          // Fallback: pre-fill email from JWT
          setProfile((p) => ({ ...p, email: (authUser as any)?.email ?? '' }));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [token, authUser, userId, isOwnProfile]);

  /* ── update profile ── */
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfMsg('');
    setProfErr('');
    setSavingProf(true);
    try {
      await api.patch(
        '/users/profile',
        editData,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setProfile((p) => ({
        ...p,
        ...editData,
      }));
      setProfMsg('Profile updated successfully!');
      setEditing(false);
    } catch (err: any) {
      setProfErr(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProf(false);
    }
  };

  /* ── update password ── */
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg('');
    setPwErr('');
    if (!passwords.old_password || !passwords.new_password) {
      setPwErr('Please fill in both password fields.');
      return;
    }
    setSavingPw(true);
    try {
      await api.post(
        '/auth/update-password',
        {
          email: profile.email,
          old_password: passwords.old_password,
          new_password: passwords.new_password,
        },
      );
      setPwMsg('Password updated successfully!');
      setPasswords({ old_password: '', new_password: '' });
    } catch (err: any) {
      setPwErr(err.response?.data?.message || 'Failed to update password. Check your current password.');
    } finally {
      setSavingPw(false);
    }
  };

  /* ── Add skill ── */
  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = skillInput.trim();
      if (val && !editData.skills.includes(val)) {
        setEditData({
          ...editData,
          skills: [...editData.skills, val],
        });
      }
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setEditData({ ...editData, skills: editData.skills.filter((_, i) => i !== index) });
  };

  /* ── Education Handlers ── */
  const addEducation = () => {
    setEditData({ ...editData, education: [...editData.education, { degree: '', institution: '', year: '' }] });
  };

  const removeEducation = (index: number) => {
    setEditData({ ...editData, education: editData.education.filter((_, i) => i !== index) });
  };

  const updateEducation = (index: number, field: keyof EducationEntry, value: string) => {
    const newEd = [...editData.education];
    newEd[index][field] = value;
    setEditData({ ...editData, education: newEd });
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: 'var(--text-muted)' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid rgba(6,182,212,0.2)', borderTop: '3px solid var(--accent-primary)' }}
        />
        Loading profile…
      </div>
    );
  }

  const initials = profile.username?.[0]?.toUpperCase() ?? 'U';

  return (
    <motion.div
      className="container"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ paddingBottom: '4rem' }}
    >
      {/* ── Page header ── */}
      <div style={{ marginBottom: '2rem' }}>
        <h1
          style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            marginBottom: '0.25rem',
          }}
        >
          Your Profile
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Manage your personal information, links, skills, and security settings.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) 280px',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        {/* ── Left column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* ── Personal Info Card ── */}
          <div style={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: '24px', padding: '1.75rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'rgba(6,182,212,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={16} color="var(--accent-primary)" />
                </div>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Profile Details</h2>
              </div>

              {isOwnProfile && (
                !editing ? (
                  <button
                    onClick={() => { setEditing(true); setProfMsg(''); setProfErr(''); }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '6px 14px', borderRadius: '9px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(255,255,255,0.04)',
                      color: 'var(--text-secondary)', cursor: 'pointer',
                      fontSize: '0.8rem', fontWeight: 500, transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(6,182,212,0.12)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-primary)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; }}
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                ) : (
                  <button
                    onClick={() => { setEditing(false); setEditData(profile); setProfErr(''); }}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '6px 14px', borderRadius: '9px',
                      border: '1px solid rgba(239,68,68,0.2)',
                      background: 'rgba(239,68,68,0.06)',
                      color: '#f87171', cursor: 'pointer',
                      fontSize: '0.8rem', fontWeight: 500, transition: 'all 0.2s',
                    }}
                  >
                    <X size={13} /> Cancel
                  </button>
                )
              )}
            </div>

            {/* Fields */}
            {!editing ? (
              /* ── Read-only view ── */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  {[
                    { label: 'Username', value: profile.username, icon: User, placeholder: 'Not set' },
                    { label: 'Email Address', value: profile.email, icon: Mail, placeholder: 'Not set' },
                    { label: 'Phone Number', value: profile.phone_no, icon: Phone, placeholder: 'Not provided' },
                  ].map(({ label, value, icon: Icon, placeholder }) => (
                    <div key={label}>
                      <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '5px' }}>{label}</label>
                      <div style={{ position: 'relative' }}>
                        <Icon size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        <input type="text" value={value} disabled placeholder={placeholder} style={inputStyle(true)} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Read-only links */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  {[
                    { label: 'GitHub', value: profile.githubUrl, icon: FolderGit2, placeholder: 'Not linked' },
                    { label: 'LeetCode', value: profile.leetcodeUrl, icon: Code, placeholder: 'Not linked' },
                    { label: 'Portfolio', value: profile.portfolioUrl, icon: LinkIcon, placeholder: 'Not linked' },
                  ].map(({ label, value, icon: Icon, placeholder }) => (
                    <div key={label}>
                      <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '5px' }}>{label}</label>
                      <div style={{ position: 'relative' }}>
                        <Icon size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        <input type="text" value={value} disabled placeholder={placeholder} style={inputStyle(true)} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Read-only skills */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>Skills</label>
                  {profile.skills.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {profile.skills.map((skill, index) => (
                        <span key={index} style={{ padding: '4px 10px', background: 'rgba(6,182,212,0.1)', color: 'var(--accent-primary)', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid rgba(6,182,212,0.2)' }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No skills added.</p>
                  )}
                </div>

                {/* Read-only education */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>Education</label>
                  {profile.education.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {profile.education.map((edu, index) => (
                        <div key={index} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '12px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <GraduationCap size={16} color="#a78bfa" />
                          </div>
                          <div>
                            <p style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>{edu.degree || 'Degree unspecified'}</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>{edu.institution || 'Institution unspecified'} {edu.year ? `• ${edu.year}` : ''}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No education history added.</p>
                  )}
                </div>

              </div>
            ) : (
              /* ── Edit form ── */
              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  {/* Email — always read-only */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '5px' }}>Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                      <input type="text" value={profile.email} disabled style={inputStyle(true)} />
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>Username</label>
                    <div style={{ position: 'relative' }}>
                      <User size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                      <input
                        type="text"
                        value={editData.username}
                        onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                        style={inputStyle(false)}
                        onFocus={(e) => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.12)'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>Phone Number</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                      <input
                        type="tel"
                        placeholder="+91 XXXXXXXXXX"
                        value={editData.phone_no}
                        onChange={(e) => setEditData({ ...editData, phone_no: e.target.value })}
                        style={inputStyle(false)}
                        onFocus={(e) => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.12)'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '0' }} />

                {/* Links */}
                <h3 style={{ fontSize: '0.85rem', color: '#fff', margin: '0 0 -10px 0' }}>Social & Links</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  {/* GitHub */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>GitHub URL</label>
                    <div style={{ position: 'relative' }}>
                      <FolderGit2 size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                      <input
                        type="url"
                        placeholder="https://github.com/..."
                        value={editData.githubUrl}
                        onChange={(e) => setEditData({ ...editData, githubUrl: e.target.value })}
                        style={inputStyle(false)}
                        onFocus={(e) => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.12)'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  </div>

                  {/* LeetCode */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>LeetCode URL</label>
                    <div style={{ position: 'relative' }}>
                      <Code size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                      <input
                        type="url"
                        placeholder="https://leetcode.com/..."
                        value={editData.leetcodeUrl}
                        onChange={(e) => setEditData({ ...editData, leetcodeUrl: e.target.value })}
                        style={inputStyle(false)}
                        onFocus={(e) => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.12)'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  </div>

                  {/* Portfolio */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>Portfolio URL</label>
                    <div style={{ position: 'relative' }}>
                      <LinkIcon size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                      <input
                        type="url"
                        placeholder="https://yourportfolio.com"
                        value={editData.portfolioUrl}
                        onChange={(e) => setEditData({ ...editData, portfolioUrl: e.target.value })}
                        style={inputStyle(false)}
                        onFocus={(e) => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.12)'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '0' }} />

                {/* Skills */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>Skills (Press Enter to add)</label>
                  <div style={{ position: 'relative', marginBottom: '10px' }}>
                    <Award size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      placeholder="React, Node.js, Python..."
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleAddSkill}
                      style={inputStyle(false)}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.12)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <AnimatePresence>
                      {editData.skills.map((skill, index) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '4px 10px', background: 'rgba(6,182,212,0.1)',
                            color: 'var(--accent-primary)', borderRadius: '6px',
                            fontSize: '0.8rem', border: '1px solid rgba(6,182,212,0.2)'
                          }}
                        >
                          {skill}
                          <X size={12} style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => removeSkill(index)} />
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '0' }} />

                {/* Education */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <label style={{ fontSize: '0.73rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Education</label>
                    <button
                      type="button"
                      onClick={addEducation}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        background: 'transparent', border: '1px dashed rgba(255,255,255,0.2)',
                        color: 'var(--text-muted)', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px',
                        cursor: 'pointer', transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-primary)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-primary)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
                    >
                      <Plus size={12} /> Add Education
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <AnimatePresence>
                      {editData.education.map((edu, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                            <button type="button" onClick={() => removeEducation(index)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                            <input
                              type="text"
                              placeholder="Degree (e.g. B.Tech in Computer Science)"
                              value={edu.degree}
                              onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                              style={{ ...inputStyle(false), padding: '0.6rem 1rem' }}
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                              <input
                                type="text"
                                placeholder="Institution"
                                value={edu.institution}
                                onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                                style={{ ...inputStyle(false), padding: '0.6rem 1rem' }}
                              />
                              <input
                                type="text"
                                placeholder="Year (e.g. 2024)"
                                value={edu.year}
                                onChange={(e) => updateEducation(index, 'year', e.target.value)}
                                style={{ ...inputStyle(false), padding: '0.6rem 1rem' }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Feedback */}
                {profErr && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#f87171', fontSize: '0.8rem' }}
                  >
                    <AlertCircle size={14} /> {profErr}
                  </motion.div>
                )}
                {profMsg && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 14px', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)', color: '#34d399', fontSize: '0.8rem' }}
                  >
                    <CheckCircle size={14} /> {profMsg}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={savingProf}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '7px',
                    alignSelf: 'flex-start',
                    padding: '0.7rem 1.4rem', borderRadius: '11px', border: 'none',
                    background: savingProf ? 'rgba(6,182,212,0.3)' : 'linear-gradient(135deg, #06b6d4, #0891b2)',
                    color: '#fff', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 600,
                    cursor: savingProf ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 16px rgba(6,182,212,0.3)', transition: 'all 0.2s',
                  }}
                >
                  <Save size={15} />
                  {savingProf ? 'Saving…' : 'Save Profile'}
                </button>
              </form>
            )}

            {/* Success after edit closed */}
            {!editing && profMsg && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 14px', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)', color: '#34d399', fontSize: '0.8rem', marginTop: '1rem' }}
              >
                <CheckCircle size={14} /> {profMsg}
              </motion.div>
            )}
          </div>

          {/* ── Security Card ── */}
          {isOwnProfile && (
            <div style={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: '24px', padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={16} color="#a78bfa" />
                </div>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Security Settings</h2>
              </div>

              <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { label: 'Current Password', key: 'old_password' as const, placeholder: '••••••••' },
                  { label: 'New Password', key: 'new_password' as const, placeholder: 'Min. 8 characters' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>{label}</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                      <input
                        type="password"
                        placeholder={placeholder}
                        value={passwords[key]}
                        onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })}
                        style={inputStyle(false)}
                        onFocus={(e) => { e.target.style.borderColor = '#8b5cf6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.12)'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  </div>
                ))}

                {pwErr && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#f87171', fontSize: '0.8rem' }}
                  >
                    <AlertCircle size={14} /> {pwErr}
                  </motion.div>
                )}
                {pwMsg && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 14px', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)', color: '#34d399', fontSize: '0.8rem' }}
                  >
                    <CheckCircle size={14} /> {pwMsg}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={savingPw}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '7px',
                    alignSelf: 'flex-start',
                    padding: '0.7rem 1.4rem', borderRadius: '11px', border: 'none',
                    background: savingPw ? 'rgba(139,92,246,0.3)' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    color: '#fff', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 600,
                    cursor: savingPw ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 16px rgba(139,92,246,0.3)', transition: 'all 0.2s',
                    marginTop: '4px',
                  }}
                  onMouseEnter={(e) => { if (!savingPw) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'none'; }}
                >
                  <Save size={15} />
                  {savingPw ? 'Updating…' : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <div style={{ position: 'sticky', top: '24px' }}>
          <div style={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: '24px', padding: '1.75rem', textAlign: 'center' }}>
            {/* Avatar */}
            <div
              style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem',
                fontSize: '1.75rem', fontWeight: 800, color: '#fff',
                boxShadow: '0 0 28px rgba(6,182,212,0.28)',
              }}
            >
              {initials}
            </div>

            <p style={{ fontWeight: 700, color: '#fff', fontSize: '1rem', marginBottom: '2px' }}>
              {profile.username || 'User'}
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem', wordBreak: 'break-all' }}>
              {profile.email}
            </p>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <InfoPair label="Phone" value={profile.phone_no || '—'} />
              <InfoPair label="Account" value="Member" />
            </div>

            {!isOwnProfile && userId && (
              <button
                onClick={() => navigate(`/chat?userId=${userId}`)}
                style={{
                  width: '100%',
                  marginTop: '1.25rem',
                  padding: '9px 14px',
                  borderRadius: '11px',
                  background: 'linear-gradient(135deg, var(--accent-primary) 0%, #0891b2 100%)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(6,182,212,0.3)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(6,182,212,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(6,182,212,0.3)';
                }}
              >
                <MessageSquare size={16} /> Message
              </button>
            )}

            {(profile.githubUrl || profile.leetcodeUrl || profile.portfolioUrl) && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '14px' }}>
                {profile.githubUrl && (
                  <a href={profile.githubUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}>
                    <FolderGit2 size={18} />
                  </a>
                )}
                {profile.leetcodeUrl && (
                  <a href={profile.leetcodeUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#f59e0b')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}>
                    <Code size={18} />
                  </a>
                )}
                {profile.portfolioUrl && (
                  <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}>
                    <LinkIcon size={18} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const InfoPair: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
    <span style={{ color: '#fff', fontWeight: 500 }}>{value}</span>
  </div>
);

export default Profile;
