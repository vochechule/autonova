'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSwipeable } from 'react-swipeable'
import FavoriteButton from '../../components/FavoriteButton'
import ShareButton from '../../components/ShareButton'
import '../../styles/AdDetailPage.scss'
import Link from 'next/link'
import { formatBrand, formatModel, formatCarTitle } from '../../utils/CarFormatter'
import { conditionMap, fuelMap, transmissionMap, colorMap, colorFinishMap } from '../../utils/labelMaps'
// ✅ PŘIDÁNO - Import loading states a error pages
import { PageLoading } from '../../components/LoadingStates'
import { NotFoundPage, NetworkErrorPage } from '../../components/ErrorPages'
import { useToast } from '../../contexts/ToastContext'
import AdMap from '../../components/AdMap'

export default function AdDetailPage() {
  const { id } = useParams()
  const [ad, setAd] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imgIndex, setImgIndex] = useState(0)
  // ✅ PŘIDÁNO - Toast hook
  const { showError } = useToast()

  useEffect(() => {
    const fetchAd = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`http://localhost:3000/ad/${id}`)
        
        if (response.status === 404) {
          setError('not-found')
          return
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setAd(data)
      } catch (error) {
        console.error('Error fetching ad:', error)
        setError('network-error')
        showError('Chyba při načítání', 'Nepodařilo se načíst detail inzerátu')
      } finally {
        setLoading(false)
      }
    }

    // Debounce - počkej 100ms před voláním
    const timeoutId = setTimeout(fetchAd, 100)
    return () => clearTimeout(timeoutId)
  }, [id, showError])

  const handleRetry = () => {
    setError(null)
    window.location.reload()
  }

  const handlePrev = () => {
    if (!ad?.images) return
    setImgIndex((prev) => prev === 0 ? ad.images.length - 1 : prev - 1)
  }
  
  const handleNext = () => {
    if (!ad?.images) return
    setImgIndex((prev) => prev === ad.images.length - 1 ? 0 : prev + 1)
  }

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleNext(),
    onSwipedRight: () => handlePrev(),
    trackMouse: true,
  })

  // ✅ UPRAVENO - Lepší loading a error handling
  if (loading) return <PageLoading message="Načítám detail inzerátu..." />
  if (error === 'not-found') return <NotFoundPage />
  if (error === 'network-error') return <NetworkErrorPage onRetry={handleRetry} />
  if (!ad) return <NotFoundPage />

  return (
    <main className="ad-detail-page">
      <div className="ad-detail-page__container">
        {/* Header s navigací zpět */}
        <div className="ad-detail-page__header">
          <button 
            className="ad-detail-page__back-btn"
            onClick={() => window.history.back()}
            aria-label="Zpět"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5m7-7l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Zpět
          </button>
          
          <div className="ad-detail-page__price">{ad.price?.toLocaleString()} Kč</div>
          
          <div className="ad-detail-page__actions">
            <ShareButton 
              title={formatCarTitle(ad.brand, ad.model)}
              url={window.location.href}
              className="ad-detail-page__share-btn"
            />
            <FavoriteButton adId={ad.id} className="ad-detail-page__favorite-btn" />
          </div>
        </div>

        {/* Layout s obrázky a základními info */}
        <div className="ad-detail-page__main-content">
          {/* Carousel obrázků */}
          <div className="ad-detail-page__carousel" {...swipeHandlers}>
            {ad.images && ad.images.length > 0 ? (
              <>
                <img
                  src={ad.images[imgIndex].url}
                  alt={ad.title}
                  className="ad-detail-page__carousel-img"
                />
                {ad.images.length > 1 && (
                  <>
                    <button className="ad-detail-page__carousel-btn left" onClick={handlePrev} aria-label="Předchozí obrázek">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button className="ad-detail-page__carousel-btn right" onClick={handleNext} aria-label="Další obrázek">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <div className="ad-detail-page__carousel-counter">
                      {imgIndex + 1} / {ad.images.length}
                    </div>
                  </>
                )}
                {ad.images.length > 1 && (
                  <div className="ad-detail-page__carousel-dots">
                    {ad.images.map((img: any, i: number) => (
                      <button
                        key={img.id || i}
                        className={`ad-detail-page__carousel-dot${i === imgIndex ? ' active' : ''}`}
                        onClick={() => setImgIndex(i)}
                        aria-label={`Obrázek ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="ad-detail-page__no-image">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
                  <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>Žádné obrázky</span>
              </div>
            )}
          </div>

          {/* Základní informace */}
          <div className="ad-detail-page__basic-info">
            <h1 className="ad-detail-page__title">
             {formatCarTitle(ad.brand, ad.model)}
            </h1>
            <div className="ad-detail-page__subtitle">
              {ad.year} &bull; {ad.mileage?.toLocaleString()} km &bull; {fuelMap[ad.fuel] ?? ad.fuel ?? '-'}
            </div>
            
            {/* Datum přidání a počet zobrazení */}
            <div className="ad-detail-page__meta-info">
              {ad.createdAt && (
                <div className="ad-detail-page__date-added">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Přidáno {new Date(ad.createdAt).toLocaleDateString('cs-CZ')}
                </div>
              )}
              
              {ad.views !== undefined && (
                <div className="ad-detail-page__views">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  {ad.views.toLocaleString()} zobrazení
                </div>
              )}
            </div>
            
            {/* Klíčové specs */}
            <div className="ad-detail-page__key-specs">
              <div className="ad-detail-page__key-spec">
                <span className="ad-detail-page__key-spec-icon">🚗</span>
                <span>{ad.bodyType}</span>
              </div>
              <div className="ad-detail-page__key-spec">
                <span className="ad-detail-page__key-spec-icon">⚙️</span>
                <span>{transmissionMap[ad.transmission] ?? ad.transmission ?? '-'}</span>
              </div>
              {ad.power && (
                <div className="ad-detail-page__key-spec">
                  <span className="ad-detail-page__key-spec-icon">⚡</span>
                  <span>{ad.power} kW</span>
                </div>
              )}
              {ad.engineVolume && (
                <div className="ad-detail-page__key-spec">
                  <span className="ad-detail-page__key-spec-icon">🔧</span>
                  <span>{(ad.engineVolume / 1000).toFixed(1)}L</span>
                </div>
              )}
            </div>

            {/* Prodejce info s integrovanými kontakty */}
            <div className="ad-detail-page__seller-compact">
              <div className="ad-detail-page__seller-avatar">
                {ad.user?.avatar
                  ? <img src={ad.user.avatar} alt="avatar" />
                  : <div className="ad-detail-page__seller-avatar-placeholder">
                      {(ad.user?.firstName?.charAt(0) || ad.contactName?.charAt(0) || 'U')}
                    </div>}
              </div>
              <div className="ad-detail-page__seller-details">
                <div className="ad-detail-page__seller-name">
                  {ad.user?.firstName && ad.user?.lastName 
                    ? `${ad.user.firstName} ${ad.user.lastName}`
                    : ad.contactName || `${ad.user?.name}`}
                </div>
                <div className="ad-detail-page__seller-location">{ad.user?.location ?? 'Neuvedeno'}</div>
                
                {/* ✅ PŘIDÁNO - Kontaktní údaje přímo zde */}
                <div className="ad-detail-page__contact-info">
                  {ad.contactPhone && (
                    <a href={`tel:${ad.contactPhone}`} className="ad-detail-page__contact-link">
                      <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      {ad.contactPhone}
                    </a>
                  )}
                  
                  {ad.contactEmail && (
                    <a href={`mailto:${ad.contactEmail}`} className="ad-detail-page__contact-link">
                      <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                      {ad.contactEmail}
                    </a>
                  )}
                </div>
              </div>
              
              <Link href={`/profile/${ad.user?.id}`} className="ad-detail-page__contact-btn">
                Profil prodejce
              </Link>
            </div>
          </div>
        </div>

        {/* Detailní specifikace */}
        <section className="ad-detail-page__specs">
          <h2 className="ad-detail-page__section-title">Specifikace</h2>
          <div className="ad-detail-page__specgrid">
            <div className="ad-detail-page__spec-group">
              <h3>Základní údaje</h3>
              <div className="ad-detail-page__spec-item">
                <span className="ad-detail-page__spec-label">Značka</span>
                <span className="ad-detail-page__spec-value">{formatBrand(ad.brand) ?? '-'}</span>
              </div>
              <div className="ad-detail-page__spec-item">
                <span className="ad-detail-page__spec-label">Model</span>
                <span className="ad-detail-page__spec-value">{formatModel(ad.brand, ad.model) ?? '-'}</span>
              </div>
              <div className="ad-detail-page__spec-item">
                <span className="ad-detail-page__spec-label">Rok výroby</span>
                <span className="ad-detail-page__spec-value">{ad.year ?? '-'}</span>
              </div>
              <div className="ad-detail-page__spec-item">
                <span className="ad-detail-page__spec-label">Nájezd</span>
                <span className="ad-detail-page__spec-value">{ad.mileage?.toLocaleString()} km</span>
              </div>
              <div className="ad-detail-page__spec-item">
                <span className="ad-detail-page__spec-label">První registrace</span>
                <span className="ad-detail-page__spec-value">{ad.firstRegistration ?? '-'}</span>
              </div>
              <div className="ad-detail-page__spec-item">
                <span className="ad-detail-page__spec-label">Stav</span>
                <span className="ad-detail-page__spec-value">{conditionMap[ad.condition] ?? ad.condition ?? '-'}</span>
              </div>
            </div>

            <div className="ad-detail-page__spec-group">
              <h3>Motor a výkon</h3>
              <div className="ad-detail-page__spec-item">
                <span className="ad-detail-page__spec-label">Palivo</span>
                <span className="ad-detail-page__spec-value">{fuelMap[ad.fuel] ?? ad.fuel ?? '-'}</span>
              </div>
              <div className="ad-detail-page__spec-item">
                <span className="ad-detail-page__spec-label">Objem motoru</span>
                <span className="ad-detail-page__spec-value">{ad.engineVolume ? (ad.engineVolume / 1000).toFixed(1) + 'L' : '-'}</span>
              </div>
              <div className="ad-detail-page__spec-item">
                <span className="ad-detail-page__spec-label">Výkon</span>
                <span className="ad-detail-page__spec-value">{ad.power ? `${ad.power} kW` : '-'}</span>
              </div>
              <div className="ad-detail-page__spec-item">
                <span className="ad-detail-page__spec-label">Spotřeba</span>
                <span className="ad-detail-page__spec-value">{ad.avgConsumption ? `${ad.avgConsumption} l/100km` : '-'}</span>
              </div>
              <div className="ad-detail-page__spec-item">
                <span className="ad-detail-page__spec-label">Euro norma</span>
                <span className="ad-detail-page__spec-value">{ad.euroStandard ?? '-'}</span>
              </div>
            </div>

            <div className="ad-detail-page__spec-group">
              <h3>Převodovka a podvozek</h3>
              <div className="ad-detail-page__spec-item">
                <span className="ad-detail-page__spec-label">Převodovka</span>
                <span className="ad-detail-page__spec-value">{transmissionMap[ad.transmission] ?? ad.transmission ?? '-'}</span>
              </div>
              <div className="ad-detail-page__spec-item">
                <span className="ad-detail-page__spec-label">Počet rychlostí</span>
                <span className="ad-detail-page__spec-value">{ad.gearCount ?? '-'}</span>
              </div>
              <div className="ad-detail-page__spec-item">
                <span className="ad-detail-page__spec-label">Pohon</span>
                <span className="ad-detail-page__spec-value">{ad.drivetrain ?? '-'}</span>
              </div>
            </div>

            <div className="ad-detail-page__spec-group">
              <h3>Karoserie a design</h3>
              <div className="ad-detail-page__spec-item">
                <span className="ad-detail-page__spec-label">Karoserie</span>
                <span className="ad-detail-page__spec-value">{ad.bodyType ?? '-'}</span>
              </div>
              <div className="ad-detail-page__spec-item">
                <span className="ad-detail-page__spec-label">Počet dveří</span>
                <span className="ad-detail-page__spec-value">{ad.doorCount ?? '-'}</span>
              </div>
              <div className="ad-detail-page__spec-item">
                <span className="ad-detail-page__spec-label">Počet míst</span>
                <span className="ad-detail-page__spec-value">{ad.seatCount ?? '-'}</span>
              </div>
              <div className="ad-detail-page__spec-item">
                <span className="ad-detail-page__spec-label">Barva</span>
                <span className="ad-detail-page__spec-value">{colorMap[ad.color] ?? ad.color ?? '-'}</span>
              </div>
              <div className="ad-detail-page__spec-item">
                <span className="ad-detail-page__spec-label">Lak</span>
                <span className="ad-detail-page__spec-value">{colorFinishMap[ad.colorFinish] ?? ad.colorFinish ?? '-'}</span>
              </div>
            </div>

            <div className="ad-detail-page__spec-group">
              <h3>Bezpečnost a komfort</h3>
              <div className="ad-detail-page__spec-item">
                <span className="ad-detail-page__spec-label">Airbagů</span>
                <span className="ad-detail-page__spec-value">{ad.airbagCount ?? '-'}</span>
              </div>
              <div className="ad-detail-page__spec-item">
                <span className="ad-detail-page__spec-label">Klimatizace</span>
                <span className="ad-detail-page__spec-value">{ad.airConditioning ?? '-'}</span>
              </div>
              <div className="ad-detail-page__spec-item">
                <span className="ad-detail-page__spec-label">První majitel</span>
                <span className="ad-detail-page__spec-value">{ad.isFirstOwner ? 'Ano' : 'Ne'}</span>
              </div>
              <div className="ad-detail-page__spec-item">
                <span className="ad-detail-page__spec-label">Servisní kniha</span>
                <span className="ad-detail-page__spec-value">{ad.hasServiceBook ? 'Ano' : 'Ne'}</span>
              </div>
              <div className="ad-detail-page__spec-item">
                <span className="ad-detail-page__spec-label">Havarované</span>
                <span className="ad-detail-page__spec-value">{ad.wasCrashed ? 'Ano' : 'Ne'}</span>
              </div>
            </div>

            <div className="ad-detail-page__spec-group">
              <h3>Dokumenty a poplatky</h3>
              <div className="ad-detail-page__spec-item">
                <span className="ad-detail-page__spec-label">STK do</span>
                <span className="ad-detail-page__spec-value">{ad.technicalCheckUntil ? new Date(ad.technicalCheckUntil).toLocaleDateString() : '-'}</span>
              </div>
              <div className="ad-detail-page__spec-item">
                <span className="ad-detail-page__spec-label">Záruka do</span>
                <span className="ad-detail-page__spec-value">{ad.warrantyUntil ? new Date(ad.warrantyUntil).toLocaleDateString() : '-'}</span>
              </div>
              <div className="ad-detail-page__spec-item">
                <span className="ad-detail-page__spec-label">Ekopoplatek</span>
                <span className="ad-detail-page__spec-value">{ad.ecoTaxPaid ? 'Zaplacen' : 'Nezaplacen'}</span>
              </div>
              <div className="ad-detail-page__spec-item">
                <span className="ad-detail-page__spec-label">Země původu</span>
                <span className="ad-detail-page__spec-value">{ad.countryOfOrigin ?? '-'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Popis */}
        {ad.description && (
          <section className="ad-detail-page__description">
            <h2 className="ad-detail-page__section-title">Popis</h2>
            <div className="ad-detail-page__description-content">
              <p>{ad.description}</p>
            </div>
          </section>
        )}

        {/* ✅ PŘIDÁNO - Mapa lokace */}
        {ad.latitude && ad.longitude && ad.address && (
          <section className="ad-detail-page__location">
            <AdMap 
              latitude={ad.latitude}
              longitude={ad.longitude}
              address={ad.address}
              height="300px"
            />
          </section>
        )}

        {/* Features */}
        {Array.isArray(ad.features) && ad.features.length > 0 && (
          <section className="ad-detail-page__features">
            <h2 className="ad-detail-page__section-title">Výbava</h2>
            <div className="ad-detail-page__features-list">
              {ad.features.map((feature: string, index: number) => (
                <span key={index} className="ad-detail-page__feature-tag">
                  {feature}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
      
     
    </main>
  )
}
