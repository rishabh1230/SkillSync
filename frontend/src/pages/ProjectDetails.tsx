import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  Edit,
  Trash2,
  ArrowLeft,
  Calendar,
  Layers,
  Activity,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ImageOff,
  Play,
} from 'lucide-react';

import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

/* ─────────────── helpers ─────────────── */

const getYoutubeEmbedUrl = (url: string): string | null => {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
};

const getDriveId = (url: string): string | null => {
  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
};

const ensureHttps = (url: string) =>
  /^https?:\/\//i.test(url) ? url : `https://${url}`;

/* ─────────────── types ─────────────── */

interface Project {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  videoLink?: string;
  images?: string[];
  status: string;
  createdAt: string;
}

type MediaItem = { type: 'video' | 'image'; src: string };

/* ─────────────── status badge colour ─────────────── */

const statusConfig: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  ACTIVE:      { bg: '#10b98115', text: '#10b981', border: '#10b98130', dot: '#10b981' },
  DRAFT:       { bg: '#f59e0b15', text: '#f59e0b', border: '#f59e0b30', dot: '#f59e0b' },
  COMPLETED:   { bg: '#6366f115', text: '#818cf8', border: '#6366f130', dot: '#818cf8' },
  ARCHIVED:    { bg: '#71717a15', text: '#a1a1aa', border: '#71717a30', dot: '#a1a1aa' },
};

/* ─────────────── MediaCarousel ─────────────── */

