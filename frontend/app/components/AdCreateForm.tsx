'use client'
import { useState } from 'react'
import '../styles/components/AdCreateForm.scss'
import { carBrands, getBrandsList, getModelsList, getBrandsGroupedByLetter } from '../data/carData';
import BrandSelect from './BrandSelect';
import ModelSelect from './ModelSelect';
import ColorSelect from './ColorSelect'
import ColorFinishSelect from './ColorFinishSelect'

export default function AdCreateForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [imageError, setImageError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedColorFinish, setSelectedColorFinish] = useState<string>('standard') // ✅ ZMĚNĚNO z '' na 'standard'

  const modelsList = getModelsList(selectedBrand)

  const handleBrandChange = (brandValue: string) => {
    setSelectedBrand(brandValue)
    setSelectedModel('') // Reset model when brand changes
  }

  const handleModelChange = (modelValue: string) => {
    setSelectedModel(modelValue)
  }

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
  try {
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

    if (!selectedBrand || !selectedModel) {
      throw new Error('Vyberte značku a model vozidla')
    }

    const form = e.currentTarget
    const formData = new FormData()
    const formValues = new FormData(form)

    // Brand a model ze state
    formData.append('brand', selectedBrand)
    formData.append('model', selectedModel)

    // String hodnoty
    const stringFields = ['title', 'description', 'bodyType', 'color', 'colorFinish', 
                         'fuel', 'transmission', 'drivetrain', 'airConditioning', 'condition', 
                         'countryOfOrigin', 'euroStandard', 'windowNote']
    
    stringFields.forEach(field => {
      const value = formValues.get(field)
      if (value) formData.append(field, value.toString())
    })

    // Integer hodnoty
    const integerFields = ['price', 'mileage', 'year', 'firstRegistration', 'doorCount', 'seatCount', 
                          'airbagCount', 'engineVolume', 'power', 'gearCount']
    
    integerFields.forEach(field => {
      const value = formValues.get(field)
      if (value && value.toString().trim()) {
        formData.append(field, value.toString())
      }
    })

    // avgConsumption jako float
    const avgConsumptionValue = formValues.get('avgConsumption')
    if (avgConsumptionValue && avgConsumptionValue.toString().trim()) {
      formData.append('avgConsumption', avgConsumptionValue.toString())
    }

    // Boolean hodnoty
    const booleanFields = ['ecoTaxPaid', 'isFirstOwner', 'isDisabledAdapted', 'wasCrashed', 'hasServiceBook']
    booleanFields.forEach(field => {
      const checkbox = form.querySelector(`[name="${field}"]`) as HTMLInputElement
      formData.append(field, checkbox?.checked ? 'true' : 'false')
    })

    // Features jako array
    // const featuresValue = formValues.get('features')
    // if (featuresValue && featuresValue.toString().trim()) {
    //   const featuresArray = featuresValue.toString().split(',').map(f => f.trim()).filter(f => f)
    //   featuresArray.forEach(feature => formData.append('features', feature))
    // }

    // Datum hodnoty
    const techCheckValue = formValues.get('technicalCheckUntil')
    if (techCheckValue) {
      formData.append('technicalCheckUntil', new Date(techCheckValue.toString()).toISOString())
    }
    
    const warrantyValue = formValues.get('warrantyUntil')
    if (warrantyValue) {
      formData.append('warrantyUntil', new Date(warrantyValue.toString()).toISOString())
    }

    // Obrázky
    if (images.length > 0) {
      images.forEach(img => {
        formData.append('images', img)
      })
    }

    // Debug log
    console.log('🔍 FormData entries:')
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`)
    }

    const token = localStorage.getItem('token')
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
    console.error('🔍 Submit error:', err)
    if (err instanceof Error) {
      setError(err.message)
    } else {
      setError('Neznámá chyba')
    }
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
    setSelectedBrand('skoda')
    setSelectedModel('octavia')
    setInputValue('description', 'Popis testovacího auta')
    setInputValue('price', '123456')
    setInputValue('mileage', '150000')
    setInputValue('year', '2018')
    setInputValue('firstRegistration', '2018')
    setInputValue('bodyType', 'sedan')
    setInputValue('doorCount', '4')
    setInputValue('seatCount', '5')
    setInputValue('color', 'Stříbrná')
    setSelectedColorFinish('metallic') // ✅ ZMĚNĚNO - používáme state setter místo input value
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
    //setInputValue('features', 'klimatizace, ABS, ESP')
  }

  return (
    <div className="ad-create-form">
      <div className="form-container">
        <h2>Přidat inzerát</h2>
        <p className="form-subtitle">Vytvořte nový inzerát a prodejte své vozidlo rychle a snadno</p>
        
        <button
          type="button"
          className="test-data-button"
          onClick={() => {
            const form = document.getElementById('ad-create-form') as HTMLFormElement
            if (form) fillTestData(form)
          }}
        >
          Vyplnit testovací data
        </button>

        <form onSubmit={handleSubmit} id="ad-create-form">
          {/* Základní informace */}
          <div className="form-section">
            <h3 className="form-section__title">Základní informace</h3>
            <div className="form-grid">
              <div className="form-group form-group--full-width">
                <label htmlFor="title">Název inzerátu</label>
                <input name="title" id="title" required placeholder="Např. Škoda Octavia 2.0 TDI Combi" />
              </div>
              
              <div className="form-group">
                <label htmlFor="brand">Značka</label>
                <BrandSelect
                  value={selectedBrand}
                  onChange={handleBrandChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="model">Model</label>
                <ModelSelect
                  value={selectedModel}
                  onChange={handleModelChange}
                  models={modelsList}
                  disabled={!selectedBrand}
                  required
                />
              </div>
              
              <div className="form-group form-group--full-width">
                <label htmlFor="description">Popis vozidla</label>
                <textarea name="description" id="description" required placeholder="Popište stav vozidla, výbavu, historii..." />
              </div>
            </div>
          </div>

          {/* Cena a základní údaje */}
          <div className="form-section">
            <h3 className="form-section__title">Cena a základní údaje</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="price">Cena (Kč)</label>
                <input name="price" id="price" type="number" required placeholder="450000" />
              </div>
              
              <div className="form-group">
                <label htmlFor="mileage">Nájezd (km)</label>
                <input name="mileage" id="mileage" type="number" required placeholder="150000" />
              </div>
              
              <div className="form-group">
                <label htmlFor="year">Rok výroby</label>
                <input name="year" id="year" type="number" placeholder="2018" />
              </div>
              
              <div className="form-group">
                <label htmlFor="firstRegistration">První registrace (rok)</label>
                <input name="firstRegistration" id="firstRegistration" type="number" placeholder="2018" />
              </div>
            </div>
          </div>

          {/* Vzhled a rozměry */}
          <div className="form-section">
            <h3 className="form-section__title">Vzhled a rozměry</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="bodyType">Karoserie</label>
                <select name="bodyType" id="bodyType" required>
                  <option value="">Vyberte karoserii</option>
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

              <div className="form-group">
                <label>Barva</label>
                <ColorSelect
                  value={selectedColor}
                  onChange={setSelectedColor}
                  required
                />
              </div>

              <div className="form-group">
                <label>Povrchová úprava</label>
                <ColorFinishSelect
                  value={selectedColorFinish}
                  onChange={setSelectedColorFinish}
                />
              </div>

              <div className="form-group">
                <label htmlFor="doorCount">Počet dveří</label>
                <input name="doorCount" id="doorCount" type="number" required placeholder="5" />
              </div>

              <div className="form-group">
                <label htmlFor="seatCount">Počet míst</label>
                <input name="seatCount" id="seatCount" type="number" required placeholder="5" />
              </div>

              <div className="form-group">
                <label htmlFor="airbagCount">Počet airbagů</label>
                <input name="airbagCount" id="airbagCount" type="number" required placeholder="6" />
              </div>
            </div>
          </div>

          {/* Motor a pohon */}
          <div className="form-section">
            <h3 className="form-section__title">Motor a pohon</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="fuel">Palivo</label>
                <select name="fuel" id="fuel" required>
                  <option value="">Vyberte palivo</option>
                  <option value="petrol">Benzín</option>
                  <option value="diesel">Nafta</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="electric">Elektro</option>
                  <option value="lpg">LPG</option>
                  <option value="cng">CNG</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="engineVolume">Objem motoru (ccm)</label>
                <input name="engineVolume" id="engineVolume" type="number" required placeholder="1968" />
              </div>

              <div className="form-group">
                <label htmlFor="power">Výkon (kW)</label>
                <input name="power" id="power" type="number" required placeholder="110" />
              </div>

              <div className="form-group">
                <label htmlFor="avgConsumption">Průměrná spotřeba (l/100km)</label>
                <input name="avgConsumption" id="avgConsumption" type="number" step="0.1" placeholder="5.2" />
              </div>

              <div className="form-group">
                <label htmlFor="transmission">Převodovka</label>
                <select name="transmission" id="transmission" required>
                  <option value="">Vyberte převodovku</option>
                  <option value="manual">Manuální</option>
                  <option value="automatic">Automatická</option>
                  <option value="cvt">CVT</option>
                  <option value="sequential">Sekvenční</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="gearCount">Počet rychlostí</label>
                <input name="gearCount" id="gearCount" type="number" placeholder="6" />
              </div>

              <div className="form-group">
                <label htmlFor="drivetrain">Pohon</label>
                <select name="drivetrain" id="drivetrain" required>
                  <option value="">Vyberte pohon</option>
                  <option value="fwd">Přední (FWD)</option>
                  <option value="rwd">Zadní (RWD)</option>
                  <option value="awd">4x4 (AWD)</option>
                  <option value="four_x_four">4x4 (mechanické)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="airConditioning">Klimatizace</label>
                <select name="airConditioning" id="airConditioning" required>
                  <option value="">Vyberte klimatizaci</option>
                  <option value="none">Žádná</option>
                  <option value="manual">Manuální</option>
                  <option value="automatic">Automatická</option>
                  <option value="two_zone">Dvouzónová</option>
                  <option value="three_zone">Třízónová</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stav a údaje */}
          <div className="form-section">
            <h3 className="form-section__title">Stav a dokumenty</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="condition">Stav vozidla</label>
                <select name="condition" id="condition" required>
                  <option value="">Vyberte stav</option>
                  <option value="new">Nové</option>
                  <option value="used">Použité</option>
                  <option value="crashed">Havárie</option>
                  <option value="demo">Demo</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="technicalCheckUntil">STK do</label>
                <input name="technicalCheckUntil" id="technicalCheckUntil" type="date" />
              </div>

              <div className="form-group">
                <label htmlFor="countryOfOrigin">Země původu</label>
                <input name="countryOfOrigin" id="countryOfOrigin" required placeholder="ČR" />
              </div>

              <div className="form-group">
                <label htmlFor="euroStandard">Emisní norma</label>
                <select name="euroStandard" id="euroStandard" required>
                  <option value="">Vyberte normu</option>
                  <option value="euro1">Euro 1</option>
                  <option value="euro2">Euro 2</option>
                  <option value="euro3">Euro 3</option>
                  <option value="euro4">Euro 4</option>
                  <option value="euro5">Euro 5</option>
                  <option value="euro6">Euro 6</option>
                  <option value="euro6d">Euro 6d</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="warrantyUntil">Záruka do</label>
                <input name="warrantyUntil" id="warrantyUntil" type="date" />
              </div>

              <div className="form-group">
                <label htmlFor="windowNote">Poznámka na okno</label>
                <input name="windowNote" id="windowNote" placeholder="Např. Volat po 18h" />
              </div>

              {/* <div className="form-group form-group--full-width">
                <label htmlFor="features">Výbava (čárkou oddělené)</label>
                <input name="features" id="features" placeholder="klimatizace, ABS, ESP, navigace..." />
              </div> */}
            </div>

            {/* Checkboxy */}
            <div className="form-grid" style={{ marginTop: '1rem' }}>
              <label className="checkbox-label">
                <input name="ecoTaxPaid" type="checkbox" /> Eko daň zaplacena
              </label>
              <label className="checkbox-label">
                <input name="isFirstOwner" type="checkbox" /> První majitel
              </label>
              <label className="checkbox-label">
                <input name="isDisabledAdapted" type="checkbox" /> Úprava pro ZTP
              </label>
              <label className="checkbox-label">
                <input name="wasCrashed" type="checkbox" /> Bylo havarované
              </label>
              <label className="checkbox-label">
                <input name="hasServiceBook" type="checkbox" /> Servisní knížka
              </label>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="image-upload-section">
            <h3>Obrázky inzerátu</h3>
            <p className="image-requirement">Přidejte alespoň 2 kvalitní obrázky vašeho vozidla</p>
            
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
                <p className="drop-subtext">Podporované formáty: JPG, PNG, WEBP (max 10MB/obrázek)</p>
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
          
          {error && <div className="error">{error}</div>}
          {success && <div className="success">Inzerát byl úspěšně přidán!</div>}
        </form>
      </div>
    </div>
  )
}