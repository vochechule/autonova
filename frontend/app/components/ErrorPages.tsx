'use client'
import Link from 'next/link'
import '../styles/components/ErrorPages.scss'

interface ErrorPageProps {
  title: string
  message: string
  code?: string
  showHomeButton?: boolean
  showBackButton?: boolean
  children?: React.ReactNode
}

export function ErrorPage({ 
  title, 
  message, 
  code, 
  showHomeButton = true, 
  showBackButton = true,
  children 
}: ErrorPageProps) {
  return (
    <div className="error-page">
      <div className="error-page__content">
        {code && <div className="error-page__code">{code}</div>}
        <h1 className="error-page__title">{title}</h1>
        <p className="error-page__message">{message}</p>
        
        {children}
        
        <div className="error-page__actions">
          {showBackButton && (
            <button 
              onClick={() => window.history.back()} 
              className="error-page__btn error-page__btn--secondary"
            >
              ← Zpět
            </button>
          )}
          {showHomeButton && (
            <Link href="/" className="error-page__btn error-page__btn--primary">
              🏠 Domů
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

// Specifické error komponenty
export function NotFoundPage() {
  return (
    <ErrorPage
      code="404"
      title="Stránka nebyla nalezena"
      message="Omlouváme se, ale stránku kterou hledáte se nepodařilo najít. Možná byla přesunuta nebo odstraněna."
    />
  )
}

export function ServerErrorPage() {
  return (
    <ErrorPage
      code="500"
      title="Chyba serveru"
      message="Omlouváme se, ale došlo k chybě na serveru. Zkuste to prosím později."
      showBackButton={false}
    >
      <button 
        onClick={() => window.location.reload()} 
        className="error-page__btn error-page__btn--secondary"
      >
        🔄 Obnovit stránku
      </button>
    </ErrorPage>
  )
}

export function UnauthorizedPage() {
  return (
    <ErrorPage
      code="401"
      title="Přístup zamítnut"
      message="Pro zobrazení této stránky se musíte přihlásit."
      showBackButton={false}
    >
      <Link href="/login" className="error-page__btn error-page__btn--primary">
        🔐 Přihlásit se
      </Link>
    </ErrorPage>
  )
}

export function NetworkErrorPage({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorPage
      title="Chyba připojení"
      message="Nepodařilo se připojit k serveru. Zkontrolujte připojení k internetu."
      showHomeButton={false}
    >
      {onRetry && (
        <button 
          onClick={onRetry} 
          className="error-page__btn error-page__btn--primary"
        >
          🔄 Zkusit znovu
        </button>
      )}
    </ErrorPage>
  )
}