'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import '../styles/components/Header.scss'

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [authLoaded, setAuthLoaded] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // ✅ DARK MODE - Safe for SSR
    const savedMode = localStorage.getItem('darkMode')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedMode !== null) {
      setIsDarkMode(savedMode === 'true')
    } else {
      setIsDarkMode(systemPrefersDark)
    }
  }, [])

  useEffect(() => {
    // ✅ AUTH CHECK - Immediate on mount
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      setLoggedIn(!!token)
      setAuthLoaded(true) // ✅ Mark as loaded
    }

    checkAuth()

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
  }, [pathname])

  useEffect(() => {
    // ✅ APPLY DARK MODE
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [isDarkMode])

  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    localStorage.setItem('darkMode', String(newMode))
  }

  return (
    <header className="header">
      <div className="header__container">
        <Link href="/" className="header__logo">
          <Image
            src={isDarkMode ? "/carta-logo-negative.svg" : "/carta-logo.svg"}
            alt="Carta.cz"
            width={36}
            height={36}
            priority
            className="header__logo-image"
          />
          <h1>Carta.cz</h1>
        </Link>
        
        <nav className="header__nav">
          <Link href="/" className="header__link">Domů</Link>
          <Link href="/ads" className="header__link">Inzeráty</Link>
          
          {/* ✅ CONDITIONAL LINK - Only show when loaded and logged in */}
          {authLoaded && loggedIn && (
            <Link href="/saved-ads" className="header__link">Oblíbené</Link>
          )}
          
          {/* ✅ AUTH BUTTONS - Always present but with loading states */}
          <div className={`header__desktop-nav ${!authLoaded ? 'header__desktop-nav--loading' : ''}`}>
            {!authLoaded ? (
              // ✅ LOADING STATE - Same layout as real buttons
              <>
                <div className="header__button-skeleton header__button-skeleton--secondary"></div>
                <div className="header__button-skeleton header__button-skeleton--primary"></div>
              </>
            ) : loggedIn ? (
              // ✅ LOGGED IN STATE
              <>
                <Link href="/ads/create" className="header__button header__button--primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Přidat inzerát
                </Link>
                <Link href="/profile" className="header__button header__button--secondary">
                  <div className="header__profile-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  Profil
                </Link>
              </>
            ) : (
              // ✅ NOT LOGGED IN STATE
              <>
                <Link href="/login" className="header__button header__button--secondary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Přihlásit se
                </Link>
                <Link href="/register" className="header__button header__button--primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12.5 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM20 8v6M23 11h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Registrovat se
                </Link>
              </>
            )}
          </div>
          
          <button 
            className="header__theme-toggle"
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? 'Přepnout na světlé téma' : 'Přepnout na tmavé téma'}
          >
            {isDarkMode ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" stroke="currentColor" strokeWidth="2"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            )}
          </button>
        </nav>
      </div>
    </header>
  )
}