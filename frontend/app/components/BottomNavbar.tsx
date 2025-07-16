'use client'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import '../styles/components/BottomNavbar.scss'

const NAV_ITEMS = [
  { href: '/', label: 'Domů', icon: '🏠' },
  { href: '/ads/create', label: 'Přidat inzerát', icon: '➕' },
  // Profile/Login will be handled dynamically
  { href: '/settings', label: 'Nastavení', icon: '⚙️' },
]

export default function BottomNavbar() {
  const pathname = usePathname()
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem('token'))
  }, [])

  return (
    <nav className="bottom-navbar">
      {NAV_ITEMS.map(item => (
        <a
          key={item.href}
          href={item.href}
          className={`bottom-navbar__item${pathname === item.href ? ' active' : ''}`}
        >
          <span className="bottom-navbar__icon">{item.icon}</span>
          <span className="bottom-navbar__label">{item.label}</span>
        </a>
      ))}
      <a
        href={loggedIn ? '/profile' : '/login'}
        className={`bottom-navbar__item${pathname === '/profile' || pathname === '/login' ? ' active' : ''}`}
      >
        <span className="bottom-navbar__icon">{loggedIn ? '👤' : '🔑'}</span>
        <span className="bottom-navbar__label">{loggedIn ? 'Profil' : 'Přihlásit'}</span>
      </a>
    </nav>
  )
}