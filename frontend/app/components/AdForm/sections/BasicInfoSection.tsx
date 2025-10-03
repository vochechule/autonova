// Create: frontend/app/components/AdForm/sections/BasicInfoSection.tsx
import React from 'react'
import BrandSelect from '../../BrandSelect'
import ModelSelect from '../../ModelSelect'
import { getModelsList } from '../../../data/carData'
import type { AdData, FieldErrors } from '../types'

interface BasicInfoSectionProps {
  selectedBrand: string
  selectedModel: string
  fieldErrors: FieldErrors
  adData?: AdData | null
  mode: 'create' | 'edit'
  onBrandChange: (value: string) => void
  onModelChange: (value: string) => void
  onFieldChange: (fieldName: string) => void
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  selectedBrand,
  selectedModel,
  fieldErrors,
  adData,
  mode,
  onBrandChange,
  onModelChange,
  onFieldChange
}) => {
  const modelsList = getModelsList(selectedBrand)

  return (
    <div className="form-section">
      <h3 className="form-section__title">Základní informace</h3>
      <div className="form-grid">
        <div className="form-group form-group--full-width">
          <label htmlFor="title">
            Název inzerátu <span className="required">*</span>
          </label>
          <input 
            name="title" 
            id="title" 
            required 
            placeholder="Např. Škoda Octavia 2.0 TDI Combi"
            className={fieldErrors.title ? 'error' : ''}
            onChange={() => onFieldChange('title')}
            defaultValue={mode === 'edit' ? adData?.title || '' : ''}  // ✅ defaultValue
          />
          {fieldErrors.title && (
            <div className="field-error">{fieldErrors.title}</div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="brand">
            Značka <span className="required">*</span>
          </label>
          <BrandSelect
            value={selectedBrand}
            onChange={onBrandChange}
            required
            className={fieldErrors.brand ? 'error' : ''}
          />
          {fieldErrors.brand && (
            <div className="field-error">{fieldErrors.brand}</div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="model">
            Model <span className="required">*</span>
          </label>
          <ModelSelect
            value={selectedModel}
            onChange={onModelChange}
            models={modelsList}
            disabled={!selectedBrand}
            required
            className={fieldErrors.model ? 'error' : ''}
          />
          {fieldErrors.model && (
            <div className="field-error">{fieldErrors.model}</div>
          )}
        </div>
        
        <div className="form-group form-group--full-width">
          <label htmlFor="description">
            Popis vozidla <span className="required">*</span>
          </label>
          <textarea 
            name="description" 
            id="description" 
            required
            placeholder="Popište stav vozidla, výbavu, historii..."
            className={fieldErrors.description ? 'error' : ''}
            onChange={() => onFieldChange('description')}
            defaultValue={mode === 'edit' ? adData?.description || '' : ''}  // ✅ defaultValue
          />
          {fieldErrors.description && (
            <div className="field-error">{fieldErrors.description}</div>
          )}
        </div>
      </div>
    </div>
  )
}