import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, FileText, AlignLeft, Tags } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CreateProject: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'DRAFT'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/projects', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="container"
    >
      <div className="mb-8 flex items-center gap-4">
        <div style={{ backgroundColor: 'var(--accent-glow)', padding: '1rem', borderRadius: '50%' }}>
          <Rocket size={32} color="var(--accent-primary)" />
        </div>
        <div>
          <h1 className="h1">Create New Project</h1>
          <p className="text-secondary">Launch your next big idea today.</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2.5rem', maxWidth: '800px' }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div className="input-group">
            <label className="input-label flex items-center gap-2">
              <FileText size={16} />
              Project Title
            </label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="E.g., SkillSync Rebrand"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required 
            />
          </div>

          <div className="input-group">
            <label className="input-label flex items-center gap-2">
              <AlignLeft size={16} />
              Description
            </label>
            <textarea 
              className="input-field" 
              placeholder="What is this project about?"
              rows={5}
              style={{ resize: 'vertical' }}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="input-group">
            <label className="input-label flex items-center gap-2">
              <Tags size={16} />
              Status
            </label>
            <select 
              className="input-field" 
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          {error && <p className="error-text">{error}</p>}

          <div className="flex justify-between items-center mt-4 border-t border-light pt-6" style={{ borderTop: '1px solid var(--border-light)' }}>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading || !formData.title}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>

        </form>
      </div>
    </motion.div>
  );
};

export default CreateProject;
