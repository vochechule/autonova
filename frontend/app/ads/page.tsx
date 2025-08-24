'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import ActiveFilters from '../components/ActiveFilters'
import FilterSidebar from '../components/FilterSidebar'
import AdCard from '../components/AdCard'
import '../styles/AdsPage.scss'
import { CardsLoading, ButtonLoading } from '../components/LoadingStates'
import { NetworkErrorPage } from '../components/ErrorPages'
import { useToast } from '../contexts/ToastContext'
import SortBar from '../components/SortBar'

type ViewMode = 'grid' | 'list'

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
  distance?: number
}

type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function AdsPage() {
  const searchParams = useSearchParams()
  const [ads, setAds] = useState<Ad[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const { showError: showToastError } = useToast()

  const handleViewChange = (view: ViewMode) => {
    setViewMode(view)
  }

  const handleLocationChange = (location: {
    latitude: number
    longitude: number
    address: string
    distance: number
  } | null) => {

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
    
    window.history.pushState(null, '', `?${newSearchParams.toString()}`)
  }

  const fetchAds = useCallback(async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true)
        setAds([])
        setError(null)
      }
      
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', isInitialLoad ? '1' : (pagination?.page ? (pagination.page + 1).toString() : '1'))
      params.set('limit', '10')

      const response = await fetch(`${API_URL}/ad?${params}`)
      
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
  }, [searchParams, showToastError])

  useEffect(() => {
    fetchAds(true)
  }, [searchParams, fetchAds])

  const loadMore = async () => {
    if (!pagination?.hasNext || loadingMore) return
    setLoadingMore(true)
    await fetchAds(false)
  }

  const handleRetry = () => {
    setError(null)
    fetchAds(true)
  }

  if (error === 'network-error') {
    return <NetworkErrorPage onRetry={handleRetry} />
  }

  console.log('AdsPage render');

  return (
    <main className="ads-page">
      <div 
        className={`filter-sidebar-overlay ${showMobileFilters ? 'filter-sidebar-overlay--visible' : ''}`}
        onClick={() => setShowMobileFilters(false)}
      />

      <div className="ads-page__layout">
        <FilterSidebar 
          isVisible={showMobileFilters}
          onClose={() => setShowMobileFilters(false)}
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

          <ActiveFilters />
          
          <div className="ads-page__results">
            <SortBar totalCount={pagination?.total} onViewChange={handleViewChange} />
            
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
                {/* ✅ CLEAN & SIMPLE RENDERING */}
                <div className={`ads-page__list ads-page__list--${viewMode}`}>
                  {ads.map(ad => (
                    <AdCard key={ad.id} ad={ad} viewMode={viewMode} />
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
                            ({Math.min(10, (pagination?.total ?? 0) - ads.length)})
                          </span>
                        </>
                      )}
                    </button>
                    
                    <div className="load-more-progress">
                      <div 
                        className="load-more-progress-bar"
                        style={{ 
                          width: `${pagination && pagination.total ? (ads.length / pagination.total) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                )}

                {!pagination?.hasNext && (pagination?.total ?? 0) > 10 && (
                  <div className="ads-page__end-message">
                    Zobrazili jste všech {pagination?.total ?? 0} inzerátů
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