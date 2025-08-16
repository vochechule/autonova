'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import AdFilter from '../components/AdFilter'
import ActiveFilters from '../components/ActiveFilters'
import FilterSidebar from '../components/FilterSidebar'
import FavoriteButton from '../components/FavoriteButton'
import Link from 'next/link'
import '../styles/AdsPage.scss'
import { formatCarTitle } from '../utils/CarFormatter'
import { CardsLoading, ButtonLoading } from '../components/LoadingStates'
import { NetworkErrorPage } from '../components/ErrorPages'
import { useToast } from '../contexts/ToastContext'
import SortBar from '../components/SortBar'

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
  latitude?: number
  longitude?: number
  address?: string
  images: { url: string }[]
  user?: {
    name: string
    averageRating: number
  }
  distance?: number // ✅ PŘIDÁNO
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
  const [error, setError] = useState<string | null>(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  // ✅ PŘIDÁNO - Location filter state
  const [locationFilter, setLocationFilter] = useState<{
    latitude: number
    longitude: number
    address: string
    distance: number
  } | null>(null)
  const { showError: showToastError } = useToast()

  // ✅ PŘIDÁNO - Location change handler
  const handleLocationChange = (location: {
    latitude: number
    longitude: number
    address: string
    distance: number
  } | null) => {
    setLocationFilter(location)
    console.log('🗺️ Location filter changed:', location)
    
    // Přidej location parametry do URL
    const newSearchParams = new URLSearchParams(searchParams.toString())
    
    if (location) {
      newSearchParams.set('nearLatitude', location.latitude.toString())
      newSearchParams.set('nearLongitude', location.longitude.toString())
      newSearchParams.set('nearDistance', location.distance.toString())
    } else {
      newSearchParams.delete('nearLatitude')
      newSearchParams.delete('nearLongitude')
      newSearchParams.delete('nearDistance')
    }
    
    // Trigger nové vyhledávání
    window.history.pushState(null, '', `?${newSearchParams.toString()}`)
    
    // Fetch new data
    fetchAds(true)
  }

  useEffect(() => {
    fetchAds(true)
  }, [searchParams])

  // V page.tsx přidejte useEffect pro URL monitoring:
  useEffect(() => {
    console.log('🔄 AdsPage: URL searchParams changed:', searchParams.toString())
    
    // Fetch ads když se změní URL (včetně sort)
    const handleUrlChange = async () => {
      setLoading(true)
      try {
        const paramsString = searchParams.toString()
        const url = `http://localhost:3000/ad${paramsString ? `?${paramsString}` : ''}`
        
        console.log('🚀 AdsPage: Fetching URL:', url)
        
        const res = await fetch(url)
        const data = await res.json()
        
        console.log('📦 AdsPage: Received data:', data)
        
        setAds(data.ads || data)
        setPagination(data.pagination)
      } catch (error) {
        console.error('❌ AdsPage: Fetch error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    handleUrlChange()
  }, [searchParams]) // ✅ Reaguje na JAKOUKOLIV změnu URL

  const fetchAds = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true)
        setAds([])
        setError(null)
      }
      
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', isInitialLoad ? '1' : (pagination.page + 1).toString())
      params.set('limit', '10')

      const response = await fetch(`http://localhost:3000/ad?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (isInitialLoad) {
        setAds(data?.ads || [])
      } else {
        setAds(prevAds => [...prevAds, ...(data?.ads || [])])
      }
      
      setPagination(data?.pagination || null)
    } catch (error) {
      console.error('Error fetching ads:', error)
      setError('network-error')
      showToastError('Chyba při načítání', 'Nepodařilo se načíst seznam inzerátů')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMore = async () => {
    if (!pagination?.hasNext || loadingMore) return
    setLoadingMore(true)
    await fetchAds(false)
  }

  const handleFilterResults = (newAdsData: PaginationResponse) => {
    setAds(newAdsData?.ads || [])
    setPagination(newAdsData?.pagination || null)
    setError(null)
  }

  const handleRetry = () => {
    setError(null)
    fetchAds(true)
  }

  if (error === 'network-error') {
    return <NetworkErrorPage onRetry={handleRetry} />
  }

  return (
    <main className="ads-page">
      <div 
        className={`filter-sidebar-overlay ${showMobileFilters ? 'filter-sidebar-overlay--visible' : ''}`}
        onClick={() => setShowMobileFilters(false)}
      />

      <div className="ads-page__layout">
        <FilterSidebar 
          onResults={handleFilterResults}
          isVisible={showMobileFilters}
          onClose={() => setShowMobileFilters(false)}
          // ✅ PŘIDÁNO - Předej location handler
          onLocationChange={handleLocationChange}
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
            {/* ✅ NAHRAZENO - results-info + SortBar */}
            <SortBar totalCount={pagination?.total} />
            
            {loading ? (
              <CardsLoading count={8} />
            ) : ads.length === 0 ? (
              <div className="ads-page__no-results">
                <p>Žádné inzeráty nebyly nalezeny.</p>
                <button onClick={handleRetry} className="retry-button">
                  Zkusit znovu
                </button>
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
                              <span className="ads-page__spec">{formatCarTitle(ad.brand, ad.model)}</span>
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
                            {ad.address && (
                              <div className="ads-page__detail-row">
                                <span className="ads-page__label">Lokalita:</span>
                                <span className="ads-page__value">
                                  📍 {ad.address}
                                  {ad.distance && (
                                    <span className="ads-page__distance"> • {ad.distance} km</span>
                                  )}
                                </span>
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
                        <ButtonLoading />
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