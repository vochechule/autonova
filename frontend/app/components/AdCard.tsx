'use client'
import Link from 'next/link'
import Image from 'next/image'
import FavoriteButton from './FavoriteButton'
import { formatCarTitle } from '../utils/CarFormatter'
import '../styles/components/AdCard.scss'
import { fuelMap } from '../utils/labelMaps'

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
            sizes="(max-width: 768px) 100vw, (max-width: 1199px) 50vw, (max-width: 1399px) 33vw, 25vw"
            style={{ 
              objectFit: 'cover',
              objectPosition: 'center'
            }}
            priority={false}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
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