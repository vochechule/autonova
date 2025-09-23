import { Suspense } from 'react'
import './styles/HomePage.scss'
import AdFilter from './components/AdFilter'
import QuickCategories from './components/QuickCategories'
import HeroSection from './components/HeroSection'
import StartupBanner from './components/StartupBanner'
import WhyCartaSection from './components/WhyCartaSection'
// import UserReviewsSection from './components/UserReviewsSection'
import SellCarCTA from './components/SellCarCTA'
import ContactForm from './components/ContactForm'
import { generateMetadata } from './lib/seo'

export const metadata = generateMetadata(
  'Carta.cz - Největší autobazar zdarma',
  'Prodej a koupě aut jednoduše, bez reklam a zdarma. Tisíce ověřených inzerátů, detailní fotografie, transparentní ceny. Najděte své vysněné auto na Carta.cz.',
  ['autobazar zdarma', 'nejlepší ceny aut', 'ověření prodejci', 'bezpečný nákup auta', 'carta autobazar']
)

export default function Home() {
  return (
    <>
      {/* SEO-optimized structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Carta.cz",
            "url": "https://carta.cz",
            "description": "Největší autobazar v České republice - prodej a koupě aut zdarma",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://carta.cz/ads?search={search_term_string}",
              "query-input": "required name=search_term_string"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Carta.cz",
              "url": "https://carta.cz"
            }
          })
        }}
      />

      <main className="home-page">
        {/* Add SEO-friendly heading structure */}
        <h1 style={{ position: 'absolute', left: '-9999px' }}>
          Carta.cz - Největší autobazar v České republice
        </h1>
        
        <HeroSection />
        <Suspense fallback={null}>
          <AdFilter />
        </Suspense>
        <Suspense fallback={null}>
        <StartupBanner />

          <QuickCategories />
        </Suspense>
        <WhyCartaSection />
        {/* <UserReviewsSection /> */}
        <SellCarCTA />
        <ContactForm />
      </main>
    </>
  )
}
