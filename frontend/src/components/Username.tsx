import React, { useEffect, useState } from 'react';
import api from '../api/axios';

// In-memory cache for user profiles to avoid redundant requests
const userCache: Record<string, { username: string; email: string }> = {};
const pendingPromises: Record<string, Promise<any>> = {};

interface UsernameProps {
  userId: string;
  fallback?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const Username: React.FC<UsernameProps> = ({ userId, fallback, className, style }) => {
  const [username, setUsername] = useState<string>(userCache[userId]?.username || '');

  useEffect(() => {
    if (!userId) return;
    
    if (userCache[userId]) {
      setUsername(userCache[userId].username);
      return;
    }

    let isMounted = true;

    const fetchUser = async () => {
      if (!pendingPromises[userId]) {
        pendingPromises[userId] = api.get(`/users/${userId}`).then((res) => {
          userCache[userId] = res.data;
          delete pendingPromises[userId];
          return res.data;
        }).catch((err) => {
          delete pendingPromises[userId];
          throw err;
        });
      }

      try {
        const data = await pendingPromises[userId];
        if (isMounted) {
          setUsername(data.username);
        }
      } catch (err) {
        console.error('Failed to fetch username for', userId, err);
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  return (
    <span className={className} style={style}>
      {username || fallback || `${userId.slice(0, 8)}...`}
    </span>
  );
};

export default Username;
