'use client'
import { useState, useEffect, useRef } from 'react' // ✅ PŘIDÁNO useRef
import { usePathname, useRouter } from 'next/navigation' // ✅ PŘIDÁNO useRouter
import Image from 'next/image'
import Link from 'next/link'
import '../styles/components/Header.scss'

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [authLoaded, setAuthLoaded] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false) // ✅ PŘIDÁNO
  const [isLoggingOut, setIsLoggingOut] = useState(false) // ✅ PŘIDÁNO
  const pathname = usePathname()
  const router = useRouter() // ✅ PŘIDÁNO
  const dropdownRef = useRef<HTMLDivElement>(null) // ✅ PŘIDÁNO

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
      setAuthLoaded(true)
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

  // ✅ PŘIDÁNO - Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
    }

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserDropdown])

  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    localStorage.setItem('darkMode', String(newMode))
  }

  // ✅ PŘIDÁNO - Logout handler
  const handleLogout = async () => {
    setIsLoggingOut(true)
    setShowUserDropdown(false)
    
    try {
      // Clear auth data
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Dispatch auth change event
      window.dispatchEvent(new Event('authChange'))
      
      // Redirect to home
      router.push('/')
      
      // Show success message (optional)
      setTimeout(() => {
        console.log('Odhlášení úspěšné')
      }, 100)
      
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
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
          
          {authLoaded && loggedIn && (
            <Link href="/saved-ads" className="header__link">Oblíbené</Link>
          )}
          
          <div className={`header__desktop-nav ${!authLoaded ? 'header__desktop-nav--loading' : ''}`}>
            {!authLoaded ? (
              <>
                <div className="header__button-skeleton header__button-skeleton--secondary"></div>
                <div className="header__button-skeleton header__button-skeleton--primary"></div>
              </>
            ) : loggedIn ? (
              // ✅ LOGGED IN STATE - upraveno
              <>
                <Link href="/ads/create" className="header__button header__button--primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Přidat inzerát
                </Link>
                
                {/* ✅ USER DROPDOWN */}
                <div className="header__user-dropdown-wrapper" ref={dropdownRef}>
                  <button 
                    className={`header__button header__button--secondary ${showUserDropdown ? 'active' : ''}`}
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                  >
                    <div className="header__profile-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                    Profil
                    <svg 
                      width="12" 
                      height="12" 
                      viewBox="0 0 24 24" 
                      fill="none"
                      className={`header__dropdown-arrow ${showUserDropdown ? 'rotated' : ''}`}
                    >
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  
                  {showUserDropdown && (
                    <div className="header__user-dropdown">
                      <Link 
                        href="/profile" 
                        className="header__dropdown-item"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Můj profil
                      </Link>
                      <button 
                        className="header__dropdown-item header__dropdown-item--logout"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {isLoggingOut ? 'Odhlašuji...' : 'Odhlásit se'}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
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