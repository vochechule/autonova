'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react'
import ActiveFilters from '../components/ActiveFilters'
import FilterSidebar from '../components/FilterSidebar'
import AdCard from '../components/AdCard'
import '../styles/AdsPage.scss'
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

export default function AdsPageContent() {
  const searchParams = useSearchParams()
  const [ads, setAds] = useState<Ad[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1) // ✅ Add state to track current page
  const { showError: showToastError } = useToast()

  // ✅ Add debug logging
  const renderCount = useRef(0);
  renderCount.current++;
  console.log(`🎨 AdsPageContent render #${renderCount.current}`, {
    changedProps: Object.keys(Object.fromEntries(searchParams.entries())),
    searchParams: searchParams.toString()
  });

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

  // ✅ FIXED: Proper pagination logic
  const fetchAds = useCallback(async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true)
        setAds([])
        setError(null)
        setCurrentPage(1) // ✅ Reset current page on initial load
      } else {
        setLoadingMore(true)
      }
      
      const params = new URLSearchParams(searchParams.toString())
      
      // ✅ FIXED: Use proper page calculation
      const pageToFetch = isInitialLoad ? 1 : currentPage + 1
      params.set('page', pageToFetch.toString())
      params.set('limit', '12')

      console.log(`📄 Fetching page ${pageToFetch}, isInitialLoad: ${isInitialLoad}`);

      const response = await fetch(`${API_URL}/ad?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      console.log(`📄 Received ${data?.ads?.length || 0} ads for page ${pageToFetch}`);
      
      if (isInitialLoad) {
        setAds(data?.ads || [])
        setCurrentPage(1) // ✅ Set current page to 1
      } else {
        setAds(prevAds => {
          const newAds = data?.ads || []
          // ✅ Prevent duplicates by checking IDs
          const existingIds = new Set(prevAds.map(ad => ad.id))
          const uniqueNewAds = newAds.filter(ad => !existingIds.has(ad.id))
          console.log(`📄 Adding ${uniqueNewAds.length} unique ads (${newAds.length} total received)`);
          return [...prevAds, ...uniqueNewAds]
        })
        setCurrentPage(pageToFetch) // ✅ Update current page
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
  }, [searchParams, currentPage, showToastError]) // ✅ Add currentPage to dependencies

  // ✅ FIXED: Reset current page when search params change
  useEffect(() => {
    setCurrentPage(1) // ✅ Reset page when filters change
    fetchAds(true)
  }, [searchParams]) // ✅ Remove fetchAds from dependencies to prevent infinite loop

  // ✅ SIMPLIFIED: Load more function
  const loadMore = async () => {
    if (!pagination?.hasNext || loadingMore) return
    console.log(`📄 Loading more: current page ${currentPage}, next page ${currentPage + 1}`);
    await fetchAds(false)
  }

  const handleRetry = () => {
    setError(null)
    setCurrentPage(1)
    fetchAds(true)
  }

  if (error === 'network-error') {
    return <NetworkErrorPage onRetry={handleRetry} />
  }

  return (
    <main className="listings-page">
      <div 
        className={`filter-sidebar-overlay ${showMobileFilters ? 'filter-sidebar-overlay--visible' : ''}`}
        onClick={() => setShowMobileFilters(false)}
      />

      <div className="listings-page__layout">
        <FilterSidebar 
          isVisible={showMobileFilters}
          onClose={() => setShowMobileFilters(false)}
          onLocationChange={handleLocationChange}
        />

        <div className="listings-page__main">
          <div className="listings-page__header">
            <h1 className="listings-page__heading">Inzeráty</h1>
            
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
          
          <div className="listings-page__results">
            <SortBar totalCount={pagination?.total} />
            
            {loading ? (
              <CardsLoading count={12} />
            ) : ads.length === 0 ? (
              <div className="listings-page__no-results">
                <p>Žádné inzeráty nebyly nalezeny.</p>
                <button onClick={handleRetry} className="retry-button">
                  Zkusit znovu
                </button>
              </div>
            ) : (
              <>
                <div className="listings-page__grid">
                  {ads.map(ad => (
                    <AdCard key={ad.id} ad={ad} />
                  ))}
                </div>

                {/* ✅ Add debug info */}
               

                {pagination?.hasNext && (
                  <div className="listings-page__load-more">
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
                            ({Math.min(12, (pagination?.total ?? 0) - ads.length)})
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

                {!pagination?.hasNext && (pagination?.total ?? 0) > 12 && (
                  <div className="listings-page__end-message">
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