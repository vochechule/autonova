'use client'
import { useState } from 'react'
import Link from 'next/link'
import '../styles/components/Footer.scss'

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Import cookies settings component
function CookiesModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean
  onClose: () => void 
}) {
  const [analytics, setAnalytics] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cookies-analytics') === 'true'
    }
    return false
  })
  
  const [marketing, setMarketing] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cookies-marketing') === 'true'
    }
    return false
  })

  const handleSave = () => {
    localStorage.setItem('cookies-analytics', analytics.toString())
    localStorage.setItem('cookies-marketing', marketing.toString())
    
    // Update consent if analytics available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: analytics ? 'granted' : 'denied',
        ad_storage: marketing ? 'granted' : 'denied'
      })
    }
    
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <div className="footer__modal-overlay" onClick={onClose} />
      <div className="footer__modal">
        <div className="footer__modal-content">
          <div className="footer__modal-header">
            <h3>Nastavení cookies</h3>
            <button onClick={onClose} className="footer__modal-close">✕</button>
          </div>

          <div className="footer__modal-settings">
            <div className="footer__modal-setting">
              <div>
                <h4>Nezbytné cookies</h4>
                <p>Potřebné pro základní fungování webu</p>
              </div>
              <span className="footer__modal-required">Vždy zapnuto</span>
            </div>

            <div className="footer__modal-setting">
              <div>
                <h4>Analytické cookies</h4>
                <p>Pomáhají nám zlepšovat web</p>
              </div>
              <label className="footer__toggle">
                <input 
                  type="checkbox" 
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                />
                <span className="footer__toggle-slider"></span>
              </label>
            </div>

            <div className="footer__modal-setting">
              <div>
                <h4>Marketingové cookies</h4>
                <p>Pro budoucí personalizaci</p>
              </div>
              <label className="footer__toggle">
                <input 
                  type="checkbox" 
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                />
                <span className="footer__toggle-slider"></span>
              </label>
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="footer__modal-save"
          >
            Uložit nastavení
          </button>
        </div>
      </div>
    </>
  )
}

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [showCookiesModal, setShowCookiesModal] = useState(false)

  return (
    <footer className="footer">
      <div className="footer__container">
        {/* Logo & Description */}
        <div className="footer__brand">
          <h3 className="footer__logo">
            <Link href="/">Carta.cz</Link>
          </h3>
          <p className="footer__description">
            Inzerce aut zdarma, bez reklam, přehledně. 
            Začínající platforma pro nákup a prodej ojetých vozů.
          </p>
        </div>

        {/* Navigace */}
        <div className="footer__section">
          <h4 className="footer__title">Navigace</h4>
          <ul className="footer__links">
            <li><Link href="/">Domů</Link></li>
            <li><Link href="/ads">Inzeráty</Link></li>
            <li><Link href="/ads/create">Přidat inzerát</Link></li>
            <li><Link href="/saved-ads">Oblíbené</Link></li>
          </ul>
        </div>

        {/* Kontakt */}
        <div className="footer__section">
          <h4 className="footer__title">Kontakt</h4>
          <div className="footer__contact">
            <p>
              <span className="footer__contact-label">Email:</span>
              <a href="mailto:info@carta.cz">info@carta.cz</a>
            </p>
            <p>
              <span className="footer__contact-label">Telefon:</span> 
              <a href="tel:+420733302123" style={{ whiteSpace: 'nowrap' }}>+420 733 302 123</a>
            </p>
          </div>
        </div>

        {/* ✅ PŘIDÁNO - Právní sekce s cookies */}
        <div className="footer__section">
          <h4 className="footer__title">Soukromí</h4>
          <ul className="footer__links">
            <li>
              <button 
                onClick={() => setShowCookiesModal(true)}
                className="footer__cookie-button"
              >
                Nastavení cookies
              </button>
            </li>
            <li>
              <Link href="/about">O projektu</Link>
            </li>
            <li>
              <Link href="/terms">Podmínky užívání</Link>
            </li>
            <li>
              <Link href="/privacy">Zásady ochrany osobních údajů</Link>
            </li>
          </ul>
        </div>

        {/* Coming Soon sekce */}
        <div className="footer__section footer__section--coming-soon">
          <h4 className="footer__title">Připravujeme</h4>
          <ul className="footer__coming-soon">
            <li>📋 Nápověda a FAQ</li>
            <li>⚖️ Právní dokumenty</li>
            <li>📱 Mobilní aplikace</li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer__bottom">
        <div className="footer__container">
          <div className="footer__bottom-content">
            <p className="footer__copyright">
              © {currentYear} Carta.cz - Startup projektu pro inzerci aut
            </p>
            <div className="footer__startup-badge">
              <span className="footer__beta">BETA verze</span>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ PŘIDÁNO - Cookies modal */}
      <CookiesModal 
        isOpen={showCookiesModal}
        onClose={() => setShowCookiesModal(false)}
      />
    </footer>
  )
}