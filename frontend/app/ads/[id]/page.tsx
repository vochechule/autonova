'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSwipeable } from 'react-swipeable'
import FavoriteButton from '../../components/FavoriteButton'
import '../../styles/AdDetailPage.scss'
import Link from 'next/link'

export default function AdDetailPage() {
  const { id } = useParams()
  const [ad, setAd] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [imgIndex, setImgIndex] = useState(0)

  useEffect(() => {
    fetch(`http://localhost:3000/ad/${id}`)
      .then(res => res.json())
      .then(data => {
        setAd(data);
        setLoading(false);
      });
  }, [id])

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

  if (loading) return <main className="ad-detail-page">Načítám...</main>
  if (!ad) return <main className="ad-detail-page">Inzerát nebyl nalezen.</main>

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
          
          <FavoriteButton adId={ad.id} className="ad-detail-page__favorite-btn" />
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
              {ad.brand} {ad.model}
            </h1>
            <div className="ad-detail-page__subtitle">
              {ad.year} &bull; {ad.mileage?.toLocaleString()} km &bull; {ad.fuel}
            </div>
            
            {/* Klíčové specs */}
            <div className="ad-detail-page__key-specs">
              <div className="ad-detail-page__key-spec">
                <span className="ad-detail-page__key-spec-icon">🚗</span>
                <span>{ad.bodyType}</span>
              </div>
              <div className="ad-detail-page__key-spec">
                <span className="ad-detail-page__key-spec-icon">⚙️</span>
                <span>{ad.transmission}</span>
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

            {/* Prodejce info */}
            <div className="ad-detail-page__seller-compact">
              <div className="ad-detail-page__seller-avatar">
                {ad.user?.avatar
                  ? <img src={ad.user.avatar} alt="avatar" />
                  : <div className="ad-detail-page__seller-avatar-placeholder">
                      {ad.user?.name?.charAt(0) || 'U'}
                    </div>}
              </div>
              <div className="ad-detail-page__seller-details">
                <div className="ad-detail-page__seller-name">{ad.user?.name ?? 'Neznámý uživatel'}</div>
                <div className="ad-detail-page__seller-location">{ad.user?.location ?? 'Neuvedeno'}</div>
              </div>
              <Link href={`/profile/${ad.user?.id}`} className="ad-detail-page__contact-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
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
                <span className="ad-detail-page__spec-value">{ad.brand ?? '-'}</span>
              </div>
              <div className="ad-detail-page__spec-item">
                <span className="ad-detail-page__spec-label">Model</span>
                <span className="ad-detail-page__spec-value">{ad.model ?? '-'}</span>
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
                <span className="ad-detail-page__spec-value">{ad.condition ?? '-'}</span>
              </div>
            </div>

            <div className="ad-detail-page__spec-group">
              <h3>Motor a výkon</h3>
              <div className="ad-detail-page__spec-item">
                <span className="ad-detail-page__spec-label">Palivo</span>
                <span className="ad-detail-page__spec-value">{ad.fuel ?? '-'}</span>
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
                <span className="ad-detail-page__spec-value">{ad.transmission ?? '-'}</span>
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
                <span className="ad-detail-page__spec-value">{ad.color ?? '-'}</span>
              </div>
              <div className="ad-detail-page__spec-item">
                <span className="ad-detail-page__spec-label">Lak</span>
                <span className="ad-detail-page__spec-value">{ad.colorFinish ?? '-'}</span>
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
      
      {/* Floating favorite button */}
      <FavoriteButton adId={ad.id} className="favorite-button--floating" />
    </main>
  )
}
