import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowRight } from 'lucide-react';

const inputStyle = {
  width: '100%',
  padding: '12px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'border-color 0.2s',
  marginBottom: '16px'
};

const labelStyle = {
  display: 'block',
  fontSize: '0.85rem',
  fontWeight: 500,
  color: 'var(--text-secondary)',
  marginBottom: '6px'
};

const SubmitProject: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // teamId
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoLink: '',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post(`/teams/${id}/submit`, formData);
      navigate(`/projects/${response.data.projectId}`); // Redirect to project page once submitted
    } catch (err) {
      console.error('Failed to submit project:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>Submit Hackathon Project</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Fill out the details below to submit your final project.</p>

      <form onSubmit={handleSubmit} style={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: '16px', padding: '30px' }}>
        
        <label style={labelStyle}>Project Title</label>
        <input style={inputStyle} type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required placeholder="E.g., Super AI Agent" />

        <label style={labelStyle}>Description</label>
        <textarea style={{ ...inputStyle, minHeight: '150px' }} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required placeholder="What does it do? How did you build it?" />

        <label style={labelStyle}>Video Demo Link (Optional)</label>
        <input style={inputStyle} type="url" value={formData.videoLink} onChange={(e) => setFormData({ ...formData, videoLink: e.target.value })} placeholder="https://youtube.com/..." />

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '14px', 
            background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', 
            color: '#fff', 
            borderRadius: '8px',
            border: 'none',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginTop: '10px'
          }}
        >
          {loading ? 'Submitting...' : <>Submit Project <ArrowRight size={18} /></>}
        </button>
      </form>
    </div>
  );
};

export default SubmitProject;
