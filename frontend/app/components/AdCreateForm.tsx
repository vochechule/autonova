'use client'
import { useState } from 'react'
import '../styles/components/AdCreateForm.scss'

export default function AdCreateForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [images, setImages] = useState<File[]>([])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const form = e.currentTarget
    const formData = new FormData()
    
    // Přidej pole formuláře
    for (const el of form.elements) {
      if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement)) continue
      if (el.name && el.value && el.type !== 'file') {
        formData.append(el.name, el.value)
      }
    }
    
    // Přidej obrázky
    if (images.length > 0) {
      images.forEach(img => {
        formData.append('images', img) // Musí se shodovat s 'images' v interceptoru
      })
    }
    
    // Převod datumů
    if (form.technicalCheckUntil?.value) {
      const date = new Date(form.technicalCheckUntil.value)
      formData.set('technicalCheckUntil', date.toISOString())
    }
    if (form.warrantyUntil?.value) {
      const date = new Date(form.warrantyUntil.value)
      formData.set('warrantyUntil', date.toISOString())
    }
    
    // DŮLEŽITÉ: NEPOSÍLEJ Content-Type header při použití FormData!
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('http://localhost:3000/ad', {
        method: 'POST',
        headers: {
          // BEZ Content-Type! Browser nastaví automaticky s boundary
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
      setImage(null)
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
      <input name="title" required placeholder="Název" />
      <textarea name="description" required placeholder="Popis" />
      <input name="price" type="number" required placeholder="Cena" />
      <input name="mileage" type="number" required placeholder="Nájezd (km)" />
      <input name="year" type="number" placeholder="Rok výroby" />
      <input name="firstRegistration" type="number" placeholder="První registrace (rok)" />

      <select name="bodyType" required>
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

      <input name="doorCount" type="number" required placeholder="Počet dveří" />
      <input name="seatCount" type="number" required placeholder="Počet míst" />
      <input name="color" required placeholder="Barva" />
      <input name="colorFinish" placeholder="Povrchová úprava barvy" />
      <input name="airbagCount" type="number" required placeholder="Počet airbagů" />

      <select name="airConditioning" required>
        <option value="">Klimatizace</option>
        <option value="none">Žádná</option>
        <option value="manual">Manuální</option>
        <option value="automatic">Automatická</option>
        <option value="two_zone">Dvouzónová</option>
        <option value="three_zone">Třízónová</option>
      </select>

      <select name="fuel" required>
        <option value="">Palivo</option>
        <option value="petrol">Benzín</option>
        <option value="diesel">Nafta</option>
        <option value="hybrid">Hybrid</option>
        <option value="electric">Elektro</option>
        <option value="lpg">LPG</option>
        <option value="cng">CNG</option>
      </select>

      <input name="engineVolume" type="number" required placeholder="Objem motoru (ccm)" />
      <input name="power" type="number" required placeholder="Výkon (kW)" />
      <input name="avgConsumption" type="number" step="0.1" placeholder="Průměrná spotřeba (l/100km)" />

      <select name="transmission" required>
        <option value="">Převodovka</option>
        <option value="manual">Manuální</option>
        <option value="automatic">Automatická</option>
        <option value="semi_automatic">Poloautomatická</option>
      </select>

      <input name="gearCount" type="number" placeholder="Počet rychlostí" />

      <select name="drivetrain" required>
        <option value="">Pohon</option>
        <option value="fwd">Přední (FWD)</option>
        <option value="rwd">Zadní (RWD)</option>
        <option value="awd">4x4 (AWD)</option>
        <option value="four_x_four">4x4 (mechanické)</option>
      </select>

      <select name="condition" required>
        <option value="">Stav</option>
        <option value="new">Nové</option>
        <option value="used">Použité</option>
        <option value="crashed">Havárie</option>
        <option value="demo">Demo</option>
      </select>

      <input name="technicalCheckUntil" type="date" placeholder="STK do" />
      <input name="countryOfOrigin" required placeholder="Země původu" />

      <select name="euroStandard" required>
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

      <input name="warrantyUntil" type="date" placeholder="Záruka do" />
      <input name="windowNote" placeholder="Poznámka na okno" />
      <input name="features" placeholder="Výbava (čárkou oddělené)" />

      
      <input
        type="file"
        name="images"
        accept="image/*"
        multiple
        onChange={e => setImages(Array.from(e.target.files || []))}
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Ukládám...' : 'Přidat inzerát'}
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>Inzerát byl úspěšně přidán!</div>}
    </form>
  )
}