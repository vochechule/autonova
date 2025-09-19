'use client'
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/AuthProvider';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface FavoriteButtonProps {
  adId: string;
  className?: string;
  onToggle?: (isSaved: boolean) => void;
}

export default function FavoriteButton({ adId, className = '', onToggle }: FavoriteButtonProps) {
  const { user, getToken, isAuthenticated } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Získej token mimo useEffect, aby nebyl v dependencies
  const token = getToken();

  useEffect(() => {

    if (!isAuthenticated || !user || !token) return;

    const abortController = new AbortController();

    const checkSavedStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/saved-ads/${adId}/is-saved`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          signal: abortController.signal,
        });

        if (abortController.signal.aborted) {
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setIsSaved(data.isSaved);
        } else {
          setIsSaved(false);
        }
      } catch (error) {
        if (typeof error === 'object' && error !== null && 'name' in error && (error as { name?: string }).name === 'AbortError') {
          return;
        }
        setIsSaved(false);
      }
    };

    checkSavedStatus();

    return () => {
      abortController.abort();
    };
  }, [adId, isAuthenticated, user, token]); // getToken už není v dependencies

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    const token = getToken();

    try {
      if (isSaved) {
        const response = await fetch(`${API_URL}/saved-ads/${adId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setIsSaved(false);
          onToggle?.(false);
        }
      } else {
        const response = await fetch(`${API_URL}/saved-ads`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ adId }),
        });

        if (response.ok) {
          setIsSaved(true);
          onToggle?.(true);
        }
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