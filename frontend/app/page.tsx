import Header from './components/Header'
import './styles/HomePage.scss'
import AdFilter from './components/AdFilter'

export default function Home() {
  return (
    <>
      <Header />
      <main className="home-page">
        <AdFilter />
        <h1 className="home-page__title">Vítej v AutoBazar!</h1>
        <p className="home-page__subtitle">Začni kliknutím na <code>/ads</code> pro zobrazení inzerátů</p>
        <a href="/ads" className="home-page__link">/ads</a>
      </main>
    </>
  )
}
