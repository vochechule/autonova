// Create: frontend/app/components/AdForm/sections/EngineSection.tsx
import React from 'react'
import type { AdData, FieldErrors } from '../types'

const fuelTypeOptions = [
  { value: 'petrol', label: 'Benzín' },
  { value: 'diesel', label: 'Nafta' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'electric', label: 'Elektro' },
  { value: 'lpg', label: 'LPG' },
  { value: 'cng', label: 'CNG' },
  { value: 'ethanol', label: 'Ethanol (E85)' },
  { value: 'hydrogen', label: 'Vodík' }
]

const transmissionOptions = [
  { value: 'manual', label: 'Manuální' },
  { value: 'automatic', label: 'Automatická' },
  { value: 'cvt', label: 'CVT (plynule měnitelná)' },
  { value: 'sequential', label: 'Sekvenční' }
]

const drivetrainOptions = [
  { value: 'fwd', label: 'Přední pohon (FWD)' },
  { value: 'rwd', label: 'Zadní pohon (RWD)' },
  { value: 'awd', label: 'Pohon všech kol (AWD)' },
  { value: 'four_x_four', label: '4x4 (terénní)' }
]

const airConditioningOptions = [
  { value: 'none', label: 'Bez klimatizace' },
  { value: 'manual', label: 'Manuální klimatizace' },
  { value: 'automatic', label: 'Automatická klimatizace' },
  { value: 'two_zone', label: 'Dvouzónová klimatizace' },
  { value: 'three_zone', label: 'Třízónová klimatizace' },
  { value: 'four_zone', label: 'Čtyřzónová klimatizace' }
]

interface EngineSectionProps {
  fieldErrors: FieldErrors
  adData?: AdData | null
  mode: 'create' | 'edit'
  onFieldChange: (fieldName: string) => void
}

export const EngineSection: React.FC<EngineSectionProps> = ({
  fieldErrors,
  adData,
  mode,
  onFieldChange
}) => {
  return (
    <div className="form-section">
      <h3 className="form-section__title">Motor a převodovka</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="fuel">
            Palivo <span className="required">*</span>
          </label>
          <select 
            name="fuel" 
            id="fuel" 
            required
            className={fieldErrors.fuel ? 'error' : ''}
            onChange={() => onFieldChange('fuel')}
            defaultValue={mode === 'edit' ? adData?.fuel || '' : ''}
          >
            <option value="">Vyberte typ paliva</option>
            {fuelTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldErrors.fuel && (
            <div className="field-error">{fieldErrors.fuel}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="engineVolume">
            Objem motoru (ccm) <span className="required">*</span>
          </label>
          <input 
            name="engineVolume" 
            id="engineVolume" 
            type="number" 
            min="50"
            max="20000"
            required 
            placeholder="1598"
            className={fieldErrors.engineVolume ? 'error' : ''}
            onChange={() => onFieldChange('engineVolume')}
            defaultValue={mode === 'edit' ? adData?.engineVolume : ''}
          />
          <small className="form-help">
            Objem motoru v kubických centimetrech (50-20000 ccm)
          </small>
          {fieldErrors.engineVolume && (
            <div className="field-error">{fieldErrors.engineVolume}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="power">
            Výkon (kW) <span className="required">*</span>
          </label>
          <input 
            name="power" 
            id="power" 
            type="number" 
            min="1"
            max="2000"
            required 
            placeholder="110"
            className={fieldErrors.power ? 'error' : ''}
            onChange={() => onFieldChange('power')}
            defaultValue={mode === 'edit' ? adData?.power : ''}
          />
          <small className="form-help">
            Výkon motoru v kilowattech (1-2000 kW). Pro koně: 1 kW ≈ 1,36 HP
          </small>
          {fieldErrors.power && (
            <div className="field-error">{fieldErrors.power}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="avgConsumption">
            Průměrná spotřeba (l/100km) <span className="required">*</span>
          </label>
          <input 
            name="avgConsumption" 
            id="avgConsumption" 
            type="number" 
            step="0.1"
            min="0.1"
            max="100"
            required 
            placeholder="6.5"
            className={fieldErrors.avgConsumption ? 'error' : ''}
            onChange={() => onFieldChange('avgConsumption')}
            defaultValue={mode === 'edit' ? adData?.avgConsumption : ''}
          />
          <small className="form-help">
            Průměrná spotřeba paliva na 100 km (kombinovaná)
          </small>
          {fieldErrors.avgConsumption && (
            <div className="field-error">{fieldErrors.avgConsumption}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="transmission">
            Převodovka <span className="required">*</span>
          </label>
          <select 
            name="transmission" 
            id="transmission" 
            required
            className={fieldErrors.transmission ? 'error' : ''}
            onChange={() => onFieldChange('transmission')}
            defaultValue={mode === 'edit' ? adData?.transmission || '' : ''}
          >
            <option value="">Vyberte typ převodovky</option>
            {transmissionOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldErrors.transmission && (
            <div className="field-error">{fieldErrors.transmission}</div>
          )}
        </div>

        {/* ✅ Gear Count as number input */}
        <div className="form-group">
          <label htmlFor="gearCount">
            Počet rychlostí <span className="required">*</span>
          </label>
          <input 
            name="gearCount" 
            id="gearCount" 
            type="number"
            min="1"
            max="12"
            required
            placeholder="6"
            className={fieldErrors.gearCount ? 'error' : ''}
            onChange={() => onFieldChange('gearCount')}
            defaultValue={mode === 'edit' ? adData?.gearCount?.toString() || '' : ''}
          />
          <small className="form-help">
            Počet rychlostí/stupňů převodovky (1-12). CVT = 1
          </small>
          {fieldErrors.gearCount && (
            <div className="field-error">{fieldErrors.gearCount}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="drivetrain">
            Pohon <span className="required">*</span>
          </label>
          <select 
            name="drivetrain" 
            id="drivetrain" 
            required
            className={fieldErrors.drivetrain ? 'error' : ''}
            onChange={() => onFieldChange('drivetrain')}
            defaultValue={mode === 'edit' ? adData?.drivetrain || '' : ''}
          >
            <option value="">Vyberte typ pohonu</option>
            {drivetrainOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <small className="form-help">
            <strong>AWD:</strong> stálý pohon všech kol (Audi quattro, BMW xDrive)<br />
            <strong>4x4:</strong> přepínatelný pohon pro terén (Jeep, Land Rover)
          </small>
          {fieldErrors.drivetrain && (
            <div className="field-error">{fieldErrors.drivetrain}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="airConditioning">Klimatizace</label>
          <select 
            name="airConditioning" 
            id="airConditioning"
            defaultValue={mode === 'edit' ? adData?.airConditioning || '' : ''}
          >
            <option value="">Neuvedeno</option>
            {airConditioningOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <small className="form-help">
            Typ klimatizace nebo ventilace ve vozidle
          </small>
        </div>
      </div>

     
    </div>
  )
}