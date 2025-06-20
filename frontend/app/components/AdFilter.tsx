'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import '../styles/components/AdFilter.scss'

export default function AdFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showAdvanced, setShowAdvanced] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const params = new URLSearchParams()

    for (const el of form.elements) {
      if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement)) continue
      if (el.name && el.value) {
        params.set(el.name, el.value)
      }
    }

    router.push(`/ads?${params.toString()}`)
  }

  return (
    <section className="ad-filter">
      <form className="ad-filter__form" onSubmit={handleSubmit}>
        <input name="title" type="text" placeholder="Hledat podle názvu..." className="ad-filter__input" defaultValue={searchParams.get('title') || ''} />

        <div className="ad-filter__basic-filters">
          <input name="priceFrom" type="number" placeholder="Cena od" className="ad-filter__input" defaultValue={searchParams.get('priceFrom') || ''} />
          <input name="priceTo" type="number" placeholder="Cena do" className="ad-filter__input" defaultValue={searchParams.get('priceTo') || ''} />
          <input name="mileage" type="number" placeholder="Nájezd max (km)" className="ad-filter__input" defaultValue={searchParams.get('mileage') || ''} />
        </div>

        <button type="button" className="ad-filter__toggle" onClick={() => setShowAdvanced(prev => !prev)}>
          {showAdvanced ? 'Skrýt detailní filtry' : 'Zobrazit detailní filtry'}
        </button>

        {showAdvanced && (
          <div className="ad-filter__advanced-filters">
            <select name="fuel" className="ad-filter__input" defaultValue={searchParams.get('fuel') || ''}>
              <option value="">Palivo</option>
              <option value="benzín">Benzín</option>
              <option value="nafta">Nafta</option>
              <option value="elektro">Elektro</option>
              <option value="hybrid">Hybrid</option>
            </select>

            <select name="body" className="ad-filter__input" defaultValue={searchParams.get('body') || ''}>
              <option value="">Karoserie</option>
              <option value="hatchback">Hatchback</option>
              <option value="sedan">Sedan</option>
              <option value="kombi">Kombi</option>
              <option value="suv">SUV</option>
            </select>

            <input name="yearFrom" type="number" placeholder="Rok od" className="ad-filter__input" defaultValue={searchParams.get('yearFrom') || ''} />
            <input name="yearTo" type="number" placeholder="Rok do" className="ad-filter__input" defaultValue={searchParams.get('yearTo') || ''} />
            <select name="transmission" className="ad-filter__input">
            <option value="">Převodovka</option>
            <option value="manuální">Manuální</option>
            <option value="automatická">Automatická</option>
          </select>

          <select name="drive" className="ad-filter__input">
            <option value="">Pohon</option>
            <option value="FWD">Přední (FWD)</option>
            <option value="RWD">Zadní (RWD)</option>
            <option value="AWD">4x4 (AWD)</option>
          </select>

          <input name="powerFrom" type="number" placeholder="Výkon od (kW)" className="ad-filter__input" />
          <input name="powerTo" type="number" placeholder="Výkon do (kW)" className="ad-filter__input" />
          
          </div>
        )}

        <button type="submit" className="ad-filter__submit">Filtrovat</button>
      </form>
    </section>
  )
}
