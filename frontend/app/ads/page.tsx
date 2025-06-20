'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import AdFilter from '../components/AdFilter'
import '../styles/AdsPage.scss'

type Ad = {
  id: number
  title: string
  price: number
  mileage: number
  image_url: string
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
          <div key={ad.id} className="ads-page__card">
            <img src={ad.image_url} alt={ad.title} className="ads-page__image" />
            <h2 className="ads-page__title">{ad.title}</h2>
            <p className="ads-page__price">{ad.price} Kč</p>
          </div>
        ))}
      </div>
    </main>
  )
}
