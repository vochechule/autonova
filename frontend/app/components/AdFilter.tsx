'use client'
import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getModelsList } from '../data/carData'
import BrandSelect from './BrandSelect'
import ModelSelect from './ModelSelect'
import RangeFilter from './RangeFilter'
import ColorSelect from './ColorSelect'
import ColorFinishSelect from './ColorFinishSelect'
import LocationFilter from './LocationFilter'
import '../styles/components/AdFilter.scss'

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Přidej typ pro inzerát místo any
interface Ad {
  id: string;
  // přidej další pole podle své struktury inzerátu
  [key: string]: unknown;
}

function AdFilterContent({ onResults }: { onResults?: (ads: Ad[]) => void }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showAllFilters, setShowAllFilters] = useState(false)
  const [loading, setLoading] = useState(false)
  const [noResults, setNoResults] = useState(false)
  
  // State pro všechny filtry
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '')
  const [selectedModel, setSelectedModel] = useState(searchParams.get('model') || '')
  const [selectedColor, setSelectedColor] = useState(searchParams.get('color') || '')
  const [selectedColorFinish, setSelectedColorFinish] = useState(searchParams.get('colorFinish') || '')
  const [priceFrom, setPriceFrom] = useState(parseInt(searchParams.get('priceFrom') || '0') || 0)
  const [priceTo, setPriceTo] = useState(parseInt(searchParams.get('priceTo') || '2000000') || 2000000)
  const [mileageFrom, setMileageFrom] = useState(parseInt(searchParams.get('mileageFrom') || '0') || 0)
  const [mileageTo, setMileageTo] = useState(parseInt(searchParams.get('mileageTo') || '500000') || 500000)
  const [locationFilter, setLocationFilter] = useState<{
    latitude: number
    longitude: number
    address: string
    distance: number
  } | null>(null)

  const modelsList = getModelsList(selectedBrand)

  // Handlers
  const handleBrandChange = (brandValue: string) => {
    setSelectedBrand(brandValue)
    setSelectedModel('') // Reset model when brand changes
  }

  const handleModelChange = (modelValue: string) => {
    setSelectedModel(modelValue)
  }

  const handleColorChange = (colorValue: string) => {
    setSelectedColor(colorValue)
  }

  const handleColorFinishChange = (colorFinishValue: string) => {
    setSelectedColorFinish(colorFinishValue)
  }

  const handlePriceChange = (from: number, to: number) => {
    setPriceFrom(from)
    setPriceTo(to)
  }

  const handleMileageChange = (from: number, to: number) => {
    setMileageFrom(from)
    setMileageTo(to)
  }

  const handleLocationChange = (location: {
    latitude: number
    longitude: number
    address: string
    distance: number
  } | null) => {
    setLocationFilter(location)
  }

  // Submit handler
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setNoResults(false)
    
    const form = e.currentTarget
    const params = new URLSearchParams()

    // Přidat všechny form elementy
    for (const el of form.elements) {
      if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement)) continue
      if (el.name && el.value) {
        params.set(el.name, el.value)
      }
    }

    // Přidat custom komponenty z state
    if (selectedBrand) params.set('brand', selectedBrand)
    if (selectedModel) params.set('model', selectedModel)
    if (selectedColor) params.set('color', selectedColor)
    if (selectedColorFinish) params.set('colorFinish', selectedColorFinish)
    if (priceFrom > 0) params.set('priceFrom', priceFrom.toString())
    if (priceTo < 2000000) params.set('priceTo', priceTo.toString())
    if (mileageFrom > 0) params.set('mileageFrom', mileageFrom.toString())
    if (mileageTo < 500000) params.set('mileageTo', mileageTo.toString())

    if (locationFilter) {
      params.set('nearLatitude', locationFilter.latitude.toString())
      params.set('nearLongitude', locationFilter.longitude.toString())
      params.set('nearDistance', locationFilter.distance.toString())
    }

    // Update URL
    router.push(`/ads?${params.toString()}`)

    // Fetch results
    try {
      const res = await fetch(`${API_URL}/ad?${params.toString()}`)
      const data = await res.json()
      const ads: Ad[] = data.ads || data
      setNoResults(ads.length === 0)
      onResults?.(ads)
    } catch (error) {
      console.error('Chyba při načítání inzerátů:', error)
      setNoResults(true)
    } finally {
      setLoading(false)
    }
  }

  // Effect pro načtení dat při změně URL
  useEffect(() => {
    // Update state from URL
    setSelectedBrand(searchParams.get('brand') || '')
    setSelectedModel(searchParams.get('model') || '')
    setSelectedColor(searchParams.get('color') || '')
    setSelectedColorFinish(searchParams.get('colorFinish') || '')
    setPriceFrom(parseInt(searchParams.get('priceFrom') || '0') || 0)
    setPriceTo(parseInt(searchParams.get('priceTo') || '2000000') || 2000000)
    setMileageFrom(parseInt(searchParams.get('mileageFrom') || '0') || 0)
    setMileageTo(parseInt(searchParams.get('mileageTo') || '500000') || 500000)

    // Location filter from URL
    const nearLat = searchParams.get('nearLatitude')
    const nearLng = searchParams.get('nearLongitude')
    const nearDist = searchParams.get('nearDistance')
    
    if (nearLat && nearLng && nearDist) {
      setLocationFilter({
        latitude: parseFloat(nearLat),
        longitude: parseFloat(nearLng),
        address: 'Vybraná lokalita',
        distance: parseInt(nearDist)
      })
    } else {
      setLocationFilter(null)
    }

    // Fetch results
    const params = searchParams.toString()
    if (params) {
      setLoading(true)
      fetch(`${API_URL}/ad?${params}`)
        .then(res => res.json())
        .then(data => {
          const ads: Ad[] = data.ads || data
          setNoResults(ads.length === 0)
          setLoading(false)
          onResults?.(ads)
        })
        .catch(error => {
          console.error('Chyba při načítání inzerátů:', error)
          setNoResults(true)
          setLoading(false)
        })
    }
  }, [searchParams, onResults])

  return (
    <section className="ad-filter">
      <form className="ad-filter__form" onSubmit={handleSubmit}>
        {/* Search bar */}
        <div className="ad-filter__search-section">
          <div className="ad-filter__search-container">
            <svg className="ad-filter__search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <input
              name="search"
              type="text"
              placeholder="Hledat vozidla..."
              className="ad-filter__search-input"
              defaultValue={searchParams.get('search') || ''}
            />
          </div>
        </div>

        {/* Main filters */}
        <div className="ad-filter__main-filters">
          <div className="ad-filter__filter-group">
            <label className="ad-filter__label">Značka</label>
            <BrandSelect
              value={selectedBrand}
              onChange={handleBrandChange}
            />
          </div>

          <div className="ad-filter__filter-group">
            <label className="ad-filter__label">Model</label>
            <ModelSelect
              value={selectedModel}
              onChange={handleModelChange}
              models={modelsList}
              disabled={!selectedBrand}
            />
          </div>

          <div className="ad-filter__filter-group">
            <label className="ad-filter__label">Cena</label>
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

          <div className="ad-filter__filter-group">
            <label className="ad-filter__label">Nájezd</label>
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
        </div>

        {/* Actions */}
        <div className="ad-filter__actions">
          <button type="submit" className="ad-filter__submit">
            Vyhledat
          </button>
          <button 
            type="button" 
            className="ad-filter__all-filters-toggle" 
            onClick={() => setShowAllFilters(prev => !prev)}
          >
            {showAllFilters ? 'Méně filtrů' : 'Všechny filtry'}
          </button>
        </div>

        {/* All filters */}
        {showAllFilters && (
          <div className="ad-filter__all-filters">
            <div className="ad-filter__all-filters-grid">
              <div className="ad-filter__filter-group ad-filter__filter-group--full-width">
                <LocationFilter 
                  onLocationChange={handleLocationChange}
                />
              </div>

              <div className="ad-filter__filter-group">
                <label className="ad-filter__label">Barva</label>
                <ColorSelect
                  value={selectedColor}
                  onChange={handleColorChange}
                />
              </div>

              <div className="ad-filter__filter-group">
                <label className="ad-filter__label">Povrchová úprava</label>
                <ColorFinishSelect
                  value={selectedColorFinish}
                  onChange={handleColorFinishChange}
                />
              </div>

              <div className="ad-filter__filter-group">
                <label className="ad-filter__label" htmlFor="fuel">Palivo</label>
                <select id="fuel" name="fuel" className="ad-filter__select" defaultValue={searchParams.get('fuel') || ''}>
                  <option value="">Všechna paliva</option>
                  <option value="petrol">Benzín</option>
                  <option value="diesel">Nafta</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="electric">Elektro</option>
                  <option value="lpg">LPG</option>
                  <option value="cng">CNG</option>
                </select>
              </div>

              <div className="ad-filter__filter-group">
                <label className="ad-filter__label" htmlFor="bodyType">Karoserie</label>
                <select id="bodyType" name="bodyType" className="ad-filter__select" defaultValue={searchParams.get('bodyType') || ''}>
                  <option value="">Všechny karoserie</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="sedan">Sedan</option>
                  <option value="kombi">Kombi</option>
                  <option value="suv">SUV</option>
                  <option value="coupe">Coupé</option>
                  <option value="cabrio">Cabrio</option>
                  <option value="mpv">MPV</option>
                  <option value="pickup">Pickup</option>
                  <option value="van">Van</option>
                  <option value="jiné">Jiné</option>
                </select>
              </div>

              <div className="ad-filter__filter-group">
                <label className="ad-filter__label" htmlFor="transmission">Převodovka</label>
                <select
                  id="transmission"
                  name="transmission"
                  className="ad-filter__select"
                  defaultValue={searchParams.get('transmission') || ''}
                >
                  <option value="">Všechny převodovky</option>
                  <option value="manual">Manuální</option>
                  <option value="automatic">Automatická</option>
                  <option value="cvt">CVT</option>
                  <option value="sequential">Sekvenční</option>
                </select>
              </div>

              <div className="ad-filter__filter-group">
                <label className="ad-filter__label" htmlFor="drivetrain">Pohon</label>
                <select id="drivetrain" name="drivetrain" className="ad-filter__select" defaultValue={searchParams.get('drivetrain') || ''}>
                  <option value="">Všechny pohony</option>
                  <option value="fwd">Přední (FWD)</option>
                  <option value="rwd">Zadní (RWD)</option>
                  <option value="awd">4x4 (AWD)</option>
                  <option value="four_x_four">4x4 (mechanické)</option>
                </select>
              </div>

              <div className="ad-filter__filter-group">
                <label className="ad-filter__label" htmlFor="condition">Stav</label>
                <select id="condition" name="condition" className="ad-filter__select" defaultValue={searchParams.get('condition') || ''}>
                  <option value="">Všechny stavy</option>
                  <option value="new">Nové</option>
                  <option value="used">Použité</option>
                  <option value="crashed">Havárie</option>
                  <option value="demo">Demo</option>
                </select>
              </div>

              <div className="ad-filter__filter-group">
                <label className="ad-filter__label" htmlFor="doorCount">Počet dveří</label>
                <input id="doorCount" name="doorCount" type="number" min={2} max={6} className="ad-filter__input" placeholder="Počet dveří" defaultValue={searchParams.get('doorCount') || ''} />
              </div>

              <div className="ad-filter__filter-group">
                <label className="ad-filter__label" htmlFor="seatCount">Počet míst</label>
                <input id="seatCount" name="seatCount" type="number" min={2} max={9} className="ad-filter__input" placeholder="Počet míst" defaultValue={searchParams.get('seatCount') || ''} />
              </div>

              <div className="ad-filter__filter-group">
                <label className="ad-filter__label" htmlFor="powerFrom">Výkon od (kW)</label>
                <input id="powerFrom" name="powerFrom" type="number" className="ad-filter__input" placeholder="Výkon od" defaultValue={searchParams.get('powerFrom') || ''} />
              </div>

              <div className="ad-filter__filter-group">
                <label className="ad-filter__label" htmlFor="powerTo">Výkon do (kW)</label>
                <input id="powerTo" name="powerTo" type="number" className="ad-filter__input" placeholder="Výkon do" defaultValue={searchParams.get('powerTo') || ''} />
              </div>

              <div className="ad-filter__filter-group">
                <label className="ad-filter__label" htmlFor="yearFrom">Rok od</label>
                <input id="yearFrom" name="yearFrom" type="number" className="ad-filter__input" placeholder="Rok od" defaultValue={searchParams.get('yearFrom') || ''} />
              </div>

              <div className="ad-filter__filter-group">
                <label className="ad-filter__label" htmlFor="yearTo">Rok do</label>
                <input id="yearTo" name="yearTo" type="number" className="ad-filter__input" placeholder="Rok do" defaultValue={searchParams.get('yearTo') || ''} />
              </div>
            </div>
          </div>
        )}

        {/* Hidden inputs */}
        <input type="hidden" name="brand" value={selectedBrand} />
        <input type="hidden" name="model" value={selectedModel} />
        <input type="hidden" name="color" value={selectedColor} />
        <input type="hidden" name="colorFinish" value={selectedColorFinish} />
        {locationFilter && (
          <>
            <input type="hidden" name="nearLatitude" value={locationFilter.latitude} />
            <input type="hidden" name="nearLongitude" value={locationFilter.longitude} />
            <input type="hidden" name="nearDistance" value={locationFilter.distance} />
          </>
        )}
      </form>

      {/* Loading & results */}
      {loading && <div className="ad-filter__loading">Načítám...</div>}
      {noResults && (
        <div className="ad-filter__no-results">
          Žádné inzeráty neodpovídají zadaným filtrům. Zkuste upravit kritéria hledání.
        </div>
      )}
    </section>
  )
}

type AdFilterProps = React.ComponentProps<typeof AdFilterContent>

export default function AdFilter(props: AdFilterProps) {
  return (
    <Suspense fallback={null}>
      <AdFilterContent {...props} />
    </Suspense>
  )
}