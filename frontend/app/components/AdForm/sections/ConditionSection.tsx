// Create: frontend/app/components/AdForm/sections/ConditionSection.tsx
import React from 'react'
import type { AdData, FieldErrors } from '../types'

const conditionOptions = [
  { value: 'new', label: 'Nové' },
  { value: 'used', label: 'Ojeté' },
  { value: 'crashed', label: 'Poškozené' },
  { value: 'demo', label: 'Předváděcí' }
]

const countryOptions = [
  'Česká republika',
  'Slovensko', 
  'Německo',
  'Rakousko',
  'Polsko',
  'Francie',
  'Itálie',
  'Španělsko',
  'Nizozemsko',
  'Belgie',
  'Jiné'
]

const euroStandardOptions = [
  { value: 'euro1', label: 'Euro 1' },
  { value: 'euro2', label: 'Euro 2' },
  { value: 'euro3', label: 'Euro 3' },
  { value: 'euro4', label: 'Euro 4' },
  { value: 'euro5', label: 'Euro 5' },
  { value: 'euro6', label: 'Euro 6' },
  { value: 'euro6d', label: 'Euro 6d' }
]

interface ConditionSectionProps {
  fieldErrors: FieldErrors
  adData?: AdData | null
  mode: 'create' | 'edit'
  onFieldChange: (fieldName: string) => void
}

export const ConditionSection: React.FC<ConditionSectionProps> = ({
  fieldErrors,
  adData,
  mode,
  onFieldChange
}) => {
  return (
    <div className="form-section">
      <h3 className="form-section__title">Stav a technické údaje</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="condition">
            Stav vozidla <span className="required">*</span>
          </label>
          <select 
            name="condition" 
            id="condition" 
            required
            className={fieldErrors.condition ? 'error' : ''}
            onChange={() => onFieldChange('condition')}
            defaultValue={mode === 'edit' ? adData?.condition || '' : ''}
          >
            <option value="">Vyberte stav vozidla</option>
            {conditionOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldErrors.condition && (
            <div className="field-error">{fieldErrors.condition}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="technicalCheckUntil">STK platná do</label>
          <input 
            name="technicalCheckUntil" 
            id="technicalCheckUntil" 
            type="date"
            defaultValue={mode === 'edit' ? adData?.technicalCheckUntil : ''}
          />
          <small className="form-help">Volitelné - datum platnosti STK</small>
        </div>

        <div className="form-group">
          <label htmlFor="countryOfOrigin">
            Země původu <span className="required">*</span>
          </label>
          <select 
            name="countryOfOrigin" 
            id="countryOfOrigin" 
            required
            className={fieldErrors.countryOfOrigin ? 'error' : ''}
            onChange={() => onFieldChange('countryOfOrigin')}
            defaultValue={mode === 'edit' ? adData?.countryOfOrigin || '' : ''}
          >
            <option value="">Vyberte zemi původu</option>
            {countryOptions.map(country => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          {fieldErrors.countryOfOrigin && (
            <div className="field-error">{fieldErrors.countryOfOrigin}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="euroStandard">Emisní norma</label>
          <select 
            name="euroStandard" 
            id="euroStandard"
            defaultValue={mode === 'edit' ? adData?.euroStandard || '' : ''}
          >
            <option value="">Neuvedeno</option>
            {euroStandardOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="warrantyUntil">Záruka do</label>
          <input 
            name="warrantyUntil" 
            id="warrantyUntil" 
            type="date"
            defaultValue={mode === 'edit' ? adData?.warrantyUntil : ''}
          />
          <small className="form-help">Volitelné - datum konce záruky</small>
        </div>

     
      </div>

      {/* Checkboxes */}
      <div className="form-section">
        <h4 className="form-section__subtitle">Vlastnosti vozidla</h4>
        <div className="checkbox-grid">
          

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                name="isFirstOwner" 
                defaultChecked={mode === 'edit' ? adData?.isFirstOwner || false : false}
              />
              <span className="checkbox-custom"></span>
              První majitel
            </label>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                name="isDisabledAdapted" 
                defaultChecked={mode === 'edit' ? adData?.isDisabledAdapted || false : false}
              />
              <span className="checkbox-custom"></span>
              Úprava pro ZTP
            </label>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                name="wasCrashed" 
                defaultChecked={mode === 'edit' ? adData?.wasCrashed || false : false}
              />
              <span className="checkbox-custom"></span>
              Vozidlo havarované
            </label>
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                name="hasServiceBook" 
                defaultChecked={mode === 'edit' ? adData?.hasServiceBook || false : false}
              />
              <span className="checkbox-custom"></span>
              Servisní knížka
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}