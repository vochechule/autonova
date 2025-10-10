'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSwipeable } from 'react-swipeable'
import { useAuth } from '../../hooks/AuthProvider'
import { useToast } from '../../contexts/ToastContext'
import { NotFoundPage, NetworkErrorPage } from '../../components/ErrorPages'
import { PageLoading } from '../../components/LoadingStates'
import FavoriteButton from '../../components/FavoriteButton'
import ShareButton from '../../components/ShareButton'
import FullscreenImageGallery from '../../components/FullscreenImageGallery'
import { formatCarTitle } from '../../utils/CarFormatter'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Car, 
  Calendar,
  Gauge,
  Eye,
  Phone,
  Mail,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Zap,
  Settings,
  Wrench,
  Lock,
  AlertTriangle,
  Fuel,
} from 'lucide-react'
import AdMap from '../../components/AdMap'
import { 
  fuelMap, 
  transmissionMap, 
  drivetrainMap, 
  colorMap, 
  colorFinishMap, 
  conditionMap, 
  airConditioningMap 
} from '../../utils/labelMaps'
import { formatBrand, formatModel } from '../../utils/CarFormatter'
import '../../styles/AdDetailPage.scss'
import '../../styles/FullscreenImageGallery.scss'

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface AdImage {
  id: string;
  url: string;
  order?: number;
}

interface AdUser {
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  location?: string;
  averageRating?: number;
  reviewCount?: number;
}

interface AdType {
  id: string;
  title: string;
  brand: { name: string } | string;
  model: { name: string } | string;
  year: number;
  mileage: number;
  price: number;
  currency?: string;
  images: AdImage[];
  user?: AdUser;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  createdAt?: string;
  views?: number;
  bodyType?: string;
  transmission?: string;
  power?: number;
  engineVolume?: number;
  fuel?: string;
  gearCount?: number;
  drivetrain?: string;
  seatCount?: number;
  doorCount?: number;
  color?: string;
  colorFinish?: string;
  airbagCount?: number;
  airConditioning?: string;
  isFirstOwner?: boolean;
  hasServiceBook?: boolean;
  wasCrashed?: boolean;
  technicalCheckUntil?: string;
  warrantyUntil?: string;
  ecoTaxPaid?: boolean;
  countryOfOrigin?: string;
  avgConsumption?: number;
  description?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  features?: string[];
  condition?: string;
  firstRegistration?: string;
  euroStandard?: string;
  isDisabledAdapted?: boolean;
  safetyFeatures?: string;
  assistSystems?: string;
  securityFeatures?: string;
  interiorComfort?: string;
}

interface AdDetailClientProps {
  initialAd?: AdType;
}

