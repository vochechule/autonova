'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import '../styles/components/ActiveFilters.scss'
import { carBrands } from '../data/carData'
import { colors, colorFinishes } from '../data/colorData'

const filterLabels: Record<string, string> = {
  search: 'Hledání',
  brand: 'Značka',
  model: 'Model',
  fuel: 'Palivo',
  bodyType: 'Karoserie',
  transmission: 'Převodovka',
  drivetrain: 'Pohon',
  condition: 'Stav',
  priceFrom: 'Cena od',
  priceTo: 'Cena do',
  mileageFrom: 'Nájezd od',
  mileageTo: 'Nájezd do',
  yearFrom: 'Rok od',
  yearTo: 'Rok do',
  powerFrom: 'Výkon od',
  powerTo: 'Výkon do',
  color: 'Barva',
  colorFinish: 'Lak',
  doorCount: 'Počet dveří',
  seatCount: 'Počet míst',
  nearLatitude: 'Zeměpisná šířka',
  nearLongitude: 'Zeměpisná délka',
  nearDistance: 'Vzdálenost'
}

const fuelLabels: Record<string, string> = {
  petrol: 'Benzín',
  diesel: 'Nafta',
  hybrid: 'Hybrid',
  electric: 'Elektro',
  lpg: 'LPG',
  cng: 'CNG',
}

const bodyTypeLabels: Record<string, string> = {
  hatchback: 'Hatchback',
  sedan: 'Sedan',
  kombi: 'Kombi',
  suv: 'SUV',
  coupe: 'Coupé',
  cabrio: 'Cabrio',
  mpv: 'MPV',
  pickup: 'Pickup',
  van: 'Van',
  jiné: 'Jiné',
}

const transmissionLabels: Record<string, string> = {
  manual: 'Manuální',
  automatic: 'Automatická',
  semi_automatic: 'Poloautomatická',
}

const drivetrainLabels: Record<string, string> = {
  fwd: 'Přední (FWD)',
  rwd: 'Zadní (RWD)',
  awd: '4x4 (AWD)',
  four_x_four: '4x4 (mechanické)',
}

const conditionLabels: Record<string, string> = {
  new: 'Nové',
  used: 'Použité',
  crashed: 'Havárie',
  demo: 'Demo',
}

// ✅ Helper function to get brand name
function getBrandLabel(brandKey: string): string {
  const brand = carBrands[brandKey as keyof typeof carBrands]
  return brand ? brand.name : brandKey
}

// ✅ Helper function to get model name
function getModelLabel(brandKey: string, modelKey: string): string {
  const brand = carBrands[brandKey as keyof typeof carBrands]
  if (!brand) return modelKey
  
  // Find model by converted key
  const model = brand.models.find(m => 
    m.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') === modelKey
  )
  return model || modelKey
}

// ✅ Helper function to get color name
function getColorLabel(colorKey: string): string {
  const color = colors.find(c => c.value === colorKey)
  return color ? color.label : colorKey
}

// ✅ Helper function to get color finish name
function getColorFinishLabel(finishKey: string): string {
  const finish = colorFinishes.find(f => f.value === finishKey)
  return finish ? finish.label : finishKey
}

export default function ActiveFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // ✅ Move getValueLabel inside component to access searchParams
  function getValueLabel(key: string, value: string): string {
    switch (key) {
      case 'brand':
        return getBrandLabel(value)
      case 'model':
        // ✅ Use searchParams hook instead of window.location
        const brandKey = searchParams.get('brand')
        return brandKey ? getModelLabel(brandKey, value) : value
      case 'fuel':
        return fuelLabels[value] || value
      case 'bodyType':
        return bodyTypeLabels[value] || value
      case 'transmission':
        return transmissionLabels[value] || value
      case 'drivetrain':
        return drivetrainLabels[value] || value
      case 'condition':
        return conditionLabels[value] || value
      case 'color':
        return getColorLabel(value)
      case 'colorFinish':
        return getColorFinishLabel(value)
      case 'priceFrom':
      case 'priceTo':
        return `${parseInt(value).toLocaleString()} Kč`
      case 'mileageFrom':
      case 'mileageTo':
        return `${parseInt(value).toLocaleString()} km`
      case 'powerFrom':
      case 'powerTo':
        return `${value} kW`
      case 'doorCount':
      case 'seatCount':
        return `${value}`
      case 'nearDistance':
        return `${value} km`
      case 'nearLatitude':
      case 'nearLongitude':
        return `${parseFloat(value).toFixed(4)}`
      default:
        return value
    }
  }

  // Process filters to handle multi-value params
  const activeFilters: Array<{ key: string; value: string; isMulti: boolean }> = []
  const multiValueFields = ['fuel', 'bodyType', 'transmission', 'drivetrain', 'condition', 'color']
  
  // ✅ Skip geolocation filters from display (they're technical)
  const skipFilters = ['nearLatitude', 'nearLongitude']
  
  // Get unique keys
  const allKeys = Array.from(new Set(Array.from(searchParams.keys())))
  
  allKeys.forEach(key => {
    if (key === 'page' || skipFilters.includes(key)) return // exclude pagination and geo coords
    
    if (multiValueFields.includes(key)) {
      // For multi-value fields, get all values and create separate filter tags
      const values = searchParams.getAll(key)
      values.forEach(value => {
        if (value) {
          activeFilters.push({ key, value, isMulti: true })
        }
      })
    } else {
      // For single-value fields
      const value = searchParams.get(key)
      if (value) {
        activeFilters.push({ key, value, isMulti: false })
      }
    }
  })

  const removeFilter = (keyToRemove: string, valueToRemove?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const multiValueFields = ['fuel', 'bodyType', 'transmission', 'drivetrain', 'condition', 'color']

    if (valueToRemove && multiValueFields.includes(keyToRemove)) {
      // Remove only the specific value for multi-value fields
      const values = params.getAll(keyToRemove).filter(v => v !== valueToRemove)
      params.delete(keyToRemove)
      values.forEach(v => params.append(keyToRemove, v))
    } else {
      // Remove the whole key for single-value fields
      params.delete(keyToRemove)
      
      // ✅ Special handling for model - also remove brand if model is removed
      if (keyToRemove === 'model') {
        params.delete('brand')
      }
    }

    router.push(`/ads${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const clearAllFilters = () => {
    router.push('/ads')
  }

  if (activeFilters.length === 0) {
    return null
  }

  return (
    <div className="active-filters">
      <div className="active-filters__header">
        <span className="active-filters__title">Aktivní filtry:</span>
        <button 
          className="active-filters__clear-all"
          onClick={clearAllFilters}
        >
          Vymazat vše
        </button>
      </div>
      <div className="active-filters__list">
        {activeFilters.map((filter, index) => (
          <div key={`${filter.key}-${filter.value}-${index}`} className="active-filters__tag">
            <span className="active-filters__label">
              {filterLabels[filter.key] || filter.key}:
            </span>
            <span className="active-filters__value">
              {getValueLabel(filter.key, filter.value)}
            </span>
            <button
              className="active-filters__remove"
              onClick={() => removeFilter(filter.key, filter.isMulti ? filter.value : undefined)}
              title={`Odstranit filtr ${filterLabels[filter.key] || filter.key}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
