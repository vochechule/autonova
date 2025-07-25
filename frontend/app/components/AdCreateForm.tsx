'use client'
import { useState } from 'react'
import '../styles/components/AdCreateForm.scss'

export default function AdCreateForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [imageError, setImageError] = useState<string | null>(null) // přidáno

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // validace počtu obrázků
    if (images.length < 2) {
      setImageError('Přidejte alespoň dva obrázky.')
      setLoading(false)
      return
    } else {
      setImageError(null)
    }

    const form = e.currentTarget
    const formData = new FormData()

    for (const el of form.elements) {
      if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement)) continue
      if (el.name && el.value && el.type !== 'file') {
        formData.append(el.name, el.value)
      }
    }
    if (images.length > 0) {
      images.forEach(img => {
        formData.append('images', img)
      })
    }
    if (form.technicalCheckUntil?.value) {
      const date = new Date(form.technicalCheckUntil.value)
      formData.set('technicalCheckUntil', date.toISOString())
    }
    if (form.warrantyUntil?.value) {
      const date = new Date(form.warrantyUntil.value)
      formData.set('warrantyUntil', date.toISOString())
    }

    const token = localStorage.getItem('token')
    try {
      const res = await fetch('http://localhost:3000/ad', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData,
        credentials: 'include'
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || errData.error || 'Chyba při ukládání inzerátu')
      }
      setSuccess(true)
      form.reset()
      setImages([])
    } catch (err) {
      if (err instanceof Error) setError(err.message)
      else setError('Neznámá chyba')
      console.error('Upload error:', err)
    } finally {
      setLoading(false)
    }
  }

  function fillTestData(form: HTMLFormElement) {
    form.title.value = 'Testovací auto'
    form.brand.value = 'Škoda'
    form.model.value = 'Octavia'
    form.description.value = 'Popis testovacího auta'
    form.price.value = '123456'
    form.mileage.value = '150000'
    form.year.value = '2018'
    form.firstRegistration.value = '2018'
    form.bodyType.value = 'sedan'
    form.doorCount.value = '4'
    form.seatCount.value = '5'
    form.color.value = 'Stříbrná'
    form.colorFinish.value = 'Metalíza'
    form.airbagCount.value = '6'
    form.airConditioning.value = 'automatic'
    form.fuel.value = 'diesel'
    form.engineVolume.value = '1968'
    form.power.value = '110'
    form.avgConsumption.value = '5.2'
    form.transmission.value = 'automatic'
    form.gearCount.value = '6'
    form.drivetrain.value = 'fwd'
    form.condition.value = 'used'
    form.technicalCheckUntil.value = '2025-12-31'
    form.countryOfOrigin.value = 'ČR'
    form.euroStandard.value = 'euro6'
    form.ecoTaxPaid.checked = true
    form.isFirstOwner.checked = false
    form.isDisabledAdapted.checked = false
    form.wasCrashed.checked = false
    form.hasServiceBook.checked = true
    form.warrantyUntil.value = '2026-01-01'
    form.windowNote.value = 'Test poznámka'
    form.features.value = 'klimatizace, ABS, ESP'
  }

  return (
    <form onSubmit={handleSubmit} className="ad-create-form" id="ad-create-form">
      <h2>Přidat inzerát</h2>
      <button
        type="button"
        style={{ marginBottom: 12 }}
        onClick={() => {
          const form = document.getElementById('ad-create-form') as HTMLFormElement
          if (form) fillTestData(form)
        }}
      >
        Vyplnit testovací data
      </button>

      <label htmlFor="title">Název</label>
      <input name="title" id="title" required placeholder="Název" />

      <label htmlFor="brand">Značka</label>
      <input name="brand" id="brand" required placeholder="Značka" />

      <label htmlFor="model">Model</label>
      <input name="model" id="model" required placeholder="Model" />

      <label htmlFor="description">Popis</label>
      <textarea name="description" id="description" required placeholder="Popis" />

      <label htmlFor="price">Cena</label>
      <input name="price" id="price" type="number" required placeholder="Cena" />

      <label htmlFor="mileage">Nájezd (km)</label>
      <input name="mileage" id="mileage" type="number" required placeholder="Nájezd (km)" />

      <label htmlFor="year">Rok výroby</label>
      <input name="year" id="year" type="number" placeholder="Rok výroby" />

      <label htmlFor="firstRegistration">První registrace (rok)</label>
      <input name="firstRegistration" id="firstRegistration" type="number" placeholder="První registrace (rok)" />

      <label htmlFor="bodyType">Karoserie</label>
      <select name="bodyType" id="bodyType" required>
        <option value="">Karoserie</option>
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

      <label htmlFor="doorCount">Počet dveří</label>
      <input name="doorCount" id="doorCount" type="number" required placeholder="Počet dveří" />

      <label htmlFor="seatCount">Počet míst</label>
      <input name="seatCount" id="seatCount" type="number" required placeholder="Počet míst" />

      <label htmlFor="color">Barva</label>
      <input name="color" id="color" required placeholder="Barva" />

      <label htmlFor="colorFinish">Povrchová úprava barvy</label>
      <input name="colorFinish" id="colorFinish" placeholder="Povrchová úprava barvy" />

      <label htmlFor="airbagCount">Počet airbagů</label>
      <input name="airbagCount" id="airbagCount" type="number" required placeholder="Počet airbagů" />

      <label htmlFor="airConditioning">Klimatizace</label>
      <select name="airConditioning" id="airConditioning" required>
        <option value="">Klimatizace</option>
        <option value="none">Žádná</option>
        <option value="manual">Manuální</option>
        <option value="automatic">Automatická</option>
        <option value="two_zone">Dvouzónová</option>
        <option value="three_zone">Třízónová</option>
      </select>

      <label htmlFor="fuel">Palivo</label>
      <select name="fuel" id="fuel" required>
        <option value="">Palivo</option>
        <option value="petrol">Benzín</option>
        <option value="diesel">Nafta</option>
        <option value="hybrid">Hybrid</option>
        <option value="electric">Elektro</option>
        <option value="lpg">LPG</option>
        <option value="cng">CNG</option>
      </select>

      <label htmlFor="engineVolume">Objem motoru (ccm)</label>
      <input name="engineVolume" id="engineVolume" type="number" required placeholder="Objem motoru (ccm)" />

      <label htmlFor="power">Výkon (kW)</label>
      <input name="power" id="power" type="number" required placeholder="Výkon (kW)" />

      <label htmlFor="avgConsumption">Průměrná spotřeba (l/100km)</label>
      <input name="avgConsumption" id="avgConsumption" type="number" step="0.1" placeholder="Průměrná spotřeba (l/100km)" />

      <label htmlFor="transmission">Převodovka</label>
      <select name="transmission" id="transmission" required>
        <option value="">Převodovka</option>
        <option value="manual">Manuální</option>
        <option value="automatic">Automatická</option>
        <option value="semi_automatic">Poloautomatická</option>
      </select>

      <label htmlFor="gearCount">Počet rychlostí</label>
      <input name="gearCount" id="gearCount" type="number" placeholder="Počet rychlostí" />

      <label htmlFor="drivetrain">Pohon</label>
      <select name="drivetrain" id="drivetrain" required>
        <option value="">Pohon</option>
        <option value="fwd">Přední (FWD)</option>
        <option value="rwd">Zadní (RWD)</option>
        <option value="awd">4x4 (AWD)</option>
        <option value="four_x_four">4x4 (mechanické)</option>
      </select>

      <label htmlFor="condition">Stav</label>
      <select name="condition" id="condition" required>
        <option value="">Stav</option>
        <option value="new">Nové</option>
        <option value="used">Použité</option>
        <option value="crashed">Havárie</option>
        <option value="demo">Demo</option>
      </select>

      <label htmlFor="technicalCheckUntil">STK do</label>
      <input name="technicalCheckUntil" id="technicalCheckUntil" type="date" placeholder="STK do" />

      <label htmlFor="countryOfOrigin">Země původu</label>
      <input name="countryOfOrigin" id="countryOfOrigin" required placeholder="Země původu" />

      <label htmlFor="euroStandard">Emisní norma</label>
      <select name="euroStandard" id="euroStandard" required>
        <option value="">Emisní norma</option>
        <option value="euro1">Euro 1</option>
        <option value="euro2">Euro 2</option>
        <option value="euro3">Euro 3</option>
        <option value="euro4">Euro 4</option>
        <option value="euro5">Euro 5</option>
        <option value="euro6">Euro 6</option>
        <option value="euro6d">Euro 6d</option>
      </select>

      <label>
        <input name="ecoTaxPaid" type="checkbox" /> Eko daň zaplacena
      </label>
      <label>
        <input name="isFirstOwner" type="checkbox" /> První majitel
      </label>
      <label>
        <input name="isDisabledAdapted" type="checkbox" /> Úprava pro ZTP
      </label>
      <label>
        <input name="wasCrashed" type="checkbox" /> Bylo havarované
      </label>
      <label>
        <input name="hasServiceBook" type="checkbox" /> Servisní knížka
      </label>

      <label htmlFor="warrantyUntil">Záruka do</label>
      <input name="warrantyUntil" id="warrantyUntil" type="date" placeholder="Záruka do" />

      <label htmlFor="windowNote">Poznámka na okno</label>
      <input name="windowNote" id="windowNote" placeholder="Poznámka na okno" />

      <label htmlFor="features">Výbava (čárkou oddělené)</label>
      <input name="features" id="features" placeholder="Výbava (čárkou oddělené)" />

      <label htmlFor="images">Obrázky (min. 2)</label>
      <input
        type="file"
        name="images"
        id="images"
        accept="image/*"
        multiple
        onChange={e => {
          const files = Array.from(e.target.files || [])
          setImages(files)
          if (files.length < 2) {
            setImageError('Přidejte alespoň dva obrázky.')
          } else {
            setImageError(null)
          }
        }}
        required
      />
      {imageError && <div style={{ color: 'red', marginBottom: 8 }}>{imageError}</div>}

      <button type="submit" disabled={loading}>
        {loading ? 'Ukládám...' : 'Přidat inzerát'}
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>Inzerát byl úspěšně přidán!</div>}
    </form>
  )
}