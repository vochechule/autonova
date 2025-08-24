'use client'
import { ChangePasswordModal, EditProfileModal, DeleteAccountModal } from '../components/ProfileModals'
import { ConfirmModal } from '../components/ConfirmModal'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import '../styles/ProfilePage.scss'
import { PageLoading, ButtonLoading } from '../components/LoadingStates'
import { UnauthorizedPage, NetworkErrorPage } from '../components/ErrorPages'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../hooks/AuthProvider';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Ad {
  id: string;
  title: string;
  price: number;
  images?: { url: string }[];
  brand?: string;
  model?: string;
}

interface SavedAd {
  id: string;
  ad: Ad;
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: { name?: string };
}

export default function ProfilePage() {
  const { user, loading, getToken } = useAuth();
  const [ads, setAds] = useState<Ad[]>([])
  const [savedAds, setSavedAds] = useState<SavedAd[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [avgRating, setAvgRating] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadingState, setLoading] = useState(true)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [deletingAdId, setDeletingAdId] = useState<string | null>(null)
  const [removingSavedId, setRemovingSavedId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // Modals
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)

  const { showSuccess, showError } = useToast()

  // useCallback to fix react-hooks/exhaustive-deps warning
  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const token = getToken();
      if (!token || !user) {
        setError('unauthorized')
        return
      }
      const [adsResponse, savedAdsResponse, reviewsResponse, avgRatingResponse] = await Promise.allSettled([
        fetch(`${API_URL}/ad/my`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/saved-ads`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/user/${user.id}/reviews`),
        fetch(`${API_URL}/user/${user.id}/average-rating`)
      ])
      if (adsResponse.status === 'fulfilled' && adsResponse.value.ok) {
        const adsData = await adsResponse.value.json()
        setAds(adsData)
      }
      if (savedAdsResponse.status === 'fulfilled' && savedAdsResponse.value.ok) {
        const savedAdsData = await savedAdsResponse.value.json()
        setSavedAds(savedAdsData)
      }
      if (reviewsResponse.status === 'fulfilled' && reviewsResponse.value.ok) {
        const reviewsData = await reviewsResponse.value.json()
        setReviews(reviewsData)
      }
      if (avgRatingResponse.status === 'fulfilled' && avgRatingResponse.value.ok) {
        const avgData = await avgRatingResponse.value.json()
        setAvgRating(avgData.averageRating)
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError('network-error')
      showError('Chyba při načítání profilu', 'Nepodařilo se načíst data profilu')
    } finally {
      setLoading(false)
    }
  }, [getToken, showError, user])

  useEffect(() => {
    if (!user || loading) return;
    fetchProfileData();
  }, [user, loading, fetchProfileData])

  useEffect(() => {
    if (!loading && !user) {
      setLoading(false); // was setLoadingState(false)
    }
  }, [loading, user]);

  const handleDeleteAd = async (adId: string) => {
    setDeletingAdId(adId)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/ad/${adId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        setAds(ads => ads.filter(a => a.id !== adId))
        showSuccess('Inzerát smazán', 'Inzerát byl úspěšně smazán')
      } else {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Smazání se nezdařilo')
      }
    } catch (error) {
      showError('Chyba při mazání', error instanceof Error ? error.message : 'Smazání se nezdařilo')
    } finally {
      setDeletingAdId(null)
    }
  }

  const handleRemoveSaved = async (savedAdId: string, adId: string) => {
    if (!confirm('Remove this ad from saved?')) return

    setRemovingSavedId(savedAdId)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/saved-ads/${adId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        setSavedAds(savedAds => savedAds.filter(sa => sa.id !== savedAdId))
        showSuccess('Odebráno z uložených', 'Inzerát byl odebrán z uložených')
      } else {
        throw new Error('Failed to remove from saved')
      }
    } catch (error) {
      showError('Chyba při odebírání', 'Failed to remove from saved')
    } finally {
      setRemovingSavedId(null)
    }
  }

  const handleRetry = () => {
    setError(null)
    fetchProfileData()
  }

  if (loadingState) return <PageLoading message="Načítám váš profil..." />
  if (error === 'unauthorized') return <UnauthorizedPage />
  if (error === 'network-error') return <NetworkErrorPage onRetry={handleRetry} />

  if (!user) {
    return (
      <main className="profile-page">
        <div className="profile-page__logged-out">
          <h2>Nejste přihlášeni</h2>
          <Link href="/login" className="profile-page__login-btn">Přihlásit se</Link>
        </div>
      </main>
    )
  }

  // Počty hvězdiček
  const ratingCounts = [0, 0, 0, 0, 0]
  reviews.forEach(r => ratingCounts[r.rating - 1]++)

  return (
    <main className="profile-page">
      <section className="profile-page__header">
        <div className="profile-page__avatar">
          <Image src={user.avatar || '/default-avatar.png'} alt="avatar" width={96} height={96} className="profile-page__avatar-img" />
        </div>
        <div>
          <h1 className="profile-page__name">{user.name}</h1>
          <div className="profile-page__email">
            {(() => {
              const email = user.email || '';
              const [name, domain] = email.split('@');
              if (!name || !domain) return 'Přihlášen jako -';
              const masked =
                name.length > 1
                  ? `${name[0]}***${name[name.length - 1]}`
                  : `${name[0]}***`;
              return `Přihlášen jako ${masked}@${domain}`;
            })()}
          </div>
          <div className="profile-page__meta">
            {user.isDealer ? 'Autobazar' : 'Soukromý prodejce'} &middot; Připojen {user.createdAt ? new Date(user.createdAt).toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' }) : 'N/A'}
          </div>
        </div>
      </section>

      <section className="profile-page__ads">
        <h2>Moje inzeráty</h2>
        <div className="profile-page__ad-limit-indicator">
          <span>
            {ads.length} / 10 aktivních inzerátů
          </span>
          <div className="profile-page__ad-limit-bar">
            <div
              className="profile-page__ad-limit-bar-inner"
              style={{
                width: `${Math.min(ads.length / 10 * 100, 100)}%`,
                background: ads.length >= 10 ? '#dc2626' : '#0070f3'
              }}
            />
          </div>
        </div>
        <table className="profile-page__ads-table">
          <thead>
            <tr>
              <th></th>
              <th>Název</th>
              <th>Cena</th>
              <th>Akce</th>
            </tr>
          </thead>
          <tbody>
            {ads.map(ad => (
              <tr key={ad.id}>
                <td>
                  <Link href={`/ads/${ad.id}`}>
                    <Image src={ad.images?.[0]?.url || '/default-car.png'} alt="" width={80} height={60} className="profile-page__ad-img" />
                  </Link>
                </td>
                <td>
                  <Link href={`/ads/${ad.id}`} className="profile-page__ad-title-link">
                    {ad.title}
                  </Link>
                </td>
                <td>{ad.price ? `${ad.price.toLocaleString()} Kč` : '-'}</td>
                <td>
                  <div className="profile-page__ad-actions">
                    <Link href={`/ads/${ad.id}/edit`} className="profile-page__ad-action edit">
                      Upravit
                    </Link>
                    <button
                      className="profile-page__ad-action delete"
                      onClick={() => setConfirmDeleteId(ad.id)}
                      disabled={deletingAdId === ad.id}
                    >
                      {deletingAdId === ad.id ? <ButtonLoading /> : 'Smazat'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="profile-page__ads-cards">
          {ads.map(ad => (
            <div key={ad.id} className="profile-page__ad-card">
              <Link href={`/ads/${ad.id}`}>
                <Image src={ad.images?.[0]?.url || '/default-car.png'} alt="" width={120} height={90} className="profile-page__ad-img" />
              </Link>
              <div className="profile-page__ad-info">
                <Link href={`/ads/${ad.id}`} className="profile-page__ad-title-link">
                  <div className="profile-page__ad-title">{ad.title}</div>
                </Link>
                <div className="profile-page__ad-price">{ad.price ? `${ad.price.toLocaleString()} Kč` : '-'}</div>
              </div>
              <div className="profile-page__ad-actions">
                <Link href={`/ads/${ad.id}/edit`} className="profile-page__ad-action edit">
                  Upravit
                </Link>
                <button
                  className="profile-page__ad-action delete"
                  onClick={() => setConfirmDeleteId(ad.id)}
                  disabled={deletingAdId === ad.id}
                >
                  {deletingAdId === ad.id ? <ButtonLoading /> : 'Smazat'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="profile-page__saved">
        <div className="profile-page__saved-header">
          <h2>Uložené inzeráty</h2>
          {savedAds.length > 3 && (
            <Link href="/saved-ads" className="profile-page__show-all-btn">
              Zobrazit vše ({savedAds.length})
            </Link>
          )}
        </div>
        <div className="profile-page__saved-list">
          {savedAds.slice(0, 3).map(savedAd => (
            <div key={savedAd.id} className="profile-page__saved-ad">
              <Link href={`/ads/${savedAd.ad.id}`} className="profile-page__saved-link">
                <Image src={savedAd.ad.images?.[0]?.url || '/default-car.png'} alt="" width={80} height={60} />
                <div className="profile-page__saved-info">
                  <div className="profile-page__saved-title">{savedAd.ad.title}</div>
                  <div className="profile-page__saved-brand">{savedAd.ad.brand} {savedAd.ad.model}</div>
                  <div className="profile-page__saved-price">{savedAd.ad.price?.toLocaleString()} Kč</div>
                </div>
              </Link>
              <button 
                className="profile-page__saved-remove"
                onClick={() => handleRemoveSaved(savedAd.id, savedAd.ad.id)}
                disabled={removingSavedId === savedAd.id}
              >
                {removingSavedId === savedAd.id ? <ButtonLoading /> : 'Remove'}
              </button>
            </div>
          ))}
          {savedAds.length === 0 && (
            <div className="profile-page__saved-empty">
              <p>Žádné uložené inzeráty</p>
              <Link href="/ads" className="profile-page__browse-btn">Procházet inzeráty</Link>
            </div>
          )}
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="profile-page__reviews">
          <h2>Recenze</h2>
          <div className="profile-page__rating-summary">
            <div className="profile-page__rating-main">
              <span className="profile-page__rating-number">{avgRating !== null ? avgRating.toFixed(1) : '-'}</span>
              <span className="profile-page__stars">
                {'★'.repeat(Math.round(Number(avgRating) || 0))}
                {'☆'.repeat(5 - Math.round(Number(avgRating) || 0))}
              </span>
            </div>
            <div className="profile-page__rating-count">{reviews.length} reviews</div>
            <div className="profile-page__rating-bars">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="profile-page__rating-bar-row">
                  <span>{star}</span>
                  <div className="profile-page__rating-bar">
                    <div
                      className="profile-page__rating-bar-inner"
                      style={{
                        width: reviews.length
                          ? `${(ratingCounts[star - 1] / reviews.length) * 100}%`
                          : '0%',
                      }}
                    />
                  </div>
                  <span>
                    {reviews.length
                      ? `${Math.round((ratingCounts[star - 1] / reviews.length) * 100)}%`
                      : '0%'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="profile-page__review-list">
            {(showAllReviews ? reviews : reviews.slice(0, 3)).map(r => (
              <div key={r.id} className="profile-page__review">
                <div className="profile-page__review-header">
                  <div className="profile-page__review-author">{r.user?.name || 'Unknown'}</div>
                  <div className="profile-page__review-date">{new Date(r.createdAt).toLocaleDateString()}</div>
                  <div className="profile-page__review-stars">
                    {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                  </div>
                </div>
                {r.comment && <div className="profile-page__review-text">{r.comment}</div>}
              </div>
            ))}
            {reviews.length > 3 && (
                <button
                className="profile-page__show-all-btn"
                onClick={() => setShowAllReviews(v => !v)}
                >
                {showAllReviews ? 'Zobrazit méně' : 'Zobrazit všechny recenze'}
                </button>
            )}
          </div>
        </section>
      )}

      <section className="profile-page__settings">
        <h2>Správa účtu</h2>
        <div className="profile-page__settings-list">
          <button onClick={() => setShowChangePassword(true)}>
            Změnit heslo
          </button>
          <button onClick={() => setShowEditProfile(true)}>
            Upravit údaje na profilu
          </button>
          <button onClick={() => setShowDeleteAccount(true)}>
            Smazat účet
          </button>
          <button 
            className="profile-page__logout-btn"
            onClick={() => {
              localStorage.removeItem('token')
              showSuccess('Odhlášení', 'Byli jste úspěšně odhlášeni')
              setTimeout(() => window.location.reload(), 1000)
            }}
          >
            Odhlásit se
          </button>
        </div>
      </section>

      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onSuccess={() => {}} // Toast už je v komponentě
      />

      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        user={user}
        onSuccess={(updatedUser) => {
          // Optionally update user in parent if needed
        }}
      />

      <DeleteAccountModal
        isOpen={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
      />

      <ConfirmModal
        open={!!confirmDeleteId}
        title="Smazat inzerát"
        message="Opravdu chcete tento inzerát nenávratně smazat?"
        confirmText="Ano, smazat"
        cancelText="Zrušit"
        loading={deletingAdId === confirmDeleteId}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) handleDeleteAd(confirmDeleteId)
          setConfirmDeleteId(null)
        }}
      />
    </main>
  )
}