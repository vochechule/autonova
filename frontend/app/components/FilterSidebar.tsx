'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useCallback, useRef } from 'react'
import '../styles/components/FilterSidebar.scss'

interface FilterSidebarProps {
  onResults?: (ads: any[]) => void
  isVisible?: boolean
  onClose?: () => void
}

export default function FilterSidebar({ onResults, isVisible = true, onClose }: FilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const lastFetchedParams = useRef<string>('')

  // Fetch ads with current params - only if params changed
  const fetchAds = useCallback(async (params: URLSearchParams) => {
    const paramsString = params.toString()
    
    // Avoid duplicate requests
    if (lastFetchedParams.current === paramsString) {
      return
    }
    
    lastFetchedParams.current = paramsString
    setLoading(true)
    
    try {
      const res = await fetch(`http://localhost:3000/ad${paramsString ? `?${paramsString}` : ''}`)
      const data = await res.json()
      if (onResults) {
        onResults(data)
      }
    } catch (error) {
      console.error('Filter error:', error)
    } finally {
      setLoading(false)
    }
  }, [onResults])

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

    return params
  }, [])

  // Handle checkbox changes (immediate)
  const handleCheckboxChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const form = e.target.form!
    const params = buildParams(form)
    const newParamsString = params.toString()
    const currentParamsString = searchParams.toString()
    
    // Only update if params actually changed
    if (currentParamsString !== newParamsString) {
      router.push(`/ads${newParamsString ? `?${newParamsString}` : ''}`)
      await fetchAds(params)
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
        await fetchAds(params)
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
    fetchAds(params)
  }, []) // Removed dependencies to prevent infinite loop

  return (
    <aside className={`filter-sidebar ${isVisible ? 'filter-sidebar--visible' : ''}`}>
      <div className="filter-sidebar__header">
        <h3 className="filter-sidebar__title">Filtry</h3>
        {onClose && (
          <button 
            className="filter-sidebar__close"
            onClick={onClose}
            aria-label="Zavřít filtry"
          >
            ×
          </button>
        )}
      </div>

      <form className="filter-sidebar__form">
        {/* Search */}
        <div className="filter-sidebar__group">
          <label htmlFor="search" className="filter-sidebar__label">Hledání</label>
          <input
            type="text"
            id="search"
            name="search"
            className="filter-sidebar__input"
            placeholder="Značka, model..."
            defaultValue={searchParams.get('search') || ''}
            onChange={handleTextInputChange}
          />
        </div>

        {/* Brand & Model */}
        <div className="filter-sidebar__group">
          <label htmlFor="brand" className="filter-sidebar__label">Značka</label>
          <input
            type="text"
            id="brand"
            name="brand"
            className="filter-sidebar__input"
            placeholder="Např. Škoda"
            defaultValue={searchParams.get('brand') || ''}
            onChange={handleTextInputChange}
          />
        </div>

        <div className="filter-sidebar__group">
          <label htmlFor="model" className="filter-sidebar__label">Model</label>
          <input
            type="text"
            id="model"
            name="model"
            className="filter-sidebar__input"
            placeholder="Např. Octavia"
            defaultValue={searchParams.get('model') || ''}
            onChange={handleTextInputChange}
          />
        </div>

        {/* Price Range */}
        <div className="filter-sidebar__group">
          <label className="filter-sidebar__label">Cena</label>
          <div className="filter-sidebar__range">
            <input
              type="number"
              name="priceFrom"
              className="filter-sidebar__input filter-sidebar__input--small"
              placeholder="Od"
              defaultValue={searchParams.get('priceFrom') || ''}
              onChange={handleTextInputChange}
            />
            <span className="filter-sidebar__range-separator">-</span>
            <input
              type="number"
              name="priceTo"
              className="filter-sidebar__input filter-sidebar__input--small"
              placeholder="Do"
              defaultValue={searchParams.get('priceTo') || ''}
              onChange={handleTextInputChange}
            />
          </div>
        </div>

        {/* Mileage Range */}
        <div className="filter-sidebar__group">
          <label className="filter-sidebar__label">Nájezd (km)</label>
          <div className="filter-sidebar__range">
            <input
              type="number"
              name="mileageFrom"
              className="filter-sidebar__input filter-sidebar__input--small"
              placeholder="Od"
              defaultValue={searchParams.get('mileageFrom') || ''}
              onChange={handleTextInputChange}
            />
            <span className="filter-sidebar__range-separator">-</span>
            <input
              type="number"
              name="mileageTo"
              className="filter-sidebar__input filter-sidebar__input--small"
              placeholder="Do"
              defaultValue={searchParams.get('mileageTo') || ''}
              onChange={handleTextInputChange}
            />
          </div>
        </div>

        {/* Year Range */}
        <div className="filter-sidebar__group">
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
        <div className="filter-sidebar__group">
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

        <div className="filter-sidebar__group">
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

        <div className="filter-sidebar__group">
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

        <div className="filter-sidebar__group">
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

        <div className="filter-sidebar__group">
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
    </aside>
  )
}
