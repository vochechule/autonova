'use client'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import '../styles/components/MapSelector.scss'

// Dynamicky importuj mapu pouze na client-side
const DynamicMapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="map-selector__loading">
      <div className="map-selector__spinner"></div>
      <p>Načítám mapu...</p>
    </div>
  )
})

interface Location {
  lat: number
  lng: number
  address: string
}

interface MapSelectorProps {
  onLocationSelect: (location: Location) => void
  initialPosition?: [number, number]
  height?: string
}

export default function MapSelector({ 
  onLocationSelect, 
  initialPosition = [49.75, 15.5], // Střed ČR
  height = '400px' 
}: MapSelectorProps) {
  const [address, setAddress] = useState<string>('')

  const handleLocationSelect = (location: Location) => {
    setAddress(location.address)
    onLocationSelect(location)
  }

  return (
    <div className="map-selector">
      <div className="map-selector__info">
        <p>Klikněte na mapu pro výběr místa</p>
        {address && (
          <div className="map-selector__address">
            📍 {address}
          </div>
        )}
      </div>
      
      <div className="map-selector__container" style={{ height }}>
        <DynamicMapComponent
          onLocationSelect={handleLocationSelect}
          initialPosition={initialPosition}
        />
      </div>
    </div>
  )
}