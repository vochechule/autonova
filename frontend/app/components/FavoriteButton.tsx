'use client'
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

interface FavoriteButtonProps {
  adId: string;
  className?: string;
  onToggle?: (isSaved: boolean) => void;
}

export default function FavoriteButton({ adId, className = '', onToggle }: FavoriteButtonProps) {
  const { user, getToken, isAuthenticated } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Check if ad is saved
      const token = getToken();
      fetch(`http://localhost:3000/saved-ads/${adId}/is-saved`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(data => setIsSaved(data.isSaved))
        .catch(() => setIsSaved(false));
    }
  }, [adId, isAuthenticated, user, getToken]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    const token = getToken();

    try {
      if (isSaved) {
        // Unsave ad
        await fetch(`http://localhost:3000/saved-ads/${adId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setIsSaved(false);
        onToggle?.(false);
      } else {
        // Save ad
        await fetch('http://localhost:3000/saved-ads', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ adId }),
        });
        setIsSaved(true);
        onToggle?.(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={loading}
      className={`favorite-button ${isSaved ? 'favorite-button--saved' : ''} ${className}`}
      aria-label={isSaved ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={isSaved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
} 