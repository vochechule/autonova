'use client'
import '../styles/components/LoadingStates.scss'

// Základní loading spinner
export function LoadingSpinner({ size = 'medium', className = '' }: { size?: 'small' | 'medium' | 'large'; className?: string }) {
  return (
    <div className={`loading-spinner loading-spinner--${size} ${className}`}>
      <div className="loading-spinner__circle"></div>
    </div>
  )
}

// Loading pro celou stránku
export function PageLoading({ message = 'Načítám...' }: { message?: string }) {
  return (
    <div className="page-loading">
      <LoadingSpinner size="large" />
      <p className="page-loading__message">{message}</p>
    </div>
  )
}

// Loading pro karty/seznamy
export function CardSkeleton() {
  return (
    <div className="card-skeleton">
      <div className="card-skeleton__image"></div>
      <div className="card-skeleton__content">
        <div className="card-skeleton__line card-skeleton__line--title"></div>
        <div className="card-skeleton__line card-skeleton__line--subtitle"></div>
        <div className="card-skeleton__line card-skeleton__line--price"></div>
      </div>
    </div>
  )
}

// Loading pro grid s kartami
export function CardsLoading({ count = 6 }: { count?: number }) {
  return (
    <div className="cards-loading">
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  )
}

// Loading overlay pro formuláře
export function FormLoading({ message = 'Ukládám...' }: { message?: string }) {
  return (
    <div className="form-loading">
      <div className="form-loading__backdrop"></div>
      <div className="form-loading__content">
        <LoadingSpinner />
        <span>{message}</span>
      </div>
    </div>
  )
}

// Loading pro tlačítka
export function ButtonLoading() {
  return (
    <div className="button-loading">
      <div className="button-loading__dot"></div>
      <div className="button-loading__dot"></div>
      <div className="button-loading__dot"></div>
    </div>
  )
}