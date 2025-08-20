import './styles/HomePage.scss'
import AdFilter from './components/AdFilter'
import QuickCategories from './components/QuickCategories'
import HeroSection from './components/HeroSection'
import StartupBanner from './components/StartupBanner'
import WhyCartaSection from './components/WhyCartaSection'
import UserReviewsSection from './components/UserReviewsSection'
import SellCarCTA from './components/SellCarCTA'

export default function Home() {
  return (
    <main className="home-page">
      <HeroSection />
      <StartupBanner />
      <AdFilter />
      <QuickCategories />
      <WhyCartaSection />
      <UserReviewsSection />
      <SellCarCTA />
    </main>
  )
}
