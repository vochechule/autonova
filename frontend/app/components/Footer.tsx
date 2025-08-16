import Link from 'next/link'
import '../styles/components/Footer.scss'

export default function Footer() {
  const currentYear = new Date().getFullYear()

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

        {/* Jen co skutečně funguje */}
        <div className="footer__section">
          <h4 className="footer__title">Navigace</h4>
          <ul className="footer__links">
            <li><Link href="/">Domů</Link></li>
            <li><Link href="/ads">Inzeráty</Link></li>
            <li><Link href="/ads/create">Přidat inzerát</Link></li>
            <li><Link href="/saved-ads">Oblíbené</Link></li>
          </ul>
        </div>

        {/* Contact - reálný nebo placeholder */}
        <div className="footer__section">
          <h4 className="footer__title">Kontakt</h4>
          <div className="footer__contact">
            <p>
              <span className="footer__contact-label">Email:</span>
              <a href="mailto:ndan@post.cz">ndan@post.cz</a>
            </p>
            <p>
              <span className="footer__contact-label">Telefon:</span> 
              <a href="tel:+420733302123" style={{ whiteSpace: 'nowrap' }}>+420 733 302 123</a>
            </p>
            {/* Zatím žádný telefon/social */}
          </div>
        </div>

        {/* Coming Soon sekce */}
        <div className="footer__section footer__section--coming-soon">
          <h4 className="footer__title">Připravujeme</h4>
          <ul className="footer__coming-soon">
            <li>📋 Nápověda a FAQ</li>
            <li>📞 Telefonní podpora</li>
            <li>⚖️ Právní dokumenty</li>
            <li>📱 Mobilní aplikace</li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar - simplified */}
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
    </footer>
  )
}