'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import AdFilter from '../components/AdFilter'
import ActiveFilters from '../components/ActiveFilters'
import FilterSidebar from '../components/FilterSidebar'
import Link from 'next/link'
import '../styles/AdsPage.scss'

type Ad = {
  id: number
  title: string
  price: number
  mileage: number
  year?: number
  brand?: string
  model?: string
  fuel?: string
  bodyType?: string
  transmission?: string
  drivetrain?: string
  power?: number
  color?: string
  description?: string
  images: { url: string }[]
}

export default function AdsPage() {
  const searchParams = useSearchParams()
  const [ads, setAds] = useState<Ad[]>([])
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  useEffect(() => {
    const params = searchParams.toString()
    fetch(`http://localhost:3000/ad?${params}`)
      .then(res => res.json())
      .then(setAds)
  }, [searchParams])

  const handleFilterResults = (newAds: Ad[]) => {
    setAds(newAds)
  }

  return (
    <main className="ads-page">
      {/* Mobile filter overlay */}
      <div 
        className={`filter-sidebar-overlay ${showMobileFilters ? 'filter-sidebar-overlay--visible' : ''}`}
        onClick={() => setShowMobileFilters(false)}
      />

      {/* Desktop layout */}
      <div className="ads-page__layout">
        {/* Sidebar Filters */}
        <FilterSidebar 
          key={searchParams.toString()}
          onResults={handleFilterResults}
          isVisible={showMobileFilters}
          onClose={() => setShowMobileFilters(false)}
        />

        {/* Main Content */}
        <div className="ads-page__main">
          <div className="ads-page__header">
            <h1 className="ads-page__heading">Inzeráty</h1>
            
            {/* Mobile filter button */}
            <button 
              className="mobile-filter-button"
              onClick={() => setShowMobileFilters(true)}
            >
              <svg className="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtry ({Object.keys(Object.fromEntries(searchParams.entries())).length})
            </button>
          </div>

          {/* Legacy AdFilter - hidden on desktop, used as fallback */}
          <div className="ads-page__legacy-filter">
            <AdFilter />
          </div>

          <ActiveFilters />
          
          <div className="ads-page__results">
            {ads.length === 0 ? (
              <div className="ads-page__no-results">
                <p>Žádné inzeráty nebyly nalezeny.</p>
              </div>
            ) : (
              <div className="ads-page__list">
                {ads.map(ad => (
                  <Link
                    key={ad.id}
                    href={`/ads/${ad.id}`}
                    className="ads-page__card-horizontal"
                  >
                    <div className="ads-page__image-container">
                      <img
                        src={ad.images?.[0]?.url || '/no-image.png'}
                        alt={ad.title}
                        className="ads-page__image-horizontal"
                      />
                    </div>
                    <div className="ads-page__content">
                      <div className="ads-page__title-horizontal">{ad.title}</div>
                      <div className="ads-page__specs">
                        {ad.brand && ad.model && (
                          <span className="ads-page__spec">{ad.brand} {ad.model}</span>
                        )}
                        {ad.year && (
                          <span className="ads-page__spec">{ad.year}</span>
                        )}
                        {ad.fuel && (
                          <span className="ads-page__spec">{ad.fuel}</span>
                        )}
                        {ad.bodyType && (
                          <span className="ads-page__spec">{ad.bodyType}</span>
                        )}
                        {ad.transmission && (
                          <span className="ads-page__spec">{ad.transmission}</span>
                        )}
                      </div>
                      <div className="ads-page__details">
                        <div className="ads-page__detail-row">
                          <span className="ads-page__label">Nájezd:</span>
                          <span className="ads-page__value">{ad.mileage?.toLocaleString()} km</span>
                        </div>
                        {ad.power && (
                          <div className="ads-page__detail-row">
                            <span className="ads-page__label">Výkon:</span>
                            <span className="ads-page__value">{ad.power} kW</span>
                          </div>
                        )}
                        {ad.color && (
                          <div className="ads-page__detail-row">
                            <span className="ads-page__label">Barva:</span>
                            <span className="ads-page__value">{ad.color}</span>
                          </div>
                        )}
                      </div>
                      <div className="ads-page__price-horizontal">{ad.price?.toLocaleString()} Kč</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
