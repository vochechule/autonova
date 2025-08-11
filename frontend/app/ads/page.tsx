'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import AdFilter from '../components/AdFilter'
import ActiveFilters from '../components/ActiveFilters'
import FilterSidebar from '../components/FilterSidebar'
import FavoriteButton from '../components/FavoriteButton'
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
  user?: {
    name: string
    averageRating: number
  }
}

type PaginationResponse = {
  ads: Ad[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export default function AdsPage() {
  const searchParams = useSearchParams()
  const [ads, setAds] = useState<Ad[]>([])
  const [pagination, setPagination] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  useEffect(() => {
    setLoading(true)
    setAds([])
    
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', '1')
    params.set('limit', '10')

    fetch(`http://localhost:3000/ad?${params}`)
      .then(res => res.json())
      .then(data => {
        // ✅ JEDINÁ OPRAVA - bezpečnostní kontrola
        setAds(data?.ads || [])
        setPagination(data?.pagination || null)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
        setAds([])
      })
  }, [searchParams])

  const loadMore = async () => {
    if (!pagination?.hasNext || loadingMore) return
    
    setLoadingMore(true)
    
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', (pagination.page + 1).toString())
    params.set('limit', '10')

    try {
      const res = await fetch(`http://localhost:3000/ad?${params}`)
      const data = await res.json()
      
      // ✅ JEDINÁ OPRAVA - bezpečnostní kontrola
      setAds(prevAds => [...prevAds, ...(data?.ads || [])])
      setPagination(data?.pagination || null)
    } catch (error) {
      console.error('Error loading more ads:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleFilterResults = (newAdsData: PaginationResponse) => {
    // ✅ JEDINÁ OPRAVA - bezpečnostní kontrola
    setAds(newAdsData?.ads || [])
    setPagination(newAdsData?.pagination || null)
  }

  return (
    <main className="ads-page">
      <div 
        className={`filter-sidebar-overlay ${showMobileFilters ? 'filter-sidebar-overlay--visible' : ''}`}
        onClick={() => setShowMobileFilters(false)}
      />

      <div className="ads-page__layout">
        <FilterSidebar 
          key={searchParams.toString()}
          onResults={handleFilterResults}
          isVisible={showMobileFilters}
          onClose={() => setShowMobileFilters(false)}
        />

        <div className="ads-page__main">
          <div className="ads-page__header">
            <h1 className="ads-page__heading">Inzeráty</h1>
            
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

          <div className="ads-page__legacy-filter">
            <AdFilter />
          </div>

          <ActiveFilters />
          
          <div className="ads-page__results">
            {pagination && (
              <div className="ads-page__results-info">
                Zobrazeno {ads.length} z {pagination.total} inzerátů
              </div>
            )}

            {loading ? (
              <div className="ads-page__loading">Načítání...</div>
            ) : ads.length === 0 ? (
              <div className="ads-page__no-results">
                <p>Žádné inzeráty nebyly nalezeny.</p>
              </div>
            ) : (
              <>
                <div className="ads-page__list">
                  {ads.map(ad => (
                    <div key={ad.id} className="ads-page__card-horizontal">
                      <Link href={`/ads/${ad.id}`} className="ads-page__card-link">
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

                          <div className="ads-page__seller-info">
                            <span className="ads-page__seller-name">{ad.user?.name ?? "Neznámý prodejce"}</span>
                            {typeof ad.user?.averageRating === "number" && (
                              <span className="ads-page__seller-rating">
                                {"★".repeat(Math.round(ad.user.averageRating))}
                                {"☆".repeat(5 - Math.round(ad.user.averageRating))}
                                <span className="ads-page__seller-rating-number">
                                  {ad.user.averageRating.toFixed(1)}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                      
                      <div className="ads-page__favorite-btn">
                        <FavoriteButton adId={ad.id.toString()} className="favorite-button--inline" />
                      </div>
                    </div>
                  ))}
                </div>

                {pagination?.hasNext && (
                  <div className="ads-page__load-more">
                    <button 
                      onClick={loadMore}
                      className="load-more-button"
                      disabled={loadingMore}
                    >
                      {loadingMore ? (
                        <>
                          <div className="loading-spinner"></div>
                          Načítání...
                        </>
                      ) : (
                        <>
                          Zobrazit další inzeráty 
                          <span className="load-more-count">
                            ({Math.min(10, pagination.total - ads.length)})
                          </span>
                        </>
                      )}
                    </button>
                    
                    <div className="load-more-progress">
                      <div 
                        className="load-more-progress-bar"
                        style={{ 
                          width: `${(ads.length / pagination.total) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                )}

                {!pagination?.hasNext && pagination?.total > 10 && (
                  <div className="ads-page__end-message">
                    Zobrazili jste všech {pagination.total} inzerátů
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}