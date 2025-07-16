'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import '../styles/components/AdFilter.scss'

export default function AdFilter({ onResults }: { onResults?: (ads: any[]) => void }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [noResults, setNoResults] = useState(false)

  // Hledání a filtrování
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setNoResults(false)
    const form = e.currentTarget
    const params = new URLSearchParams()

    for (const el of form.elements) {
      if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement)) continue
      if (el.name && el.value) {
        params.set(el.name, el.value)
      }
    }

    // Změna URL (kvůli sdílení/filtrování)
    router.push(`/ads?${params.toString()}`)

    // Fetch výsledků
    const res = await fetch(`http://localhost:3000/ad?${params.toString()}`)
    const data = await res.json()
    setAds(data)
    setLoading(false)
    setNoResults(data.length === 0)
    onResults?.(data)
  }

  // Pro načtení výsledků při změně URL/searchParams
  useEffect(() => {
    const params = searchParams.toString()
    setLoading(true)
    fetch(`http://localhost:3000/ad?${params}`)
      .then(res => res.json())
      .then(data => {
        setAds(data)
        setNoResults(data.length === 0)
        setLoading(false)
        onResults?.(data)
      })
  }, [searchParams])

  return (
    <section className="ad-filter">
      <form className="ad-filter__form" onSubmit={handleSubmit}>
        <div className="ad-filter__dropdowns">
          <div className="ad-filter__dropdown-group">
            <label className="ad-filter__label" htmlFor="fuel">Palivo</label>
            <select id="fuel" name="fuel" className="ad-filter__input" defaultValue={searchParams.get('fuel') || ''}>
              <option value="">-- vyber --</option>
              <option value="petrol">Benzín</option>
              <option value="diesel">Nafta</option>
              <option value="hybrid">Hybrid</option>
              <option value="electric">Elektro</option>
              <option value="lpg">LPG</option>
              <option value="cng">CNG</option>
            </select>
          </div>
          <div className="ad-filter__dropdown-group">
            <label className="ad-filter__label" htmlFor="bodyType">Karoserie</label>
            <select id="bodyType" name="bodyType" className="ad-filter__input" defaultValue={searchParams.get('bodyType') || ''}>
              <option value="">-- vyber --</option>
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
          <div className="ad-filter__dropdown-group">
            <label className="ad-filter__label" htmlFor="transmission">Převodovka</label>
            <select id="transmission" name="transmission" className="ad-filter__input" defaultValue={searchParams.get('transmission') || ''}>
              <option value="">-- vyber --</option>
              <option value="manual">Manuální</option>
              <option value="automatic">Automatická</option>
              <option value="semi_automatic">Poloautomatická</option>
            </select>
          </div>
          <div className="ad-filter__dropdown-group">
            <label className="ad-filter__label" htmlFor="drivetrain">Pohon</label>
            <select id="drivetrain" name="drivetrain" className="ad-filter__input" defaultValue={searchParams.get('drivetrain') || ''}>
              <option value="">-- vyber --</option>
              <option value="fwd">Přední (FWD)</option>
              <option value="rwd">Zadní (RWD)</option>
              <option value="awd">4x4 (AWD)</option>
              <option value="four_x_four">4x4 (mechanické)</option>
            </select>
          </div>
          <div className="ad-filter__dropdown-group">
            <label className="ad-filter__label" htmlFor="condition">Stav</label>
            <select id="condition" name="condition" className="ad-filter__input" defaultValue={searchParams.get('condition') || ''}>
              <option value="">-- vyber --</option>
              <option value="new">Nové</option>
              <option value="used">Použité</option>
              <option value="crashed">Havárie</option>
              <option value="demo">Demo</option>
            </select>
          </div>
        </div>
        <input
          name="search"
          type="text"
          placeholder="Hledat v názvu, popisu, značce/modelu..."
          className="ad-filter__input ad-filter__searchbar"
          defaultValue={searchParams.get('search') || ''}
        />
        <button type="button" className="ad-filter__advanced-toggle" onClick={() => setShowAdvanced(v => !v)}>
          {showAdvanced ? 'Skrýt další filtry' : 'Další filtry'}
        </button>
        <button type="submit" className="ad-filter__submit">Filtrovat</button>
        {showAdvanced && (
          <div className="ad-filter__advanced">
            <div className="ad-filter__dropdown-group">
              <label className="ad-filter__label" htmlFor="color">Barva</label>
              <select id="color" name="color" className="ad-filter__input" defaultValue={searchParams.get('color') || ''}>
                <option value="">-- vyber --</option>
                <option value="černá">Černá</option>
                <option value="bílá">Bílá</option>
                <option value="šedá">Šedá</option>
                <option value="modrá">Modrá</option>
                <option value="červená">Červená</option>
                <option value="zelená">Zelená</option>
                <option value="žlutá">Žlutá</option>
                <option value="stříbrná">Stříbrná</option>
                <option value="jiná">Jiná</option>
              </select>
            </div>
            <div className="ad-filter__dropdown-group">
              <label className="ad-filter__label" htmlFor="doorCount">Počet dveří</label>
              <input id="doorCount" name="doorCount" type="number" min={2} max={6} className="ad-filter__input" placeholder="Počet dveří" defaultValue={searchParams.get('doorCount') || ''} />
            </div>
            <div className="ad-filter__dropdown-group">
              <label className="ad-filter__label" htmlFor="seatCount">Počet míst</label>
              <input id="seatCount" name="seatCount" type="number" min={2} max={9} className="ad-filter__input" placeholder="Počet míst" defaultValue={searchParams.get('seatCount') || ''} />
            </div>
            <div className="ad-filter__dropdown-group">
              <label className="ad-filter__label" htmlFor="powerFrom">Výkon od (kW)</label>
              <input id="powerFrom" name="powerFrom" type="number" className="ad-filter__input" placeholder="Výkon od (kW)" defaultValue={searchParams.get('powerFrom') || ''} />
            </div>
            <div className="ad-filter__dropdown-group">
              <label className="ad-filter__label" htmlFor="powerTo">Výkon do (kW)</label>
              <input id="powerTo" name="powerTo" type="number" className="ad-filter__input" placeholder="Výkon do (kW)" defaultValue={searchParams.get('powerTo') || ''} />
            </div>
            <div className="ad-filter__dropdown-group">
              <label className="ad-filter__label" htmlFor="euroStandard">Emisní norma</label>
              <select id="euroStandard" name="euroStandard" className="ad-filter__input" defaultValue={searchParams.get('euroStandard') || ''}>
                <option value="">-- vyber --</option>
                <option value="euro1">Euro 1</option>
                <option value="euro2">Euro 2</option>
                <option value="euro3">Euro 3</option>
                <option value="euro4">Euro 4</option>
                <option value="euro5">Euro 5</option>
                <option value="euro6">Euro 6</option>
                <option value="euro6d">Euro 6d</option>
              </select>
            </div>
            <div className="ad-filter__dropdown-group">
              <label className="ad-filter__label" htmlFor="priceFrom">Cena od</label>
              <input id="priceFrom" name="priceFrom" type="number" className="ad-filter__input" placeholder="Cena od" defaultValue={searchParams.get('priceFrom') || ''} />
            </div>
            <div className="ad-filter__dropdown-group">
              <label className="ad-filter__label" htmlFor="priceTo">Cena do</label>
              <input id="priceTo" name="priceTo" type="number" className="ad-filter__input" placeholder="Cena do" defaultValue={searchParams.get('priceTo') || ''} />
            </div>
            <div className="ad-filter__dropdown-group">
              <label className="ad-filter__label" htmlFor="mileage">Max. nájezd (km)</label>
              <input id="mileage" name="mileage" type="number" className="ad-filter__input" placeholder="Max. nájezd (km)" defaultValue={searchParams.get('mileage') || ''} />
            </div>
            <div className="ad-filter__dropdown-group">
              <label className="ad-filter__label" htmlFor="yearFrom">Rok od</label>
              <input id="yearFrom" name="yearFrom" type="number" className="ad-filter__input" placeholder="Rok od" defaultValue={searchParams.get('yearFrom') || ''} />
            </div>
            <div className="ad-filter__dropdown-group">
              <label className="ad-filter__label" htmlFor="yearTo">Rok do</label>
              <input id="yearTo" name="yearTo" type="number" className="ad-filter__input" placeholder="Rok do" defaultValue={searchParams.get('yearTo') || ''} />
            </div>
          </div>
        )}
      </form>
      {loading && <div className="ad-filter__loading">Načítám...</div>}
      {noResults && (
        <div className="ad-filter__no-results">
          Žádné inzeráty neodpovídají zadaným filtrům. Zkuste upravit kritéria hledání.
        </div>
      )}
    </section>
  )
}
