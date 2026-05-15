import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import api from '../api/axios';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { email, username, password });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel"
        style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}
      >
        <div className="flex flex-col items-center mb-8">
          <div style={{ backgroundColor: 'var(--accent-glow)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <UserPlus size={32} color="var(--accent-primary)" />
          </div>
          <h1 className="h2 text-center">Create Account</h1>
          <p className="text-secondary text-center">Join SkillSync today</p>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div className="input-group">
            <label className="input-label">Username</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="johndoe"
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="name@example.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          
          {error && <p className="error-text text-center mt-4">{error}</p>}

          <button type="submit" className="btn btn-primary mt-4 w-full">
            Sign Up
          </button>
        </form>

        <p className="text-center text-secondary mt-8">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
