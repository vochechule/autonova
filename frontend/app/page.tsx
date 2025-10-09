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
  'Carta.cz - Jednoduchý a moderní autobazar',
  'Objevte nový způsob prodeje a nákupu aut. Bez zbytečných poplatků, jednoduše a přehledně. Vyzkoušejte moderní autobazar na Carta.cz.',
  ['autobazar zdarma', 'nejlepší ceny aut', 'ověření prodejci', 'bezpečný nákup auta', 'carta autobazar'],
  undefined, // ogImage - use default
  'https://carta.cz/' // ✅ FIX: Explicit canonical URL with trailing slash for homepage
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
            "description": "Jednoduchý a moderní autobazar",
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
        {/* SEO H1 - hidden but accessible to search engines */}
        <h1 className="sr-only">
          Carta.cz - Jednoduchý a moderní autobazar
        </h1>
        
        <HeroSection />
        <StartupBanner />
        <Suspense fallback={null}>
          <AdFilter />
        </Suspense>
        <Suspense fallback={null}>
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
