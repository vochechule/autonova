// AdDetailClient.tsx - Simple client component with pre-fetched data
'use client'
import { formatCarTitle } from '../../utils/CarFormatter'
import { fuelMap } from '../../utils/labelMaps'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Car, 
  Calendar,
  Eye,
  Phone,
  Mail,
  ArrowLeft,
} from 'lucide-react'

interface AdType {
  id: number
  title: string
  description: string
  price: number
  currency: string
  year: number
  mileage: number
  location: string
  images: Array<{ id: string; url: string; order: number }>
  brand: { name: string }
  model: { name: string }
  fuel: string
  transmission: string
  condition: string
  bodyType: string
  color: string
  user: {
    name: string
    location: string
  }
  contactPhone?: string
  contactEmail?: string
  views?: number
  createdAt: string
  updatedAt: string
}

interface AdDetailClientProps {
  initialAd: AdType
}

export default function AdDetailClient({ initialAd: ad }: AdDetailClientProps) {
  const carTitle = formatCarTitle(ad.brand.name, ad.model.name)
  const sortedImages = ad.images?.sort((a, b) => a.order - b.order) || []
  
  return (
    <div className="ad-detail-page">
      {/* Navigation */}
      <div className="ad-detail-nav">
        <Link href="/ads" className="back-button">
          <ArrowLeft size={20} />
          Zpět na přehled
        </Link>
      </div>

      {/* Main content */}
      <div className="ad-detail-container">
        {/* Image gallery */}
        {sortedImages.length > 0 && (
          <div className="image-gallery">
            <div className="main-image-container">
              <Image
                src={sortedImages[0]?.url || '/default-car.jpg'}
                alt={carTitle}
                width={800}
                height={600}
                className="main-image"
                priority
              />
            </div>

            {/* Additional images */}
            {sortedImages.length > 1 && (
              <div className="thumbnail-grid">
                {sortedImages.slice(1).map((img, index) => (
                  <div key={img.id} className="thumbnail">
                    <Image
                      src={img.url}
                      alt={`${carTitle} - obrázek ${index + 2}`}
                      width={150}
                      height={100}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Ad info */}
        <div className="ad-info">
          <div className="ad-header">
            <h1 className="ad-title">{carTitle} ({ad.year})</h1>
          </div>

          <div className="price-container">
            <span className="price">
              {ad.price?.toLocaleString('cs-CZ')} {ad.currency}
            </span>
          </div>

          {/* Basic specs */}
          <div className="basic-specs">
            <div className="spec-item">
              <Calendar size={18} />
              <span>{ad.year}</span>
            </div>
            <div className="spec-item">
              <Car size={18} />
              <span>{ad.mileage?.toLocaleString('cs-CZ')} km</span>
            </div>
            <div className="spec-item">
              <span>{fuelMap[ad.fuel] || ad.fuel}</span>
            </div>
            {ad.views && (
              <div className="spec-item">
                <Eye size={18} />
                <span>{ad.views} zobrazení</span>
              </div>
            )}
          </div>

          {/* Description */}
          {ad.description && (
            <div className="description-section">
              <h3>Popis</h3>
              <p>{ad.description}</p>
            </div>
          )}

          {/* Contact info */}
          <div className="contact-section">
            <h3>Kontakt</h3>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-name">
                  {ad.user?.name || 'Neposkytnut'}
                </span>
                {ad.user?.location && (
                  <span className="contact-location">{ad.user.location}</span>
                )}
              </div>
              
              {ad.contactPhone && (
                <div className="contact-item">
                  <Phone size={18} />
                  <a href={`tel:${ad.contactPhone}`}>{ad.contactPhone}</a>
                </div>
              )}
              
              {ad.contactEmail && (
                <div className="contact-item">
                  <Mail size={18} />
                  <a href={`mailto:${ad.contactEmail}`}>{ad.contactEmail}</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}