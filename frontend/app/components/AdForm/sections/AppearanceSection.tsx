// Create: frontend/app/components/AdForm/sections/AppearanceSection.tsx
import React from 'react'
import ColorSelect from '../../ColorSelect'
import { colorFinishes, getColorFinishByValue } from '../../../data/colorData'
import type { AdData, FieldErrors } from '../types'

const bodyTypeOptions = [
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'sedan', label: 'Sedan' },
  { value: 'kombi', label: 'Kombi' },
  { value: 'suv', label: 'SUV' },
  { value: 'coupe', label: 'Coupé' },
  { value: 'cabrio', label: 'Cabrio' },
  { value: 'mpv', label: 'MPV' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'van', label: 'Van' },
  { value: 'jiné', label: 'Jiné' }
]

interface AppearanceSectionProps {
  selectedColor: string
  selectedColorFinish: string
  fieldErrors: FieldErrors
  adData?: AdData | null
  mode: 'create' | 'edit'
  onColorChange: (value: string) => void
  onColorFinishChange: (value: string) => void
  onFieldChange: (fieldName: string) => void
}

export const AppearanceSection: React.FC<AppearanceSectionProps> = ({
  selectedColor,
  selectedColorFinish,
  fieldErrors,
  adData,
  mode,
  onColorChange,
  onColorFinishChange,
  onFieldChange
}) => {
  return (
    <div className="form-section">
      <h3 className="form-section__title">Vzhled vozidla</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="bodyType">
            Typ karoserie <span className="required">*</span>
          </label>
          <select 
            name="bodyType" 
            id="bodyType" 
            required
            className={fieldErrors.bodyType ? 'error' : ''}
            onChange={() => onFieldChange('bodyType')}
            defaultValue={mode === 'edit' ? adData?.bodyType || '' : ''}
          >
            <option value="">Vyberte typ karoserie</option>
            {bodyTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldErrors.bodyType && (
            <div className="field-error">{fieldErrors.bodyType}</div>
          )}
        </div>

        {/* ✅ Color Select using ColorSelect component */}
        <div className="form-group">
          <label htmlFor="color">
            Barva <span className="required">*</span>
          </label>
          <ColorSelect
            value={selectedColor}
            onChange={(value) => {
              onColorChange(value)
              onFieldChange('color') // Clear field error
            }}
            required
            placeholder="Vyberte barvu vozidla"
            className={fieldErrors.color ? 'error' : ''}
          />
          {fieldErrors.color && (
            <div className="field-error">{fieldErrors.color}</div>
          )}
        </div>

        {/* ✅ Color Finish using colorData.ts */}
        <div className="form-group">
          <label htmlFor="colorFinish">Povrchová úprava</label>
          <select 
            name="colorFinish" 
            id="colorFinish"
            value={selectedColorFinish}
            onChange={(e) => onColorFinishChange(e.target.value)}
          >
            {colorFinishes.map(finish => (
              <option key={finish.value} value={finish.value}>
                {finish.label}
              </option>
            ))}
          </select>
          {selectedColorFinish && selectedColorFinish !== 'standard' && (
            <small className="form-help" style={{ color: '#6b7280', marginTop: '4px' }}>
              {getColorFinishByValue(selectedColorFinish)?.label} povrchová úprava
            </small>
          )}
        </div>

        {/* ✅ Door Count as number input */}
        <div className="form-group">
          <label htmlFor="doorCount">
            Počet dveří <span className="required">*</span>
          </label>
          <input 
            name="doorCount" 
            id="doorCount" 
            type="number"
            min="2"
            max="8"
            required
            placeholder="5"
            className={fieldErrors.doorCount ? 'error' : ''}
            onChange={() => onFieldChange('doorCount')}
            defaultValue={mode === 'edit' ? adData?.doorCount?.toString() || '' : ''}
          />
          <small className="form-help">
            Obvykle 3 nebo 5 dveří (včetně zadních dveří/klapy)
          </small>
          {fieldErrors.doorCount && (
            <div className="field-error">{fieldErrors.doorCount}</div>
          )}
        </div>

        {/* ✅ Seat Count as number input */}
        <div className="form-group">
          <label htmlFor="seatCount">
            Počet míst <span className="required">*</span>
          </label>
          <input 
            name="seatCount" 
            id="seatCount" 
            type="number"
            min="1"
            max="12"
            required
            placeholder="5"
            className={fieldErrors.seatCount ? 'error' : ''}
            onChange={() => onFieldChange('seatCount')}
            defaultValue={mode === 'edit' ? adData?.seatCount?.toString() || '' : ''}
          />
          <small className="form-help">
            Počet míst k sezení (obvykle 2-9 míst)
          </small>
          {fieldErrors.seatCount && (
            <div className="field-error">{fieldErrors.seatCount}</div>
          )}
        </div>

        {/* ✅ Airbag Count as number input */}
        <div className="form-group">
          <label htmlFor="airbagCount">Počet airbagů</label>
          <input 
            name="airbagCount" 
            id="airbagCount" 
            type="number"
            min="0"
            max="12"
            placeholder="6"
            defaultValue={mode === 'edit' ? adData?.airbagCount?.toString() || '' : ''}
          />
          <small className="form-help">
            Volitelné - celkový počet airbagů ve vozidle (0-12)
          </small>
        </div>
      </div>


     
    </div>
  )
}