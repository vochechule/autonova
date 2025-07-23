import Header from './components/Header'
import './styles/HomePage.scss'
import AdFilter from './components/AdFilter'
import QuickCategories from './components/QuickCategories'

export default function Home() {
  return (
    <>
      <Header />
      <main className="home-page">
        <AdFilter />
        <QuickCategories />
       
      </main>
    </>
  )
}