const MediaCarousel: React.FC<{ items: MediaItem[] }> = ({ items }) => {
  const [idx, setIdx] = useState(0);
  const total = items.length;

  const prev = () => setIdx((i) => (i - 1 + total) % total);
  const next = () => setIdx((i) => (i + 1) % total);

  const item = items[idx];
  const youtubeEmbed = item.type === 'video' ? getYoutubeEmbedUrl(item.src) : null;
  const driveId      = item.type === 'video' ? getDriveId(item.src) : null;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        borderRadius: '24px',
        overflow: 'hidden',
        background: '#08080f',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
      }}
    >
      {/* ── slide ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.25 }}
          style={{
            width: '100%',
            aspectRatio: '16 / 9',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#08080f',
          }}
        >
          {item.type === 'image' ? (
            <img
              src={item.src}
              alt={`media-${idx}`}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          ) : youtubeEmbed ? (
            <iframe
              src={`${youtubeEmbed}?rel=0&modestbranding=1`}
              title={`youtube-${idx}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                border: 'none',
              }}
            />
          ) : driveId ? (
            <iframe
              src={`https://drive.google.com/file/d/${driveId}/preview`}
              title={`drive-${idx}`}
              allow="autoplay"
              allowFullScreen
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                border: 'none',
              }}
            />
          ) : (
            <video
              controls
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            >
              <source src={item.src} />
            </video>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── controls ── */}
      {total > 1 && (
        <>
          {/* prev */}
          <button
            onClick={prev}
            aria-label="Previous"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(6,182,212,0.35)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.55)')}
          >
            <ChevronLeft size={20} />
          </button>

          {/* next */}
          <button
            onClick={next}
            aria-label="Next"
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(6,182,212,0.35)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.55)')}
          >
            <ChevronRight size={20} />
          </button>

          {/* dots */}
          <div
            style={{
              position: 'absolute',
              bottom: '14px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '6px',
              zIndex: 10,
            }}
          >
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Go to slide ${i + 1}`}
                style={{
                  width: i === idx ? '22px' : '7px',
                  height: '7px',
                  borderRadius: '9999px',
                  background: i === idx ? 'var(--accent-primary)' : 'rgba(255,255,255,0.3)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.25s',
                }}
              />
            ))}
          </div>

          {/* counter */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '9999px',
              padding: '3px 10px',
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.75)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {item.type === 'image' ? <ImageOff size={12} /> : <Play size={12} />}
            {idx + 1} / {total}
          </div>
        </>
      )}
    </div>
  );
};

/* ─────────────── Page ─────────────── */

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data } = await api.get(`/projects/${id}`);
        setProject(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load project details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.delete(`/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to delete project.');
      setDeleting(false);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          color: 'var(--text-secondary)',
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '3px solid rgba(6,182,212,0.2)',
            borderTop: '3px solid var(--accent-primary)',
          }}
        />
        Loading project…
      </div>
    );
  }

  /* ── Error ── */
  if (error || !project) {
    return (
      <div className="container" style={{ paddingTop: '4rem', textAlign: 'center', color: 'var(--danger)' }}>
        {error || 'Project not found.'}
      </div>
    );
  }

  /* ── derived data ── */
  const isOwner = user?.id === project.ownerId;

  const videoUrls =
    project.videoLink
      ?.match(/(?:https?:\/\/)?(?:www\.)?[^\s,]+/g)
      ?.map((u) => ensureHttps(u.trim()))
      .filter(Boolean) ?? [];

  const mediaItems: MediaItem[] = [
    ...videoUrls.map((src) => ({ type: 'video' as const, src })),
    ...(project.images ?? []).map((src) => ({ type: 'image' as const, src })),
  ];

  const hasUnparsedVideo = project.videoLink && videoUrls.length === 0;

  const st = statusConfig[project.status] ?? statusConfig['DRAFT'];

  /* ── render ── */
  return (
    <motion.div
      className="container"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ paddingBottom: '6rem' }}
    >
      {/* ── Back + Owner actions bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
            (e.currentTarget as HTMLButtonElement).style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {isOwner && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate(`/projects/${id}/edit`)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '8px 18px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)')}
            >
              <Edit size={15} />
              Edit
            </button>

            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '8px 18px',
                borderRadius: '12px',
                border: '1px solid rgba(239,68,68,0.25)',
                background: 'rgba(239,68,68,0.08)',
                color: '#f87171',
                cursor: deleting ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                opacity: deleting ? 0.6 : 1,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!deleting) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.18)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)';
              }}
            >
              <Trash2 size={15} />
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        )}
      </div>

      {/* ── Title + meta ── */}
      <div style={{ marginBottom: '2rem' }}>
        <h1
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.75rem',
            lineHeight: 1.15,
          }}
        >
          {project.title}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* status badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              background: st.bg,
              color: st.text,
              border: `1px solid ${st.border}`,
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: st.dot,
                flexShrink: 0,
              }}
            />
            {project.status}
          </span>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
            }}
          >
            <Calendar size={13} />
            {new Date(project.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>

          {mediaItems.length > 0 && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
              }}
            >
              <Layers size={13} />
              {mediaItems.length} media asset{mediaItems.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* ── Fallback for unparsed video ── */}
      {hasUnparsedVideo && (
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '1rem 1.25rem',
            borderRadius: '14px',
            border: '1px solid rgba(245,158,11,0.2)',
            background: 'rgba(245,158,11,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.875rem',
            color: '#fbbf24',
          }}
        >
          <Activity size={16} />
          A video link was provided but couldn't be auto-embedded.&nbsp;
          <a
            href={project.videoLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#06b6d4',
              textDecoration: 'underline',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            Open link <ExternalLink size={12} />
          </a>
        </div>
      )}

      {/* ── Main two-column layout ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 280px',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* ── Left column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
          {/* Media carousel */}
          {mediaItems.length > 0 && <MediaCarousel items={mediaItems} />}

          {/* Description card */}
          <div
            className="glass-panel"
            style={{ padding: '2rem', borderRadius: '20px' }}
          >
            <h2
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '18px',
                  height: '2px',
                  background: 'var(--accent-primary)',
                  borderRadius: '2px',
                }}
              />
              Description
            </h2>

            <div
              className="markdown-body"
              style={{
                color: 'var(--text-primary)',
                lineHeight: 1.75,
                fontSize: '0.9375rem',
              }}
            >
              <ReactMarkdown>
                {project.description || '*No description provided.*'}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '24px' }}>
          {/* Project Info card */}
          <div
            className="glass-panel"
            style={{ padding: '1.5rem', borderRadius: '20px' }}
          >
            <h3
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
                marginBottom: '1.25rem',
              }}
            >
              Project Info
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Status */}
              <InfoRow
                label="Status"
                value={
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: st.text,
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: st.dot,
                      }}
                    />
                    {project.status}
                  </span>
                }
              />

              {/* Created */}
              <InfoRow
                label="Created"
                value={
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    {new Date(project.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                }
              />

              {/* Media */}
              <InfoRow
                label="Media"
                value={
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    {mediaItems.length > 0
                      ? `${mediaItems.filter((m) => m.type === 'video').length} video(s), ${
                          mediaItems.filter((m) => m.type === 'image').length
                        } image(s)`
                      : '—'}
                  </span>
                }
              />
            </div>
          </div>

          {/* Owner actions card (visible to owner) */}
          {isOwner && (
            <div
              className="glass-panel"
              style={{ padding: '1.5rem', borderRadius: '20px' }}
            >
              <h3
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-muted)',
                  marginBottom: '1.25rem',
                }}
              >
                Owner Actions
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={() => navigate(`/projects/${id}/edit`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '10px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(6,182,212,0.1)',
                    color: 'var(--accent-primary)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(6,182,212,0.2)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(6,182,212,0.1)')}
                >
                  <Edit size={15} />
                  Edit Project
                </button>

                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '10px',
                    borderRadius: '12px',
                    border: '1px solid rgba(239,68,68,0.2)',
                    background: 'rgba(239,68,68,0.07)',
                    color: '#f87171',
                    cursor: deleting ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    opacity: deleting ? 0.6 : 1,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!deleting) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.16)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.07)';
                  }}
                >
                  <Trash2 size={15} />
                  {deleting ? 'Deleting…' : 'Delete Project'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ── tiny helper component ── */
const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      paddingBottom: '18px',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}
  >
    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
    {value}
  </div>
);

export default ProjectDetails;