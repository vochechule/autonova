'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import '../styles/components/BottomNavbar.scss'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const pathname = usePathname()
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem('token'))
    // Listen for storage changes (e.g. login/logout in another tab)
    const handler = () => setLoggedIn(!!localStorage.getItem('token'))
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [pathname])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch('http://localhost:3000/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    })
      .then(res => res.ok ? res.json() : res.text().then(text => { throw new Error(text) }))
      .then(setUser)
      .catch(err => setError('Nepodařilo se načíst profil: ' + err.message))
  }, [loggedIn])

  if (!loggedIn) {
    return (
      <main className="profile-page">
        <h2>Nejste přihlášeni</h2>
        <a href="/login" className="profile-page__login-btn">Přihlásit se</a>
      </main>
    )
  }

  return (
    <main className="profile-page">
      {user ? (
        <>
          <h2>Profil uživatele</h2>
          <div><b>Email:</b> {user.email}</div>
        </>
      ) : (
        <>
          <h2>Nelze načíst profil</h2>
          {error && <div style={{ color: 'red' }}>{error}</div>}
        </>
      )}
      <button
        className="profile-page__logout-btn"
        onClick={() => {
          localStorage.removeItem('token')
          window.location.reload()
        }}
      >
        Odhlásit se
      </button>
    </main>
  )
}