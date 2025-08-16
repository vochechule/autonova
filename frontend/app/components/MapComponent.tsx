'use client'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { useState, useEffect } from 'react'
import L from 'leaflet'

// Fix pro Leaflet ikony v Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

interface MapComponentProps {
  onLocationSelect: (location: {
    latitude: number
    longitude: number
    address: string
  }) => void
  initialPosition: [number, number]
}

export default function MapComponent({ onLocationSelect, initialPosition }: MapComponentProps) {
  const [position, setPosition] = useState<[number, number] | null>(null)

  // Komponenta pro handling kliků na mapu
  function LocationMarker() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng
        setPosition([lat, lng])
        reverseGeocode(lat, lng)
      },
    })

    return position === null ? null : (
      <Marker position={position} />
    )
  }

  // Převod GPS na adresu (reverse geocoding)
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=cs`
      )
      const data = await response.json()
      
      const city = data.address?.city || data.address?.town || data.address?.village || 'Neznámé město'
      const region = data.address?.state || 'Neznámý kraj'
      const fullAddress = `${city}, ${region}`
      
      // Zavolej callback
      onLocationSelect({
        latitude: lat,
        longitude: lng,
        address: fullAddress
      })
    } catch (error) {
      console.error('Geocoding error:', error)
      onLocationSelect({
        latitude: lat,
        longitude: lng,
        address: 'Nepodařilo se načíst adresu'
      })
    }
  }

  return (
    <MapContainer
      center={initialPosition}
      zoom={8}
      style={{ height: '100%', width: '100%' }}
      attributionControl={false} // Vypneme default attribution
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <LocationMarker />
    </MapContainer>
  )
}