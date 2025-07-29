'use client'
import { useState } from 'react'
import '../styles/components/AdCreateForm.scss'

export default function AdCreateForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [imageError, setImageError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleImageAdd = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => file.type.startsWith('image/'))
    setImages(prev => [...prev, ...validFiles])
    
    if (images.length + validFiles.length < 2) {
      setImageError('Přidejte alespoň dva obrázky.')
    } else {
      setImageError(null)
    }
  }

  const handleImageRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    
    if (newImages.length < 2) {
      setImageError('Přidejte alespoň dva obrázky.')
    } else {
      setImageError(null)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files)
      handleImageAdd(files)
    }
  }

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
    const getValue = (name: string): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null => 
      form.querySelector(`[name="${name}"]`)
    
    const setInputValue = (name: string, value: string) => {
      const element = getValue(name)
      if (element) (element as any).value = value
    }
    
    const setCheckboxValue = (name: string, checked: boolean) => {
      const element = getValue(name) as HTMLInputElement
      if (element) element.checked = checked
    }

    setInputValue('title', 'Testovací auto')
    setInputValue('brand', 'Škoda')
    setInputValue('model', 'Octavia')
    setInputValue('description', 'Popis testovacího auta')
    setInputValue('price', '123456')
    setInputValue('mileage', '150000')
    setInputValue('year', '2018')
    setInputValue('firstRegistration', '2018')
    setInputValue('bodyType', 'sedan')
    setInputValue('doorCount', '4')
    setInputValue('seatCount', '5')
    setInputValue('color', 'Stříbrná')
    setInputValue('colorFinish', 'Metalíza')
    setInputValue('airbagCount', '6')
    setInputValue('airConditioning', 'automatic')
    setInputValue('fuel', 'diesel')
    setInputValue('engineVolume', '1968')
    setInputValue('power', '110')
    setInputValue('avgConsumption', '5.2')
    setInputValue('transmission', 'automatic')
    setInputValue('gearCount', '6')
    setInputValue('drivetrain', 'fwd')
    setInputValue('condition', 'used')
    setInputValue('technicalCheckUntil', '2025-12-31')
    setInputValue('countryOfOrigin', 'ČR')
    setInputValue('euroStandard', 'euro6')
    setCheckboxValue('ecoTaxPaid', true)
    setCheckboxValue('isFirstOwner', false)
    setCheckboxValue('isDisabledAdapted', false)
    setCheckboxValue('wasCrashed', false)
    setCheckboxValue('hasServiceBook', true)
    setInputValue('warrantyUntil', '2026-01-01')
    setInputValue('windowNote', 'Test poznámka')
    setInputValue('features', 'klimatizace, ABS, ESP')
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

      {/* Image Upload Section */}
      <div className="image-upload-section">
        <h3>Obrázky inzerátu</h3>
        <p className="image-requirement">Přidejte alespoň 2 obrázky vašeho vozidla</p>
        
        {/* Image Gallery */}
        {images.length > 0 && (
          <div className="image-gallery">
            {images.map((image, index) => (
              <div key={index} className="image-preview">
                <img 
                  src={URL.createObjectURL(image)} 
                  alt={`Náhled ${index + 1}`}
                  onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
                />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => handleImageRemove(index)}
                  title="Odstranit obrázek"
                >
                  ×
                </button>
                <div className="image-info">
                  <span className="image-name">{image.name}</span>
                  <span className="image-size">{(image.size / 1024 / 1024).toFixed(1)} MB</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Drop Zone */}
        <div 
          className={`drop-zone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="drop-zone-content">
            <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="drop-text">
              Přetáhněte obrázky sem nebo 
              <label htmlFor="images" className="file-input-label"> vyberte soubory</label>
            </p>
            <p className="drop-subtext">Podporované formáty: JPG, PNG, WEBP</p>
          </div>
          
          <input
            type="file"
            name="images"
            id="images"
            accept="image/*"
            multiple
            onChange={e => {
              const files = Array.from(e.target.files || [])
              handleImageAdd(files)
            }}
            style={{ display: 'none' }}
          />
        </div>

        {/* Image Counter */}
        <div className="image-counter">
          <span className={`counter ${images.length >= 2 ? 'valid' : 'invalid'}`}>
            {images.length} / min. 2 obrázků
          </span>
        </div>

        {imageError && <div className="error">{imageError}</div>}
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Ukládám...' : 'Přidat inzerát'}
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>Inzerát byl úspěšně přidán!</div>}
    </form>
  )
}