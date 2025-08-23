'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import '../styles/components/AdCreateForm.scss'
import '../styles/components/SuccessMessage.scss'
import { getModelsList } from '../data/carData';
import BrandSelect from './BrandSelect';
import ModelSelect from './ModelSelect';
import ColorSelect from './ColorSelect'
import ColorFinishSelect from './ColorFinishSelect'
import { FormLoading, ButtonLoading } from './LoadingStates'
import { useToast } from '../contexts/ToastContext'
import MapSelector from './MapSelector'

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdCreateForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [createdAdId, setCreatedAdId] = useState<string | null>(null)
  const [images, setImages] = useState<File[]>([])
  const [imageError, setImageError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [selectedColorFinish, setSelectedColorFinish] = useState<string>('standard')
  const [location, setLocation] = useState<{
    latitude: number
    longitude: number
    address: string
  } | null>(null)
  const { showSuccess, showError, showWarning } = useToast()

  const [adCount, setAdCount] = useState<number | null>(null)
  const [showLimitModal, setShowLimitModal] = useState(false)

  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [uploadStep, setUploadStep] = useState<string>('')

  const modelsList = getModelsList(selectedBrand)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setShowLoginModal(true)
      return
    }
    fetch(`${API_URL}/ad/my`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setAdCount(Array.isArray(data) ? data.length : 0)
        if (Array.isArray(data) && data.length >= 10) {
          setShowLimitModal(true)
        }
      })
      .catch(() => setAdCount(null))
  }, [])

  const handleBrandChange = (brandValue: string) => {
    setSelectedBrand(brandValue)
    setSelectedModel('') // Reset model when brand changes
  }

  const handleModelChange = (modelValue: string) => {
    setSelectedModel(modelValue)
  }

  const handleImageRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    
    if (newImages.length < 2) {
      setImageError('Přidejte alespoň dva obrázky.')
    } else {
      setImageError(null)
    }
    
    showSuccess('Obrázek odebrán', 'Obrázek byl odebrán ze seznamu')
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    validateAndAddFiles(files)
  }

  const handleLocationSelect = (selectedLocation: {
    latitude: number
    longitude: number
    address: string
  }) => {
    setLocation(selectedLocation)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
    const files = Array.from(e.dataTransfer.files)
    validateAndAddFiles(files)
  }

  const validateAndAddFiles = (newFiles: File[]) => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const errors: string[] = []
    const validFiles: File[] = []

    newFiles.forEach(file => {
      // Kontrola velikosti
      if (file.size > maxSize) {
        errors.push(`${file.name}: Příliš velký soubor (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum je 10MB.`)
        return
      }

      // Kontrola typu
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Nepodporovaný formát. Povolené: JPEG, PNG, WebP.`)
        return
      }

      validFiles.push(file)
    })

    // Kontrola celkového počtu obrázků
    if (images.length + validFiles.length > 15) {
      errors.push(`Můžete nahrát maximálně 15 obrázků. Aktuálně máte ${images.length}, snažíte se přidat ${validFiles.length}.`)
    } else {
      setImages(prev => [...prev, ...validFiles])
      // ✅ PŘIDÁNO - Toast po přidání obrázků
      if (validFiles.length > 0) {
        showSuccess('Obrázky přidány', `Přidáno ${validFiles.length} ${validFiles.length === 1 ? 'obrázek' : 'obrázků'}`)
      }
    }

    // Zobraz chyby
    if (errors.length > 0) {
      setImageError(errors.join('\n'))
      // ✅ PŘIDÁNO - Toast pro chyby obrázků
      showWarning('Problém s obrázky', errors[0])
    } else {
      setImageError(null)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // ✅ Kontrola limitu před validací
    if (adCount !== null && adCount >= 10) {
      setShowLimitModal(true)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // validace počtu obrázků
      if (images.length < 2) {
        setImageError('Přidejte alespoň dva obrázky.')
        setLoading(false)
        showError('Nedostatek obrázků', 'Musíte přidat alespoň 2 obrázky')
        return
      } else {
        setImageError(null)
      }

      if (!selectedBrand || !selectedModel) {
        setError('Vyberte značku a model vozidla')
        setLoading(false)
        return
      }

      const form = e.currentTarget
      const formValues = new FormData(form)


      // Map povinných polí: název pole -> uživatelská hláška
      const requiredFields: { [key: string]: string } = {
        title: 'Název inzerátu je povinný',
        description: 'Popis vozidla je povinný',
        price: 'Cena je povinná',
        mileage: 'Nájezd je povinný',
        year: 'Rok výroby je povinný',
        firstRegistration: 'První registrace je povinná',
        bodyType: 'Karoserie je povinná',
        doorCount: 'Počet dveří je povinný',
        seatCount: 'Počet míst je povinný',
        airbagCount: 'Počet airbagů je povinný', // ✅ NOVĚ POVINNÉ
        color: 'Barva je povinná',
        fuel: 'Palivo je povinné',
        engineVolume: 'Objem motoru je povinný',
        power: 'Výkon je povinný',
        avgConsumption: 'Průměrná spotřeba je povinná',
        transmission: 'Převodovka je povinná',
        gearCount: 'Počet rychlostních stupňů je povinný', // ✅ NOVĚ POVINNÉ
        drivetrain: 'Pohon je povinný',
        condition: 'Stav vozidla je povinný',
        countryOfOrigin: 'Země původu je povinná',
        contactPhone: 'Telefon je povinný',
        contactEmail: 'Email je povinný',
      }

      // Zkontroluj povinná pole
      for (const [field, message] of Object.entries(requiredFields)) {
        let value = formValues.get(field)
        // Barva a povrchová úprava jsou ve state
        if (field === 'color') value = selectedColor
        if (field === 'colorFinish') value = selectedColorFinish
        if (!value || !value.toString().trim()) {
          setError(message)
          setLoading(false)
          return
        }
      }

      // Kontrola lokace
      if (!location) {
        setError('Vyberte lokalitu vozidla na mapě')
        setLoading(false)
        return
      }

      const formData = new FormData()
      // Brand a model ze state
      formData.append('brand', selectedBrand)
      formData.append('model', selectedModel)
      
      // Color a colorFinish ze state
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

      // Integer hodnoty - ✅ PŘIDÁNO year, firstRegistration jako povinné
      const requiredIntegerFields = ['price', 'mileage', 'year', 'firstRegistration', 'doorCount', 'seatCount', 'engineVolume', 'power']
      const optionalIntegerFields = ['airbagCount', 'gearCount']

      // Povinná integer pole
      requiredIntegerFields.forEach(field => {
        const value = formValues.get(field)
        if (!value || !value.toString().trim()) {
          throw new Error(`${field} je povinné pole`)
        }
        formData.append(field, value.toString())
      })

      // Nepovinná integer pole
      optionalIntegerFields.forEach(field => {
        const value = formValues.get(field)
        if (value && value.toString().trim()) {
          formData.append(field, value.toString())
        }
      })

      // ✅ ZMĚNĚNO - avgConsumption jako povinná, ale správně validovaná
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

      // Obrázky
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          setUploadStep(`Nahrávám obrázek ${i + 1} z ${images.length}`)
          setUploadProgress(Math.round(((i + 1) / images.length) * 100))
          formData.append('images', images[i])
          // případně uploaduj na server po jednom, pokud backend podporuje chunk upload
        }
      }

      // V handleSubmit před odesláním:
      const contactPhone = formValues.get('contactPhone')
      const contactEmail = formValues.get('contactEmail')

      if (!contactPhone || !contactPhone.toString().trim()) {
        throw new Error('Telefon je povinný')
      }

      if (!contactEmail || !contactEmail.toString().trim()) {
        throw new Error('Email je povinný')
      }

      // Přidej do formData
      formData.append('contactPhone', contactPhone.toString())
      formData.append('contactEmail', contactEmail.toString())
            setUploading(true)
      setUploadProgress(null)
      setUploadStep('Připravuji data...')

      const contactName = formValues.get('contactName')
      if (contactName && contactName.toString().trim()) {
        formData.append('contactName', contactName.toString())
      }

      // ✅ PŘIDÁNO - Přidání lokace
      if (!location) {
        throw new Error('Vyberte lokalitu vozidla na mapě')
      }

      formData.append('latitude', location.latitude.toString())
      formData.append('longitude', location.longitude.toString())
      formData.append('address', location.address)

      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/ad`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData,
        credentials: 'include'
      })
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        console.error('❌ Backend error response:', errData);
        // ✅ VYLEPŠENO - Lepší error parsing
        let errorMessage = 'Chyba při ukládání inzerátu';
        
        if (errData.message) {
          errorMessage = Array.isArray(errData.message) 
            ? errData.message.join(', ') 
            : errData.message;
        } else if (errData.error) {
          errorMessage = errData.error;
        } else if (res.status === 413) {
          errorMessage = 'Soubory jsou příliš velké. Zkuste nahrát menší obrázky.';
        } else if (res.status === 400) {
          errorMessage = 'Neplatná data ve formuláři. Zkontrolujte všechna pole.';
        }
        
        throw new Error(errorMessage);
      }

      // ✅ ZMĚNĚNO - Získáme ID vytvořeného inzerátu
      const result = await res.json()
      setCreatedAdId(result.id)
      setSuccess(true)
      form.reset()
      setImages([])

      // ✅ PŘIDÁNO - Toast po úspěšném vytvoření
      showSuccess('Inzerát vytvořen', 'Váš inzerát byl úspěšně publikován')

      // ✅ PŘIDÁNO - Redirect po 2 sekundách
      setTimeout(() => {
        if (result.id) {
          router.push(`/ads/${result.id}`)
        } else {
          router.push('/ads')
        }
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
      setUploading(false)
      setUploadProgress(null)
      setUploadStep('')
    }
  }

  

  return (
    <div className="ad-create-form">
      <div className="form-container" style={{ position: 'relative' }}>
        <h2>Přidat inzerát</h2>
        <p className="form-subtitle">Vytvořte nový inzerát a prodejte své vozidlo rychle a snadno</p>

        <form onSubmit={handleSubmit} id="ad-create-form">
          {/* Základní informace */}
          <div className="form-section">
            <h3 className="form-section__title">Základní informace</h3>
            <div className="form-grid">
              <div className="form-group form-group--full-width">
                <label htmlFor="title">Název inzerátu <span className="required">*</span></label>
                <input name="title" id="title" required placeholder="Např. Škoda Octavia 2.0 TDI Combi" />
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
              
              {/* Základní informace - POPIS NEPOVINNÝ */}
              <div className="form-group form-group--full-width">
                <label htmlFor="description">Popis vozidla<span className="required">*</span></label> 
                <textarea name="description" id="description" placeholder="Popište stav vozidla, výbavu, historii..." />
              </div>
            </div>
          </div>

          {/* Cena a základní údaje */}
          <div className="form-section">
            <h3 className="form-section__title">Cena a základní údaje</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="price">Cena (Kč) <span className="required">*</span></label>
                <input name="price" id="price" type="number" required placeholder="450000" />
              </div>
              
              <div className="form-group">
                <label htmlFor="mileage">Nájezd (km) <span className="required">*</span></label>
                <input name="mileage" id="mileage" type="number" required placeholder="150000" />
              </div>
              
              <div className="form-group">
                <label htmlFor="year">Rok výroby <span className="required">*</span></label> {/* ✅ PŘIDÁNO * */}
                <input name="year" id="year" type="number" required placeholder="2018" />
              </div>
              
              <div className="form-group">
                <label htmlFor="firstRegistration">První registrace (rok) <span className="required">*</span></label> {/* ✅ PŘIDÁNO * */}
                <input name="firstRegistration" id="firstRegistration" type="number" required placeholder="2018" />
              </div>
            </div>
          </div>

          {/* Vzhled a rozměry */}
          <div className="form-section">
            <h3 className="form-section__title">Vzhled a rozměry</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="bodyType">Karoserie <span className="required">*</span></label>
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
                <label>Barva <span className="required">*</span></label>
                <ColorSelect
                  value={selectedColor}
                  onChange={setSelectedColor}
                  required
                />
              </div>

              <div className="form-group">
                <label>Povrchová úprava </label>
                <ColorFinishSelect
                  value={selectedColorFinish}
                  onChange={setSelectedColorFinish}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="doorCount">Počet dveří <span className="required">*</span></label>
                <input name="doorCount" id="doorCount" type="number" required placeholder="5" />
              </div>

              <div className="form-group">
                <label htmlFor="seatCount">Počet míst <span className="required">*</span></label>
                <input name="seatCount" id="seatCount" type="number" required placeholder="5" />
              </div>

              {/* Vzhled a rozměry - AIRBAGY NEPOVINNÉ */}
              <div className="form-group">
                <label htmlFor="airbagCount">Počet airbagů <span className="required">*</span></label>
                <input name="airbagCount" id="airbagCount" type="number" required placeholder="6" />
              </div>
            </div>
          </div>

          {/* Motor a pohon */}
          <div className="form-section">
            <h3 className="form-section__title">Motor a pohon</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="fuel">Palivo <span className="required">*</span></label>
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
                <label htmlFor="engineVolume">Objem motoru (ccm) <span className="required">*</span></label>
                <input name="engineVolume" id="engineVolume" type="number" required placeholder="1968" />
              </div>

              <div className="form-group">
                <label htmlFor="power">Výkon (kW) <span className="required">*</span></label>
                <input name="power" id="power" type="number" required placeholder="110" />
              </div>

              <div className="form-group">
                <label htmlFor="avgConsumption">Průměrná spotřeba (l/100km) <span className="required">*</span></label>
                <input name="avgConsumption" id="avgConsumption" type="number" step="0.1" required placeholder="5.2" />
              </div>

              {/* ✅ PŘIDÁNO ZPĚT - Převodovka */}
              <div className="form-group">
                <label htmlFor="transmission">Převodovka <span className="required">*</span></label>
                <select name="transmission" id="transmission" required>
                  <option value="">Vyberte převodovku</option>
                  <option value="manual">Manuální</option>
                  <option value="automatic">Automatická</option>
                  <option value="cvt">CVT</option>
                  <option value="sequential">Sekvenční</option>
                </select>
              </div>

              {/* ✅ PŘIDÁNO ZPĚT - Počet rychlostí */}
              <div className="form-group">
                <label htmlFor="gearCount">Počet rychlostí <span className="required">*</span></label>
                <input name="gearCount" id="gearCount" type="number" required placeholder="6" />
              </div>

              <div className="form-group">
                <label htmlFor="airConditioning">Klimatizace</label>
                <select name="airConditioning" id="airConditioning">
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
                <select name="drivetrain" id="drivetrain" required>
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
            <h3 className="form-section__title">Stav a dokumenty</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="condition">Stav vozidla <span className="required">*</span></label>
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
                <label htmlFor="countryOfOrigin">Země původu <span className="required">*</span></label>
                <input name="countryOfOrigin" id="countryOfOrigin" required placeholder="ČR" />
              </div>

              <div className="form-group">
                <label htmlFor="euroStandard">Emisní norma</label> {/* ✅ ODSTRANĚNO required * */}
                <select name="euroStandard" id="euroStandard"> {/* ✅ ODSTRANĚNO required */}
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

          {/* Image Upload Section */}
          <div className="image-upload-section">
            <h3>Obrázky inzerátu <span className="required">*</span></h3> {/* ✅ PŘIDÁNO * */}
            <p className="image-requirement">
              Přidejte alespoň 2 kvalitní obrázky vašeho vozidla
              <br />
              <small style={{ color: '#6c757d' }}>
                Maximální velikost: 10MB na obrázek | Povolené formáty: JPEG, PNG, WebP | Maximum: 10 obrázků
              </small>
            </p>
            
            {/* Image Gallery */}
            {images.length > 0 && (
              <div className="image-gallery">
                {images.map((image, index) => (
                  <div key={index} className="image-preview">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
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
              className={`drop-zone ${dragActive ? 'active' : ''} ${images.length >= 15 ? 'disabled' : ''}`}
              onDragEnter={images.length < 15 ? handleDrag : undefined}
              onDragLeave={images.length < 15 ? handleDrag : undefined}
              onDragOver={images.length < 15 ? handleDrag : undefined}
              onDrop={images.length < 15 ? handleDrop : undefined}
            >
              <div className="drop-zone-content">
                {images.length >= 15 ? (
                  <>
                    <p className="drop-text">Dosáhli jste maximálního počtu obrázků (15)</p>
                    <p className="drop-subtext">Odstraňte některé obrázky pro přidání nových</p>
                  </>
                ) : (
                  <>
                    <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="drop-text">
                      Přetáhněte obrázky sem nebo 
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
                disabled={images.length >= 15} // ← změna zde
                style={{ display: 'none' }}
              />
            </div>

            {/* Image Counter */}
            <div className="image-counter">
              <span className={`counter ${images.length >= 2 ? 'valid' : 'invalid'} ${images.length >= 15 ? 'full' : ''}`}>
                {images.length} / 15 obrázků (min. 2)
                {images.length >= 15 && <span className="limit-reached"> - limit dosažen</span>}
              </span>
            </div>

            {imageError && (
              <div className="image-error" style={{ 
                color: '#dc3545', 
                backgroundColor: '#f8d7da', 
                border: '1px solid #f5c6cb',
                borderRadius: '4px',
                padding: '12px',
                marginTop: '8px',
                whiteSpace: 'pre-line' // Pro zobrazení více řádků
              }}>
                {imageError}
              </div>
            )}
          </div>

          {/* Nová sekce pro mapu - Lokalita vozidla */}
          <section className="form-section">
            <h3>Lokalita vozidla <span className="required">*</span></h3>
            <MapSelector 
              onLocationSelect={handleLocationSelect}
              height="300px"
            />
            {location && (
              <input 
                type="hidden" 
                name="latitude" 
                value={location.latitude} 
              />
            )}
            {location && (
              <input 
                type="hidden" 
                name="longitude" 
                value={location.longitude} 
              />
            )}
            {location && (
              <input 
                type="hidden" 
                name="address" 
                value={location.address} 
              />
            )}
          </section>

          <button type="submit" disabled={loading || (adCount !== null && adCount >= 10)}>
            {loading ? <ButtonLoading /> : 'Přidat inzerát'}
          </button>
          
          {error && <div className="error">{error}</div>}
          
          {/* ✅ ZMĚNĚNO - Nová success zpráva */}
          {success && (
            <div className="success-message">
              <div className="success-message__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="success-message__content">
                <h3 className="success-message__title">Inzerát byl úspěšně vytvořen!</h3>
                <p className="success-message__text">
                  Přesměrovávám vás na detail inzerátu...
                </p>
                <div className="success-message__actions">
                  {createdAdId && (
                    <button 
                      type="button"
                      className="success-message__button"
                      onClick={() => router.push(`/ads/${createdAdId}`)}
                    >
                      Zobrazit inzerát
                    </button>
                  )}
                  <button 
                    type="button"
                    className="success-message__button success-message__button--secondary"
                    onClick={() => router.push('/ads')}
                  >
                    Všechny inzeráty
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
        {loading && <FormLoading message="Ukládám inzerát..." />}

        {/* LIMIT MODAL */}
        {showLimitModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Limit inzerátů dosažen</h3>
              <p>Máte již <b>10 aktivních inzerátů</b>. Pro přidání nového nejprve některý smažte.</p>
              <button onClick={() => setShowLimitModal(false)} className="success-message__button">
                Zavřít
              </button>
            </div>
          </div>
        )}

        {/* ✅ PŘIDÁNO - Přihlášení modal */}
        {showLoginModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Přihlášení nutné</h3>
              <p>Pro přidání inzerátu se nejprve přihlaste ke svému účtu.</p>
              <button
                className="success-message__button"
                onClick={() => {
                  setShowLoginModal(false)
                  router.push('/login')
                }}
              >
                Přihlásit se
              </button>
            </div>
          </div>
        )}

        {/* Zbytek stejný jako původní... */}
      </div>

      {/* Nově přidaná část pro upload stav */}
      {uploading && (
        <div className="ad-create-upload-overlay">
          <div className="ad-create-upload-modal">
            <div className="ad-create-upload-spinner"></div>
            <div className="ad-create-upload-text">
              <h3>Ukládám inzerát...</h3>
              <p>{uploadStep || 'Probíhá ukládání, čekejte prosím.'}</p>
              {uploadProgress !== null && (
                <div className="ad-create-upload-progressbar">
                  <div
                    className="ad-create-upload-progress"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}