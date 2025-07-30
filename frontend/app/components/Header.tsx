'use client'
import { useState, useEffect } from 'react'
import '../styles/components/Header.scss'

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    // Aplikuj dark mode na html element
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [isDarkMode])

  useEffect(() => {
    // Check if user is logged in
    setLoggedIn(!!localStorage.getItem('token'))
  }, [])

  return (
    <header className="header">
      <div className="header__container">
        <a href="/" className="header__logo"><h1>Carta.cz</h1></a>
        
        <nav className="header__nav">
          <a href="/" className="header__link">Domů</a>
          <a href="/ads" className="header__link">Inzeráty</a>
          
          {/* Desktop-only navigation items */}
          <div className="header__desktop-nav">
            <a href="/ads/create" className="header__button header__button--primary">
              + Přidat inzerát
            </a>
            <a 
              href={loggedIn ? '/profile' : '/login'} 
              className="header__button header__button--secondary"
            >
              {loggedIn ? '👤 Profil' : '🔑 Přihlásit'}
            </a>
          </div>
          
          {/* Theme Toggle */}
          <button 
            className="header__theme-toggle"
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label={isDarkMode ? 'Přepnout na světlé téma' : 'Přepnout na tmavé téma'}
          >
            {isDarkMode ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
                <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2"/>
                <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2"/>
                <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2"/>
                <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            )}
          </button>
        </nav>
      </div>
    </header>
  )
}
