// Create: frontend/app/components/AdForm/sections/LocationSection.tsx
import React from 'react'
import MapSelector from '../../MapSelector'
import type { FieldErrors } from '../types'

interface LocationSectionProps {
  fieldErrors: FieldErrors
  onLocationSelect: (location: {
    lat: number
    lng: number
    address: string
  }) => void
}

export const LocationSection: React.FC<LocationSectionProps> = ({
  fieldErrors,
  onLocationSelect
}) => {
  return (
    <section className="form-section">
      <h3>Lokalita vozidla <span className="required">*</span></h3>
      <div className={fieldErrors.location ? 'map-error' : ''}>
        <MapSelector 
          onLocationSelect={onLocationSelect}
          height="300px"
        />
      </div>
      {fieldErrors.location && (
        <div className="field-error">{fieldErrors.location}</div>
      )}
    </section>
  )
}