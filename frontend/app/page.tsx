import './styles/HomePage.scss'
import AdFilter from './components/AdFilter'
import QuickCategories from './components/QuickCategories'
import HeroSection from './components/HeroSection'
import StartupBanner from './components/StartupBanner'

export default function Home() {
  return (
    <main className="home-page">
      <HeroSection />
      <StartupBanner /> {/* ✅ PŘIDÁNO */}
      <AdFilter />
      <QuickCategories />
    </main>
  )
}
