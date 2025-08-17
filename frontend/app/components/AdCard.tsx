'use client'
import Link from 'next/link'
import FavoriteButton from './FavoriteButton'
import { formatCarTitle } from '../utils/CarFormatter'
import '../styles/components/AdCard.scss'

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
  viewMode: 'grid' | 'list'
}

export default function AdCard({ ad, viewMode }: AdCardProps) {
  if (viewMode === 'grid') {
    return <GridCard ad={ad} />
  }
  
  return <ListCard ad={ad} />
}

// ✅ GRID CARD COMPONENT (bez změn)
function GridCard({ ad }: { ad: Ad }) {
  return (
    <div className="ad-card ad-card--grid">
      <Link href={`/ads/${ad.id}`} className="ad-card__link">
        <div className="ad-card__image-container ad-card__image-container--grid">
          <img
            src={ad.images?.[0]?.url || '/no-image.png'}
            alt={ad.title}
            className="ad-card__image"
            loading="lazy"
          />
        </div>
        
        <div className="ad-card__content ad-card__content--grid">
          <h3 className="ad-card__title ad-card__title--grid">
            {ad.title}
          </h3>
          
          <div className="ad-card__specs">
            {ad.brand && ad.model && (
              <span className="ad-card__spec">{formatCarTitle(ad.brand, ad.model)}</span>
            )}
            {ad.year && <span className="ad-card__spec">{ad.year}</span>}
            {ad.fuel && <span className="ad-card__spec">{ad.fuel}</span>}
          </div>
          
          <div className="ad-card__details ad-card__details--grid">
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
          
          <div className="ad-card__price ad-card__price--grid">
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

// ✅ LIST CARD COMPONENT - OPRAVENO pro desktop + mobile
function ListCard({ ad }: { ad: Ad }) {
  return (
    <div className="ad-card ad-card--list">
      <Link href={`/ads/${ad.id}`} className="ad-card__link">
        <div className="ad-card__image-container ad-card__image-container--list">
          <img
            src={ad.images?.[0]?.url || '/no-image.png'}
            alt={ad.title}
            className="ad-card__image"
            loading="lazy"
          />
        </div>
        
        <div className="ad-card__content ad-card__content--list">
          {/* ✅ DESKTOP LAYOUT - pouze na široké obrazovky */}
          <div className="ad-card__desktop-layout">
            <div className="ad-card__header">
              <h3 className="ad-card__title ad-card__title--list">
                {ad.title}
              </h3>
              
              <div className="ad-card__specs ad-card__specs--list">
                {ad.brand && ad.model && (
                  <span className="ad-card__spec">{formatCarTitle(ad.brand, ad.model)}</span>
                )}
                {ad.year && <span className="ad-card__spec">{ad.year}</span>}
                {ad.fuel && <span className="ad-card__spec">{ad.fuel}</span>}
                {ad.bodyType && <span className="ad-card__spec">{ad.bodyType}</span>}
                {ad.transmission && <span className="ad-card__spec">{ad.transmission}</span>}
              </div>
            </div>
            
            <div className="ad-card__details ad-card__details--list">
              <div className="ad-card__detail-row">
                <span className="ad-card__detail-label">Nájezd:</span>
                <span className="ad-card__detail-value">{ad.mileage?.toLocaleString()} km</span>
              </div>
              {ad.power && (
                <div className="ad-card__detail-row">
                  <span className="ad-card__detail-label">Výkon:</span>
                  <span className="ad-card__detail-value">{ad.power} kW</span>
                </div>
              )}
              {ad.color && (
                <div className="ad-card__detail-row">
                  <span className="ad-card__detail-label">Barva:</span>
                  <span className="ad-card__detail-value">{ad.color}</span>
                </div>
              )}
              {ad.address && (
                <div className="ad-card__detail-row">
                  <span className="ad-card__detail-label">Lokalita:</span>
                  <span className="ad-card__detail-value">
                    📍 {ad.address}
                    {ad.distance && (
                      <span className="ad-card__distance"> • {ad.distance} km</span>
                    )}
                  </span>
                </div>
              )}
            </div>
            
            <div className="ad-card__footer">
              <div className="ad-card__price ad-card__price--list">
                {ad.price?.toLocaleString()} Kč
              </div>
              
              <div className="ad-card__seller">
                <span className="ad-card__seller-name">
                  {ad.user?.name ?? "Neznámý prodejce"}
                </span>
                {typeof ad.user?.averageRating === "number" && (
                  <span className="ad-card__seller-rating">
                    {"★".repeat(Math.round(ad.user.averageRating))}
                    {"☆".repeat(5 - Math.round(ad.user.averageRating))}
                    <span className="ad-card__seller-rating-number">
                      {ad.user.averageRating.toFixed(1)}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ✅ MOBILE LAYOUT - pouze na úzké obrazovky */}
          <div className="ad-card__mobile-layout">
            <h3 className="ad-card__title ad-card__title--mobile">
              {ad.title}
            </h3>
            
            <div className="ad-card__price ad-card__price--mobile">
              {ad.price?.toLocaleString()} Kč
            </div>
            
            <div className="ad-card__specs-line">
              {ad.year && <span>{ad.year}</span>}
              {ad.mileage && <span>{ad.mileage?.toLocaleString()} km</span>}
              {ad.fuel && <span>{ad.fuel}</span>}
            </div>
          </div>
        </div>
      </Link>
      
      <div className="ad-card__favorite">
        <FavoriteButton adId={ad.id.toString()} className="favorite-button--card" />
      </div>
    </div>
  )
}