'use client'
import { usePathname, useRouter } from 'next/navigation' // ✅ PŘIDÁNO useRouter
import { useEffect, useState, useRef } from 'react' // ✅ PŘIDÁNO useRef
import Link from 'next/link'
import '../styles/components/BottomNavbar.scss'

export default function BottomNavbar() {
  const pathname = usePathname()
  const router = useRouter() // ✅ PŘIDÁNO
  const [loggedIn, setLoggedIn] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false) // ✅ PŘIDÁNO
  const [isLoggingOut, setIsLoggingOut] = useState(false) // ✅ PŘIDÁNO
  const dropdownRef = useRef<HTMLDivElement>(null) // ✅ PŘIDÁNO

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      setLoggedIn(!!token)
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

  // ✅ PŘIDÁNO - Logout handler
  const handleLogout = async () => {
    setIsLoggingOut(true)
    setShowUserDropdown(false)
    
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.dispatchEvent(new Event('authChange'))
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  // ✅ PŘIDÁNO - Handle profile click
  const handleProfileClick = (e: React.MouseEvent) => {
    if (!loggedIn) return // Pokud není přihlášen, jdi na login
    
    e.preventDefault() // Zablokuj default link behavior
    setShowUserDropdown(!showUserDropdown)
  }

  return (
    <>
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

        {/* Inzeráty */}
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

        {/* ✅ UPRAVENO - Profil s dropdown */}
        <div className="bottom-navbar__user-wrapper" ref={dropdownRef}>
          {loggedIn ? (
            <button
              className={`bottom-navbar__item ${pathname === '/profile' ? 'active' : ''} ${showUserDropdown ? 'dropdown-active' : ''}`}
              onClick={handleProfileClick}
            >
              <svg className="bottom-navbar__icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <span className="bottom-navbar__label">Profil</span>
            </button>
          ) : (
            <Link
              href="/login"
              className={`bottom-navbar__item${pathname === '/login' || pathname === '/register' ? ' active' : ''}`}
            >
              <svg className="bottom-navbar__icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <span className="bottom-navbar__label">Přihlásit</span>
            </Link>
          )}

          {/* ✅ DROPDOWN MENU */}
          {loggedIn && showUserDropdown && (
            <div className="bottom-navbar__user-dropdown">
              <Link 
                href="/profile" 
                className="bottom-navbar__dropdown-item"
                onClick={() => setShowUserDropdown(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Můj profil
              </Link>
              <button 
                className="bottom-navbar__dropdown-item bottom-navbar__dropdown-item--logout"
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
      </nav>
    </>
  )
}