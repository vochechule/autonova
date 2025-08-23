"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import '../../styles/ProfilePageView.scss';
import { useAuth } from '../../hooks/AuthProvider';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [myReview, setMyReview] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { user: authUser, isAuthenticated, loading: authLoading, getToken } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return setLoading(false);
    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((me) => {
        setCurrentUserId(me?.id || null);
      });
  }, []);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    Promise.all([
      fetch(`${API_URL}/user/${userId}`).then((res) => res.ok ? res.json() : null),
      fetch(`${API_URL}/user/${userId}/reviews`).then((res) => res.ok ? res.json() : []),
      fetch(`${API_URL}/user/${userId}/average-rating`).then((res) => res.ok ? res.json() : { averageRating: null }),
    ])
      .then(([user, reviews, avg]) => {
        setUser(user);
        setReviews(reviews);
        setAvgRating(avg.averageRating);
        setLoading(false);
        const token = localStorage.getItem("token");
        if (token && user && reviews.length) {
          fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => (res.ok ? res.json() : null))
            .then((me) => {
              if (me) {
                const mine = reviews.find((r: any) => r.userId === me.id);
                if (mine) {
                  setMyReview(mine);
                  setRating(mine.rating);
                  setComment(mine.comment || "");
                }
              }
            });
        }
      })
      .catch((err) => {
        setError("Nepodařilo se načíst profil: " + err.message);
        setLoading(false);
      });
  }, [userId]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem("token");
    if (!token) return;
    const res = await fetch(`${API_URL}/user/${userId}/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating, comment }),
    });
    if (res.ok) {
      const updated = await res.json();
      setMyReview(updated);
      setRating(updated.rating);
      setComment(updated.comment || "");
      const reviewsRes = await fetch(`${API_URL}/user/${userId}/reviews`);
      setReviews(await reviewsRes.json());
      const avgRes = await fetch(`${API_URL}/user/${userId}/average-rating`);
      setAvgRating((await avgRes.json()).averageRating);
    } else {
      alert("Nepodařilo se odeslat hodnocení");
    }
    setSubmitting(false);
  };

  if (loading) return <main className="profile-page"><div>Načítám...</div></main>;
  if (!user) return <main className="profile-page"><div>Uživatel nenalezen</div></main>;

  return (
    <main className="profile-page">
      <section className="profile-page__header">
        <div className="profile-page__avatar">
          <img src={user.avatar || "/default-avatar.png"} alt="avatar" />
        </div>
        <div>
          <h1 className="profile-page__name">
            {user.firstName && user.lastName 
              ? `${user.firstName} ${user.lastName}`
              : user.name || 'Neznámý uživatel'}
          </h1>
          {/* ❌ ODSTRANĚNO - email uživatele */}
          <div className="profile-page__meta">
            <span className="profile-page__user-type">
              {user.isDealer ? "🏢 Autobazar" : "👤 Soukromá osoba"}
            </span>
            {user.location && (
              <span className="profile-page__location">
                📍 {user.location}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ✅ VYLEPŠENÉ - Rating summary */}
      <section className="profile-page__reviews">
        <div className="profile-page__rating-summary">
          <div className="profile-page__rating-main">
            <span className="profile-page__rating-number">
              {avgRating !== null ? avgRating.toFixed(1) : "-"}
            </span>
            <div className="profile-page__stars">
              {"★".repeat(Math.round(Number(avgRating) || 0))}
              {"☆".repeat(5 - Math.round(Number(avgRating) || 0))}
            </div>
            <div className="profile-page__rating-count">
              {reviews.length} {reviews.length === 1 ? 'hodnocení' : 'hodnocení'}
            </div>
          </div>
        </div>

        {/* ✅ PŘIDÁNO - Vylepšená sekce pro hodnocení */}
        {currentUserId && currentUserId !== userId && (
          <div className="profile-page__rate-user">
            <h3>
              <svg className="profile-page__rate-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
              </svg>
              {myReview ? 'Upravit hodnocení' : 'Ohodnotit uživatele'}
            </h3>
            <form onSubmit={handleSubmit} className="profile-page__rate-form">
              <div className="profile-page__rate-field">
                <label>Hodnocení <span className="required">*</span></label>
                <select 
                  value={rating} 
                  onChange={e => setRating(Number(e.target.value))} 
                  required
                  className="profile-page__rate-select"
                >
                  <option value={0}>Vyberte hodnocení</option>
                  {[1,2,3,4,5].map(star => (
                    <option key={star} value={star}>
                      {"★".repeat(star)} ({star} {star === 1 ? 'hvězda' : star < 5 ? 'hvězdy' : 'hvězd'})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="profile-page__rate-field">
                <label>Komentář</label>
                <input
                  type="text"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  maxLength={200}
                  placeholder="Volitelný komentář k hodnocení..."
                  className="profile-page__rate-input"
                />
                <small className="profile-page__rate-help">
                  {comment.length}/200 znaků
                </small>
              </div>

              <button 
                type="submit" 
                disabled={submitting || rating === 0}
                className="profile-page__rate-submit"
              >
                {submitting ? (
                  <>⏳ Odesílám...</>
                ) : myReview ? (
                  <>✏️ Aktualizovat hodnocení</>
                ) : (
                  <>⭐ Odeslat hodnocení</>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ✅ VYLEPŠENÉ - Seznam hodnocení */}
        <div className="profile-page__reviews-section">
          <h2>Hodnocení od uživatelů</h2>
          <div className="profile-page__review-list">
            {reviews.length === 0 ? (
              <div className="profile-page__reviews-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
                <p>Zatím žádná hodnocení</p>
                <small>Hodnocení se zobrazí poté, co ostatní uživatelé ohodnotí tohoto prodejce.</small>
              </div>
            ) : (
              reviews.map((r: any) => (
                <div key={r.id} className="profile-page__review">
                  <div className="profile-page__review-header">
                    <div className="profile-page__review-user">
                      <div className="profile-page__review-avatar">
                        {(r.user?.firstName?.charAt(0) || r.user?.name?.charAt(0) || 'U')}
                      </div>
                      <div>
                        <div className="profile-page__review-author">
                          {r.user?.firstName && r.user?.lastName 
                            ? `${r.user.firstName} ${r.user.lastName}`
                            : r.user?.name || "Neznámý uživatel"}
                        </div>
                        <div className="profile-page__review-date">
                          {new Date(r.createdAt).toLocaleDateString('cs-CZ')}
                        </div>
                      </div>
                    </div>
                    <div className="profile-page__review-stars">
                      {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                    </div>
                  </div>
                  {r.comment && (
                    <div className="profile-page__review-text">"{r.comment}"</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ✅ NOVÉ - Seller's ads section */}
      <section className="profile-page__seller-ads">
        <h2>Inzeráty prodejce ({user.ads?.length || 0})</h2>
        
        {user.ads && user.ads.length > 0 ? (
          <div className="profile-page__ads-grid">
            {user.ads.map((ad: any) => (
              <Link 
                key={ad.id} 
                href={`/ads/${ad.id}`} 
                className="profile-page__ad-card"
              >
                <div className="profile-page__ad-image-container">
                  {ad.images && ad.images.length > 0 ? (
                    <img 
                      src={ad.images[0].url} 
                      alt={ad.title}
                      loading="lazy"
                    />
                  ) : (
                    <div className="profile-page__ad-placeholder">🚗</div>
                  )}
                  <div className="profile-page__ad-price-tag">
                    {ad.price?.toLocaleString('cs-CZ')} Kč
                  </div>
                </div>
                
                <div className="profile-page__ad-content">
                  <h3 className="profile-page__ad-title">{ad.title}</h3>
                  
                  <div className="profile-page__ad-details">
                    <div className="profile-page__ad-brand">
                      {ad.brand} {ad.model}
                    </div>
                    
                    <div className="profile-page__ad-specs">
                      {ad.year && <span>{ad.year}</span>}
                      {ad.mileage && <span>{ad.mileage?.toLocaleString('cs-CZ')} km</span>}
                      {ad.fuelType && <span>{ad.fuelType}</span>}
                    </div>
                    
                    {ad.location && (
                      <div className="profile-page__ad-location">
                        {ad.location}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="profile-page__ads-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 16V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 1 2 2h14a2 2 0 0 1 2-2z"/>
              <polyline points="16,17 21,12 16,7"/>
            </svg>
            <p>Žádné aktivní inzeráty</p>
            <small>Tento prodejce aktuálně nemá žádné aktivní inzeráty.</small>
          </div>
        )}
      </section>
    </main>
  );
}