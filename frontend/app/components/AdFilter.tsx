'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getModelsList } from '../data/carData'
import BrandSelect from './BrandSelect'
import ModelSelect from './ModelSelect'
import RangeFilter from './RangeFilter'
import ColorSelect from './ColorSelect' // ✅ PŘIDÁNO
import ColorFinishSelect from './ColorFinishSelect' // ✅ PŘIDÁNO
import LocationFilter from './LocationFilter'
import '../styles/components/AdFilter.scss'

export default function AdFilter({ onResults }: { onResults?: (ads: any[]) => void }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showAllFilters, setShowAllFilters] = useState(false)
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [noResults, setNoResults] = useState(false)
  
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

  // Do state přidejte:
  const [locationFilter, setLocationFilter] = useState<{
    latitude: number
    longitude: number
    address: string
    distance: number
  } | null>(null)

  const modelsList = getModelsList(selectedBrand)

  const handleBrandChange = (brandValue: string) => {
    setSelectedBrand(brandValue)
    setSelectedModel('') // Reset model when brand changes
  }

  const handleModelChange = (modelValue: string) => {
    setSelectedModel(modelValue)
  }

  // ✅ PŘIDÁNO - Handlery pro barvy
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

  // Handler pro location change:
  const handleLocationChange = (location: {
    latitude: number
    longitude: number
    address: string
    distance: number
  } | null) => {
    console.log('🗺️ AdFilter: Location changed:', location)
    setLocationFilter(location)
    
    // ❌ ODSTRANĚNO - auto submit
    // Lokalita se pouze nastaví, submit se udělá manuálně
  }

  // Hledání a filtrování
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

    // Přidat brand/model/color z state (přepsat hidden inputy)
    if (selectedBrand) params.set('brand', selectedBrand)
    if (selectedModel) params.set('model', selectedModel)
    if (selectedColor) params.set('color', selectedColor) // ✅ PŘIDÁNO
    if (selectedColorFinish) params.set('colorFinish', selectedColorFinish) // ✅ PŘIDÁNO
    
    // Přidat price range (přepsat hidden inputy)
    if (priceFrom > 0) params.set('priceFrom', priceFrom.toString())
    if (priceTo < 2000000) params.set('priceTo', priceTo.toString())
    
    // Přidat mileage range (přepsat hidden inputy) - správný název parametru
    if (mileageFrom > 0) params.set('mileageFrom', mileageFrom.toString())
    if (mileageTo < 500000) params.set('mileageTo', mileageTo.toString())

    // ✅ PŘIDÁNO - Location filter
    if (locationFilter) {
      params.set('nearLatitude', locationFilter.latitude.toString())
      params.set('nearLongitude', locationFilter.longitude.toString())
      params.set('nearDistance', locationFilter.distance.toString())
    }

    console.log('Odesílané parametry:', params.toString()) // Debug

    // Změna URL (kvůli sdílení/filtrování)
    router.push(`/ads?${params.toString()}`)

    // Fetch výsledků
    try {
      const res = await fetch(`http://localhost:3000/ad?${params.toString()}`)
      const data = await res.json()
      setAds(data)
      setNoResults(data.length === 0)
      onResults?.(data)
    } catch (error) {
      console.error('Chyba při načítání inzerátů:', error)
      setAds([])
      setNoResults(true)
    } finally {
      setLoading(false)
    }
  }

  // Pro načtení výsledků při změně URL/searchParams
  useEffect(() => {
    // Aktualizace state z URL parametrů
    setSelectedBrand(searchParams.get('brand') || '')
    setSelectedModel(searchParams.get('model') || '')
    setSelectedColor(searchParams.get('color') || '')
    setSelectedColorFinish(searchParams.get('colorFinish') || '')
    setPriceFrom(parseInt(searchParams.get('priceFrom') || '0') || 0)
    setPriceTo(parseInt(searchParams.get('priceTo') || '2000000') || 2000000)
    setMileageFrom(parseInt(searchParams.get('mileageFrom') || '0') || 0)
    setMileageTo(parseInt(searchParams.get('mileageTo') || '500000') || 500000)

    // ✅ PŘIDÁNO - Inicializace location filter z URL
    const nearLat = searchParams.get('nearLatitude')
    const nearLng = searchParams.get('nearLongitude')
    const nearDist = searchParams.get('nearDistance')
    
    if (nearLat && nearLng && nearDist) {
      setLocationFilter({
        latitude: parseFloat(nearLat),
        longitude: parseFloat(nearLng),
        address: 'Vybraná lokalita', // Fallback
        distance: parseInt(nearDist)
      })
    } else {
      setLocationFilter(null)
    }

    // Fetch výsledků
    const params = searchParams.toString()
    setLoading(true)
    fetch(`http://localhost:3000/ad?${params}`)
      .then(res => res.json())
      .then(data => {
        setAds(data.ads || data) // ✅ OPRAVENO - backend vrací { ads: [...] }
        setNoResults((data.ads || data).length === 0)
        setLoading(false)
        onResults?.(data.ads || data)
      })
      .catch(error => {
        console.error('Chyba při načítání inzerátů:', error)
        setAds([])
        setNoResults(true)
        setLoading(false)
      })
  }, [searchParams, onResults])

  return (
    <section className="ad-filter">
      <form className="ad-filter__form" onSubmit={handleSubmit}>
        {/* Search bar - nahoře */}
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

        {/* Hlavní filtry */}
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

        {/* Tlačítka */}
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

        {/* Všechny filtry - skryté */}
        {showAllFilters && (
          <div className="ad-filter__all-filters">
            <div className="ad-filter__all-filters-grid">
              {/* ✅ PŘESUNUTO - Location Filter do rozšířených */}
              <div className="ad-filter__filter-group ad-filter__filter-group--full-width">
                <LocationFilter 
                  onLocationChange={handleLocationChange}
                  className="ad-filter__location"
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

              {/* ✅ PŘIDÁNO - Color Filter */}
          <div className="ad-filter__filter-group">
            <label className="ad-filter__label">Barva</label>
            <ColorSelect
              value={selectedColor}
              onChange={handleColorChange}
              placeholder="Všechny barvy"
              className="ad-filter__color-select"
            />
          </div>

          {/* ✅ PŘIDÁNO - Color Finish Filter */}
          <div className="ad-filter__filter-group">
            <label className="ad-filter__label">Povrchová úprava</label>
            <ColorFinishSelect
              value={selectedColorFinish}
              onChange={handleColorFinishChange}
              className="ad-filter__color-finish-select"
            />
          </div>

              <div className="ad-filter__filter-group">
                <label className="ad-filter__label" htmlFor="transmission">Převodovka</label>
                <select id="transmission" name="transmission" className="ad-filter__select" defaultValue={searchParams.get('transmission') || ''}>
                  <option value="">Všechny převodovky</option>
                  <option value="manual">Manuální</option>
                  <option value="automatic">Automatická</option>
                  <option value="semi_automatic">Poloautomatická</option>
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

              {/* ✅ ODSTRANIT starý color select - nahrazený ColorSelect komponentou */}

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

        {/* ✅ Hidden inputs pro form submission */}
        <input type="hidden" name="color" value={selectedColor} />
        <input type="hidden" name="colorFinish" value={selectedColorFinish} />
        
        {/* ✅ PŘIDÁNO - Location hidden inputs */}
        {locationFilter && (
          <>
            <input type="hidden" name="nearLatitude" value={locationFilter.latitude} />
            <input type="hidden" name="nearLongitude" value={locationFilter.longitude} />
            <input type="hidden" name="nearDistance" value={locationFilter.distance} />
          </>
        )}
      </form>

      {/* Loading a výsledky */}
      {loading && <div className="ad-filter__loading">Načítám...</div>}
      {noResults && (
        <div className="ad-filter__no-results">
          Žádné inzeráty neodpovídají zadaným filtrům. Zkuste upravit kritéria hledání.
        </div>
      )}
    </section>
  )
}
