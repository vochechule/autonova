import '../styles/components/Header.scss'

export default function Header() {
  return (
    <header className="header">
      <div className="header__container">
        <a href="/" className="header__logo"><h1>Auto<span>nova</span></h1></a>
        <nav className="header__nav">
          <a href="/" className="header__link">Domů</a>
          <a href="/ads" className="header__link">Inzeráty</a>
        </nav>
      </div>
    </header>
  )
}
