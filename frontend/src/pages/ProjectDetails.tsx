import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import ReactPlayer from 'react-player';
import { Edit, Trash2, ArrowLeft } from 'lucide-react';

import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

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
    const confirmed = window.confirm(
      'Are you sure you want to delete this project? This cannot be undone.'
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      await api.delete(`/projects/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to delete project.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-12 text-center">
        Loading project...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mt-12 text-center text-red-500">
        {error || 'Project not found.'}
      </div>
    );
  }

  const isOwner = user?.id === project.ownerId;

  // Extract all URLs robustly
  const videoUrls =
    project.videoLink
      ?.match(/(?:https?:\/\/)?(?:www\.)?[^\s,]+/g)
      ?.map((url) => {
        let cleanUrl = url.trim();
        if (!/^https?:\/\//i.test(cleanUrl)) {
          cleanUrl = 'https://' + cleanUrl;
        }
        return cleanUrl;
      })
      ?.filter(Boolean) || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container pb-24"
    >
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-secondary hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      {/* VIDEO SECTION */}
      {project.videoLink && videoUrls.length === 0 && (
        <div className="mb-8 p-4 bg-slate-800 rounded-xl border border-slate-700 text-center text-slate-300">
          <p>A video link was provided but couldn't be parsed automatically.</p>
          <a href={project.videoLink} target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline mt-2 inline-block">
            {project.videoLink}
          </a>
        </div>
      )}

      {videoUrls.length > 0 && (
        <div className="flex flex-col gap-8 mb-8">
          {videoUrls.map((url, idx) => {
            // Google Drive Patterns
            const drivePatterns = [
              /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
              /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
              /drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/,
            ];

            let driveId: string | null = null;

            for (const pattern of drivePatterns) {
              const match = url.match(pattern);

              if (match) {
                driveId = match[1];
                break;
              }
            }

            // GOOGLE DRIVE VIDEO
            if (driveId) {
              return (
                <div
                  key={idx}
                  className="w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800"
                  style={{
                    aspectRatio: '16/9',
                    maxHeight: '650px',
                  }}
                >
                  <iframe
                    src={`https://drive.google.com/file/d/${driveId}/preview`}
                    width="100%"
                    height="100%"
                    allow="autoplay"
                    allowFullScreen
                    className="border-0"
                    title={`drive-video-${idx}`}
                  />
                </div>
              );
            }

            // YOUTUBE + OTHER VIDEOS
            return (
              <div
                key={idx}
                className="w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800"
                style={{
                  aspectRatio: '16/9',
                  maxHeight: '650px',
                }}
              >
                <ReactPlayer
                  url={url}
                  width="100%"
                  height="100%"
                  controls
                  playing={false}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-white">
            {project.title}
          </h1>

          <div className="flex gap-4 text-sm text-slate-400">
            <span>
              Status:{' '}
              <span className="text-blue-400">
                {project.status}
              </span>
            </span>

            <span>
              Created:{' '}
              {new Date(project.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* OWNER ACTIONS */}
        {isOwner && (
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/projects/${id}/edit`)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Edit size={16} />
              Edit
            </button>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} />

              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* DESCRIPTION */}
        <div
          className="lg:col-span-2 glass-panel p-8 rounded-2xl markdown-body"
          style={{ color: 'var(--text-primary)' }}
        >
          <ReactMarkdown>
            {project.description || '*No description provided.*'}
          </ReactMarkdown>
        </div>

        {/* IMAGE GALLERY */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 rounded-2xl sticky top-8">
            <h3 className="text-xl font-bold mb-4">
              Gallery
            </h3>

            {project.images && project.images.length > 0 ? (
              <div className="flex flex-col gap-4">
                {project.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Project screenshot ${idx + 1}`}
                    className="w-full h-auto rounded-xl shadow-md border border-slate-700 object-cover hover:scale-[1.02] transition-transform cursor-pointer"
                    onClick={() => window.open(img, '_blank')}
                  />
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">
                No images uploaded for this project.
              </p>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default ProjectDetails;