import { Suspense } from 'react'
import './styles/HomePage.scss'
import AdFilter from './components/AdFilter'
import QuickCategories from './components/QuickCategories'
import HeroSection from './components/HeroSection'
import StartupBanner from './components/StartupBanner'
import WhyCartaSection from './components/WhyCartaSection'
import UserReviewsSection from './components/UserReviewsSection'
import SellCarCTA from './components/SellCarCTA'
import ContactForm from './components/ContactForm'

export default function Home() {
  return (
    <main className="home-page">
      <HeroSection />
      <StartupBanner />
      <Suspense fallback={null}>
        <AdFilter />
      </Suspense>
      <Suspense fallback={null}>
        <QuickCategories />
      </Suspense>
      <WhyCartaSection />
      <UserReviewsSection />
      <SellCarCTA />
      <ContactForm />
    </main>
  )
}
