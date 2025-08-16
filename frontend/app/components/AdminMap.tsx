'use client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useEffect, useState } from 'react'
import L from 'leaflet'

// Fix pro ikony
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

// ✅ RŮZNÉ IKONY podle typu
const dealerIcon = new L.DivIcon({
  html: `<div class="admin-map-marker dealer">🏢</div>`,
  className: 'admin-map-icon',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
})

const privateIcon = new L.DivIcon({
  html: `<div class="admin-map-marker private">👤</div>`,
  className: 'admin-map-icon',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
})

const hiddenIcon = new L.DivIcon({
  html: `<div class="admin-map-marker hidden">🙈</div>`,
  className: 'admin-map-icon',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
})

interface AdminMapProps {
  ads: Array<{
    id: string
    title: string
    brand: string
    model: string
    price: number
    latitude?: number
    longitude?: number
    address?: string
    isVisible: boolean
    user: {
      name: string
      isDealer: boolean
    }
    images: Array<{ url: string }>
  }>
}

export default function AdminMap({ ads }: AdminMapProps) {
  const [mapReady, setMapReady] = useState(false)
  
  // Filtruj pouze inzeráty s lokací
  const adsWithLocation = ads.filter(ad => ad.latitude && ad.longitude)
  
  useEffect(() => {
    setMapReady(true)
  }, [])

  if (!mapReady) {
    return (
      <div className="admin-map-loading">
        <p>Načítání mapy...</p>
      </div>
    )
  }

  if (adsWithLocation.length === 0) {
    return (
      <div className="admin-map-empty">
        <h3>Žádné inzeráty s lokací</h3>
        <p>Zatím nejsou k dispozici žádné inzeráty s geografickou polohou.</p>
      </div>
    )
  }

  // Výpočet středu mapy (průměr všech pozic)
  const centerLat = adsWithLocation.reduce((sum, ad) => sum + (ad.latitude || 0), 0) / adsWithLocation.length
  const centerLng = adsWithLocation.reduce((sum, ad) => sum + (ad.longitude || 0), 0) / adsWithLocation.length

  return (
    <div className="admin-map">
      <div className="admin-map-info">
        <h3>🗺️ Mapa všech inzerátů</h3>
        <div className="admin-map-legend">
          <div className="legend-item">
            <span className="legend-icon dealer">🏢</span>
            <span>Autobazar</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon private">👤</span>
            <span>Soukromý prodejce</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon hidden">🙈</span>
            <span>Skrytý inzerát</span>
          </div>
        </div>
        <p>Zobrazeno: {adsWithLocation.length} z {ads.length} inzerátů</p>
      </div>
      
      <div className="admin-map-container">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={8}
          style={{ height: '600px', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          
          {adsWithLocation.map(ad => {
            // Volba ikony podle typu
            let icon = privateIcon
            if (!ad.isVisible) {
              icon = hiddenIcon
            } else if (ad.user.isDealer) {
              icon = dealerIcon
            }

            return (
              <Marker
                key={ad.id}
                position={[ad.latitude!, ad.longitude!]}
                icon={icon}
              >
                <Popup className="admin-map-popup">
                  <div className="admin-popup-content">
                    <div className="popup-image">
                      <img 
                        src={ad.images[0]?.url || '/default-car.png'} 
                        alt={ad.title}
                      />
                    </div>
                    <div className="popup-info">
                      <h4>{ad.title}</h4>
                      <p><strong>{ad.brand} {ad.model}</strong></p>
                      <p className="price">{ad.price.toLocaleString()} Kč</p>
                      <p className="seller">
                        {ad.user.name} 
                        <span className={ad.user.isDealer ? 'dealer-badge' : 'private-badge'}>
                          {ad.user.isDealer ? 'Autobazar' : 'Soukromý'}
                        </span>
                      </p>
                      {ad.address && <p className="address">📍 {ad.address}</p>}
                      <p className={`status ${ad.isVisible ? 'visible' : 'hidden'}`}>
                        {ad.isVisible ? '👁️ Viditelný' : '🙈 Skrytý'}
                      </p>
                      <button 
                        className="popup-link"
                        onClick={() => window.open(`/ads/${ad.id}`, '_blank')}
                      >
                        👀 Zobrazit detail
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>
    </div>
  )
}