export default function AdDetailClient({ initialAd }: AdDetailClientProps) {
  const params = useParams()
  const { showError } = useToast()
  const { user } = useAuth()
  
  const [ad, setAd] = useState<AdType | null>(initialAd || null)
  const [loading, setLoading] = useState(!initialAd)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imagesPreloaded, setImagesPreloaded] = useState(false)
  const [showPhone, setShowPhone] = useState(false)
  const [showEmail, setShowEmail] = useState(false)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)

  const nextImage = () => {
    if (ad?.images?.length) {
      setCurrentImageIndex((prev) => 
        prev === ad.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (ad?.images?.length) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? ad.images.length - 1 : prev - 1
      )
    }
  }

  const swipeHandlers = useSwipeable({
    onSwipedLeft: nextImage,
    onSwipedRight: prevImage,
    trackMouse: true
  })

  useEffect(() => {
    if (!initialAd && params?.id) {
      fetchAdData(params.id as string)
    }
  }, [params?.id, initialAd]) // eslint-disable-line react-hooks/exhaustive-deps

  // Preload all images when ad data is available
  useEffect(() => {
    if (ad?.images && ad.images.length > 0 && !imagesPreloaded) {
      const preloadImages = async () => {
        // Preload images immediately without waiting
        const imagePromises = ad.images.map((image, index) => {
          return new Promise<void>((resolve) => {
            const img = document.createElement('img')
            img.onload = () => resolve()
            img.onerror = () => resolve() // Don't fail on error, just continue
            
            // Set high priority for first few images
            if (index < 3) {
              img.loading = 'eager'
            }
            
            img.src = image.url
            
            // Also add to browser's image cache by setting it
            const link = document.createElement('link')
            link.rel = 'preload'
            link.as = 'image'
            link.href = image.url
            document.head.appendChild(link)
          })
        })

        // Don't wait for all to complete, set as preloaded quickly
        setTimeout(() => {
          setImagesPreloaded(true)
        }, 100)

        try {
          await Promise.allSettled(imagePromises) // Use allSettled instead of all
        } catch (error) {
          console.warn('Some images failed to preload:', error)
        }
      }

      preloadImages()
    }
  }, [ad?.images, imagesPreloaded])

  const fetchAdData = async (adId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${API_URL}/ad/${adId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('not-found')
          return
        }
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

  const handleRetry = () => {
    setError(null)
    if (params?.id) {
      fetchAdData(params.id as string)
    }
  }

  const handlePrev = () => {
    if (!ad?.images) return
    const newIndex = currentImageIndex === 0 ? ad.images.length - 1 : currentImageIndex - 1
    setCurrentImageIndex(newIndex)
  }

  const handleNext = () => {
    if (!ad?.images) return
    const newIndex = currentImageIndex === ad.images.length - 1 ? 0 : currentImageIndex + 1
    setCurrentImageIndex(newIndex)
  }

  const handleDotClick = (index: number) => {
    if (index === currentImageIndex) return
    setCurrentImageIndex(index)
  }

  const openGallery = () => {
    setIsGalleryOpen(true)
  }

  const closeGallery = () => {
    setIsGalleryOpen(false)
  }

  if (loading) {
    return <PageLoading />
  }

  if (error === 'not-found') {
    return <NotFoundPage />
  }

  if (error === 'network-error') {
    return <NetworkErrorPage onRetry={handleRetry} />
  }

  if (!ad) {
    return <NotFoundPage />
  }

  const getBrandName = (brand: { name: string } | string) => {
    return typeof brand === 'string' ? brand : brand?.name || 'Neznámá značka'
  }

  const getModelName = (model: { name: string } | string) => {
    return typeof model === 'string' ? model : model?.name || 'Neznámý model'
  }

  const brandName = getBrandName(ad.brand)
  const modelName = getModelName(ad.model)
  const carTitle = formatCarTitle(brandName, modelName)

  return (
    <>
      <main className="listing-detail-page">
        <div className="listing-detail-page__container">
          <div className="listing-detail-page__header">
            <button 
              className="listing-detail-page__back-btn"
              onClick={() => window.history.back()}
              aria-label="Zpět"
            >
              <ArrowLeft size={20} />
              Zpět
            </button>
            
            <div className="listing-detail-page__price">{ad.price?.toLocaleString()} Kč</div>
            
            <div className="listing-detail-page__actions">
              <ShareButton 
                title={carTitle}
                url={typeof window !== 'undefined' ? window.location.href : ''}
                className="listing-detail-page__share-btn"
              />
              {user && <FavoriteButton adId={ad.id} className="listing-detail-page__favorite-btn" />}
            </div>
          </div>

          <div className="listing-detail-page__main-content">
            <div className="listing-detail-page__carousel" {...swipeHandlers}>
              {ad.images && ad.images.length > 0 ? (
                <>
                  <>
                    {/* Visible current image */}
                    <div 
                      className="listing-detail-page__carousel-img-container"
                      onClick={openGallery}
                      style={{ cursor: 'pointer' }}
                    >
                      <Image
                        src={ad.images[currentImageIndex].url}
                        alt={ad.title}
                        className="listing-detail-page__carousel-img"
                        width={800}
                        height={600}
                        style={{ 
                          objectFit: 'cover'
                        }}
                        priority={true}
                        loading="eager"
                        unoptimized={true}
                      />
                    </div>
                    
                    {/* Hidden preloaded images for next/prev */}
                    {ad.images.map((image, index) => {
                      if (index === currentImageIndex) return null
                      
                      // Only preload adjacent images and first few
                      const isAdjacent = Math.abs(index - currentImageIndex) <= 1 || 
                                        (currentImageIndex === 0 && index === ad.images.length - 1) ||
                                        (currentImageIndex === ad.images.length - 1 && index === 0)
                      const isEarly = index < 3
                      
                      if (!isAdjacent && !isEarly) return null
                      
                      return (
                        <Image
                          key={`preload-${index}`}
                          src={image.url}
                          alt=""
                          width={800}
                          height={600}
                          style={{ 
                            position: 'absolute',
                            opacity: 0,
                            pointerEvents: 'none',
                            zIndex: -1
                          }}
                          priority={isAdjacent}
                          loading="eager"
                          unoptimized={true}
                        />
                      )
                    })}
                  </>
                  
                  {ad.images.length > 1 && (
                    <>
                      <button 
                        className="listing-detail-page__carousel-btn left" 
                        onClick={handlePrev} 
                        aria-label="Předchozí obrázek"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button 
                        className="listing-detail-page__carousel-btn right" 
                        onClick={handleNext} 
                        aria-label="Další obrázek"
                      >
                        <ChevronRight size={16} />
                      </button>
                      <div className="listing-detail-page__carousel-counter">
                        {currentImageIndex + 1} / {ad.images.length}
                      </div>
                    </>
                  )}
                  
                  {ad.images.length > 1 && (
                    <div className="listing-detail-page__carousel-dots">
                      {ad.images.map((img, i) => {
                        if (Math.abs(i - currentImageIndex) > 2) return null
                        return (
                          <button
                            key={img.id || i}
                            className={`listing-detail-page__carousel-dot${i === currentImageIndex ? ' active' : ''}`}
                            onClick={() => handleDotClick(i)}
                            aria-label={`Obrázek ${i + 1}`}
                          />
                        )
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className="listing-detail-page__no-image">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
                    <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span>Žádné obrázky</span>
                </div>
              )}
            </div>

            <div className="listing-detail-page__basic-info">
              <h1 className="listing-detail-page__title">
               {carTitle}
              </h1>
              
              <div className="listing-detail-page__meta-info">
                {ad.createdAt && (
                  <div className="listing-detail-page__date-added">
                    <Calendar size={16} />
                    Přidáno {new Date(ad.createdAt).toLocaleDateString('cs-CZ')}
                  </div>
                )}
                
                {ad.views !== undefined && (
                  <div className="listing-detail-page__views">
                    <Eye size={16} />
                    {ad.views.toLocaleString()} zobrazení
                  </div>
                )}
              </div>
              
              <div className="listing-detail-page__key-specs">
                <div className="listing-detail-page__key-spec">
                  <Gauge className="listing-detail-page__key-spec-icon" size={18} />
                  <span>{ad.mileage?.toLocaleString()} km</span>
                </div>
                <div className="listing-detail-page__key-spec">
                  <Fuel className="listing-detail-page__key-spec-icon" size={18} />
                  <span>{ad.fuel ? fuelMap[ad.fuel as string] ?? ad.fuel : '-'}</span>
                </div>
                <div className="listing-detail-page__key-spec">
                  <Car className="listing-detail-page__key-spec-icon" size={18} />
                  <span>{ad.bodyType}</span>
                </div>
                <div className="listing-detail-page__key-spec">
                  <Settings className="listing-detail-page__key-spec-icon" size={18} />
                  <span className="listing-detail-page__spec-value">
                    {ad.transmission ? transmissionMap[ad.transmission as string] ?? ad.transmission : '-'}
                  </span>              
                </div>
                {ad.power && (
                  <div className="listing-detail-page__key-spec">
                    <Zap className="listing-detail-page__key-spec-icon" size={18} />
                    <span>{ad.power} kW</span>
                  </div>
                )}
                {ad.engineVolume && (
                  <div className="listing-detail-page__key-spec">
                    <Wrench className="listing-detail-page__key-spec-icon" size={18} />
                    <span>{(ad.engineVolume / 1000).toFixed(1)}L</span>
                  </div>
                )}
              </div>

              <div className="listing-detail-page__seller-compact">
                <div className="listing-detail-page__seller-avatar">
                  {ad.user?.avatar
                    ? <Image src={ad.user.avatar} alt="avatar" width={48} height={48} style={{ borderRadius: '50%' }} />
                    : <div className="listing-detail-page__seller-avatar-placeholder">
                        {(ad.user?.firstName?.charAt(0) || ad.contactName?.charAt(0) || 'U')}
                      </div>}
                </div>
                <div className="listing-detail-page__seller-details">
                  <div className="listing-detail-page__seller-name">
                    {ad.user?.firstName && ad.user?.lastName 
                      ? `${ad.user.firstName} ${ad.user.lastName}`
                      : ad.contactName || `${ad.user?.name}`}
                  </div>
                  
                  <div className="listing-detail-page__seller-location">
                    {ad.user?.location || ad.address || 'Neuvedeno'}
                  </div>
                  
                  {(() => {
                    const hasRating = ad.user?.averageRating !== undefined && ad.user?.averageRating > 0
                    return hasRating
                  })() && (
                    <div className="listing-detail-page__seller-rating">
                      <div className="listing-detail-page__stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg 
                            key={star}
                            width="14" 
                            height="14" 
                            viewBox="0 0 24 24" 
                            fill={star <= (ad.user?.averageRating || 0) ? '#fbbf24' : '#e5e7eb'}
                            className="listing-detail-page__star"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        ))}
                      </div>
                      <span className="listing-detail-page__rating-text">
                        {(ad.user?.averageRating || 0).toFixed(1)}
                        {ad.user?.reviewCount !== undefined && ` (${ad.user.reviewCount} hodnocení)`}
                      </span>
                    </div>
                  )}
                  
                  <div className="listing-detail-page__contact-info">
                    {user ? (
                      <>
                        {ad.contactPhone && (
                          <div className="listing-detail-page__contact-item">
                            {!showPhone ? (
                              <button 
                                onClick={() => setShowPhone(true)}
                                className="listing-detail-page__reveal-btn"
                              >
                                <Phone className="contact-icon" size={16} />
                                Ukázat telefon
                              </button>
                            ) : (
                              <a href={`tel:${ad.contactPhone}`} className="listing-detail-page__contact-link">
                                <Phone className="contact-icon" size={16} />
                                {ad.contactPhone}
                              </a>
                            )}
                          </div>
                        )}
                        
                        {ad.contactEmail && (
                          <div className="listing-detail-page__contact-item">
                            {!showEmail ? (
                              <button 
                                onClick={() => setShowEmail(true)}
                                className="listing-detail-page__reveal-btn"
                              >
                                <Mail className="contact-icon" size={16} />
                                Ukázat email
                              </button>
                            ) : (
                              <a href={`mailto:${ad.contactEmail}`} className="listing-detail-page__contact-link">
                                <Mail className="contact-icon" size={16} />
                                {ad.contactEmail}
                              </a>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="listing-detail-page__contact-locked">
                        <Lock className="contact-icon" size={32} />
                        <span>Pro zobrazení kontaktu se musíte registrovat nebo přihlásit</span>
                        <div className="listing-detail-page__auth-buttons">
                          <Link href="/login" className="listing-detail-page__auth-btn primary">
                            Přihlásit se
                          </Link>
                          <Link href="/register" className="listing-detail-page__auth-btn secondary">
                            Registrovat
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {user ? (
                  <Link href={`/profile/${ad.user?.id}`} className="listing-detail-page__contact-btn">
                    Profil prodejce
                  </Link>
                ) : (
                  <Link href="/login" className="listing-detail-page__contact-btn">
                    Přihlásit se
                  </Link>
                )}
              </div>
            </div>
          </div>

          {ad.description && (
            <section className="listing-detail-page__description">
              <h2 className="listing-detail-page__section-title">Popis</h2>
              <div className="listing-detail-page__description-content">
                <p>{ad.description}</p>
              </div>
            </section>
          )}

          <section className="listing-detail-page__specs">
            <h2 className="listing-detail-page__section-title">Specifikace</h2>
            <div className="listing-detail-page__specgrid">
              <div className="listing-detail-page__spec-group">
                <h3>Základní údaje</h3>
                <div className="listing-detail-page__spec-item">
                  <span className="listing-detail-page__spec-label">Značka</span>
                  <span className="listing-detail-page__spec-value">{formatBrand(brandName) ?? '-'}</span>
                </div>
                <div className="listing-detail-page__spec-item">
                  <span className="listing-detail-page__spec-label">Model</span>
                  <span className="listing-detail-page__spec-value">{formatModel(brandName, modelName) ?? '-'}</span>
                </div>
                <div className="listing-detail-page__spec-item">
                  <span className="listing-detail-page__spec-label">Rok výroby</span>
                  <span className="listing-detail-page__spec-value">{ad.year ?? '-'}</span>
                </div>
                <div className="listing-detail-page__spec-item">
                  <span className="listing-detail-page__spec-label">Nájezd</span>
                  <span className="listing-detail-page__spec-value">{ad.mileage?.toLocaleString()} km</span>
                </div>
                <div className="listing-detail-page__spec-item">
                  <span className="listing-detail-page__spec-label">První registrace</span>
                  <span className="listing-detail-page__spec-value">{ad.firstRegistration ?? '-'}</span>
                </div>
                <div className="listing-detail-page__spec-item">
                  <span className="listing-detail-page__spec-label">Stav</span>
                  <span className="listing-detail-page__spec-value">
                    {ad.condition ? conditionMap[ad.condition as string] ?? ad.condition : '-'}
                  </span>
                </div>
              </div>

              <div className="listing-detail-page__spec-group">
                <h3>Motor a výkon</h3>
                <div className="listing-detail-page__spec-item">
                  <span className="listing-detail-page__spec-label">Palivo</span>
                  <span className="listing-detail-page__spec-value">{ad.fuel ? fuelMap[ad.fuel as string] ?? ad.fuel : '-'}</span>
                </div>
                <div className="listing-detail-page__spec-item">
                  <span className="listing-detail-page__spec-label">Objem motoru</span>
                  <span className="listing-detail-page__spec-value">{ad.engineVolume ? (ad.engineVolume / 1000).toFixed(1) + 'L' : '-'}</span>
                </div>
                <div className="listing-detail-page__spec-item">
                  <span className="listing-detail-page__spec-label">Výkon</span>
                  <span className="listing-detail-page__spec-value">
                    {ad.power 
                      ? `${ad.power} kW (${Math.round(ad.power * 1.35962)} koní)` 
                      : '-'}
                  </span>
                </div>
                <div className="listing-detail-page__spec-item">
                  <span className="listing-detail-page__spec-label">Spotřeba</span>
                  <span className="listing-detail-page__spec-value">{ad.avgConsumption ? `${ad.avgConsumption} l/100km` : '-'}</span>
                </div>
                <div className="listing-detail-page__spec-item">
                  <span className="listing-detail-page__spec-label">Euro norma</span>
                  <span className="listing-detail-page__spec-value">{ad.euroStandard ?? '-'}</span>
                </div>
              </div>

              <div className="listing-detail-page__spec-group">
                <h3>Převodovka a podvozek</h3>
                <div className="listing-detail-page__spec-item">
                  <span className="listing-detail-page__spec-label">Převodovka</span>
                  <span className="listing-detail-page__spec-value">{ad.transmission ? transmissionMap[ad.transmission as string] ?? ad.transmission : '-'}</span>
                </div>
                <div className="listing-detail-page__spec-item">
                  <span className="listing-detail-page__spec-label">Počet rychlostí</span>
                  <span className="listing-detail-page__spec-value">{ad.gearCount ?? '-'}</span>
                </div>
                <div className="listing-detail-page__spec-item">
                  <span className="listing-detail-page__spec-label">Pohon</span>
                  <span className="listing-detail-page__spec-value">
                    {ad.drivetrain ? drivetrainMap[ad.drivetrain as string] ?? ad.drivetrain : '-'}
                  </span>
                </div>
              </div>

              <div className="listing-detail-page__spec-group">
                <h3>Karoserie a design</h3>
                <div className="listing-detail-page__spec-item">
                  <span className="listing-detail-page__spec-label">Karoserie</span>
                  <span className="listing-detail-page__spec-value">{ad.bodyType ?? '-'}</span>
                </div>
                <div className="listing-detail-page__spec-item">
                  <span className="listing-detail-page__spec-label">Počet dveří</span>
                  <span className="listing-detail-page__spec-value">{ad.doorCount ?? '-'}</span>
                </div>
                <div className="listing-detail-page__spec-item">
                  <span className="listing-detail-page__spec-label">Počet míst</span>
                  <span className="listing-detail-page__spec-value">{ad.seatCount ?? '-'}</span>
                </div>
                <div className="listing-detail-page__spec-item">
                  <span className="listing-detail-page__spec-label">Barva</span>
                  <span className="listing-detail-page__spec-value">{ad.color ? colorMap[ad.color as string] ?? ad.color : '-'}</span>
                </div>
                <div className="listing-detail-page__spec-item">
                  <span className="listing-detail-page__spec-label">Lak</span>
                  <span className="listing-detail-page__spec-value">{ad.colorFinish ? colorFinishMap[ad.colorFinish as string] ?? ad.colorFinish : '-'}</span>
                </div>
              </div>

              <div className="listing-detail-page__spec-group">
                <h3>Bezpečnost a komfort</h3>
                <div className="listing-detail-page__spec-item">
                  <span className="listing-detail-page__spec-label">Airbagů</span>
                  <span className="listing-detail-page__spec-value">{ad.airbagCount ?? '-'}</span>
                </div>
                <div className="listing-detail-page__spec-item">
                  <span className="listing-detail-page__spec-label">Klimatizace</span>
                  <span className="listing-detail-page__spec-value">
                    {ad.airConditioning ? airConditioningMap[ad.airConditioning as string] ?? ad.airConditioning : '-'}
                  </span>
                </div>
                <div className="listing-detail-page__spec-item">
                  <span className="listing-detail-page__spec-label">První majitel</span>
                  <span className="listing-detail-page__spec-value">{ad.isFirstOwner ? 'Ano' : 'Ne'}</span>
                </div>
                <div className="listing-detail-page__spec-item">
                  <span className="listing-detail-page__spec-label">Servisní kniha</span>
                  <span className="listing-detail-page__spec-value">{ad.hasServiceBook ? 'Ano' : 'Ne'}</span>
                </div>
                <div className="listing-detail-page__spec-item">
                  <span className="listing-detail-page__spec-label">Havarované</span>
                  <span className="listing-detail-page__spec-value">{ad.wasCrashed ? 'Ano' : 'Ne'}</span>
                </div>
              </div>

              <div className="listing-detail-page__spec-group">
                <h3>Dokumenty a poplatky</h3>
                <div className="listing-detail-page__spec-item">
                  <span className="listing-detail-page__spec-label">STK do</span>
                  <span className="listing-detail-page__spec-value">{ad.technicalCheckUntil ? new Date(ad.technicalCheckUntil).toLocaleDateString() : '-'}</span>
                </div>
                <div className="listing-detail-page__spec-item">
                  <span className="listing-detail-page__spec-label">Záruka do</span>
                  <span className="listing-detail-page__spec-value">{ad.warrantyUntil ? new Date(ad.warrantyUntil).toLocaleDateString() : '-'}</span>
                </div>
                <div className="listing-detail-page__spec-item">
                  <span className="listing-detail-page__spec-label">Úprava pro ZTP</span>
                  <span className="listing-detail-page__spec-value">{ad.isDisabledAdapted ? 'Ano' : 'Ne'}</span>
                </div>
                <div className="listing-detail-page__spec-item">
                  <span className="listing-detail-page__spec-label">Země původu</span>
                  <span className="listing-detail-page__spec-value">{ad.countryOfOrigin ?? '-'}</span>
                </div>
              </div>
            </div>
          </section>

          {(ad.safetyFeatures || ad.assistSystems || ad.securityFeatures || ad.interiorComfort) && (
            <section className="listing-detail-page__additional-info">
              <h2 className="listing-detail-page__section-title">Další informace o vozidle</h2>
              
              {ad.safetyFeatures && (
                <div className="listing-detail-page__info-block">
                  <h3>Bezpečnostní systémy</h3>
                  <div className="listing-detail-page__info-content">
                    <p>{ad.safetyFeatures}</p>
                  </div>
                </div>
              )}
              
              {ad.assistSystems && (
                <div className="listing-detail-page__info-block">
                  <h3>Asistenční systémy</h3>
                  <div className="listing-detail-page__info-content">
                    <p>{ad.assistSystems}</p>
                  </div>
                </div>
              )}
              
              {ad.securityFeatures && (
                <div className="listing-detail-page__info-block">
                  <h3>Zabezpečení vozidla</h3>
                  <div className="listing-detail-page__info-content">
                    <p>{ad.securityFeatures}</p>
                  </div>
                </div>
              )}
              
              {ad.interiorComfort && (
                <div className="listing-detail-page__info-block">
                  <h3>Vnitřní výbava a komfort</h3>
                  <div className="listing-detail-page__info-content">
                    <p>{ad.interiorComfort}</p>
                  </div>
                </div>
              )}
            </section>
          )}

          {ad.latitude && ad.longitude && ad.address && (
            <section className="listing-detail-page__location">
              <AdMap 
                latitude={ad.latitude}
                longitude={ad.longitude}
                address={ad.address}
                height="300px"
              />
            </section>
          )}

          {Array.isArray(ad.features) && ad.features.length > 0 && (
            <section className="listing-detail-page__features">
              <h2 className="listing-detail-page__section-title">Výbava</h2>
              <div className="listing-detail-page__features-list">
                {ad.features.map((feature: string, index: number) => (
                  <span key={index} className="listing-detail-page__feature-tag">
                    {feature}
                  </span>
                ))}
              </div>
            </section>
          )}

        </div>
        
        <footer className="listing-detail-page__disclaimer">
          <AlertTriangle size={20} style={{marginRight: 8, verticalAlign: 'middle'}} />
          <span>
            <b>Carta.cz</b> není prodejcem vozidel a neručí za pravdivost údajů v inzerátech ani za kvalitu prodávaných vozidel. Kupující i prodávající jednají na vlastní odpovědnost.
          </span>
        </footer>
      </main>
      
      {/* Fullscreen Image Gallery */}
      {ad.images && ad.images.length > 0 && (
        <FullscreenImageGallery
          images={ad.images}
          isOpen={isGalleryOpen}
          onClose={closeGallery}
          initialIndex={currentImageIndex}
          adTitle={carTitle}
        />
      )}
    </>
  )
}
