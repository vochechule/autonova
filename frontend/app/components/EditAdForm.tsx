'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import '../styles/components/AdCreateForm.scss'
import '../styles/components/SuccessMessage.scss'
import { carBrands, getBrandsList, getModelsList, getBrandsGroupedByLetter } from '../data/carData';
import BrandSelect from './BrandSelect';
import ModelSelect from './ModelSelect';
import ColorSelect from './ColorSelect'
import ColorFinishSelect from './ColorFinishSelect'
// ✅ PŘIDÁNO - Loading states a toast
import { FormLoading, ButtonLoading } from './LoadingStates'
import { useToast } from '../contexts/ToastContext'
import MapSelector from './MapSelector'

interface EditAdFormProps {
  adId: string
  initialData?: any
}

export default function EditAdForm({ adId, initialData }: EditAdFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<any[]>([])
  const [imageError, setImageError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedColorFinish, setSelectedColorFinish] = useState<string>('standard')
  const [adData, setAdData] = useState<any>(null)
  const [initialLoading, setInitialLoading] = useState(false)
  const [location, setLocation] = useState<{ latitude: number, longitude: number, address: string } | null>(null)
  // ✅ PŘIDÁNO - Toast hook
  const { showSuccess, showError, showWarning } = useToast()

  // Načti data inzerátu
  useEffect(() => {
    if (initialData) {
      setAdData(initialData)
      populateFormData(initialData)
      // ✅ PŘIDÁNO - Toast jen pro initialData
      showSuccess('Data načtena', 'Formulář byl naplněn aktuálními údaji')
    } else if (adId) {
      fetchAdData()
    }
  }, [adId, initialData])

  const fetchAdData = async () => {
    try {
      setInitialLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:3000/ad/${adId}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include'
      })

      if (!res.ok) {
        throw new Error('Nepodařilo se načíst data inzerátu')
      }

      const data = await res.json()
      setAdData(data)
      populateFormData(data)
      // ✅ PŘIDÁNO - Toast jen pro fetch (ne pro initialData)
      showSuccess('Data načtena', 'Formulář byl naplněn aktuálními údaji')
    } catch (err) {
      console.error('Error fetching ad data:', err)
      setError(err instanceof Error ? err.message : 'Chyba při načítání dat')
      showError('Chyba při načítání', 'Nepodařilo se načíst data inzerátu')
    } finally {
      setInitialLoading(false)
    }
  }

  const populateFormData = (data: any) => {
    // Nastav state hodnoty
    setSelectedBrand(data.brand || '')
    setSelectedModel(data.model || '')
    setSelectedColor(data.color || '')
    setSelectedColorFinish(data.colorFinish || 'standard')
    setExistingImages(data.images || [])

    // ✅ PŘIDÁNO - Lokace
    if (data.latitude && data.longitude && data.address) {
      setLocation({
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address
      })
    }
  }

  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand)
    setSelectedModel('') // Reset model při změně značky
  }

  const handleModelChange = (model: string) => {
    setSelectedModel(model)
  }

  const modelsList = selectedBrand ? getModelsList(selectedBrand) : []

  // Image handling funkce (stejné jako v AdCreateForm)
  const validateAndAddFiles = (newFiles: File[]) => {
    const maxSize = 10 * 1024 * 1024
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const errors: string[] = []
    const validFiles: File[] = []

    newFiles.forEach(file => {
      if (file.size > maxSize) {
        errors.push(`${file.name}: Příliš velký soubor (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum je 10MB.`)
        return
      }

      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Nepodporovaný formát. Povolené: JPEG, PNG, WebP.`)
        return
      }

      validFiles.push(file)
    })

    const totalImages = existingImages.length + images.length + validFiles.length
    if (totalImages > 10) {
      errors.push(`Můžete mít maximálně 10 obrázků. Aktuálně máte ${existingImages.length + images.length}, snažíte se přidat ${validFiles.length}.`)
    } else {
      setImages(prev => [...prev, ...validFiles])
      // ✅ PŘIDÁNO - Toast po přidání obrázků
      if (validFiles.length > 0) {
        showSuccess('Obrázky přidány', `Přidáno ${validFiles.length} ${validFiles.length === 1 ? 'obrázek' : 'obrázků'}`)
      }
    }

    if (errors.length > 0) {
      setImageError(errors.join('\n'))
      // ✅ PŘIDÁNO - Toast pro chyby obrázků
      showWarning('Problém s obrázky', errors[0])
    } else {
      setImageError(null)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    validateAndAddFiles(files)
  }

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
    const files = Array.from(e.dataTransfer.files)
    validateAndAddFiles(files)
  }

  const handleImageRemove = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImageError(null)
    // ✅ PŘIDÁNO - Toast po odebrání
    showSuccess('Obrázek odebrán', 'Nový obrázek byl odebrán ze seznamu')
  }

  const handleExistingImageRemove = (imageId: string) => {
    setExistingImages(prev => prev.filter(img => img.id !== imageId))
    // ✅ PŘIDÁNO - Toast po odebrání existujícího
    showWarning('Obrázek bude smazán', 'Existující obrázek bude smazán při uložení')
  }

  const handleLocationSelect = (loc: { latitude: number, longitude: number, address: string }) => {
    setLocation(loc)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault()
      setLoading(true)
      setError(null)

      // Validace - musí mít alespoň 2 obrázky celkem
      const totalImages = existingImages.length + images.length
      if (totalImages < 2) {
        setImageError('Musíte mít alespoň dva obrázky.')
        setLoading(false)
        // ✅ PŘIDÁNO - Toast pro validační chybu
        showError('Nedostatek obrázků', 'Inzerát musí mít alespoň 2 obrázky')
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

      // ✅ PŘESUNUTO - Kontaktní údaje HNED na začátek
      const contactPhone = formValues.get('contactPhone')
      const contactEmail = formValues.get('contactEmail')

      if (!contactPhone || !contactPhone.toString().trim()) {
        throw new Error('Telefon je povinný')
      }

      if (!contactEmail || !contactEmail.toString().trim()) {
        throw new Error('Email je povinný')
      }

      // Přidej kontaktní údaje do formData
      formData.append('contactPhone', contactPhone.toString())
      formData.append('contactEmail', contactEmail.toString())

      const contactName = formValues.get('contactName')
      if (contactName && contactName.toString().trim()) {
        formData.append('contactName', contactName.toString())
      }

      // Brand a model ze state
      formData.append('brand', selectedBrand)
      formData.append('model', selectedModel)
      formData.append('color', selectedColor)
      formData.append('colorFinish', selectedColorFinish || 'standard')

      // String hodnoty
      const stringFields = ['title', 'description', 'bodyType', 
                           'fuel', 'transmission', 'drivetrain', 'airConditioning', 'condition', 
                           'countryOfOrigin', 'euroStandard']
      
      stringFields.forEach(field => {
        const value = formValues.get(field)
        if (value) formData.append(field, value.toString())
      })

      // Integer hodnoty
      const requiredIntegerFields = ['price', 'mileage', 'year', 'firstRegistration', 'doorCount', 'seatCount', 'engineVolume', 'power']
      const optionalIntegerFields = ['airbagCount', 'gearCount']

      requiredIntegerFields.forEach(field => {
        const value = formValues.get(field)
        if (!value || !value.toString().trim()) {
          throw new Error(`${field} je povinné pole`)
        }
        formData.append(field, value.toString())
      })

      optionalIntegerFields.forEach(field => {
        const value = formValues.get(field)
        if (value && value.toString().trim()) {
          formData.append(field, value.toString())
        }
      })

      // avgConsumption jako povinná
      const avgConsumptionValue = formValues.get('avgConsumption')
      if (!avgConsumptionValue || !avgConsumptionValue.toString().trim()) {
        throw new Error('Průměrná spotřeba je povinná')
      }
      formData.append('avgConsumption', avgConsumptionValue.toString())

      // Boolean hodnoty
      const booleanFields = ['ecoTaxPaid', 'isFirstOwner', 'isDisabledAdapted', 'wasCrashed', 'hasServiceBook']
      booleanFields.forEach(field => {
        const checkbox = form.querySelector(`[name="${field}"]`) as HTMLInputElement
        formData.append(field, checkbox?.checked ? 'true' : 'false')
      })

      // Datum hodnoty
      const techCheckValue = formValues.get('technicalCheckUntil')
      if (techCheckValue) {
        formData.append('technicalCheckUntil', new Date(techCheckValue.toString()).toISOString())
      }
      
      const warrantyValue = formValues.get('warrantyUntil')
      if (warrantyValue) {
        formData.append('warrantyUntil', new Date(warrantyValue.toString()).toISOString())
      }

      // Nové obrázky
      if (images.length > 0) {
        images.forEach(img => {
          formData.append('images', img)
        })
      }

      // Které existující obrázky smazat
      const imagesToDelete = adData.images.filter((img: any) => 
        !existingImages.find(existing => existing.id === img.id)
      )
      
      if (imagesToDelete.length > 0) {
        const idsToDelete = imagesToDelete.map((img: any) => img.id);
        formData.append('imagesToDelete', JSON.stringify(idsToDelete));
      }

      // ✅ ODSTRANĚNO - duplikát kontaktních údajů (byl tu druhý blok)

      // ✅ PŘIDÁNO - Lokace
      if (location) {
        formData.append('latitude', location.latitude.toString())
        formData.append('longitude', location.longitude.toString())
        formData.append('address', location.address)
      }

      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:3000/ad/${adId}`, {
        method: 'PATCH',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData,
        credentials: 'include'
      })
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        console.error('❌ Backend error response:', errData)
        
        let errorMessage = 'Chyba při aktualizaci inzerátu'
        
        if (errData.message) {
          errorMessage = Array.isArray(errData.message) 
            ? errData.message.join(', ') 
            : errData.message
        } else if (errData.error) {
          errorMessage = errData.error
        }
        
        throw new Error(errorMessage)
      }

      const result = await res.json()
      setSuccess(true)

      // ✅ PŘIDÁNO - Toast po úspěšném uložení
      showSuccess('Inzerát aktualizován', 'Všechny změny byly úspěšně uloženy')

      // Redirect po 2 sekundách
      setTimeout(() => {
        router.push(`/ads/${adId}`)
      }, 2000)

    } catch (err) {
      console.error('🔍 Submit error:', err)
      if (err instanceof Error) {
        setError(err.message)
        // ✅ PŘIDÁNO - Toast pro chybu
        showError('Chyba při ukládání', err.message)
      } else {
        setError('Neznámá chyba')
        showError('Chyba při ukládání', 'Neznámá chyba')
      }
    } finally {
      setLoading(false)
    }
  }

  // ✅ UPRAVENO - Loading states
  if (initialLoading && !adData) {
    return (
      <div className="ad-create-form">
        <div className="form-container">
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                border: '3px solid #e2e8f0', 
                borderTop: '3px solid #0070f3',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto'
              }}></div>
            </div>
            <h3 style={{ color: '#4a5568', margin: 0 }}>Načítám data inzerátu...</h3>
            <p style={{ color: '#718096', marginTop: '8px' }}>Prosím čekejte</p>
          </div>
        </div>
      </div>
    )
  }

  if (!adData) {
    return (
      <div className="ad-create-form">
        <div className="form-container">
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h3 style={{ color: '#e53e3e', marginBottom: '16px' }}>Chyba při načítání</h3>
            <p style={{ color: '#718096', marginBottom: '24px' }}>Nepodařilo se načíst data inzerátu</p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                background: '#0070f3',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Zkusit znovu
            </button>
          </div>
        </div>
      </div>
    )
  }

  const totalImages = existingImages.length + images.length

  return (
    <div className="ad-create-form">
      <div className="form-container" style={{ position: 'relative' }}>
        <h2>Upravit inzerát</h2>
        <p className="form-subtitle">Upravte údaje vašeho inzerátu</p>

        <form onSubmit={handleSubmit} id="ad-edit-form">
          {/* Základní informace */}
          <div className="form-section">
            <h3 className="form-section__title">Základní informace</h3>
            <div className="form-grid">
              <div className="form-group form-group--full-width">
                <label htmlFor="title">Název inzerátu <span className="required">*</span></label>
                <input name="title" id="title" required placeholder="Např. Škoda Octavia 2.0 TDI Combi" defaultValue={adData.title} />
              </div>

              <div className="form-group">
                <label htmlFor="brand">Značka <span className="required">*</span></label>
                <BrandSelect
                  value={selectedBrand}
                  onChange={handleBrandChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="model">Model <span className="required">*</span></label>
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
                <textarea name="description" id="description" placeholder="Popište stav vozidla, výbavu, historii..." defaultValue={adData.description} />
              </div>
            </div>
          </div>

          {/* Cena a základní údaje */}
          <div className="form-section">
            <h3 className="form-section__title">Cena a základní údaje</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="price">Cena (Kč) <span className="required">*</span></label>
                <input name="price" id="price" type="number" required placeholder="450000" defaultValue={adData.price} />
              </div>

              <div className="form-group">
                <label htmlFor="mileage">Nájezd (km) <span className="required">*</span></label>
                <input name="mileage" id="mileage" type="number" required placeholder="150000" defaultValue={adData.mileage} />
              </div>

              <div className="form-group">
                <label htmlFor="year">Rok výroby <span className="required">*</span></label>
                <input name="year" id="year" type="number" required placeholder="2018" defaultValue={adData.year} />
              </div>

              <div className="form-group">
                <label htmlFor="firstRegistration">První registrace (rok) <span className="required">*</span></label>
                <input name="firstRegistration" id="firstRegistration" type="number" required placeholder="2018" defaultValue={adData.firstRegistration} />
              </div>
            </div>
          </div>

          {/* Vzhled a rozměry */}
          <div className="form-section">
            <h3 className="form-section__title">Vzhled a rozměry</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="bodyType">Karoserie <span className="required">*</span></label>
                <select name="bodyType" id="bodyType" required defaultValue={adData.bodyType}>
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
                <label>Barva <span className="required">*</span></label>
                <ColorSelect
                  value={selectedColor}
                  onChange={setSelectedColor}
                  required
                />
              </div>

              <div className="form-group">
                <label>Povrchová úprava <span className="required">*</span></label>
                <ColorFinishSelect
                  value={selectedColorFinish}
                  onChange={setSelectedColorFinish}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="doorCount">Počet dveří <span className="required">*</span></label>
                <input name="doorCount" id="doorCount" type="number" required placeholder="5" defaultValue={adData.doorCount} />
              </div>

              <div className="form-group">
                <label htmlFor="seatCount">Počet míst <span className="required">*</span></label>
                <input name="seatCount" id="seatCount" type="number" required placeholder="5" defaultValue={adData.seatCount} />
              </div>

              <div className="form-group">
                <label htmlFor="airbagCount">Počet airbagů</label>
                <input name="airbagCount" id="airbagCount" type="number" placeholder="6" defaultValue={adData.airbagCount} />
              </div>
            </div>
          </div>

          {/* Motor a pohon */}
          <div className="form-section">
            <h3 className="form-section__title">Motor a pohon</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="fuel">Palivo <span className="required">*</span></label>
                <select name="fuel" id="fuel" required defaultValue={adData.fuel}>
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
                <label htmlFor="engineVolume">Objem motoru (ccm) <span className="required">*</span></label>
                <input name="engineVolume" id="engineVolume" type="number" required placeholder="1968" defaultValue={adData.engineVolume} />
              </div>

              <div className="form-group">
                <label htmlFor="power">Výkon (kW) <span className="required">*</span></label>
                <input name="power" id="power" type="number" required placeholder="110" defaultValue={adData.power} />
              </div>

              <div className="form-group">
                <label htmlFor="avgConsumption">Průměrná spotřeba (l/100km) <span className="required">*</span></label>
                <input name="avgConsumption" id="avgConsumption" type="number" step="0.1" required placeholder="5.2" defaultValue={adData.avgConsumption} />
              </div>

              <div className="form-group">
                <label htmlFor="transmission">Převodovka <span className="required">*</span></label>
                <select name="transmission" id="transmission" required defaultValue={adData.transmission}>
                  <option value="">Vyberte převodovku</option>
                  <option value="manual">Manuální</option>
                  <option value="automatic">Automatická</option>
                  <option value="cvt">CVT</option>
                  <option value="sequential">Sekvenční</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="gearCount">Počet rychlostí</label>
                <input name="gearCount" id="gearCount" type="number" placeholder="6" defaultValue={adData.gearCount} />
              </div>

              <div className="form-group">
                <label htmlFor="airConditioning">Klimatizace</label>
                <select name="airConditioning" id="airConditioning" defaultValue={adData.airConditioning}>
                  <option value="">Vyberte klimatizaci</option>
                  <option value="none">Žádná</option>
                  <option value="manual">Manuální</option>
                  <option value="automatic">Automatická</option>
                  <option value="two_zone">Dvouzónová</option>
                  <option value="three_zone">Třízónová</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="drivetrain">Pohon <span className="required">*</span></label>
                <select name="drivetrain" id="drivetrain" required defaultValue={adData.drivetrain}>
                  <option value="">Vyberte pohon</option>
                  <option value="fwd">Přední (FWD)</option>
                  <option value="rwd">Zadní (RWD)</option>
                  <option value="awd">4x4 (AWD)</option>
                  <option value="four_x_four">4x4 (mechanické)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stav a údaje */}
          <div className="form-section">
            <h3 className="form-section__title">Stav a údaje</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="condition">Stav vozidla <span className="required">*</span></label>
                <select name="condition" id="condition" required defaultValue={adData.condition}>
                  <option value="">Vyberte stav</option>
                  <option value="new">Nové</option>
                  <option value="used">Použité</option>
                  <option value="crashed">Havárie</option>
                  <option value="demo">Demo</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="technicalCheckUntil">STK do</label>
                <input name="technicalCheckUntil" id="technicalCheckUntil" type="date" 
                       defaultValue={adData.technicalCheckUntil ? new Date(adData.technicalCheckUntil).toISOString().split('T')[0] : ''} />
              </div>

              <div className="form-group">
                <label htmlFor="countryOfOrigin">Země původu <span className="required">*</span></label>
                <input name="countryOfOrigin" id="countryOfOrigin" required placeholder="ČR" defaultValue={adData.countryOfOrigin} />
              </div>

              <div className="form-group">
                <label htmlFor="euroStandard">Emisní norma</label>
                <select name="euroStandard" id="euroStandard" defaultValue={adData.euroStandard}>
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
                <input name="warrantyUntil" id="warrantyUntil" type="date" 
                       defaultValue={adData.warrantyUntil ? new Date(adData.warrantyUntil).toISOString().split('T')[0] : ''} />
              </div>
            </div>

            {/* Checkboxy */}
            <div className="form-grid" style={{ marginTop: '1rem' }}>
              <label className="checkbox-label">
                <input name="ecoTaxPaid" type="checkbox" defaultChecked={adData.ecoTaxPaid} /> Eko daň zaplacena
              </label>
              <label className="checkbox-label">
                <input name="isFirstOwner" type="checkbox" defaultChecked={adData.isFirstOwner} /> První majitel
              </label>
              <label className="checkbox-label">
                <input name="isDisabledAdapted" type="checkbox" defaultChecked={adData.isDisabledAdapted} /> Úprava pro ZTP
              </label>
              <label className="checkbox-label">
                <input name="wasCrashed" type="checkbox" defaultChecked={adData.wasCrashed} /> Bylo havarované
              </label>
              <label className="checkbox-label">
                <input name="hasServiceBook" type="checkbox" defaultChecked={adData.hasServiceBook} /> Servisní knížka
              </label>
            </div>
          </div>

          {/* Kontaktní údaje */}
          <div className="form-section">
            <h3 className="form-section__title">Kontaktní údaje prodejce</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="contactName">Jméno kontaktní osoby</label>
                <input 
                  name="contactName" 
                  id="contactName" 
                  placeholder="Vyplňte pouze pokud se liší od vašeho jména" 
                  defaultValue={adData?.contactName || ''} // Pro EditAdForm
                />
                <small className="form-help">
                  Volitelné - zobrazí se pouze pokud se liší od jména z vašeho profilu
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="contactPhone">Telefon <span className="required">*</span></label>
                <input 
                  name="contactPhone" 
                  id="contactPhone" 
                  type="tel" 
                  required 
                  placeholder="+420 123 456 789"
                  defaultValue={adData?.contactPhone || ''} // Pro EditAdForm
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactEmail">Email <span className="required">*</span></label>
                <input 
                  name="contactEmail" 
                  id="contactEmail" 
                  type="email" 
                  required 
                  placeholder="vase@email.cz"
                  defaultValue={adData?.contactEmail || ''} // Pro EditAdForm
                />
              </div>
            </div>
            
            <div className="contact-notice">
              <svg className="contact-notice__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
              <p>
                Telefon a email budou zobrazeny zájemcům přímo u vašeho inzerátu. 
                Můžete použít jiné kontakty než ty z vašeho profilu.
              </p>
            </div>
          </div>

          {/* Lokalita vozidla */}
          <div className="form-section">
            <h3 className="form-section__title">Lokalita vozidla</h3>
            <MapSelector 
              onLocationSelect={handleLocationSelect}
              height="300px"
              initialPosition={location ? [location.latitude, location.longitude] : undefined}
            />
            {location && (
              <>
                <input type="hidden" name="latitude" value={location.latitude} />
                <input type="hidden" name="longitude" value={location.longitude} />
                <input type="hidden" name="address" value={location.address} />
              </>
            )}
          </div>

          {/* Image Upload Section */}
          <div className="image-upload-section">
            <h3>Obrázky inzerátu <span className="required">*</span></h3>
            <p className="image-requirement">
              Musíte mít alespoň 2 obrázky, maximálně 10
              <br />
              <small style={{ color: '#6c757d' }}>
                Maximální velikost: 10MB na obrázek | Povolené formáty: JPEG, PNG, WebP
              </small>
            </p>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="existing-images">
                <h4>Současné obrázky:</h4>
                <div className="image-gallery">
                  {existingImages.map((image) => (
                    <div key={image.id} className="image-preview">
                      <img src={image.url} alt="Současný obrázek" />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => handleExistingImageRemove(image.id)}
                        title="Odstranit obrázek"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            {images.length > 0 && (
              <div className="new-images">
                <h4>Nové obrázky:</h4>
                <div className="image-gallery">
                  {images.map((image, index) => (
                    <div key={index} className="image-preview">
                      <img 
                        src={URL.createObjectURL(image)} 
                        alt={`Nový náhled ${index + 1}`}
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
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image Counter */}
            <div className="image-counter">
              <span className={`counter ${totalImages >= 2 ? 'valid' : 'invalid'} ${totalImages >= 10 ? 'full' : ''}`}>
                {totalImages} / 10 obrázků (min. 2)
                {totalImages >= 10 && <span className="limit-reached"> - limit dosažen</span>}
              </span>
            </div>

            {/* Drop Zone */}
            <div 
              className={`drop-zone ${dragActive ? 'active' : ''} ${totalImages >= 10 ? 'disabled' : ''}`}
              onDragEnter={totalImages < 10 ? handleDrag : undefined}
              onDragLeave={totalImages < 10 ? handleDrag : undefined}
              onDragOver={totalImages < 10 ? handleDrag : undefined}
              onDrop={totalImages < 10 ? handleDrop : undefined}
            >
              <div className="drop-zone-content">
                {totalImages >= 10 ? (
                  <>
                    <p className="drop-text">Dosáhli jste maximálního počtu obrázků (10)</p>
                    <p className="drop-subtext">Odstraňte některé obrázky pro přidání nových</p>
                  </>
                ) : (
                  <>
                    <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="drop-text">
                      Přetáhněte nové obrázky sem nebo 
                      <label htmlFor="images" className="file-input-label"> vyberte soubory</label>
                    </p>
                    <p className="drop-subtext">Podporované formáty: JPG, PNG, WEBP (max 10MB/obrázek)</p>
                  </>
                )}
              </div>
              
              <input
                type="file"
                name="images"
                id="images"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                disabled={totalImages >= 10}
                style={{ display: 'none' }}
              />
            </div>

            {imageError && (
              <div className="image-error" style={{ 
                color: '#dc3545', 
                backgroundColor: '#f8d7da', 
                border: '1px solid #f5c6cb',
                borderRadius: '4px',
                padding: '12px',
                marginTop: '8px',
                whiteSpace: 'pre-line'
              }}>
                {imageError}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? <ButtonLoading /> : 'Uložit změny'}
          </button>
          
          {error && <div className="error">{error}</div>}
          
          {success && (
            <div className="success-message">
              <div className="success-message__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="success-message__content">
                <h3 className="success-message__title">Inzerát byl úspěšně aktualizován!</h3>
                <p className="success-message__text">
                  Přesměrovávám vás na detail inzerátu...
                </p>
                <div className="success-message__actions">
                  <button 
                    type="button"
                    className="success-message__button"
                    onClick={() => router.push(`/ads/${adId}`)}
                  >
                    Zobrazit inzerát
                  </button>
                </div>
              </div>
              <div className="success-message__spinner">
                <div className="spinner"></div>
              </div>
            </div>
          )}
        </form>

        {/* ✅ PŘIDÁNO - Loading overlay */}
        {loading && <FormLoading message="Ukládám změny..." />}

        {/* Vysvětlivka pro povinná pole */}
        <div className="form-notice">
          <div className="form-notice__content">
            <svg className="form-notice__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9,9h6v6H9z"/>
              <path d="M9,15h6"/>
            </svg>
            <p>
              <span className="required">*</span> 
              Povinná pole jsou označena červenou hvězdičkou a musí být vyplněna před uložením změn.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}