'use client'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import '../styles/components/BottomNavbar.scss'

export default function BottomNavbar() {
  const pathname = usePathname()
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    // ✅ AUTH CHECK - Same logic as Header
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      setLoggedIn(!!token)
    }

    checkAuth()

    // ✅ LISTEN FOR AUTH CHANGES - Same as Header
    const handleAuthChange = () => {
      const token = localStorage.getItem('token')
      setLoggedIn(!!token)
    }
    
    window.addEventListener('storage', handleAuthChange)
    window.addEventListener('authChange', handleAuthChange)
    
    return () => {
      window.removeEventListener('storage', handleAuthChange)
      window.removeEventListener('authChange', handleAuthChange)
    }
  }, [pathname]) // ✅ Also listen to pathname changes like Header

  return (
    <nav className="bottom-navbar">
      {/* Domů */}
      <Link
        href="/"
        className={`bottom-navbar__item${pathname === '/' ? ' active' : ''}`}
      >
        <svg className="bottom-navbar__icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
        <span className="bottom-navbar__label">Domů</span>
      </Link>

      {/* Inzeráty - Add this for better navigation */}
      <Link
        href="/ads"
        className={`bottom-navbar__item${pathname === '/ads' ? ' active' : ''}`}
      >
        <svg className="bottom-navbar__icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
        </svg>
        <span className="bottom-navbar__label">Inzeráty</span>
      </Link>

      {/* Přidat inzerát - Only show when logged in */}
      {loggedIn && (
        <Link
          href="/ads/create"
          className={`bottom-navbar__item${pathname === '/ads/create' ? ' active' : ''}`}
        >
          <svg className="bottom-navbar__icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          <span className="bottom-navbar__label">Přidat</span>
        </Link>
      )}

      {/* Oblíbené - Only show when logged in */}
      {loggedIn && (
        <Link
          href="/saved-ads"
          className={`bottom-navbar__item${pathname === '/saved-ads' ? ' active' : ''}`}
        >
          <svg className="bottom-navbar__icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <span className="bottom-navbar__label">Oblíbené</span>
        </Link>
      )}

      {/* Profil / Přihlásit */}
      <Link
        href={loggedIn ? '/profile' : '/login'}
        className={`bottom-navbar__item${
          pathname === '/profile' || pathname === '/login' || pathname === '/register' ? ' active' : ''
        }`}
      >
        <svg className="bottom-navbar__icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
        <span className="bottom-navbar__label">{loggedIn ? 'Profil' : 'Přihlásit'}</span>
      </Link>
    </nav>
  )
}