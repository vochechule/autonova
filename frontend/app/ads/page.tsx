'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import AdFilter from '../components/AdFilter'
import Link from 'next/link'
import '../styles/AdsPage.scss'

type Ad = {
  id: number
  title: string
  price: number
  mileage: number
  images: { url: string }[] // OPRAVA: pole obrázků
}

export default function AdsPage() {
  const searchParams = useSearchParams()
  const [ads, setAds] = useState<Ad[]>([])

  useEffect(() => {
    const params = searchParams.toString()
    fetch(`http://localhost:3000/ad?${params}`)
      .then(res => res.json())
      .then(setAds)
  }, [searchParams])

  return (
    <main className="ads-page">
      <h1 className="ads-page__heading">Inzeráty</h1>
      <AdFilter />
      <div className="ads-page__grid">
        {ads.map(ad => (
          <Link
            key={ad.id}
            href={`/ads/${ad.id}`}
            className="ads-page__card"
          >
            <img
              src={ad.images?.[0]?.url || '/no-image.png'}
              alt={ad.title}
              className="ads-page__image"
            />
            <div className="ads-page__title">{ad.title}</div>
            <div className="ads-page__price">{ad.price} Kč</div>
            <div className="ads-page__mileage">{ad.mileage} km</div>
          </Link>
        ))}
      </div>
    </main>
  )
}
