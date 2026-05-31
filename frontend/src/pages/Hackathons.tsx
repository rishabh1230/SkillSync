import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Users, Trophy, ChevronRight, Search, Filter } from 'lucide-react';
import api from '../api/axios';

const Hackathons: React.FC = () => {
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const response = await api.get('/hackathons');
        setHackathons(response.data);
      } catch (err) {
        console.error('Failed to fetch hackathons:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHackathons();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>Hackathons</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Discover and participate in upcoming coding challenges.</p>
        </div>
        <Link 
          to="/hackathons/new" 
          style={{ 
            padding: '10px 20px', 
            background: 'var(--accent-primary)', 
            color: '#fff', 
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          Host a Hackathon
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>Loading...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {hackathons.map((h, i) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ height: '140px', background: h.bannerImage ? `url(${h.bannerImage}) center/cover` : 'linear-gradient(45deg, #1e293b, #0f172a)' }} />
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.7rem', padding: '4px 8px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-primary)', borderRadius: '12px', fontWeight: 600 }}>
                    {h.status}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '8px' }}>{h.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {h.shortDescription}
                </p>
                <div style={{ display: 'flex', gap: '16px', marginTop: 'auto', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <Calendar size={14} />
                    <span>{new Date(h.hackathonStartDate).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <Users size={14} />
                    <span>{h.maxTeamSize} per team</span>
                  </div>
                </div>
                <Link 
                  to={`/hackathons/${h.id}`}
                  style={{ 
                    padding: '10px', 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    color: '#fff', 
                    textAlign: 'center',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                >
                  View Details
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Hackathons;
