'use client'
import { useState, useEffect } from 'react'
import '../styles/components/StartupBanner.scss'

export default function StartupBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Zkontroluj jestli už banner nebyl dismissed
    const dismissed = localStorage.getItem('startup-banner-dismissed')
    if (dismissed) {
      setIsVisible(false)
      setIsDismissed(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('startup-banner-dismissed', 'true')
    setIsDismissed(true)
  }

  const handleShow = () => {
    setIsVisible(true)
    localStorage.removeItem('startup-banner-dismissed')
    setIsDismissed(false)
  }

  if (isDismissed && !isVisible) {
    return (
      <button 
        onClick={handleShow}
        className="startup-banner__show-button"
        title="Zobrazit startup zprávu"
      >
        💡
      </button>
    )
  }

  if (!isVisible) return null

  return (
    <div className="startup-banner">
      <div className="startup-banner__container">
        <div className="startup-banner__icon">
          🚀
        </div>
        
        <div className="startup-banner__content">
          <h3 className="startup-banner__title">
            Jsme nová platforma! Pomozte nám růst 
          </h3>
          <p className="startup-banner__text">
            Chceme udělat hledání nového auta <strong>zdarma a bez reklam</strong>. 
            Znáte někoho kdo prodává auto? Řekněte mu ať ho sem přidá zdarma! 
            Každý inzerát nám pomáhá vybudovat lepší platformu pro všechny.
          </p>
        </div>

        <div className="startup-banner__actions">
          <button 
            onClick={() => window.open('/ads/create', '_blank')}
            className="startup-banner__cta"
          >
            Přidat inzerát
          </button>
          <button 
            onClick={handleDismiss}
            className="startup-banner__dismiss"
            title="Skrýt zprávu"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}