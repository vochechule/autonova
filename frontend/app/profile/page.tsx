'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import '../styles/ProfilePage.scss'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [ads, setAds] = useState<any[]>([])
  const [savedAds, setSavedAds] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    Promise.all([
      fetch('http://localhost:3000/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => res.ok ? res.json() : null),
      fetch('http://localhost:3000/ad/my', {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => res.ok ? res.json() : []),
      fetch('http://localhost:3000/ad/saved', {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => res.ok ? res.json() : []),
      fetch('http://localhost:3000/review/my', {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => res.ok ? res.json() : []),
    ])
      .then(([user, ads, savedAds, reviews]) => {
        setUser(user)
        setAds(ads)
        setSavedAds(savedAds)
        setReviews(reviews)
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

  // Výpočet průměrného hodnocení
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

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
        <h2>Saved Ads</h2>
        <div className="profile-page__saved-list">
          {savedAds.map(ad => (
            <div key={ad.id} className="profile-page__saved-ad">
              <img src={ad.images?.[0]?.url || '/default-car.png'} alt="" />
              <div>
                <div>{ad.title}</div>
                <div className="profile-page__saved-price">${ad.price?.toLocaleString()}</div>
              </div>
              <button className="profile-page__saved-remove">Remove</button>
            </div>
          ))}
        </div>
      </section>

      <section className="profile-page__reviews">
        <h2>Reviews Received</h2>
        <div className="profile-page__rating-summary">
          <div className="profile-page__rating-main">
            <span className="profile-page__rating-number">{avgRating ?? '-'}</span>
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
          {reviews.map(r => (
            <div key={r.id} className="profile-page__review">
              <div className="profile-page__review-header">
                <img src={r.author?.avatar || '/default-avatar.png'} alt="" />
                <div>
                  <div className="profile-page__review-author">{r.author?.name}</div>
                  <div className="profile-page__review-date">{r.date}</div>
                  <div className="profile-page__review-stars">
                    {'★'.repeat(r.rating)}
                    {'☆'.repeat(5 - r.rating)}
                  </div>
                </div>
              </div>
              <div className="profile-page__review-text">{r.text}</div>
              <div className="profile-page__review-actions">
                <span>👍 {r.likes || 0}</span>
                <span>💬 {r.comments || 0}</span>
              </div>
            </div>
          ))}
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