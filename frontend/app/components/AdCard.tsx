'use client'
import Link from 'next/link'
import FavoriteButton from './FavoriteButton'
import { formatCarTitle } from '../utils/CarFormatter'
import '../styles/components/AdCard.scss'
import { fuelMap, transmissionMap, colorMap } from '../utils/labelMaps'

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

interface AdCardProps {
  ad: Ad
}

export default function AdCard({ ad }: AdCardProps) {
  console.log('AdCard render', ad.id);

  return (
    <div className="ad-card">
      <Link href={`/ads/${ad.id}`} className="ad-card__link">
        <div className="ad-card__image-container">
          <img
            src={ad.images?.[0]?.url || '/no-image.png'}
            alt={ad.title}
            className="ad-card__image"
            loading="lazy"
          />
        </div>
        
        <div className="ad-card__content">
          <h3 className="ad-card__title">
            {ad.title}
          </h3>
          
          <div className="ad-card__specs">
            {ad.brand && ad.model && (
              <span className="ad-card__spec">{formatCarTitle(ad.brand, ad.model)}</span>
            )}
            {ad.year && <span className="ad-card__spec">{ad.year}</span>}
            {ad.fuel && <span className="ad-card__spec">{fuelMap[ad.fuel] ?? ad.fuel}</span>}
          </div>
          
          <div className="ad-card__details">
            <div className="ad-card__detail-item">
              <span className="ad-card__detail-label">Nájezd</span>
              <span className="ad-card__detail-value">{ad.mileage?.toLocaleString()} km</span>
            </div>
            {ad.power && (
              <div className="ad-card__detail-item">
                <span className="ad-card__detail-label">Výkon</span>
                <span className="ad-card__detail-value">{ad.power} kW</span>
              </div>
            )}
          </div>
          
          <div className="ad-card__price">
            {ad.price?.toLocaleString()} Kč
          </div>
          
          {ad.address && (
            <div className="ad-card__location">
              📍 {ad.address}
              {ad.distance && <span> • {ad.distance} km</span>}
            </div>
          )}
        </div>
      </Link>
      
      <div className="ad-card__favorite">
        <FavoriteButton adId={ad.id.toString()} className="favorite-button--card" />
      </div>
    </div>
  )
}