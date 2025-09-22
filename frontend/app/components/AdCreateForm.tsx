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

// ✅ Define proper types instead of any
interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  message: string;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

interface FieldErrors {
  [key: string]: string;
}

// ✅ Updated type to include File and FormDataEntryValue
type FormFieldValue = string | number | boolean | null | undefined | File;

export default function AdCreateForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({}) // ✅ Proper type
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

  // ✅ Form validation rules with proper typing
  const validationRules: ValidationRules = {
    title: {
      required: true,
      minLength: 5,
      maxLength: 100,
      message: 'Název musí mít 5-100 znaků'
    },
    description: {
      required: true,
      minLength: 20,
      maxLength: 5000,
      message: 'Popis musí mít 20-5000 znaků'
    },
    price: {
      required: true,
      min: 1000,
      max: 50000000,
      message: 'Cena musí být 1 000 - 50 000 000 Kč'
    },
    mileage: {
      required: true,
      min: 0,
      max: 2000000,
      message: 'Nájezd musí být 0 - 2 000 000 km'
    },
    year: {
      required: true,
      min: 1900,
      max: new Date().getFullYear() + 1,
      message: `Rok výroby musí být ${1900}-${new Date().getFullYear() + 1}`
    },
    firstRegistration: {
      required: true,
      min: 1900,
      max: new Date().getFullYear() + 1,
      message: `První registrace musí být ${1900}-${new Date().getFullYear() + 1}`
    },
    engineVolume: {
      required: true,
      min: 50,
      max: 20000,
      message: 'Objem motoru musí být 50-20000 ccm'
    },
    power: {
      required: true,
      min: 1,
      max: 2000,
      message: 'Výkon musí být 1-2000 kW'
    },
    avgConsumption: {
      required: true,
      min: 0.1,
      max: 50,
      message: 'Spotřeba musí být 0.1-50 l/100km'
    },
    doorCount: {
      required: true,
      min: 2,
      max: 6,
      message: 'Počet dveří musí být 2-6'
    },
    seatCount: {
      required: true,
      min: 1,
      max: 12,
      message: 'Počet míst musí být 1-12'
    },
    airbagCount: {
      required: true,
      min: 0,
      max: 20,
      message: 'Počet airbagů musí být 0-20'
    },
    gearCount: {
      required: true,
      min: 1,
      max: 12,
      message: 'Počet rychlostí musí být 1-12'
    },
    contactPhone: {
      required: true,
      pattern: /^(\+420\s?)?[0-9\s]{9,}$/,
      message: 'Zadejte platné telefonní číslo'
    },
    contactEmail: {
      required: true,
      pattern: /^[^@]+@[^@]+\.[^@]+$/,
      message: 'Zadejte platnou e-mailovou adresu'
    }
  };

  // ✅ Client-side validation function with proper typing - handle File objects
  const validateField = (name: string, value: FormFieldValue): string | null => {
    const rule = validationRules[name];
    if (!rule) return null;

    // ✅ Skip validation for File objects (these are handled separately)
    if (value instanceof File) {
      return null;
    }

    // Required check
    if (rule.required && (!value || value.toString().trim() === '')) {
      return rule.message || `${name} je povinné`;
    }

    if (!value || value.toString().trim() === '') return null;

    const stringValue = value.toString().trim();
    const numberValue = Number(value);

    // String length validation
    if (rule.minLength && stringValue.length < rule.minLength) {
      return rule.message || `Minimálně ${rule.minLength} znaků`;
    }
    if (rule.maxLength && stringValue.length > rule.maxLength) {
      return rule.message || `Maximálně ${rule.maxLength} znaků`;
    }

    // Number range validation
    if (rule.min !== undefined && numberValue < rule.min) {
      return rule.message || `Minimální hodnota je ${rule.min}`;
    }
    if (rule.max !== undefined && numberValue > rule.max) {
      return rule.message || `Maximální hodnota je ${rule.max}`;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(stringValue)) {
      return rule.message || 'Neplatný formát';
    }

    return null;
  };

  // ✅ Validate all fields with proper typing - handle FormDataEntryValue
  const validateForm = (formData: FormData): FieldErrors => {
    const errors: FieldErrors = {};

    // Validate basic fields
    Object.keys(validationRules).forEach(fieldName => {
      const value = formData.get(fieldName); // This is FormDataEntryValue | null
      const error = validateField(fieldName, value); // ✅ Now properly typed
      if (error) {
        errors[fieldName] = error;
      }
    });

    // Special validations
    if (!selectedBrand) {
      errors.brand = 'Vyberte značku vozidla';
    }
    if (!selectedModel) {
      errors.model = 'Vyberte model vozidla';
    }
    if (!selectedColor) {
      errors.color = 'Vyberte barvu vozidla';
    }
    if (!location) {
      errors.location = 'Vyberte lokalitu vozidla na mapě';
    }

    // Cross-field validation
    const year = Number(formData.get('year'));
    const firstRegistration = Number(formData.get('firstRegistration'));
    if (year && firstRegistration && firstRegistration < year) {
      errors.firstRegistration = 'První registrace nemůže být před rokem výroby';
    }

    // Image validation
    if (images.length < 2) {
      errors.images = 'Přidejte alespoň 2 obrázky';
    }

    return errors;
  };

  // ✅ Clear field error when user starts typing with proper typing
  const handleFieldChange = (fieldName: string) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
    if (error) setError(null);
  };

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
    setSelectedModel('')
    handleFieldChange('brand')
  }

  const handleModelChange = (modelValue: string) => {
    setSelectedModel(modelValue)
    handleFieldChange('model')
  }

  const handleImageRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    
    if (newImages.length < 2) {
      setImageError('Přidejte alespoň dva obrázky.')
      setFieldErrors(prev => ({ ...prev, images: 'Přidejte alespoň 2 obrázky' }))
    } else {
      setImageError(null)
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.images;
        return newErrors;
      })
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
    handleFieldChange('location')
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

    if (images.length + validFiles.length > 15) {
      errors.push(`Můžete nahrát maximálně 15 obrázků. Aktuálně máte ${images.length}, snažíte se přidat ${validFiles.length}.`)
    } else {
      setImages(prev => [...prev, ...validFiles])
      if (validFiles.length > 0) {
        showSuccess('Obrázky přidány', `Přidáno ${validFiles.length} ${validFiles.length === 1 ? 'obrázek' : 'obrázků'}`)
        // Clear image error if we now have enough images
        if (images.length + validFiles.length >= 2) {
          setImageError(null)
          setFieldErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.images;
            return newErrors;
          })
        }
      }
    }

    if (errors.length > 0) {
      setImageError(errors.join('\n'))
      showWarning('Problém s obrázky', errors[0])
    } else if (validFiles.length > 0) {
      setImageError(null)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    if (adCount !== null && adCount >= 10) {
      setShowLimitModal(true)
      return
    }

    try {
      setLoading(true)
      setError(null)
      setFieldErrors({})

      const form = e.currentTarget
      const formData = new FormData(form)

      // ✅ Client-side validation first
      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setFieldErrors(validationErrors);
        setError('Zkontrolujte všechna pole formuláře');
        setLoading(false);
        
        // Show first error in toast
        const firstError = Object.values(validationErrors)[0];
        showError('Chyba ve formuláři', firstError);
        
        // Scroll to first error
        const firstErrorField = Object.keys(validationErrors)[0];
        const element = document.querySelector(`[name="${firstErrorField}"], #${firstErrorField}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // Build FormData for submission
      const submitFormData = new FormData()
      
      // Brand and model from state
      submitFormData.append('brand', selectedBrand)
      submitFormData.append('model', selectedModel)
      submitFormData.append('color', selectedColor)
      submitFormData.append('colorFinish', selectedColorFinish || 'standard')

      // String fields
      const stringFields = ['title', 'description', 'bodyType', 
                           'fuel', 'transmission', 'drivetrain', 'airConditioning', 'condition', 
                           'countryOfOrigin', 'euroStandard', 'contactPhone', 'contactEmail', 'contactName']
      
      stringFields.forEach(field => {
        const value = formData.get(field)
        if (value && value.toString().trim()) {
          submitFormData.append(field, value.toString().trim())
        }
      })

      // Integer fields
      const integerFields = ['price', 'mileage', 'year', 'firstRegistration', 'doorCount', 
                            'seatCount', 'engineVolume', 'power', 'airbagCount', 'gearCount']
      
      integerFields.forEach(field => {
        const value = formData.get(field)
        if (value && value.toString().trim()) {
          submitFormData.append(field, value.toString())
        }
      })

      // Float field
      const avgConsumptionValue = formData.get('avgConsumption')
      if (avgConsumptionValue && avgConsumptionValue.toString().trim()) {
        submitFormData.append('avgConsumption', avgConsumptionValue.toString())
      }

      // Boolean fields
      const booleanFields = ['ecoTaxPaid', 'isFirstOwner', 'isDisabledAdapted', 'wasCrashed', 'hasServiceBook']
      booleanFields.forEach(field => {
        const checkbox = form.querySelector(`[name="${field}"]`) as HTMLInputElement
        submitFormData.append(field, checkbox?.checked ? 'true' : 'false')
      })

      // Date fields
      const techCheckValue = formData.get('technicalCheckUntil')
      if (techCheckValue && techCheckValue.toString().trim()) {
        submitFormData.append('technicalCheckUntil', new Date(techCheckValue.toString()).toISOString())
      }
      
      const warrantyValue = formData.get('warrantyUntil')
      if (warrantyValue && warrantyValue.toString().trim()) {
        submitFormData.append('warrantyUntil', new Date(warrantyValue.toString()).toISOString())
      }

      // Location
      if (location) {
        submitFormData.append('latitude', location.latitude.toString())
        submitFormData.append('longitude', location.longitude.toString())
        submitFormData.append('address', location.address)
      }

      // Images
      setUploading(true)
      setUploadStep('Nahrávám obrázky...')
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          setUploadStep(`Nahrávám obrázek ${i + 1} z ${images.length}`)
          setUploadProgress(Math.round(((i + 1) / images.length) * 100))
          submitFormData.append('images', images[i])
        }
      }

      setUploadStep('Ukládám inzerát...')
      setUploadProgress(null)

      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/ad`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: submitFormData,
        credentials: 'include'
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        console.error('❌ Backend error response:', errData);
        
        // ✅ Enhanced server error handling - use const instead of let
        let errorMessage = 'Chyba při ukládání inzerátu';
        const serverFieldErrors: FieldErrors = {}; // ✅ Use const and proper typing
        
        if (errData.message) {
          if (Array.isArray(errData.message)) {
            // Handle validation error array from class-validator
            errData.message.forEach((msg: string) => {
              // Try to extract field name from message
              if (msg.includes('title')) serverFieldErrors.title = msg;
              else if (msg.includes('price')) serverFieldErrors.price = msg;
              else if (msg.includes('email')) serverFieldErrors.contactEmail = msg;
              else if (msg.includes('phone')) serverFieldErrors.contactPhone = msg;
              else errorMessage = msg;
            });
          } else {
            errorMessage = errData.message;
          }
        } else if (errData.error) {
          errorMessage = errData.error;
        } else if (res.status === 413) {
          errorMessage = 'Soubory jsou příliš velké. Zkuste nahrát menší obrázky.';
        } else if (res.status === 400) {
          errorMessage = 'Neplatná data ve formuláři. Zkontrolujte všechna pole.';
        } else if (res.status === 401) {
          errorMessage = 'Nejste přihlášeni. Přihlaste se prosím.';
          setShowLoginModal(true);
        } else if (res.status === 429) {
          errorMessage = 'Příliš mnoho požadavků. Zkuste to prosím později.';
        }
        
        if (Object.keys(serverFieldErrors).length > 0) {
          setFieldErrors(serverFieldErrors);
        }
        
        throw new Error(errorMessage);
      }

      const result = await res.json()
      setCreatedAdId(result.id)
      setSuccess(true)
      form.reset()
      setImages([])
      setSelectedBrand('')
      setSelectedModel('')
      setSelectedColor('')
      setLocation(null)
      setFieldErrors({})

      showSuccess('Inzerát vytvořen', 'Váš inzerát byl úspěšně publikován')

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
                <input 
                  name="title" 
                  id="title" 
                  required 
                  placeholder="Např. Škoda Octavia 2.0 TDI Combi"
                  className={fieldErrors.title ? 'error' : ''}
                  onChange={() => handleFieldChange('title')}
                />
                {fieldErrors.title && <div className="field-error">{fieldErrors.title}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="brand">Značka <span className="required">*</span></label>
                <BrandSelect
                  value={selectedBrand}
                  onChange={handleBrandChange}
                  required
                  className={fieldErrors.brand ? 'error' : ''}
                />
                {fieldErrors.brand && <div className="field-error">{fieldErrors.brand}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="model">Model <span className="required">*</span></label>
                <ModelSelect
                  value={selectedModel}
                  onChange={handleModelChange}
                  models={modelsList}
                  disabled={!selectedBrand}
                  required
                  className={fieldErrors.model ? 'error' : ''}
                />
                {fieldErrors.model && <div className="field-error">{fieldErrors.model}</div>}
              </div>
              
              <div className="form-group form-group--full-width">
                <label htmlFor="description">Popis vozidla <span className="required">*</span></label>
                <textarea 
                  name="description" 
                  id="description" 
                  placeholder="Popište stav vozidla, výbavu, historii..." 
                  className={fieldErrors.description ? 'error' : ''}
                  onChange={() => handleFieldChange('description')}
                />
                {fieldErrors.description && <div className="field-error">{fieldErrors.description}</div>}
              </div>
            </div>
          </div>

          {/* Cena a základní údaje */}
          <div className="form-section">
            <h3 className="form-section__title">Cena a základní údaje</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="price">Cena (Kč) <span className="required">*</span></label>
                <input 
                  name="price" 
                  id="price" 
                  type="number" 
                  required 
                  placeholder="450000"
                  className={fieldErrors.price ? 'error' : ''}
                  onChange={() => handleFieldChange('price')}
                />
                {fieldErrors.price && <div className="field-error">{fieldErrors.price}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="mileage">Nájezd (km) <span className="required">*</span></label>
                <input 
                  name="mileage" 
                  id="mileage" 
                  type="number" 
                  required 
                  placeholder="150000"
                  className={fieldErrors.mileage ? 'error' : ''}
                  onChange={() => handleFieldChange('mileage')}
                />
                {fieldErrors.mileage && <div className="field-error">{fieldErrors.mileage}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="year">Rok výroby <span className="required">*</span></label>
                <input 
                  name="year" 
                  id="year" 
                  type="number" 
                  required 
                  placeholder="2018"
                  className={fieldErrors.year ? 'error' : ''}
                  onChange={() => handleFieldChange('year')}
                />
                {fieldErrors.year && <div className="field-error">{fieldErrors.year}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="firstRegistration">První registrace (rok) <span className="required">*</span></label>
                <input 
                  name="firstRegistration" 
                  id="firstRegistration" 
                  type="number" 
                  required 
                  placeholder="2018"
                  className={fieldErrors.firstRegistration ? 'error' : ''}
                  onChange={() => handleFieldChange('firstRegistration')}
                />
                {fieldErrors.firstRegistration && <div className="field-error">{fieldErrors.firstRegistration}</div>}
              </div>
            </div>
          </div>

          {/* Vzhled a rozměry */}
          <div className="form-section">
            <h3 className="form-section__title">Vzhled a rozměry</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="bodyType">Karoserie <span className="required">*</span></label>
                <select 
                  name="bodyType" 
                  id="bodyType" 
                  required
                  className={fieldErrors.bodyType ? 'error' : ''}
                  onChange={() => handleFieldChange('bodyType')}
                >
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
                {fieldErrors.bodyType && <div className="field-error">{fieldErrors.bodyType}</div>}
              </div>

              <div className="form-group">
                <label>Barva <span className="required">*</span></label>
                <ColorSelect
                  value={selectedColor}
                  onChange={(value) => {
                    setSelectedColor(value)
                    handleFieldChange('color')
                  }}
                  required
                  className={fieldErrors.color ? 'error' : ''}
                />
                {fieldErrors.color && <div className="field-error">{fieldErrors.color}</div>}
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
                <input 
                  name="doorCount" 
                  id="doorCount" 
                  type="number" 
                  required 
                  placeholder="5"
                  className={fieldErrors.doorCount ? 'error' : ''}
                  onChange={() => handleFieldChange('doorCount')}
                />
                {fieldErrors.doorCount && <div className="field-error">{fieldErrors.doorCount}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="seatCount">Počet míst <span className="required">*</span></label>
                <input 
                  name="seatCount" 
                  id="seatCount" 
                  type="number" 
                  required 
                  placeholder="5"
                  className={fieldErrors.seatCount ? 'error' : ''}
                  onChange={() => handleFieldChange('seatCount')}
                />
                {fieldErrors.seatCount && <div className="field-error">{fieldErrors.seatCount}</div>}
              </div>

              {/* Vzhled a rozměry - AIRBAGY NEPOVINNÉ */}
              <div className="form-group">
                <label htmlFor="airbagCount">Počet airbagů <span className="required">*</span></label>
                <input 
                  name="airbagCount" 
                  id="airbagCount" 
                  type="number" 
                  required 
                  placeholder="6"
                  min="0"
                  max="20"
                  defaultValue="0" // ✅ Ensure default value
                  className={fieldErrors.airbagCount ? 'error' : ''}
                  onChange={() => handleFieldChange('airbagCount')}
                />
                {fieldErrors.airbagCount && <div className="field-error">{fieldErrors.airbagCount}</div>}
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
                <input 
                  name="engineVolume" 
                  id="engineVolume" 
                  type="number" 
                  required 
                  placeholder="1968"
                  className={fieldErrors.engineVolume ? 'error' : ''}
                  onChange={() => handleFieldChange('engineVolume')}
                />
                {fieldErrors.engineVolume && <div className="field-error">{fieldErrors.engineVolume}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="power">Výkon (kW) <span className="required">*</span></label>
                <input 
                  name="power" 
                  id="power" 
                  type="number" 
                  required 
                  placeholder="110"
                  className={fieldErrors.power ? 'error' : ''}
                  onChange={() => handleFieldChange('power')}
                />
                {fieldErrors.power && <div className="field-error">{fieldErrors.power}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="avgConsumption">Průměrná spotřeba (l/100km) <span className="required">*</span></label>
                <input 
                  name="avgConsumption" 
                  id="avgConsumption" 
                  type="number" 
                  step="0.1" 
                  required 
                  placeholder="5.2"
                  className={fieldErrors.avgConsumption ? 'error' : ''}
                  onChange={() => handleFieldChange('avgConsumption')}
                />
                {fieldErrors.avgConsumption && <div className="field-error">{fieldErrors.avgConsumption}</div>}
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
                <input 
                  name="gearCount" 
                  id="gearCount" 
                  type="number" 
                  required 
                  placeholder="6"
                  className={fieldErrors.gearCount ? 'error' : ''}
                  onChange={() => handleFieldChange('gearCount')}
                />
                {fieldErrors.gearCount && <div className="field-error">{fieldErrors.gearCount}</div>}
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
                  className={fieldErrors.contactPhone ? 'error' : ''}
                  onChange={() => handleFieldChange('contactPhone')}
                />
                {fieldErrors.contactPhone && <div className="field-error">{fieldErrors.contactPhone}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="contactEmail">Email <span className="required">*</span></label>
                <input 
                  name="contactEmail" 
                  id="contactEmail" 
                  type="email" 
                  required 
                  placeholder="vase@email.cz"
                  className={fieldErrors.contactEmail ? 'error' : ''}
                  onChange={() => handleFieldChange('contactEmail')}
                />
                {fieldErrors.contactEmail && <div className="field-error">{fieldErrors.contactEmail}</div>}
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
            <div className={fieldErrors.location ? 'map-error' : ''}>
              <MapSelector 
                onLocationSelect={handleLocationSelect}
                height="300px"
              />
            </div>
            {fieldErrors.location && <div className="field-error">{fieldErrors.location}</div>}
          </section>

          <button type="submit" disabled={loading || (adCount !== null && adCount >= 10) || Object.keys(fieldErrors).length > 0}>
            {loading ? <ButtonLoading /> : 'Přidat inzerát'}
          </button>
          
          {/* Enhanced error display */}
          {error && (
            <div className="form-error">
              <div className="form-error__icon">⚠️</div>
              <div className="form-error__content">
                <strong>Chyba:</strong> {error}
                {Object.keys(fieldErrors).length > 0 && (
                  <div className="form-error__count">
                    Počet chyb: {Object.keys(fieldErrors).length}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Success message remains the same */}
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