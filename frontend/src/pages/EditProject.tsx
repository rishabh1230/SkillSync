import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, FileText, AlignLeft, Tags, Image as ImageIcon, Video, UploadCloud, ArrowLeft } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import MDEditor from '@uiw/react-md-editor';

const EditProject: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'DRAFT',
    videoLink: '',
    images: [] as string[]
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data } = await api.get(`/projects/${id}`);
        if (data.ownerId !== user?.id) {
          navigate('/dashboard'); // Unauthorized
          return;
        }
        setFormData({
          title: data.title || '',
          description: data.description || '',
          status: data.status || 'DRAFT',
          videoLink: data.videoLink || '',
          images: data.images || []
        });
      } catch (err) {
        setError('Failed to load project details.');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProject();
  }, [id, user, navigate]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formDataPayload = new FormData();
        formDataPayload.append('file', file);
        
        const { data } = await api.post('/projects/upload', formDataPayload, {
          headers: { 
            Authorization: `Bearer ${token}`
            // DO NOT manually set Content-Type here; Axios needs to set it automatically to include the boundary!
          }
        });

        uploadedUrls.push(data.url);
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));

    } catch (err) {
      console.error('Image upload failed', err);
      alert('Failed to upload image(s).');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      await api.patch(`/projects/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/projects/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container mt-12 text-center">Loading...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="container pb-12"
    >
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-secondary hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} /> Back to Project
      </button>

      <div className="mb-8 flex items-center gap-4">
        <div style={{ backgroundColor: 'var(--accent-glow)', padding: '1rem', borderRadius: '50%' }}>
          <Rocket size={32} color="var(--accent-primary)" />
        </div>
        <div>
          <h1 className="h1">Edit Project</h1>
          <p className="text-secondary">Update your project details and media.</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2.5rem', maxWidth: '900px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          
          <div className="input-group">
            <label className="input-label flex items-center gap-2">
              <FileText size={16} />
              Project Title
            </label>
            <input 
              type="text" 
              className="input-field" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required 
            />
          </div>

          <div className="input-group">
            <label className="input-label flex items-center gap-2">
              <Video size={16} />
              Hero Video Link
            </label>
            <input 
              type="url" 
              className="input-field" 
              value={formData.videoLink}
              onChange={(e) => setFormData({...formData, videoLink: e.target.value})}
            />
          </div>

          <div className="input-group" data-color-mode="dark">
            <label className="input-label flex items-center gap-2 mb-2">
              <AlignLeft size={16} />
              Rich Description
            </label>
            <MDEditor
              value={formData.description}
              onChange={(val) => setFormData({...formData, description: val || ''})}
              preview="edit"
              height={300}
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            />
          </div>

          <div className="input-group">
            <label className="input-label flex items-center gap-2">
              <ImageIcon size={16} />
              Project Images Gallery
            </label>
            
            <div className="border-dashed border-2 border-slate-600 rounded-lg p-6 text-center hover:bg-slate-800 transition-colors duration-200">
              <UploadCloud size={32} className="mx-auto mb-2 text-slate-400" />
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleImageUpload}
                disabled={uploadingImage}
                style={{ display: 'none' }}
                id="edit-image-upload"
              />
              <label htmlFor="edit-image-upload" className="btn btn-secondary cursor-pointer">
                {uploadingImage ? 'Uploading...' : 'Browse New Images'}
              </label>
            </div>
            
            {formData.images.length > 0 && (
              <div className="flex gap-4 flex-wrap mt-4">
                {formData.images.map((img, i) => (
                  <div key={i} className="relative w-32 h-32 rounded-lg overflow-hidden border border-slate-700">
                    <img src={img} alt={`Uploaded ${i}`} className="object-cover w-full h-full" />
                    <button 
                      type="button"
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs shadow-lg hover:bg-red-700"
                      onClick={() => setFormData(prev => ({...prev, images: prev.images.filter((_, idx) => idx !== i)}))}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              onClick={() => navigate(`/projects/${id}`)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={saving || !formData.title || uploadingImage}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </motion.div>
  );
};

export default EditProject;
