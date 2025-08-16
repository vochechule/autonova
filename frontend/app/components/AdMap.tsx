'use client'
import dynamic from 'next/dynamic'
import '../styles/components/AdMap.scss'

const DynamicAdMapComponent = dynamic(() => import('./AdMapComponent'), {
  ssr: false,
  loading: () => (
    <div className="ad-map__loading">
      <p>Načítám mapu...</p>
    </div>
  )
})

interface AdMapProps {
  latitude: number
  longitude: number
  address: string
  height?: string
}

export default function AdMap({ latitude, longitude, address, height = '200px' }: AdMapProps) {
  return (
    <div className="ad-map">
      <h4>📍 Lokalita</h4>
      <p className="ad-map__address">{address}</p>
      <div className="ad-map__container" style={{ height }}>
        <DynamicAdMapComponent 
          latitude={latitude}
          longitude={longitude}
          address={address}
        />
      </div>
    </div>
  )
}