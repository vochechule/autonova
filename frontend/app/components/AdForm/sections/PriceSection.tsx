// Create: frontend/app/components/AdForm/sections/PriceSection.tsx
import React from 'react'
import type { AdData, FieldErrors } from '../types'

interface PriceSectionProps {
  fieldErrors: FieldErrors
  adData?: AdData | null
  mode: 'create' | 'edit'
  onFieldChange: (fieldName: string) => void
}

export const PriceSection: React.FC<PriceSectionProps> = ({
  fieldErrors,
  adData,
  mode,
  onFieldChange
}) => {
  const currentYear = new Date().getFullYear()
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="form-section">
      <h3 className="form-section__title">Cena a základní údaje</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="price">
            Cena (Kč) <span className="required">*</span>
          </label>
          <input
            name="price"
            id="price"
            type="number"
            min="0"
            max="50000000"
            required
            placeholder="350000"
            className={fieldErrors.price ? 'error' : ''}
            onChange={() => onFieldChange('price')}
            defaultValue={mode === 'edit' ? adData?.price?.toString() || '' : ''}  // ✅ defaultValue
          />
          {fieldErrors.price && (
            <div className="field-error">{fieldErrors.price}</div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="mileage">
            Nájezd (km) <span className="required">*</span>
          </label>
          <input
            name="mileage"
            id="mileage"
            type="number"
            min="0"
            max="9999999"
            required
            placeholder="125000"
            className={fieldErrors.mileage ? 'error' : ''}
            onChange={() => onFieldChange('mileage')}
            defaultValue={mode === 'edit' ? adData?.mileage?.toString() || '' : ''}  // ✅ defaultValue
          />
          {fieldErrors.mileage && (
            <div className="field-error">{fieldErrors.mileage}</div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="year">
            Rok výroby <span className="required">*</span>
          </label>
          <input
            name="year"
            id="year"
            type="number"
            min="1900"
            max={currentYear}
            required
            placeholder={currentYear.toString()}
            className={fieldErrors.year ? 'error' : ''}
            onChange={() => onFieldChange('year')}
            defaultValue={mode === 'edit' ? adData?.year?.toString() || '' : ''}  // ✅ defaultValue
          />
          {fieldErrors.year && (
            <div className="field-error">{fieldErrors.year}</div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="firstRegistration">
            První registrace (rok) <span className="required">*</span>
          </label>
          <input
            name="firstRegistration"
            id="firstRegistration"
            type="number"
            min="1900"
            max={currentYear}
            required
            placeholder="2018"
            className={fieldErrors.firstRegistration ? 'error' : ''}
            onChange={() => onFieldChange('firstRegistration')}
            defaultValue={mode === 'edit' ? adData?.firstRegistration?.toString() || '' : ''}
          />
          <small className="form-help">
            Rok první registrace vozidla (obvykle stejný nebo novější než rok výroby)
          </small>
          {fieldErrors.firstRegistration && (
            <div className="field-error">{fieldErrors.firstRegistration}</div>
          )}
        </div>
      </div>
    </div>
  )
}