'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useRef } from 'react'
import { getModelsList } from '../data/carData'
import BrandSelect from './BrandSelect'
import ModelSelect from './ModelSelect'
import RangeFilter from './RangeFilter'
import ColorSelect from './ColorSelect'
import ColorFinishSelect from './ColorFinishSelect'
import LocationFilter from './LocationFilter'
import '../styles/components/FilterSidebar.scss'

interface FilterSidebarProps {
  isVisible?: boolean
  onClose?: () => void
  onLocationChange?: (location: {
    latitude: number
    longitude: number
    address: string
    distance: number
  } | null) => void
}

export default function FilterSidebar({
  isVisible = true,
  onClose,
  onLocationChange
}: FilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Always read filter values from searchParams
  const selectedBrand = searchParams.get('brand') || ''
  const selectedModel = searchParams.get('model') || ''
  const selectedColor = searchParams.get('color') || ''
  const selectedColorFinish = searchParams.get('colorFinish') || ''
  const priceFrom = parseInt(searchParams.get('priceFrom') || '0') || 0
  const priceTo = parseInt(searchParams.get('priceTo') || '2000000') || 2000000
  const mileageFrom = parseInt(searchParams.get('mileageFrom') || '0') || 0
  const mileageTo = parseInt(searchParams.get('mileageTo') || '500000') || 500000
  const searchValue = searchParams.get('search') || ''
  const yearFrom = searchParams.get('yearFrom') || ''
  const yearTo = searchParams.get('yearTo') || ''
  const selectedFuels = searchParams.getAll('fuel')
  const selectedBodyTypes = searchParams.getAll('bodyType')
  const selectedTransmissions = searchParams.getAll('transmission')
  const selectedDrivetrains = searchParams.getAll('drivetrain')
  const selectedConditions = searchParams.getAll('condition')
  const doorCount = searchParams.get('doorCount') || ''
  const seatCount = searchParams.get('seatCount') || ''
  const powerFrom = searchParams.get('powerFrom') || ''
  const powerTo = searchParams.get('powerTo') || ''
  const modelsList = getModelsList(selectedBrand)

  // --- Handlers ---
  const updateParams = (callback: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString())
    callback(params)
    router.push(`/ads${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false })
  }

  const handleBrandChange = (brandValue: string) => {
    updateParams(params => {
      if (brandValue) params.set('brand', brandValue)
      else params.delete('brand')
      params.delete('model') // reset model when brand changes
    })
  }

  const handleModelChange = (modelValue: string) => {
    updateParams(params => {
      if (modelValue) params.set('model', modelValue)
      else params.delete('model')
    })
  }

  const handlePriceChange = (from: number, to: number) => {
    updateParams(params => {
      if (from > 0) params.set('priceFrom', from.toString())
      else params.delete('priceFrom')
      if (to < 2000000) params.set('priceTo', to.toString())
      else params.delete('priceTo')
    })
  }

  const handleMileageChange = (from: number, to: number) => {
    updateParams(params => {
      if (from > 0) params.set('mileageFrom', from.toString())
      else params.delete('mileageFrom')
      if (to < 500000) params.set('mileageTo', to.toString())
      else params.delete('mileageTo')
    })
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target
    updateParams(params => {
      const values = params.getAll(name)
      params.delete(name)
      if (checked) {
        values.push(value)
      } else {
        const idx = values.indexOf(value)
        if (idx > -1) values.splice(idx, 1)
      }
      values.forEach(v => params.append(name, v))
    })
  }

  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      updateParams(params => {
        if (value) params.set(name, value)
        else params.delete(name)
      })
    }, 300)
  }

  const handleColorChange = (value: string) => {
    updateParams(params => {
      if (value) params.set('color', value)
      else params.delete('color')
    })
  }

  const handleColorFinishChange = (value: string) => {
    updateParams(params => {
      if (value) params.set('colorFinish', value)
      else params.delete('colorFinish')
    })
  }

  const handleLocationChangeInternal = (location: {
    latitude: number
    longitude: number
    address: string
    distance: number
  } | null) => {
    updateParams(params => {
      if (location) {
        params.set('nearLatitude', location.latitude.toString())
        params.set('nearLongitude', location.longitude.toString())
        params.set('nearDistance', location.distance.toString())
      } else {
        params.delete('nearLatitude')
        params.delete('nearLongitude')
        params.delete('nearDistance')
      }
    })
    if (onLocationChange) onLocationChange(location)
  }

  return (
    <aside className={`filter-sidebar ${isVisible ? 'filter-sidebar--visible' : ''}`}>
      <div className="filter-sidebar__content">
        <div className="filter-sidebar__header">
          <h2>Filtry</h2>
          <button className="filter-sidebar__close" onClick={onClose}>✕</button>
        </div>
        <form className="filter-sidebar__form" onSubmit={e => e.preventDefault()}>
          {/* Search */}
          <div className="filter-sidebar__section">
            <label className="filter-sidebar__label">Hledat</label>
            <input
              type="text"
              name="search"
              className="filter-sidebar__input"
              placeholder="Zadejte značku, model..."
              value={searchValue}
              onChange={handleTextInputChange}
            />
          </div>
          {/* Location */}
          {onLocationChange && (
            <div className="filter-sidebar__section">
              <label className="filter-sidebar__label">Lokalita</label>
              <LocationFilter 
                onLocationChange={handleLocationChangeInternal}
                className="filter-sidebar__location"
              />
            </div>
          )}
          {/* Brand */}
          <div className="filter-sidebar__section">
            <label className="filter-sidebar__label">Značka</label>
            <BrandSelect value={selectedBrand} onChange={handleBrandChange} />
          </div>
          {/* Model */}
          <div className="filter-sidebar__section">
            <label className="filter-sidebar__label">Model</label>
            <ModelSelect value={selectedModel} onChange={handleModelChange} models={modelsList} disabled={!selectedBrand} />
          </div>
          {/* Color */}
          <div className="filter-sidebar__section">
            <label className="filter-sidebar__label">Barva</label>
            <ColorSelect value={selectedColor} onChange={handleColorChange} placeholder="Všechny barvy" className="filter-sidebar__color-select" />
          </div>
          {/* Color Finish */}
          <div className="filter-sidebar__section">
            <label className="filter-sidebar__label">Povrchová úprava</label>
            <ColorFinishSelect value={selectedColorFinish} onChange={handleColorFinishChange} placeholder="Všechny úpravy" className="filter-sidebar__color-finish-select" />
          </div>
          {/* Price Range */}
          <div className="filter-sidebar__section">
            <label className="filter-sidebar__label">Cena</label>
            <RangeFilter label="Cena" namePrefix="price" min={0} max={2000000} step={10000} valueFrom={priceFrom} valueTo={priceTo} formatValue={v => `${(v / 1000).toFixed(0)}k Kč`} onValueChange={handlePriceChange} />
          </div>
          {/* Mileage Range */}
          <div className="filter-sidebar__section">
            <label className="filter-sidebar__label">Nájezd</label>
            <RangeFilter label="Nájezd" namePrefix="mileage" min={0} max={500000} step={5000} valueFrom={mileageFrom} valueTo={mileageTo} formatValue={v => `${(v / 1000).toFixed(0)}k km`} onValueChange={handleMileageChange} />
          </div>
          {/* Door count */}
          <div className="filter-sidebar__section">
            <label className="filter-sidebar__label" htmlFor="doorCount">Počet dveří</label>
            <input id="doorCount" name="doorCount" type="number" min={2} max={6} className="filter-sidebar__input" placeholder="Počet dveří" value={doorCount} onChange={handleTextInputChange} />
          </div>
          {/* Seat count */}
          <div className="filter-sidebar__section">
            <label className="filter-sidebar__label" htmlFor="seatCount">Počet míst</label>
            <input id="seatCount" name="seatCount" type="number" min={2} max={9} className="filter-sidebar__input" placeholder="Počet míst" value={seatCount} onChange={handleTextInputChange} />
          </div>
          {/* Power from */}
          <div className="filter-sidebar__section">
            <label className="filter-sidebar__label" htmlFor="powerFrom">Výkon od (kW)</label>
            <input id="powerFrom" name="powerFrom" type="number" className="filter-sidebar__input" placeholder="Výkon od" value={powerFrom} onChange={handleTextInputChange} />
          </div>
          {/* Power to */}
          <div className="filter-sidebar__section">
            <label className="filter-sidebar__label" htmlFor="powerTo">Výkon do (kW)</label>
            <input id="powerTo" name="powerTo" type="number" className="filter-sidebar__input" placeholder="Výkon do" value={powerTo} onChange={handleTextInputChange} />
          </div>
          {/* Year Range */}
          <div className="filter-sidebar__section">
            <label className="filter-sidebar__label">Rok výroby</label>
            <div className="filter-sidebar__range">
              <input type="number" name="yearFrom" className="filter-sidebar__input filter-sidebar__input--small" placeholder="Od" value={yearFrom} onChange={handleTextInputChange} />
              <span className="filter-sidebar__range-separator">-</span>
              <input type="number" name="yearTo" className="filter-sidebar__input filter-sidebar__input--small" placeholder="Do" value={yearTo} onChange={handleTextInputChange} />
            </div>
          </div>
          {/* Fuel checkboxes */}
          <div className="filter-sidebar__section">
            <label className="filter-sidebar__label">Palivo</label>
            <div className="filter-sidebar__checkbox-group">
              {[
                { value: 'petrol', label: 'Benzín' },
                { value: 'diesel', label: 'Nafta' },
                { value: 'hybrid', label: 'Hybrid' },
                { value: 'electric', label: 'Elektro' },
                { value: 'lpg', label: 'LPG' },
                { value: 'cng', label: 'CNG' },
              ].map(opt => (
                <label key={`fuel-${opt.value}`} className="filter-sidebar__checkbox-label">
                  <input
                    type="checkbox"
                    name="fuel"
                    value={opt.value}
                    checked={selectedFuels.includes(opt.value)}
                    onChange={handleCheckboxChange}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
          {/* BodyType checkboxes */}
          <div className="filter-sidebar__section">
            <label className="filter-sidebar__label">Karoserie</label>
            <div className="filter-sidebar__checkbox-group">
              {[
                { value: 'hatchback', label: 'Hatchback' },
                { value: 'sedan', label: 'Sedan' },
                { value: 'kombi', label: 'Kombi' },
                { value: 'suv', label: 'SUV' },
                { value: 'coupe', label: 'Coupé' },
                { value: 'cabrio', label: 'Cabrio' },
                { value: 'mpv', label: 'MPV' },
                { value: 'pickup', label: 'Pickup' },
                { value: 'van', label: 'Van' },
              ].map(opt => (
                <label key={`bodyType-${opt.value}`} className="filter-sidebar__checkbox-label">
                  <input
                    type="checkbox"
                    name="bodyType"
                    value={opt.value}
                    checked={selectedBodyTypes.includes(opt.value)}
                    onChange={handleCheckboxChange}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
          {/* Transmission checkboxes */}
          <div className="filter-sidebar__section">
            <label className="filter-sidebar__label">Převodovka</label>
            <div className="filter-sidebar__checkbox-group">
              {[
                { value: 'manual', label: 'Manuální' },
                { value: 'automatic', label: 'Automatická' },
                { value: 'cvt', label: 'CVT' },
                { value: 'sequential', label: 'Sekvenční' },
              ].map(opt => (
                <label key={`transmission-${opt.value}`} className="filter-sidebar__checkbox-label">
                  <input
                    type="checkbox"
                    name="transmission"
                    value={opt.value}
                    checked={selectedTransmissions.includes(opt.value)}
                    onChange={handleCheckboxChange}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
          {/* Drivetrain checkboxes */}
          <div className="filter-sidebar__section">
            <label className="filter-sidebar__label">Pohon</label>
            <div className="filter-sidebar__checkbox-group">
              {[
                { value: 'fwd', label: 'Přední (FWD)' },
                { value: 'rwd', label: 'Zadní (RWD)' },
                { value: 'awd', label: '4x4 (AWD)' },
                { value: 'four_x_four', label: '4x4 (mechanické)' },
              ].map(opt => (
                <label key={`drivetrain-${opt.value}`} className="filter-sidebar__checkbox-label">
                  <input
                    type="checkbox"
                    name="drivetrain"
                    value={opt.value}
                    checked={selectedDrivetrains.includes(opt.value)}
                    onChange={handleCheckboxChange}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
          {/* Condition checkboxes */}
          <div className="filter-sidebar__section">
            <label className="filter-sidebar__label">Stav</label>
            <div className="filter-sidebar__checkbox-group">
              {[
                { value: 'new', label: 'Nové' },
                { value: 'used', label: 'Použité' },
                { value: 'crashed', label: 'Havárie' },
                { value: 'demo', label: 'Demo' },
              ].map(opt => (
                <label key={`condition-${opt.value}`} className="filter-sidebar__checkbox-label">
                  <input
                    type="checkbox"
                    name="condition"
                    value={opt.value}
                    checked={selectedConditions.includes(opt.value)}
                    onChange={handleCheckboxChange}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </form>
      </div>
    </aside>
  )
}
