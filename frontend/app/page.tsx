import './styles/HomePage.scss'
import AdFilter from './components/AdFilter'
import QuickCategories from './components/QuickCategories'

export default function Home() {
  return (
    <main className="home-page">
      <AdFilter />
      <QuickCategories />
    </main>
  )
}
