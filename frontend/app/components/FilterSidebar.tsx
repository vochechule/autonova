'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useCallback, useRef } from 'react'
import { getModelsList } from '../data/carData'
import BrandSelect from './BrandSelect'
import ModelSelect from './ModelSelect'
import RangeFilter from './RangeFilter'
import ColorSelect from './ColorSelect' // ✅ PŘIDÁNO
import ColorFinishSelect from './ColorFinishSelect' // ✅ PŘIDÁNO
import LocationFilter from './LocationFilter'
import '../styles/components/FilterSidebar.scss'

interface FilterSidebarProps {
  onResults?: (adsData: any) => void
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
  onResults, 
  isVisible = true, 
  onClose, 
  onLocationChange 
}: FilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const lastFetchedParams = useRef<string>('')

  // State pro brand/model filtry
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '')
  const [selectedModel, setSelectedModel] = useState(searchParams.get('model') || '')
  const [selectedColor, setSelectedColor] = useState(searchParams.get('color') || '') // ✅ PŘIDÁNO
  const [selectedColorFinish, setSelectedColorFinish] = useState(searchParams.get('colorFinish') || '') // ✅ PŘIDÁNO
  
  // State pro range filtry
  const [priceFrom, setPriceFrom] = useState(parseInt(searchParams.get('priceFrom') || '0') || 0)
  const [priceTo, setPriceTo] = useState(parseInt(searchParams.get('priceTo') || '2000000') || 2000000)
  const [mileageFrom, setMileageFrom] = useState(parseInt(searchParams.get('mileageFrom') || '0') || 0)
  const [mileageTo, setMileageTo] = useState(parseInt(searchParams.get('mileageTo') || '500000') || 500000)

  // ✅ PŘIDÁNO - Location filter state
  const [locationFilter, setLocationFilter] = useState<{
    latitude: number
    longitude: number
    address: string
    distance: number
  } | null>(null)

  const modelsList = getModelsList(selectedBrand)

  // ✅ PŘIDÁNO - Handler pro barvu
  const handleColorChange = (colorValue: string) => {
    setSelectedColor(colorValue)
    // Trigger immediate filter update
    setTimeout(() => {
      const form = document.querySelector('.filter-sidebar__form') as HTMLFormElement
      if (form) {
        const params = buildParams(form)
        const newParamsString = params.toString()
        const currentParamsString = searchParams.toString()
        
        if (currentParamsString !== newParamsString) {
          router.push(`/ads${newParamsString ? `?${newParamsString}` : ''}`)
          fetchAds(newParamsString) // ✅ String místo URLSearchParams
        }
      }
    }, 0)
  }

  // ✅ PŘIDÁNO - Handler pro povrchovou úpravu
  const handleColorFinishChange = (colorFinishValue: string) => {
    setSelectedColorFinish(colorFinishValue)
    // Trigger immediate filter update
    setTimeout(() => {
      const form = document.querySelector('.filter-sidebar__form') as HTMLFormElement
      if (form) {
        const params = buildParams(form)
        const newParamsString = params.toString()
        const currentParamsString = searchParams.toString()
        
        if (currentParamsString !== newParamsString) {
          router.push(`/ads${newParamsString ? `?${newParamsString}` : ''}`)
          fetchAds(newParamsString) // ✅ String místo URLSearchParams
        }
      }
    }, 0)
  }

  // Handlery pro změny v komponentách
  const handleBrandChange = (brandValue: string) => {
    console.log('Selected brand:', brandValue) // Přidejte tento log
    setSelectedBrand(brandValue)
    setSelectedModel('') // Reset model when brand changes
    // Trigger immediate filter update
    setTimeout(() => {
      const form = document.querySelector('.filter-sidebar__form') as HTMLFormElement
      if (form) {
        const params = buildParams(form)
        console.log('Built params:', params.toString()) // Přidejte tento log
        const newParamsString = params.toString()
        const currentParamsString = searchParams.toString()
        
        if (currentParamsString !== newParamsString) {
          router.push(`/ads${newParamsString ? `?${newParamsString}` : ''}`)
          fetchAds(newParamsString) // ✅ String místo URLSearchParams
        }
      }
    }, 0)
  }

  const handleModelChange = (modelValue: string) => {
    setSelectedModel(modelValue)
    // Trigger immediate filter update
    setTimeout(() => {
      const form = document.querySelector('.filter-sidebar__form') as HTMLFormElement
      if (form) {
        const params = buildParams(form)
        const newParamsString = params.toString()
        const currentParamsString = searchParams.toString()
        
        if (currentParamsString !== newParamsString) {
          router.push(`/ads${newParamsString ? `?${newParamsString}` : ''}`)
          fetchAds(newParamsString) // ✅ String místo URLSearchParams
        }
      }
    }, 0)
  }

  const handlePriceChange = (from: number, to: number) => {
    setPriceFrom(from)
    setPriceTo(to)
    // Trigger immediate filter update
    setTimeout(() => {
      const form = document.querySelector('.filter-sidebar__form') as HTMLFormElement
      if (form) {
        const params = buildParams(form)
        const newParamsString = params.toString()
        const currentParamsString = searchParams.toString()
        
        if (currentParamsString !== newParamsString) {
          router.push(`/ads${newParamsString ? `?${newParamsString}` : ''}`)
          fetchAds(newParamsString) // ✅ String místo URLSearchParams
        }
      }
    }, 0)
  }

  const handleMileageChange = (from: number, to: number) => {
    setMileageFrom(from)
    setMileageTo(to)
    // Trigger immediate filter update
    setTimeout(() => {
      const form = document.querySelector('.filter-sidebar__form') as HTMLFormElement
      if (form) {
        const params = buildParams(form)
        const newParamsString = params.toString()
        const currentParamsString = searchParams.toString()
        
        if (currentParamsString !== newParamsString) {
          router.push(`/ads${newParamsString ? `?${newParamsString}` : ''}`)
          fetchAds(newParamsString) // ✅ String místo URLSearchParams
        }
      }
    }, 0)
  }

  // Fetch ads with current params - only if params changed
  const fetchAds = async (paramsString: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = `http://localhost:3000/ad${paramsString ? `?${paramsString}` : ''}`;
      console.log('🚀 FETCHING URL:', url); // ✅ PŘIDÁNO
      
      const res = await fetch(url);
      console.log('📡 Response status:', res.status); // ✅ PŘIDÁNO
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('📦 FULL RESPONSE DATA:', data); // ✅ PŘIDÁNO
      console.log('📊 Number of ads returned:', data.ads?.length || 'No ads property'); // ✅ PŘIDÁNO
      
      if (onResults) {
        onResults(data);
      }
    } catch (err) {
      console.error('❌ Error fetching ads:', err);
      setError(err instanceof Error ? err.message : 'Chyba při načítání');
    } finally {
      setLoading(false);
    }
  }

  // Build URL params from form
  const buildParams = useCallback((form: HTMLFormElement) => {
    const formData = new FormData(form)
    const params = new URLSearchParams()

    // Multi-value fields (checkboxes)
    const multiFields = ['fuel', 'bodyType', 'transmission', 'drivetrain', 'condition']
    multiFields.forEach(field => {
      const values = Array.from(form.querySelectorAll(`input[name='${field}']:checked`)).map((el: any) => el.value)
      values.forEach(val => params.append(field, val))
    })

    // Single-value fields
    for (const [key, value] of formData.entries()) {
      if (multiFields.includes(key)) continue // skip, already handled
      if (value && value.toString().trim() !== '') {
        params.set(key, value.toString().trim())
      }
    }

    // Přidat state hodnoty
    if (selectedBrand) params.set('brand', selectedBrand)
    if (selectedModel) params.set('model', selectedModel)
    if (selectedColor) params.set('color', selectedColor) // ✅ PŘIDÁNO
    if (selectedColorFinish) params.set('colorFinish', selectedColorFinish) // ✅ PŘIDÁNO
    
    // Přidat price range z state
    if (priceFrom > 0) params.set('priceFrom', priceFrom.toString())
    if (priceTo < 2000000) params.set('priceTo', priceTo.toString())
    
    // Přidat mileage range z state
    if (mileageFrom > 0) params.set('mileageFrom', mileageFrom.toString())
    if (mileageTo < 500000) params.set('mileageTo', mileageTo.toString())

    // ✅ PŘIDÁNO - Location filter
    if (locationFilter) {
      params.set('nearLatitude', locationFilter.latitude.toString())
      params.set('nearLongitude', locationFilter.longitude.toString())
      params.set('nearDistance', locationFilter.distance.toString())
    }

    console.log('🔧 BuildParams result:', params.toString())
    return params
  }, [selectedBrand, selectedModel, selectedColor, selectedColorFinish, priceFrom, priceTo, mileageFrom, mileageTo, locationFilter]) // ✅ PŘIDÁNO locationFilter

  // Handle checkbox changes (immediate)
  const handleCheckboxChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const form = e.target.form!
    const params = buildParams(form)
    const newParamsString = params.toString()
    const currentParamsString = searchParams.toString()
    
    // Only update if params actually changed
    if (currentParamsString !== newParamsString) {
      router.push(`/ads${newParamsString ? `?${newParamsString}` : ''}`)
      await fetchAds(newParamsString) // ✅ String místo URLSearchParams
    }
  }, [router, buildParams, fetchAds, searchParams])

  // Handle text input changes (debounced)
  const handleTextInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const form = e.target.form!
    
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Set new timer
    debounceTimer.current = setTimeout(async () => {
      const params = buildParams(form)
      const newParamsString = params.toString()
      const currentParamsString = searchParams.toString()
      
      // Only update if params actually changed
      if (currentParamsString !== newParamsString) {
        router.push(`/ads${newParamsString ? `?${newParamsString}` : ''}`)
        await fetchAds(newParamsString) // ✅ String místo URLSearchParams
      }
    }, 500) // 500ms debounce
  }, [router, buildParams, fetchAds, searchParams])

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])

  // Load initial results - only once on mount
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    fetchAds(params.toString()) // ✅ Převod na string
  }, []) // Removed dependencies to prevent infinite loop

  // Synchronizace state s URL parametry
  useEffect(() => {
    setSelectedBrand(searchParams.get('brand') || '')
    setSelectedModel(searchParams.get('model') || '')
    setSelectedColor(searchParams.get('color') || '') // ✅ PŘIDÁNO
    setSelectedColorFinish(searchParams.get('colorFinish') || '') // ✅ PŘIDÁNO
    setPriceFrom(parseInt(searchParams.get('priceFrom') || '0') || 0)
    setPriceTo(parseInt(searchParams.get('priceTo') || '2000000') || 2000000)
    setMileageFrom(parseInt(searchParams.get('mileageFrom') || '0') || 0)
    setMileageTo(parseInt(searchParams.get('mileageTo') || '500000') || 500000)
  }, [searchParams])

  // ✅ OPRAVENO - Location change handler
  const handleLocationChangeInternal = (location: {
    latitude: number
    longitude: number
    address: string
    distance: number
  } | null) => {
    console.log('🗺️ FilterSidebar: Location changed:', location)
    setLocationFilter(location)
    
    // Předej dál do parent komponenty
    if (onLocationChange) {
      onLocationChange(location)
    }
    
    // TRIGGER IMMEDIATE SEARCH
    setTimeout(() => {
      const form = document.querySelector('.filter-sidebar__form') as HTMLFormElement
      if (form) {
        const params = buildParams(form)
        console.log('🔧 Final params being sent:', params.toString()) // ✅ PŘIDÁNO
        const newParamsString = params.toString()
        const currentParamsString = searchParams.toString()
        
        if (currentParamsString !== newParamsString) {
          console.log('🚀 Navigating to:', `/ads${newParamsString ? `?${newParamsString}` : ''}`) // ✅ PŘIDÁNO
          router.push(`/ads${newParamsString ? `?${newParamsString}` : ''}`)
          fetchAds(newParamsString) // ✅ String místo URLSearchParams
        } else {
          console.log('⚠️ Params unchanged, not fetching') // ✅ PŘIDÁNO
        }
      }
    }, 0)
  }

  return (
    <aside className={`filter-sidebar ${isVisible ? 'filter-sidebar--visible' : ''}`}>
      <div className="filter-sidebar__content">
        <div className="filter-sidebar__header">
          <h2>Filtry</h2>
          <button className="filter-sidebar__close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* ✅ VRÁCENO - Search pole */}
        <form className="filter-sidebar__form">
          <div className="filter-sidebar__section">
            <label className="filter-sidebar__label">Hledat</label>
            <input
              type="text"
              name="search"
              className="filter-sidebar__input"
              placeholder="Zadejte značku, model..."
              defaultValue={searchParams.get('search') || ''}
              onChange={handleTextInputChange}
            />
          </div>

          {/* ✅ PŘIDÁNO - Location Filter */}
          {onLocationChange && (
            <div className="filter-sidebar__section">
              <LocationFilter 
                onLocationChange={handleLocationChangeInternal}
                className="filter-sidebar__location"
              />
            </div>
          )}

          {/* Značka */}
          <div className="filter-sidebar__section">
            <label className="filter-sidebar__label">Značka</label>
            <BrandSelect
              value={selectedBrand}
              onChange={handleBrandChange}
            />
          </div>

          {/* Model */}
          <div className="filter-sidebar__section">
            <label className="filter-sidebar__label">Model</label>
            <ModelSelect
              value={selectedModel}
              onChange={handleModelChange}
              models={modelsList}
              disabled={!selectedBrand}
            />
          </div>

          {/* ✅ PŘIDÁNO - Color Filter */}
          <div className="filter-sidebar__section">
            <label className="filter-sidebar__label">Barva</label>
            <ColorSelect
              value={selectedColor}
              onChange={handleColorChange}
              placeholder="Všechny barvy"
              className="filter-sidebar__color-select"
            />
          </div>

          {/* ✅ PŘIDÁNO - Color Finish Filter */}
          <div className="filter-sidebar__section">
            <label className="filter-sidebar__label">Povrchová úprava</label>
            <ColorFinishSelect
              value={selectedColorFinish}
              onChange={handleColorFinishChange}
              placeholder="Všechny úpravy"
              className="filter-sidebar__color-finish-select"
            />
          </div>

          {/* Price Range */}
          <div className="filter-sidebar__section">
            <label className="filter-sidebar__label">Cena</label>
            <RangeFilter
              label="Cena"
              namePrefix="price"
              min={0}
              max={2000000}
              step={10000}
              valueFrom={priceFrom}
              valueTo={priceTo}
              formatValue={(value) => `${(value / 1000).toFixed(0)}k Kč`}
              onValueChange={handlePriceChange}
            />
          </div>

          {/* Mileage Range */}
          <div className="filter-sidebar__section">
            <label className="filter-sidebar__label">Nájezd</label>
            <RangeFilter
              label="Nájezd"
              namePrefix="mileage"
              min={0}
              max={500000}
              step={5000}
              valueFrom={mileageFrom}
              valueTo={mileageTo}
              formatValue={(value) => `${(value / 1000).toFixed(0)}k km`}
              onValueChange={handleMileageChange}
            />
          </div>

          {/* Year Range */}
          <div className="filter-sidebar__section">
            <label className="filter-sidebar__label">Rok výroby</label>
            <div className="filter-sidebar__range">
              <input
                type="number"
                name="yearFrom"
                className="filter-sidebar__input filter-sidebar__input--small"
                placeholder="Od"
                defaultValue={searchParams.get('yearFrom') || ''}
                onChange={handleTextInputChange}
              />
              <span className="filter-sidebar__range-separator">-</span>
              <input
                type="number"
                name="yearTo"
                className="filter-sidebar__input filter-sidebar__input--small"
                placeholder="Do"
                defaultValue={searchParams.get('yearTo') || ''}
                onChange={handleTextInputChange}
              />
            </div>
          </div>

          {/* Dropdowns */}
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
                    defaultChecked={searchParams.getAll('fuel').includes(opt.value)}
                    onChange={handleCheckboxChange}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

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
                    defaultChecked={searchParams.getAll('bodyType').includes(opt.value)}
                    onChange={handleCheckboxChange}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-sidebar__section">
            <label className="filter-sidebar__label">Převodovka</label>
            <div className="filter-sidebar__checkbox-group">
              {[
                { value: 'manual', label: 'Manuální' },
                { value: 'automatic', label: 'Automatická' },
                { value: 'semi_automatic', label: 'Poloautomatická' },
              ].map(opt => (
                <label key={`transmission-${opt.value}`} className="filter-sidebar__checkbox-label">
                  <input
                    type="checkbox"
                    name="transmission"
                    value={opt.value}
                    defaultChecked={searchParams.getAll('transmission').includes(opt.value)}
                    onChange={handleCheckboxChange}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

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
                    defaultChecked={searchParams.getAll('drivetrain').includes(opt.value)}
                    onChange={handleCheckboxChange}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

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
                    defaultChecked={searchParams.getAll('condition').includes(opt.value)}
                    onChange={handleCheckboxChange}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {loading && (
            <div className="filter-sidebar__loading">
              Načítám výsledky...
            </div>
          )}
        </form>
      </div>
    </aside>
  )
}
