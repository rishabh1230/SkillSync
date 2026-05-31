import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Upload, X, ImageIcon, Plus } from 'lucide-react';
import api from '../api/axios';

const SUGGESTED_TAGS = ['AI', 'Web3', 'Healthcare', 'Fintech', 'Education', 'Open Innovation', 'SaaS', 'Cybersecurity', 'Climate', 'Gaming', 'AR/VR', 'Robotics'];

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '10px',
  color: '#fff',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.85rem',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  marginBottom: '8px',
  letterSpacing: '0.02em',
};

const fieldWrap: React.CSSProperties = { marginBottom: '24px' };

const CreateHackathon: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    organizationName: '',
    shortDescription: '',
    fullDescription: '',
    theme: '',
    prizePool: '',
    maxTeamSize: 4,
    registrationStartDate: '',
    registrationEndDate: '',
    hackathonStartDate: '',
    submissionDeadline: '',
    eligibility: '',
    rules: '',
  });

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    const reader = new FileReader();
    reader.onload = () => setBannerPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 6) {
      setTags([...tags, trimmed]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerFile) { setError('Please upload a banner image.'); return; }
    if (tags.length === 0) { setError('Please add at least one tag.'); return; }
    setError('');
    setLoading(true);
    try {
      // 1. Upload banner image first
      setUploading(true);
      const fd = new FormData();
      fd.append('file', bannerFile);
      const uploadRes = await api.post('/hackathons/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const bannerImage = uploadRes.data.url;
      setUploading(false);

      // 2. Create hackathon with image URL + tags
      const payload = {
        ...formData,
        bannerImage,
        tags,
        registrationStartDate: new Date(formData.registrationStartDate).toISOString(),
        registrationEndDate: new Date(formData.registrationEndDate).toISOString(),
        hackathonStartDate: new Date(formData.hackathonStartDate).toISOString(),
        submissionDeadline: new Date(formData.submissionDeadline).toISOString(),
      };

      const response = await api.post('/hackathons', payload);
      navigate(`/hackathons/${response.data.id}`);
    } catch (err: any) {
      console.error('Failed to create hackathon:', err);
      setError(err?.response?.data?.message || 'Failed to create hackathon. Please try again.');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const field = (label: string, key: keyof typeof formData, type = 'text', required = false, placeholder = '') => (
    <div style={fieldWrap}>
      <label style={labelStyle}>{label}{required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}</label>
      <input
        style={inputStyle}
        type={type}
        placeholder={placeholder}
        value={String(formData[key])}
        onChange={(e) => setFormData({ ...formData, [key]: type === 'number' ? Number(e.target.value) : e.target.value })}
        required={required}
        onFocus={(e) => { e.target.style.borderColor = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
        onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
      />
    </div>
  );

  return (
    <div style={{ padding: '24px', maxWidth: '860px', margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>Host a Hackathon</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Fill in the details to launch your coding challenge.</p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', padding: '36px', display: 'flex', flexDirection: 'column', gap: '0px' }}
      >
        {/* ── Banner Image Upload ── */}
        <div style={fieldWrap}>
          <label style={labelStyle}>Banner Image <span style={{ color: '#ef4444' }}>*</span></label>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              position: 'relative',
              width: '100%',
              paddingTop: '35%',
              background: bannerPreview ? `url(${bannerPreview}) center/cover` : 'rgba(255,255,255,0.03)',
              border: `2px dashed ${bannerPreview ? 'transparent' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: '12px',
              cursor: 'pointer',
              overflow: 'hidden',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={(e) => { if (!bannerPreview) (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-primary)'; }}
            onMouseLeave={(e) => { if (!bannerPreview) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'; }}
          >
            {!bannerPreview && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <ImageIcon size={40} color="var(--text-muted)" />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Click to upload hackathon banner</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>PNG, JPG — 16:9 ratio recommended</p>
              </div>
            )}
            {bannerPreview && (
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }}>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setBannerFile(null); setBannerPreview(null); }}
                  style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={16} />
                </button>
                <div style={{ position: 'absolute', bottom: '12px', left: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '0.85rem' }}>
                  <Upload size={14} /> {bannerFile?.name}
                </div>
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
        </div>

        {/* ── Basic Info ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>{field('Hackathon Title', 'title', 'text', true, 'e.g., Global AI Hackathon 2026')}</div>
          <div>{field('Organization Name', 'organizationName', 'text', false, 'e.g., TechCorp Inc.')}</div>
        </div>

        {field('Short Description', 'shortDescription', 'text', true, '1–2 sentence summary shown on the card')}

        {/* ── Tags ── */}
        <div style={fieldWrap}>
          <label style={labelStyle}>Themes / Tags <span style={{ color: '#ef4444' }}>*</span> <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.75rem' }}>(up to 6)</span></label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
            {SUGGESTED_TAGS.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => tags.includes(t) ? removeTag(t) : addTag(t)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  border: `1px solid ${tags.includes(t) ? 'var(--accent-primary)' : 'rgba(255,255,255,0.12)'}`,
                  background: tags.includes(t) ? 'rgba(37,99,235,0.15)' : 'rgba(255,255,255,0.03)',
                  color: tags.includes(t) ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 0.15s',
                }}
              >
                {tags.includes(t) ? '✓ ' : ''}{t}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
              placeholder="Or type a custom tag and press Enter..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
            />
            <button type="button" onClick={() => addTag(tagInput)} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '10px', cursor: 'pointer' }}>
              <Plus size={18} />
            </button>
          </div>
          {tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
              {tags.map(t => (
                <span key={t} style={{ padding: '4px 12px', background: 'rgba(37,99,235,0.12)', borderRadius: '20px', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {t}
                  <X size={12} style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => removeTag(t)} />
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Prize & Team ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>{field('Prize Pool', 'prizePool', 'text', false, 'e.g., $10,000')}</div>
          <div style={fieldWrap}>
            <label style={labelStyle}>Max Team Size</label>
            <input style={inputStyle} type="number" min={1} max={10} value={formData.maxTeamSize} onChange={(e) => setFormData({ ...formData, maxTeamSize: Number(e.target.value) })} />
          </div>
        </div>

        {/* ── Dates ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={fieldWrap}>
            <label style={labelStyle}>Registration Start <span style={{ color: '#ef4444' }}>*</span></label>
            <input style={inputStyle} type="datetime-local" value={formData.registrationStartDate} onChange={(e) => setFormData({ ...formData, registrationStartDate: e.target.value })} required />
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle}>Registration End <span style={{ color: '#ef4444' }}>*</span></label>
            <input style={inputStyle} type="datetime-local" value={formData.registrationEndDate} onChange={(e) => setFormData({ ...formData, registrationEndDate: e.target.value })} required />
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle}>Hackathon Start <span style={{ color: '#ef4444' }}>*</span></label>
            <input style={inputStyle} type="datetime-local" value={formData.hackathonStartDate} onChange={(e) => setFormData({ ...formData, hackathonStartDate: e.target.value })} required />
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle}>Submission Deadline <span style={{ color: '#ef4444' }}>*</span></label>
            <input style={inputStyle} type="datetime-local" value={formData.submissionDeadline} onChange={(e) => setFormData({ ...formData, submissionDeadline: e.target.value })} required />
          </div>
        </div>

        {/* ── Full Description ── */}
        <div style={fieldWrap}>
          <label style={labelStyle}>Full Description <span style={{ color: '#ef4444' }}>*</span></label>
          <textarea
            style={{ ...inputStyle, minHeight: '140px', resize: 'vertical', fontFamily: 'inherit' }}
            value={formData.fullDescription}
            onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
            required
            placeholder="Tell participants everything about your hackathon..."
            onFocus={(e) => { e.target.style.borderColor = 'var(--accent-primary)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          />
        </div>

        {/* ── Eligibility & Rules ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={fieldWrap}>
            <label style={labelStyle}>Eligibility</label>
            <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }} placeholder="Who can participate?" value={formData.eligibility} onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })} />
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle}>Rules</label>
            <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }} placeholder="Key rules for participants..." value={formData.rules} onChange={(e) => setFormData({ ...formData, rules: e.target.value })} />
          </div>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#ef4444', fontSize: '0.9rem', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%',
            padding: '16px',
            background: loading ? 'rgba(37,99,235,0.5)' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
            color: '#fff',
            borderRadius: '12px',
            border: 'none',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 20px rgba(37,99,235,0.3)',
          }}
        >
          {uploading ? 'Uploading banner...' : loading ? 'Creating...' : <><span>Launch Hackathon</span><ArrowRight size={18} /></>}
        </motion.button>
      </motion.form>
    </div>
  );
};

export default CreateHackathon;
