'use client'
import { useEffect, useState } from 'react'

type Ad = {
  id: number
  title: string
  price: number
  image_url: string
}

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([])

  useEffect(() => {
    fetch('http://localhost:3000/ad') // uprav adresu na svou API endpoint
      .then(res => res.json())
      .then(setAds)
  }, [])

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Inzeráty</h1>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {ads.map(ad => (
          <div key={ad.id} className="border rounded-xl p-4 shadow">
            <img src={ad.image_url} alt={ad.title} className="w-full h-48 object-cover rounded mb-2" />
            <h2 className="text-lg font-semibold">{ad.title}</h2>
            <p className="text-gray-600">{ad.price} Kč</p>
          </div>
        ))}
      </div>
    </main>
  )
}
