'use client'
import { createPortal } from 'react-dom'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import '../styles/components/LocationFilter.scss'

const DynamicLocationMapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="location-filter__map-loading">
      <div className="location-filter__spinner"></div>
      <p>Načítám mapu...</p>
    </div>
  )
})

interface LocationFilterProps {
  onLocationChange: (location: {
    latitude: number
    longitude: number
    address: string
    distance: number
  } | null) => void
  initialDistance?: number
  className?: string
}

export default function LocationFilter({ onLocationChange, initialDistance = 25, className = '' }: LocationFilterProps) {
  const [userLocation, setUserLocation] = useState<{
    latitude: number
    longitude: number
    address: string
  } | null>(null)
  const [selectedDistance, setSelectedDistance] = useState(initialDistance)
  const [isEnabled, setIsEnabled] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handler pro změnu vzdálenosti
  const handleDistanceChange = (distance: number) => {
    setSelectedDistance(distance)
    
    // Zachovat enabled stav a userLocation
    if (isEnabled && userLocation) {
      onLocationChange({
        ...userLocation,
        distance
      })
    }
  }

  // Toggle filtru
  const handleToggle = (enabled: boolean) => {
    setIsEnabled(enabled)
    
    if (enabled && userLocation) {
      onLocationChange({
        ...userLocation,
        distance: selectedDistance
      })
    } else {
      onLocationChange(null)
    }
  }

  // Handler pro výběr místa na mapě
  const handleMapLocationSelect = (location: { latitude: number; longitude: number; address: string }) => {
    setUserLocation(location)
    setIsEnabled(true) // Automaticky zapni
    setShowMap(false)
    
    // Okamžitě zavolej callback
    onLocationChange({
      ...location,
      distance: selectedDistance
    })
  }

  // Detekce polohy uživatele
  const detectUserLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolokace není podporována vaším prohlížečem')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=cs`
          )
          const data = await response.json()
          
          const city = data.address?.city || data.address?.town || data.address?.village || 'Neznámé město'
          const region = data.address?.state || 'Neznámý kraj'
          const address = `${city}, ${region}`
          
          const location = { latitude, longitude, address }
          setUserLocation(location)
          setIsEnabled(true) // Automaticky zapni
          
          // Okamžitě zavolej callback
          onLocationChange({
            ...location,
            distance: selectedDistance
          })
          
        } catch (err) {
          console.error('Geocoding error:', err)
          setError('Nepodařilo se načíst adresu')
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        setLoading(false)
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Přístup k poloze byl zamítnut')
            break
          case err.POSITION_UNAVAILABLE:
            setError('Poloha není dostupná')
            break
          case err.TIMEOUT:
            setError('Timeout při načítání polohy')
            break
          default:
            setError('Neznámá chyba při načítání polohy')
            break
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minut cache
      }
    )
  }

  // Odstranit filtr
  const handleClear = () => {
    setIsEnabled(false)
    setUserLocation(null)
    setError(null)
    onLocationChange(null)
  }

  const distanceOptions = [5, 10, 25, 50, 100, 200]

  // ✅ PŘIDÁNO - Inicializace z URL parametrů při refresh
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const nearLat = urlParams.get('nearLatitude')
      const nearLng = urlParams.get('nearLongitude')
      const nearDist = urlParams.get('nearDistance')

      if (nearLat && nearLng && nearDist) {
        const location = {
          latitude: parseFloat(nearLat),
          longitude: parseFloat(nearLng),
          address: 'Obnovená lokalita' // Fallback text - nemáme address v URL
        }
        
        setUserLocation(location)
        setSelectedDistance(parseInt(nearDist))
        setIsEnabled(true)

        
        // Zavolej callback s kompletními daty
        onLocationChange({
          ...location,
          distance: parseInt(nearDist)
        })
      } else {
        // Pokud nejsou location parametry, vynuluj
        setUserLocation(null)
        setIsEnabled(false)
        onLocationChange(null)
      }
    }
  }, []) // ✅ Prázdné deps - spustí se pouze při mount

  return (
    <div className={`location-filter ${className}`}>
      <div className="location-filter__header">
        <label className="location-filter__toggle">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => handleToggle(e.target.checked)}
            disabled={!userLocation}
          />
          <span className="location-filter__toggle-text">
            Filtrovat podle vzdálenosti
          </span>
        </label>
      </div>

      {/* Kontroly pro polohu */}
      {!userLocation && (
        <div className="location-filter__actions">
          <button
            type="button"
            className="location-filter__button location-filter__button--primary"
            onClick={detectUserLocation}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="location-filter__button-spinner"></div>
                Načítám polohu...
              </>
            ) : (
              <>
                🎯 Najít mou polohu
              </>
            )}
          </button>
          
          <button
            type="button"
            className="location-filter__button location-filter__button--secondary"
            onClick={() => setShowMap(true)}
          >
            🗺️ Vybrat na mapě
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="location-filter__error">
          ⚠️ {error}
          <button 
            type="button"
            className="location-filter__retry"
            onClick={() => setShowMap(true)}
          >
            Vybrat ručně
          </button>
        </div>
      )}

      {/* Aktuální poloha */}
      {userLocation && (
        <div className="location-filter__current">
          <div className="location-filter__location">
            📍 {userLocation.address}
          </div>
          <button
            type="button"
            className="location-filter__clear"
            onClick={handleClear}
          >
            ✕
          </button>
        </div>
      )}

      {/* Slider pro vzdálenost */}
      {userLocation && (
        <div className="location-filter__distance">
          <label className="location-filter__distance-label">
            Vzdálenost: {selectedDistance} km
          </label>
          <div className="location-filter__distance-options">
            {distanceOptions.map(distance => (
              <button
                key={distance}
                type="button"
                className={`location-filter__distance-option ${
                  selectedDistance === distance ? 'location-filter__distance-option--active' : ''
                }`}
                onClick={() => handleDistanceChange(distance)}
              >
                {distance}km
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mapa pro výběr - PORTAL VERZE */}
      {showMap && typeof window !== 'undefined' && createPortal(
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowMap(false)
            }
          }}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              width: '90vw',
              maxWidth: '900px',
              height: '80vh',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px',
                borderBottom: '1px solid #e2e8f0'
              }}
            >
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Vyberte místo</h3>
              <button
                type="button"
                onClick={() => setShowMap(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px'
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ height: 'calc(100% - 80px)' }}>
              <DynamicLocationMapComponent
                onLocationSelect={handleMapLocationSelect}
                initialPosition={[49.75, 15.5]}
                height="100%"
              />
            </div>
            <div style={{
              padding: '12px 20px',
              background: '#e6fffa',
              borderTop: '1px solid #38b2ac',
              color: '#234e52',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              💡 Klikněte na mapu pro výběr místa
            </div>
          </div>
        </div>,
        document.body // ✅ KLÍČOVÉ - render do body, ne do komponenty
      )}

      {/* Hidden inputs pro form submission */}
      {isEnabled && userLocation && (
        <>
          <input type="hidden" name="nearLatitude" value={userLocation.latitude} />
          <input type="hidden" name="nearLongitude" value={userLocation.longitude} />
          <input type="hidden" name="nearDistance" value={selectedDistance} />
        </>
      )}
    </div>
  )
}