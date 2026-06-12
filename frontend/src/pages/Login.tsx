import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Zap, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorations */}
      <div
        style={{
          position: 'fixed',
          top: '-20%',
          left: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: '-20%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: '420px', position: 'relative' }}
      >
        {/* Card */}
        <div
          style={{
            background: 'rgba(12,12,20,0.85)',
            backdropFilter: 'blur(24px)',
            border: 'none',
            borderRadius: '24px',
            padding: '2.5rem',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          }}
        >
          {/* Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                boxShadow: '0 0 32px rgba(6,182,212,0.35)',
              }}
            >
              <Zap size={26} color="#fff" />
            </div>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                color: '#fff',
                marginBottom: '0.35rem',
              }}
            >
              Welcome back
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Sign in to your SkillSync account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Email */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  marginBottom: '6px',
                }}
              >
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.75rem',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--accent-primary)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.12)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  marginBottom: '6px',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 3rem 0.75rem 2.75rem',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--accent-primary)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.12)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#f87171',
                  fontSize: '0.8rem',
                }}
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '0.85rem',
                borderRadius: '12px',
                border: 'none',
                background: loading
                  ? 'rgba(6,182,212,0.4)'
                  : 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                color: '#fff',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(6,182,212,0.35)',
                marginTop: '4px',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 28px rgba(6,182,212,0.45)';
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'none';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(6,182,212,0.35)';
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          {/* Footer link */}
          <p
            style={{
              textAlign: 'center',
              marginTop: '1.5rem',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
            }}
          >
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{ color: 'var(--accent-primary)', fontWeight: 500, textDecoration: 'none' }}
            >
              Sign up free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
