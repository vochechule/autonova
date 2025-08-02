"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import '../../styles/ProfilePage.scss';

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return setLoading(false);
    // Fetch current user id
    fetch("http://localhost:3000/auth/me", {
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
      fetch(`http://localhost:3000/user/${userId}`).then((res) => res.ok ? res.json() : null),
      fetch(`http://localhost:3000/user/${userId}/reviews`).then((res) => res.ok ? res.json() : []),
      fetch(`http://localhost:3000/user/${userId}/average-rating`).then((res) => res.ok ? res.json() : { averageRating: null }),
    ])
      .then(([user, reviews, avg]) => {
        setUser(user);
        setReviews(reviews);
        setAvgRating(avg.averageRating);
        setLoading(false);
        // Find my review if present
        const token = localStorage.getItem("token");
        if (token && user && reviews.length) {
          fetch("http://localhost:3000/auth/me", {
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
    const res = await fetch(`http://localhost:3000/user/${userId}/review`, {
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
      // Refresh reviews
      const reviewsRes = await fetch(`http://localhost:3000/user/${userId}/reviews`);
      setReviews(await reviewsRes.json());
      const avgRes = await fetch(`http://localhost:3000/user/${userId}/average-rating`);
      setAvgRating((await avgRes.json()).averageRating);
    } else {
      alert("Failed to submit review");
    }
    setSubmitting(false);
  };

  if (loading) return <main className="profile-page"><div>Loading...</div></main>;
  if (!user) return <main className="profile-page"><div>User not found</div></main>;

  return (
    <main className="profile-page">
      <section className="profile-page__header">
        <div className="profile-page__avatar">
          <img src={user.avatar || "/default-avatar.png"} alt="avatar" />
        </div>
        <div>
          <h1 className="profile-page__name">{user.name}</h1>
          <div className="profile-page__email">{user.email}</div>
          <div className="profile-page__meta">
            {user.isDealer ? "Dealer" : "Private Person"}
          </div>
        </div>
      </section>

      <section className="profile-page__rating-summary">
        <div className="profile-page__rating-main">
          <span className="profile-page__rating-number">{avgRating !== null ? avgRating.toFixed(1) : "-"}</span>
          <span className="profile-page__stars">
            {"★".repeat(Math.round(Number(avgRating) || 0))}
            {"☆".repeat(5 - Math.round(Number(avgRating) || 0))}
          </span>
        </div>
        <div className="profile-page__rating-count">{reviews.length} reviews</div>
      </section>

      {currentUserId && currentUserId !== userId && (
        <section className="profile-page__rate-user">
          <h3>Rate this user</h3>
          <form onSubmit={handleSubmit} className="profile-page__rate-form">
            <label>Rating: </label>
            <select value={rating} onChange={e => setRating(Number(e.target.value))} required>
              <option value={0}>Select</option>
              {[1,2,3,4,5].map(star => (
                <option key={star} value={star}>{star} star{star > 1 ? 's' : ''}</option>
              ))}
            </select>
            <label>Comment: </label>
            <input
              type="text"
              value={comment}
              onChange={e => setComment(e.target.value)}
              maxLength={200}
              placeholder="Optional comment"
            />
            <button type="submit" disabled={submitting || rating === 0}>
              {myReview ? "Update Rating" : "Submit Rating"}
            </button>
          </form>
        </section>
      )}

      <section className="profile-page__reviews">
        <h2>Reviews</h2>
        <div className="profile-page__review-list">
          {reviews.length === 0 && <div>No reviews yet.</div>}
          {reviews.map((r: any) => (
            <div key={r.id} className="profile-page__review">
              <div className="profile-page__review-header">
                <div className="profile-page__review-author">{r.user?.name || "Unknown"}</div>
                <div className="profile-page__review-date">{new Date(r.createdAt).toLocaleDateString()}</div>
                <div className="profile-page__review-stars">
                  {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                </div>
              </div>
              {r.comment && <div className="profile-page__review-text">{r.comment}</div>}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}