import './styles/HomePage.scss'
import AdFilter from './components/AdFilter'
import QuickCategories from './components/QuickCategories'
import HeroSection from './components/HeroSection'

export default function Home() {
  return (
    <main className="home-page">
      <HeroSection />
      <AdFilter />
      <QuickCategories />
    </main>
  )
}
