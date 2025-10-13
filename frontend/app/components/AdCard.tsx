'use client'
import Link from 'next/link'
import Image from 'next/image'
import FavoriteButton from './FavoriteButton'
import { formatCarTitle } from '../utils/CarFormatter'
import '../styles/components/AdCard.scss'
import { fuelMap } from '../utils/labelMaps'
import { getImageProps } from '../utils/imageOptimization'

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

  return (
    <div className="listing-card">
      <Link href={`/ads/${ad.id}`} className="listing-card__link">
        <div className="listing-card__image-container">
          <Image
            src={ad.images?.[0]?.url || '/no-image.png'}
            alt={ad.title}
            className="listing-card__image"
            fill
            {...getImageProps('card')}
            style={{ 
              objectFit: 'cover',
              objectPosition: 'center'
            }}
          />
        </div>
        
        <div className="listing-card__content">
          <h3 className="listing-card__title">
            {ad.title}
          </h3>
          
          <div className="listing-card__specs">
            {ad.brand && ad.model && (
              <span className="listing-card__spec">{formatCarTitle(ad.brand, ad.model)}</span>
            )}
            {ad.year && <span className="listing-card__spec">{ad.year}</span>}
            {ad.fuel && <span className="listing-card__spec">{fuelMap[ad.fuel] ?? ad.fuel}</span>}
          </div>
          
          <div className="listing-card__details">
            <div className="listing-card__detail-item">
              <span className="listing-card__detail-label">Nájezd</span>
              <span className="listing-card__detail-value">{ad.mileage?.toLocaleString()} km</span>
            </div>
            {ad.power && (
              <div className="listing-card__detail-item">
                <span className="listing-card__detail-label">Výkon</span>
                <span className="listing-card__detail-value">{ad.power} kW</span>
              </div>
            )}
          </div>
          
          <div className="listing-card__price">
            {ad.price?.toLocaleString()} Kč
          </div>
          
          {ad.address && (
            <div className="listing-card__location">
              📍 {ad.address}
              {ad.distance && <span> • {ad.distance} km</span>}
            </div>
          )}
        </div>
      </Link>
      
      <div className="listing-card__favorite">
        <FavoriteButton adId={ad.id.toString()} className="favorite-button--card" />
      </div>
    </div>
  )
}