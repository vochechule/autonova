'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import '../styles/components/ActiveFilters.scss'

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
  doorCount: 'Počet dveří',
  seatCount: 'Počet míst',
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

function getValueLabel(key: string, value: string): string {
  switch (key) {
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
    case 'priceFrom':
    case 'priceTo':
      return `${parseInt(value).toLocaleString()} Kč`
    case 'mileageFrom':
    case 'mileageTo':
      return `${parseInt(value).toLocaleString()} km`
    case 'powerFrom':
    case 'powerTo':
      return `${value} kW`
    default:
      return value
  }
}

export default function ActiveFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Process filters to handle multi-value params
  const activeFilters: Array<{ key: string; value: string; isMulti: boolean }> = []
  const multiValueFields = ['fuel', 'bodyType', 'transmission', 'drivetrain', 'condition']
  
  // Get unique keys
  const allKeys = Array.from(new Set(Array.from(searchParams.keys())))
  
  allKeys.forEach(key => {
    if (key === 'page') return // exclude pagination
    
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
    const newParams = new URLSearchParams()
    
    // Copy all params except the one we want to remove
    Array.from(searchParams.entries()).forEach(([key, value]) => {
      if (key === keyToRemove) {
        // For multi-value fields, only remove the specific value
        if (valueToRemove && multiValueFields.includes(key) && value !== valueToRemove) {
          newParams.append(key, value)
        }
        // For single-value fields, don't add anything (removes the whole filter)
      } else {
        newParams.append(key, value)
      }
    })
    
    router.push(`/ads${newParams.toString() ? `?${newParams.toString()}` : ''}`)
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
