import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';
import SkillSyncLogo from '../components/SkillSyncLogo';
import { Typewriter } from '../components/Typewriter';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', { email, username, password });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <style>{`
        .auth-right-pane { display: none; }
        @media (min-width: 768px) {
          .auth-right-pane { 
            display: block; 
            flex: 1; 
            position: relative; 
            background-size: cover; 
            background-position: center; 
          }
        }
        .form-container { width: 100%; max-width: 400px; margin: 0 auto; }
      `}</style>

      {/* Left Pane: Form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '2rem', position: 'relative', justifyContent: 'center' }}>
        <div className="form-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
              <Link to="/" style={{ display: 'inline-block', marginBottom: '1.5rem' }}>
                <SkillSyncLogo size={80} />
              </Link>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
                Create Account
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Join SkillSync to start building, collaborating, and shipping faster.
              </p>
            </div>

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Username
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3rem', background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s' }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--accent-secondary)'; e.target.style.boxShadow = '0 0 0 4px rgba(249,115,22,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.85rem 1rem 0.85rem 3rem', background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s' }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--accent-secondary)'; e.target.style.boxShadow = '0 0 0 4px rgba(249,115,22,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.85rem 3rem 0.85rem 3rem', background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s' }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--accent-secondary)'; e.target.style.boxShadow = '0 0 0 4px rgba(249,115,22,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '12px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '0.85rem', textAlign: 'center' }}>
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: 'none', background: loading ? 'rgba(249,115,22,0.4)' : 'var(--accent-secondary)', color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s', marginTop: '8px' }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(249,115,22,0.3)'; } }}
                onMouseLeave={e => { if (!loading) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; } }}
              >
                {loading ? 'Creating account...' : 'Create Account'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--accent-secondary)', fontWeight: 600, textDecoration: 'none' }}>
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>

        <div style={{ marginTop: 'auto' }} />
      </div>

      {/* Right Pane: Image & Quote */}
      <div 
        className="auth-right-pane"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop")',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-primary) 0%, transparent 60%)' }} />
        
        <div style={{ position: 'absolute', bottom: '3rem', left: '3rem', right: '3rem', zIndex: 10 }}>
          <blockquote style={{ margin: 0, padding: 0 }}>
            <p style={{ fontSize: '1.75rem', fontWeight: 600, color: '#fff', lineHeight: 1.3, marginBottom: '1rem' }}>
              "<Typewriter 
                text="Create an account. A new chapter of innovation awaits." 
                speed={50} 
              />"
            </p>
            <cite style={{ fontSize: '1rem', fontStyle: 'normal', color: 'var(--accent-secondary)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
              — SkillSync Community
            </cite>
          </blockquote>
        </div>
      </div>
    </div>
  );
};

export default Register;
