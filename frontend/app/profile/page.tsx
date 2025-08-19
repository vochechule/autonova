'use client'
import { ChangePasswordModal, EditProfileModal, DeleteAccountModal } from '../components/ProfileModals'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import '../styles/ProfilePage.scss'
// ✅ PŘIDÁNO - Loading states a error handling
import { PageLoading, ButtonLoading } from '../components/LoadingStates'
import { UnauthorizedPage, NetworkErrorPage } from '../components/ErrorPages'
import { useToast } from '../contexts/ToastContext'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [ads, setAds] = useState<any[]>([])
  const [savedAds, setSavedAds] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [avgRating, setAvgRating] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [deletingAdId, setDeletingAdId] = useState<string | null>(null)
  const [removingSavedId, setRemovingSavedId] = useState<string | null>(null)

  // Nové stavy pro modály
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)

  // ✅ PŘIDÁNO - Toast hook
  const { showSuccess, showError } = useToast()

  useEffect(() => {
    fetchProfileData()
  }, [])

  // ✅ NOVÁ FUNKCE - Centralizované načítání dat
  const fetchProfileData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('token')
      if (!token) {
        setError('unauthorized')
        return
      }

      const userResponse = await fetch('http://localhost:3000/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (userResponse.status === 401) {
        setError('unauthorized')
        return
      }

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data')
      }

      const userData = await userResponse.json()
      setUser(userData)

      if (userData) {
        // Paralelní načítání všech dat
        const [adsResponse, savedAdsResponse, reviewsResponse, avgRatingResponse] = await Promise.allSettled([
          fetch(`http://localhost:3000/ad/my`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:3000/saved-ads`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:3000/user/${userData.id}/reviews`),
          fetch(`http://localhost:3000/user/${userData.id}/average-rating`)
        ])

        // Zpracování výsledků s error handling
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
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError('network-error')
      showError('Chyba při načítání profilu', 'Nepodařilo se načíst data profilu')
    } finally {
      setLoading(false)
    }
  }

  // ✅ NOVÁ FUNKCE - Smazání inzerátu s loading
  const handleDeleteAd = async (adId: string) => {
    if (!confirm('Opravdu chcete inzerát smazat?')) return

    setDeletingAdId(adId)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:3000/ad/${adId}`, {
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

  // ✅ NOVÁ FUNKCE - Odebrání z uložených s loading
  const handleRemoveSaved = async (savedAdId: string, adId: string) => {
    if (!confirm('Remove this ad from saved?')) return

    setRemovingSavedId(savedAdId)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:3000/saved-ads/${adId}`, {
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

  // ✅ UPRAVENO - Error handling
  if (loading) return <PageLoading message="Načítám váš profil..." />
  if (error === 'unauthorized') return <UnauthorizedPage />
  if (error === 'network-error') return <NetworkErrorPage onRetry={handleRetry} />

  if (!user) {
    return (
      <main className="profile-page">
        <h2>Nejste přihlášeni</h2>
        <Link href="/login" className="profile-page__login-btn">Přihlásit se</Link>
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
          <img src={user.avatar || '/default-avatar.png'} alt="avatar" />
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
            {user.isDealer ? 'Autobazar' : 'Soukromý prodejce'} &middot; Joined in {user.createdAt ? new Date(user.createdAt).toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' }) : 'N/A'}
          </div>
        </div>
      </section>

      <section className="profile-page__ads">
        <h2>My Ads</h2>
        {/* ✅ UKAZATEL LIMITU */}
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
        {/* Desktop tabulka */}
        <table className="profile-page__ads-table">
          <thead>
            <tr>
              <th></th>
              <th>Title</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ads.map(ad => (
              <tr key={ad.id}>
                <td>
                  <Link href={`/ads/${ad.id}`}>
                    <img src={ad.images?.[0]?.url || '/default-car.png'} alt="" className="profile-page__ad-img" />
                  </Link>
                </td>
                <td>
                  <Link href={`/ads/${ad.id}`} className="profile-page__ad-title-link">
                    {ad.title}
                  </Link>
                </td>
                <td>{ad.price ? `$${ad.price.toLocaleString()}` : '-'}</td>
                <td>
                  <div className="profile-page__ad-actions">
                    <Link href={`/ads/${ad.id}/edit`} className="profile-page__ad-action edit">
                      Upravit
                    </Link>
                    <button
                      className="profile-page__ad-action delete"
                      onClick={() => handleDeleteAd(ad.id)}
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
        {/* Mobilní karty */}
        <div className="profile-page__ads-cards">
          {ads.map(ad => (
            <div key={ad.id} className="profile-page__ad-card">
              <Link href={`/ads/${ad.id}`}>
                <img src={ad.images?.[0]?.url || '/default-car.png'} alt="" className="profile-page__ad-img" />
              </Link>
              <div className="profile-page__ad-info">
                <Link href={`/ads/${ad.id}`} className="profile-page__ad-title-link">
                  <div className="profile-page__ad-title">{ad.title}</div>
                </Link>
                <div className="profile-page__ad-price">{ad.price ? `$${ad.price.toLocaleString()}` : '-'}</div>
              </div>
              <div className="profile-page__ad-actions">
                <Link href={`/ads/${ad.id}/edit`} className="profile-page__ad-action edit">
                  Upravit
                </Link>
                <button
                  className="profile-page__ad-action delete"
                  onClick={() => handleDeleteAd(ad.id)}
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
          <h2>Saved Ads</h2>
          {savedAds.length > 3 && (
            <Link href="/saved-ads" className="profile-page__show-all-btn">
              Show All ({savedAds.length})
            </Link>
          )}
        </div>
        <div className="profile-page__saved-list">
          {savedAds.slice(0, 3).map(savedAd => (
            <div key={savedAd.id} className="profile-page__saved-ad">
              <Link href={`/ads/${savedAd.ad.id}`} className="profile-page__saved-link">
                <img src={savedAd.ad.images?.[0]?.url || '/default-car.png'} alt="" />
                <div className="profile-page__saved-info">
                  <div className="profile-page__saved-title">{savedAd.ad.title}</div>
                  <div className="profile-page__saved-brand">{savedAd.ad.brand} {savedAd.ad.model}</div>
                  <div className="profile-page__saved-price">${savedAd.ad.price?.toLocaleString()}</div>
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
              <p>No saved ads yet</p>
              <Link href="/ads" className="profile-page__browse-btn">Browse Ads</Link>
            </div>
          )}
        </div>
      </section>

      {/* Zbytek sections zůstává stejný... */}
      {reviews.length > 0 && (
        <section className="profile-page__reviews">
          <h2>Reviews Received</h2>
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
              {[5, 4, 3, 2, 1].map((star, i) => (
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
                {showAllReviews ? 'Show less' : 'See all my reviews'}
              </button>
            )}
          </div>
        </section>
      )}

      {/* Sekce pro nastavení účtu */}
      <section className="profile-page__settings">
        <h2>Account Settings</h2>
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

      {/* ✅ UPRAVENO - Toast notifikace místo alert */}
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
          setUser(updatedUser)
          // Toast už je v komponentě
        }}
      />

      <DeleteAccountModal
        isOpen={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
      />
    </main>
  )
}