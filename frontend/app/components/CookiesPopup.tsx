'use client'
import { useState, useEffect } from 'react'
import '../styles/components/CookiesPopup.scss'

// ✅ PŘIDÁNO - TypeScript declaration pro gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function CookiesPopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    // Zkontroluj jestli už uživatel neodpověděl
    const cookiesAccepted = localStorage.getItem('cookies-accepted')
    if (!cookiesAccepted) {
      // Zobraz popup po krátkém delay
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1500)
      
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAcceptAll = () => {
    localStorage.setItem('cookies-accepted', 'all')
    localStorage.setItem('cookies-analytics', 'true')
    localStorage.setItem('cookies-marketing', 'true')
    setIsVisible(false)
    
    // ✅ OPRAVENO - Trigger analytics init if needed
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted'
      })
    }
  }

  const handleAcceptNecessary = () => {
    localStorage.setItem('cookies-accepted', 'necessary')
    localStorage.setItem('cookies-analytics', 'false')
    localStorage.setItem('cookies-marketing', 'false')
    setIsVisible(false)
  }

  const handleCustomSettings = () => {
    setShowSettings(true)
  }

  const handleSaveSettings = (analytics: boolean, marketing: boolean) => {
    localStorage.setItem('cookies-accepted', 'custom')
    localStorage.setItem('cookies-analytics', analytics.toString())
    localStorage.setItem('cookies-marketing', marketing.toString())
    setIsVisible(false)
    
    // ✅ OPRAVENO - Update consent if analytics available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: analytics ? 'granted' : 'denied',
        ad_storage: marketing ? 'granted' : 'denied'
      })
    }
  }

  if (!isVisible) return null

  return (
    <>
      <div className="cookies-overlay" />
      <div className="cookies-popup">
        <div className="cookies-popup__container">
          {!showSettings ? (
            // Main popup
            <>
              <div className="cookies-popup__header">
                <div className="cookies-popup__icon">🍪</div>
                <h3 className="cookies-popup__title">
                  Vaše cookies jsou u nás v bezpečí
                </h3>
              </div>
              
              <div className="cookies-popup__content">
                <p className="cookies-popup__text">
                  Používáme pouze nezbytné cookies pro správné fungování webu a volitelné 
                  pro analytiku (abychom věděli co vylepšovat). Žádné sledování, žádné 
                  obtěžující reklamy - prostě jen lepší Carta.cz pro vás.
                </p>
                
                <div className="cookies-popup__features">
                  <div className="cookies-popup__feature">
                    <span className="cookies-popup__feature-icon">🔒</span>
                    <span>Bez prodeje dat třetím stranám</span>
                  </div>
                  <div className="cookies-popup__feature">
                    <span className="cookies-popup__feature-icon">🚫</span>
                    <span>Bez sledovacích pixelů</span>
                  </div>
                  <div className="cookies-popup__feature">
                    <span className="cookies-popup__feature-icon">📊</span>
                    <span>Jen anonymní statistiky</span>
                  </div>
                </div>
              </div>

              <div className="cookies-popup__actions">
                <button 
                  onClick={handleAcceptAll}
                  className="cookies-popup__button cookies-popup__button--primary"
                >
                  Jasně! 👍
                </button>
                <button 
                  onClick={handleCustomSettings}
                  className="cookies-popup__button cookies-popup__button--secondary"
                >
                  Nastavení
                </button>
              </div>
              
              <button 
                onClick={handleAcceptNecessary}
                className="cookies-popup__link"
              >
                Jen nezbytné cookies
              </button>
            </>
          ) : (
            // Settings popup
            <CookiesSettings 
              onSave={handleSaveSettings}
              onBack={() => setShowSettings(false)}
            />
          )}
        </div>
      </div>
    </>
  )
}

// Settings component
function CookiesSettings({ 
  onSave, 
  onBack 
}: { 
  onSave: (analytics: boolean, marketing: boolean) => void
  onBack: () => void 
}) {
  const [analytics, setAnalytics] = useState(true)
  const [marketing, setMarketing] = useState(false)

  return (
    <>
      <div className="cookies-popup__header">
        <button 
          onClick={onBack}
          className="cookies-popup__back"
          aria-label="Zpět"
        >
          ←
        </button>
        <h3 className="cookies-popup__title">
          Nastavení cookies
        </h3>
      </div>

      <div className="cookies-popup__settings">
        <div className="cookies-popup__setting">
          <div className="cookies-popup__setting-info">
            <h4>Nezbytné cookies</h4>
            <p>Potřebné pro základní fungování webu</p>
          </div>
          <div className="cookies-popup__toggle cookies-popup__toggle--disabled">
            <span>Vždy zapnuto</span>
          </div>
        </div>

        <div className="cookies-popup__setting">
          <div className="cookies-popup__setting-info">
            <h4>Analytické cookies</h4>
            <p>Pomáhají nám zlepšovat web (Google Analytics)</p>
          </div>
          <label className="cookies-popup__toggle">
            <input 
              type="checkbox" 
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
            />
            <span className="cookies-popup__toggle-slider"></span>
          </label>
        </div>

        <div className="cookies-popup__setting">
          <div className="cookies-popup__setting-info">
            <h4>Marketingové cookies</h4>
            <p>Pro budoucí personalizaci (zatím nepoužíváme)</p>
          </div>
          <label className="cookies-popup__toggle">
            <input 
              type="checkbox" 
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
            />
            <span className="cookies-popup__toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="cookies-popup__actions">
        <button 
          onClick={() => onSave(analytics, marketing)}
          className="cookies-popup__button cookies-popup__button--primary"
        >
          Uložit nastavení
        </button>
      </div>
    </>
  )
}