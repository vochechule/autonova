'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import '../styles/ProfilePage.scss'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [ads, setAds] = useState<any[]>([])
  const [savedAds, setSavedAds] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [avgRating, setAvgRating] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAllReviews, setShowAllReviews] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch('http://localhost:3000/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : null)
      .then(user => {
        setUser(user)
        if (user) {
          Promise.all([
            fetch(`http://localhost:3000/ad/my`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then(res => res.ok ? res.json() : []),
            fetch(`http://localhost:3000/saved-ads`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then(res => res.ok ? res.json() : []),
            fetch(`http://localhost:3000/user/${user.id}/reviews`).then(res => res.ok ? res.json() : []),
            fetch(`http://localhost:3000/user/${user.id}/average-rating`).then(res => res.ok ? res.json() : { averageRating: null }),
          ]).then(([ads, savedAds, reviews, avg]) => {
            setAds(ads)
            setSavedAds(savedAds)
            setReviews(reviews)
            setAvgRating(avg.averageRating)
          })
        }
      })
      .catch(err => setError('Nepodařilo se načíst profil: ' + err.message))
  }, [])

  if (!user) {
    return (
      <main className="profile-page">
        <h2>Nejste přihlášeni</h2>
        <Link href="/login" className="profile-page__login-btn">Přihlásit se</Link>
        {error && <div style={{ color: 'red' }}>{error}</div>}
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
            {user.type === 'private' ? 'Private Person' : 'Dealer'} &middot; Joined in {user.joinedYear || 'N/A'}
          </div>
        </div>
      </section>

      <section className="profile-page__ads">
        <h2>My Ads</h2>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Title</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ads.map(ad => (
              <tr key={ad.id}>
                <td>
                  <img src={ad.images?.[0]?.url || '/default-car.png'} alt="" className="profile-page__ad-img" />
                </td>
                <td>{ad.title}</td>
                <td>{ad.price ? `$${ad.price.toLocaleString()}` : '-'}</td>
                <td>
                  <span className={`profile-page__ad-status profile-page__ad-status--${ad.status?.toLowerCase()}`}>
                    {ad.status}
                  </span>
                </td>
                <td>
                  <Link href={`/ads/${ad.id}/edit`}>Edit</Link> |{' '}
                  <button
                    className="profile-page__ad-action"
                    onClick={async () => {
                      if (!confirm('Opravdu chcete inzerát smazat?')) return;
                      const token = localStorage.getItem('token');
                      const res = await fetch(`http://localhost:3000/ad/${ad.id}`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      if (res.ok) {
                        setAds(ads => ads.filter(a => a.id !== ad.id));
                      } else {
                        alert('Smazání se nezdařilo');
                      }
                    }}
                  >
                    Delete
                  </button> |{' '}
                  <button className="profile-page__ad-action">Extend</button> |{' '}
                  <button className="profile-page__ad-action">Promote</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
                onClick={async () => {
                  if (!confirm('Remove this ad from saved?')) return;
                  const token = localStorage.getItem('token');
                  const res = await fetch(`http://localhost:3000/saved-ads/${savedAd.ad.id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  if (res.ok) {
                    setSavedAds(savedAds => savedAds.filter(sa => sa.id !== savedAd.id));
                  } else {
                    alert('Failed to remove from saved');
                  }
                }}
              >
                Remove
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

      <section className="profile-page__settings">
        <h2>Account Settings</h2>
        <div className="profile-page__settings-list">
          <button>Change Password</button>
          <button>Update Profile Info</button>
          <button>Delete Account</button>
          <button className="profile-page__logout-btn"
            onClick={() => {
              localStorage.removeItem('token')
              window.location.reload()
            }}
          >
            Log Out
          </button>
        </div>
      </section>
    </main>
  )
}