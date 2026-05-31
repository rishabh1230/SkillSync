import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Trophy, Calendar, CheckCircle, ArrowRight } from 'lucide-react';

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

const CreateHackathon: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    fullDescription: '',
    theme: '',
    prizePool: '',
    maxTeamSize: 4,
    registrationStartDate: '',
    registrationEndDate: '',
    hackathonStartDate: '',
    submissionDeadline: '',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Ensure dates are parsed to ISO format
      const payload = {
        ...formData,
        registrationStartDate: new Date(formData.registrationStartDate).toISOString(),
        registrationEndDate: new Date(formData.registrationEndDate).toISOString(),
        hackathonStartDate: new Date(formData.hackathonStartDate).toISOString(),
        submissionDeadline: new Date(formData.submissionDeadline).toISOString(),
      };
      
      const response = await api.post('/hackathons', payload);
      navigate(`/hackathons/${response.data.id}`);
    } catch (err) {
      console.error('Failed to create hackathon:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>Host a Hackathon</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Fill in the details to launch your coding challenge.</p>

      <form onSubmit={handleSubmit} style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '30px' }}>
        
        <label style={labelStyle}>Hackathon Title</label>
        <input style={inputStyle} type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />

        <label style={labelStyle}>Short Description</label>
        <input style={inputStyle} type="text" value={formData.shortDescription} onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })} required />

        <label style={labelStyle}>Theme</label>
        <input style={inputStyle} type="text" value={formData.theme} onChange={(e) => setFormData({ ...formData, theme: e.target.value })} />

        <label style={labelStyle}>Prize Pool</label>
        <input style={inputStyle} type="text" value={formData.prizePool} onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Registration Start</label>
            <input style={inputStyle} type="datetime-local" value={formData.registrationStartDate} onChange={(e) => setFormData({ ...formData, registrationStartDate: e.target.value })} required />
          </div>
          <div>
            <label style={labelStyle}>Registration End</label>
            <input style={inputStyle} type="datetime-local" value={formData.registrationEndDate} onChange={(e) => setFormData({ ...formData, registrationEndDate: e.target.value })} required />
          </div>
          <div>
            <label style={labelStyle}>Hackathon Start</label>
            <input style={inputStyle} type="datetime-local" value={formData.hackathonStartDate} onChange={(e) => setFormData({ ...formData, hackathonStartDate: e.target.value })} required />
          </div>
          <div>
            <label style={labelStyle}>Submission Deadline</label>
            <input style={inputStyle} type="datetime-local" value={formData.submissionDeadline} onChange={(e) => setFormData({ ...formData, submissionDeadline: e.target.value })} required />
          </div>
        </div>

        <label style={labelStyle}>Full Description</label>
        <textarea style={{ ...inputStyle, minHeight: '120px' }} value={formData.fullDescription} onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })} required />

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
          {loading ? 'Creating...' : <>Launch Hackathon <ArrowRight size={18} /></>}
        </button>
      </form>
    </div>
  );
};

export default CreateHackathon;
