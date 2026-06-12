import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket, FileText, Video, AlignLeft, Tags, UploadCloud,
  X, AlertCircle, ArrowLeft, Image as ImageIcon, CheckCircle2,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import MDEditor from '@uiw/react-md-editor';

/* ── shared input style ── */
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const focusInput = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.target.style.borderColor = 'var(--accent-primary)';
  e.target.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.12)';
};
const blurInput = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.target.style.borderColor = 'rgba(255,255,255,0.08)';
  e.target.style.boxShadow = 'none';
};

const CreateProject: React.FC = () => {
  const { token } = useAuth();
  const navigate  = useNavigate();

  const [formData, setFormData] = useState({
    title:     '',
    description: '',
    status:    'DRAFT',
    videoLink: '',
    images:    [] as string[],
  });

  const [error, setError]                   = useState('');
  const [loading, setLoading]               = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadSuccess, setUploadSuccess]   = useState(false);

  /* ── Image upload ── */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImage(true);
    setError('');
    const uploadedUrls: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const payload = new FormData();
        payload.append('file', files[i]);
        const { data } = await api.post('/projects/upload', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        uploadedUrls.push(data.url);
      }
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 2500);
    } catch {
      setError('Failed to upload image(s). Please try again.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/projects', formData, { headers: { Authorization: `Bearer ${token}` } });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (i: number) =>
    setFormData((prev) => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));

  return (
    <motion.div
      className="container"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ paddingBottom: '5rem' }}
    >
      {/* ── Back ── */}
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '7px',
          padding: '7px 16px', borderRadius: '10px',
          border: 'none',
          background: 'var(--bg-secondary)',
          color: 'var(--text-secondary)', cursor: 'pointer',
          fontSize: '0.83rem', fontWeight: 500,
          marginBottom: '1.75rem', transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-secondary)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; }}
      >
        <ArrowLeft size={15} /> Back to Dashboard
      </button>

      {/* ── Page title ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '2rem' }}>
        <div
          style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(139,92,246,0.2))',
            border: '1px solid rgba(6,182,212,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Rocket size={22} color="var(--accent-primary)" />
        </div>
        <div>
          <h1
            style={{
              fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 800, letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}
          >
            Create New Project
          </h1>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginTop: '1px' }}>
            Launch your next big idea today.
          </p>
        </div>
      </div>

      {/* ── Form card ── */}
      <div
        style={{
          background: 'rgba(255,255,255,0.025)',
          border: 'none',
          borderRadius: '24px',
          padding: '2rem',
          maxWidth: '820px',
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Title */}
          <FormField label="Project Title" icon={<FileText size={14} />}>
            <input
              type="text"
              placeholder="E.g., SkillSync Rebrand"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              style={inputStyle}
              onFocus={focusInput}
              onBlur={blurInput}
            />
          </FormField>

          {/* Video */}
          <FormField label="Hero Video Link" icon={<Video size={14} />} hint="YouTube, Google Drive, or direct URL">
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={formData.videoLink}
              onChange={(e) => setFormData({ ...formData, videoLink: e.target.value })}
              style={inputStyle}
              onFocus={focusInput}
              onBlur={blurInput}
            />
          </FormField>

          {/* Description */}
          <FormField label="Rich Description" icon={<AlignLeft size={14} />}>
            <div data-color-mode="dark">
              <MDEditor
                value={formData.description}
                onChange={(val) => setFormData({ ...formData, description: val || '' })}
                preview="edit"
                height={280}
                style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>
          </FormField>

          {/* Images */}
          <FormField label="Project Images" icon={<ImageIcon size={14} />}>
            <label
              htmlFor="image-upload"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '10px', padding: '2rem',
                border: '1.5px dashed rgba(255,255,255,0.12)',
                borderRadius: '14px',
                background: uploadingImage ? 'rgba(6,182,212,0.05)' : 'rgba(255,255,255,0.02)',
                cursor: uploadingImage ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { if (!uploadingImage) (e.currentTarget as HTMLLabelElement).style.borderColor = 'rgba(6,182,212,0.4)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLLabelElement).style.borderColor = 'rgba(255,255,255,0.12)'; }}
            >
              {uploadSuccess
                ? <CheckCircle2 size={28} color="#10b981" />
                : <UploadCloud size={28} color={uploadingImage ? 'var(--accent-primary)' : 'var(--text-muted)'} />}
              <span style={{ fontSize: '0.85rem', color: uploadingImage ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                {uploadingImage ? 'Uploading…' : uploadSuccess ? 'Uploaded!' : 'Click to browse images'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PNG, JPG, WEBP up to 10MB</span>
              <input id="image-upload" type="file" multiple accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} style={{ display: 'none' }} />
            </label>

            {/* Previews */}
            {formData.images.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                <AnimatePresence>
                  {formData.images.map((img, i) => (
                    <motion.div
                      key={img}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      style={{ position: 'relative', width: '96px', height: '96px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <img src={img} alt={`Upload ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        style={{
                          position: 'absolute', top: '5px', right: '5px',
                          width: '22px', height: '22px', borderRadius: '50%',
                          background: 'rgba(0,0,0,0.7)', border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                        }}
                      >
                        <X size={12} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </FormField>

          {/* Status */}
          <FormField label="Project Status" icon={<Tags size={14} />}>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={focusInput}
              onBlur={blurInput}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </FormField>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#f87171', fontSize: '0.82rem' }}
            >
              <AlertCircle size={14} /> {error}
            </motion.div>
          )}

          {/* Actions */}
          <div
            style={{
              display: 'flex', justifyContent: 'flex-end', gap: '10px',
              paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '0.7rem 1.4rem', borderRadius: '11px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)',
                color: 'var(--text-secondary)', fontFamily: 'inherit',
                fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'}
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={loading || !formData.title || uploadingImage}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '0.7rem 1.6rem', borderRadius: '11px', border: 'none',
                background: (loading || !formData.title || uploadingImage)
                  ? 'rgba(6,182,212,0.3)'
                  : 'linear-gradient(135deg, #06b6d4, #0891b2)',
                color: '#fff', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 600,
                cursor: (loading || !formData.title || uploadingImage) ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 16px rgba(6,182,212,0.3)', transition: 'all 0.2s',
              }}
            >
              <Rocket size={15} />
              {loading ? 'Creating…' : 'Create Project'}
            </motion.button>
          </div>

        </form>
      </div>
    </motion.div>
  );
};

/* ── tiny field wrapper ── */
const FormField: React.FC<{ label: string; icon: React.ReactNode; hint?: string; children: React.ReactNode }> = ({
  label, icon, hint, children,
}) => (
  <div>
    <label
      style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        fontSize: '0.8rem', fontWeight: 600,
        color: 'var(--text-secondary)',
        letterSpacing: '0.02em',
        marginBottom: hint ? '4px' : '8px',
      }}
    >
      <span style={{ color: 'var(--accent-primary)' }}>{icon}</span>
      {label}
    </label>
    {hint && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{hint}</p>}
    {children}
  </div>
);

export default CreateProject;
