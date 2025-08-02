'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import FavoriteButton from '../components/FavoriteButton'
import Link from 'next/link'
import '../styles/SavedAdsPage.scss'

interface SavedAd {
  id: string
  adId: string
  userId: string
  createdAt: string
  ad: {
    id: string
    title: string
    brand: string
    model: string
    price: number
    images?: Array<{
      id: string
      url: string
    }>
    createdAt: string
  }
}

export default function SavedAdsPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const [savedAds, setSavedAds] = useState<SavedAd[]>([])
  const [loadingAds, setLoadingAds] = useState(true)

  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('token')
      fetch('http://localhost:3000/saved-ads', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          setSavedAds(data)
          setLoadingAds(false)
        })
        .catch(() => {
          setLoadingAds(false)
        })
    } else if (!loading) {
      setLoadingAds(false)
    }
  }, [isAuthenticated, user, loading])

  const handleRemoveAd = (adId: string) => {
    setSavedAds(prev => prev.filter(savedAd => savedAd.adId !== adId))
  }

  if (loading || loadingAds) {
    return (
      <main className="saved-ads-page">
        <div className="saved-ads-page__container">
          <div className="saved-ads-page__loading">Načítám...</div>
        </div>
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="saved-ads-page">
        <div className="saved-ads-page__container">
          <div className="saved-ads-page__auth-required">
            <h1>Oblíbené inzeráty</h1>
            <p>Pro zobrazení oblíbených inzerátů se musíte přihlásit.</p>
            <Link href="/login" className="saved-ads-page__login-btn">
              Přihlásit se
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="saved-ads-page">
      <div className="saved-ads-page__container">
        <div className="saved-ads-page__header">
          <h1>Oblíbené inzeráty</h1>
          <p>{savedAds.length} inzerátů</p>
        </div>

        {savedAds.length === 0 ? (
          <div className="saved-ads-page__empty">
            <div className="saved-ads-page__empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2>Zatím nemáte žádné oblíbené inzeráty</h2>
            <p>Procházejte inzeráty a přidejte si je do oblíbených kliknutím na srdíčko.</p>
            <Link href="/ads" className="saved-ads-page__browse-btn">
              Procházet inzeráty
            </Link>
          </div>
        ) : (
          <div className="saved-ads-page__list">
            {savedAds.map(savedAd => (
              <div key={savedAd.id} className="saved-ads-page__card">
                <Link href={`/ads/${savedAd.adId}`} className="saved-ads-page__card-link">
                  <div className="saved-ads-page__image-container">
                    <img
                      src={savedAd.ad.images?.[0]?.url || '/no-image.png'}
                      alt={savedAd.ad.title}
                      className="saved-ads-page__image"
                    />
                  </div>
                  <div className="saved-ads-page__content">
                    <h3 className="saved-ads-page__title">
                      {savedAd.ad.brand} {savedAd.ad.model}
                    </h3>
                    <div className="saved-ads-page__price">
                      {savedAd.ad.price?.toLocaleString()} Kč
                    </div>
                    <div className="saved-ads-page__date">
                      Uloženo {new Date(savedAd.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
                
                <div className="saved-ads-page__actions">
                  <FavoriteButton 
                    adId={savedAd.adId} 
                    className="favorite-button--inline"
                    onToggle={(isSaved) => {
                      if (!isSaved) {
                        handleRemoveAd(savedAd.adId)
                      }
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
} 