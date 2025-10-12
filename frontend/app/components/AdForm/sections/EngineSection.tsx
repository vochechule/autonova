// Create: frontend/app/components/AdForm/sections/EngineSection.tsx
import React, { useState, useEffect } from 'react'
import type { AdData, FieldErrors } from '../types'

const fuelTypeOptions = [
  { value: 'petrol', label: 'Benzín' },
  { value: 'diesel', label: 'Nafta' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'electric', label: 'Elektro' },
  { value: 'lpg', label: 'LPG' },
  { value: 'cng', label: 'CNG' }
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
  { value: 'three_zone', label: 'Třízónová klimatizace' }
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
  const [selectedFuel, setSelectedFuel] = useState<string>(mode === 'edit' ? adData?.fuel || '' : '')
  
  // Update selected fuel when adData changes
  useEffect(() => {
    if (mode === 'edit' && adData?.fuel) {
      setSelectedFuel(adData.fuel)
    }
  }, [mode, adData?.fuel])

  const isElectric = selectedFuel === 'electric'
  const isHybrid = selectedFuel === 'hybrid'

  // Get dynamic labels based on fuel type
  const getEngineVolumeLabel = () => {
    if (isElectric) return 'Kapacita baterie (kWh)'
    if (isHybrid) return 'Objem motoru (ccm) / Kapacita (kWh)'
    return 'Objem motoru (ccm)'
  }

  const getEngineVolumePlaceholder = () => {
    if (isElectric) return '75'
    if (isHybrid) return '1598 (pro spalovací motor)'
    return '1598'
  }

  const getEngineVolumeHelp = () => {
    if (isElectric) return 'Kapacita baterie v kilowatthodinách (10-200 kWh)'
    if (isHybrid) return 'Objem spalovacího motoru v ccm (50-20000) nebo kapacita baterie pro plug-in hybrid'
    return 'Objem motoru v kubických centimetrech (50-20000 ccm)'
  }

  const getEngineVolumeMinMax = () => {
    if (isElectric) return { min: 10, max: 200 }
    return { min: 50, max: 20000 }
  }

  const getConsumptionLabel = () => {
    if (isElectric) return 'Spotřeba energie (kWh/100km)'
    if (isHybrid) return 'Kombinovaná spotřeba (l/100km)'
    return 'Průměrná spotřeba (l/100km)'
  }

  const getConsumptionPlaceholder = () => {
    if (isElectric) return '18.5'
    if (isHybrid) return '4.2'
    return '6.5'
  }

  const getConsumptionHelp = () => {
    if (isElectric) return 'Spotřeba energie na 100 km (kombinovaná)'
    if (isHybrid) return 'Kombinovaná spotřeba paliva hybridního pohonu'
    return 'Průměrná spotřeba paliva na 100 km (kombinovaná)'
  }

  const getConsumptionMinMax = () => {
    if (isElectric) return { min: 5, max: 50, step: 0.1 }
    return { min: 0.1, max: 100, step: 0.1 }
  }

  const handleFuelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const fuelValue = e.target.value
    setSelectedFuel(fuelValue)
    onFieldChange('fuel')
  }

  return (
    <div className={`form-section ${isElectric ? 'electric-mode' : isHybrid ? 'hybrid-mode' : ''}`}>
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
            onChange={handleFuelChange}
            value={selectedFuel}
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

        <div className="form-group engine-volume-group">
          <label htmlFor="engineVolume">
            {getEngineVolumeLabel()} <span className="required">*</span>
          </label>
          <input 
            name="engineVolume" 
            id="engineVolume" 
            type="number" 
            min={getEngineVolumeMinMax().min}
            max={getEngineVolumeMinMax().max}
            required 
            placeholder={getEngineVolumePlaceholder()}
            className={fieldErrors.engineVolume ? 'error' : ''}
            onChange={() => onFieldChange('engineVolume')}
            defaultValue={mode === 'edit' ? adData?.engineVolume : ''}
          />
          <small className="form-help">
            {getEngineVolumeHelp()}
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

        <div className="form-group consumption-group">
          <label htmlFor="avgConsumption">
            {getConsumptionLabel()} <span className="required">*</span>
          </label>
          <input 
            name="avgConsumption" 
            id="avgConsumption" 
            type="number" 
            step={getConsumptionMinMax().step}
            min={getConsumptionMinMax().min}
            max={getConsumptionMinMax().max}
            required 
            placeholder={getConsumptionPlaceholder()}
            className={fieldErrors.avgConsumption ? 'error' : ''}
            onChange={() => onFieldChange('avgConsumption')}
            defaultValue={mode === 'edit' ? adData?.avgConsumption : ''}
          />
          <small className="form-help">
            {getConsumptionHelp()}
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