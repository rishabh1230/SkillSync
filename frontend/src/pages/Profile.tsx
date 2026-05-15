import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Save } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    phone_no: ''
  });

  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // Assuming a GET /users/profile endpoint exists, or decode token.
      // For now we'll fetch from the user service via gateway if possible.
      // If no endpoint, we can just show the form for updates.
      const res = await api.get('/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) {
        setProfile({
          username: res.data.username || '',
          email: res.data.email || '',
          phone_no: res.data.phone_no || ''
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    if (!passwords.old_password || !passwords.new_password) {
      setError('Please fill in both password fields');
      return;
    }

    try {
      await api.post('/auth/update-password', {
        email: profile.email,
        old_password: passwords.old_password,
        new_password: passwords.new_password
      });
      setMessage('Password updated successfully');
      setPasswords({ old_password: '', new_password: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update password');
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container"
    >
      <div className="mb-8">
        <h1 className="h1">Your Profile</h1>
        <p className="text-secondary">Manage your personal information and security.</p>
      </div>

      <div className="flex flex-col gap-8" style={{ maxWidth: '800px' }}>
        
        {/* Personal Info Card */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 className="h3 mb-4 flex items-center gap-2">
            <User size={24} color="var(--accent-primary)" />
            Personal Information
          </h2>
          <div className="flex flex-col gap-4">
            <div className="input-group">
              <label className="input-label">Username</label>
              <div className="flex items-center gap-2">
                <User size={18} className="text-muted" />
                <input type="text" className="input-field" value={profile.username} disabled />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Email</label>
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-muted" />
                <input type="email" className="input-field" value={profile.email} disabled />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Phone Number</label>
              <div className="flex items-center gap-2">
                <Phone size={18} className="text-muted" />
                <input type="text" className="input-field" value={profile.phone_no} disabled placeholder="Not provided" />
              </div>
            </div>
          </div>
        </div>

        {/* Security Card */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 className="h3 mb-4 flex items-center gap-2">
            <Lock size={24} color="var(--accent-primary)" />
            Security Settings
          </h2>
          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
            <div className="input-group">
              <label className="input-label">Current Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••"
                value={passwords.old_password}
                onChange={(e) => setPasswords({...passwords, old_password: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label className="input-label">New Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••"
                value={passwords.new_password}
                onChange={(e) => setPasswords({...passwords, new_password: e.target.value})}
              />
            </div>

            {error && <p className="error-text">{error}</p>}
            {message && <p className="success-text">{message}</p>}

            <button type="submit" className="btn btn-primary mt-4" style={{ alignSelf: 'flex-start' }}>
              <Save size={18} />
              Update Password
            </button>
          </form>
        </div>

      </div>
    </motion.div>
  );
};

export default Profile;
