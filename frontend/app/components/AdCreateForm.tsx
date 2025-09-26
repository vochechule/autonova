'use client'
import { useState, useEffect, useCallback } from 'react'
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
import Image from 'next/image'

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ✅ Add props for edit mode support
interface AdCreateFormProps {
  mode?: 'create' | 'edit'
  adId?: string
  initialData?: AdData
}

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

type FormFieldValue = string | number | boolean | null | undefined | File;

// ✅ Add interface for ad data
interface AdImage {
  id: string
  url: string
}

interface AdData {
  id?: string
  title?: string
  brand?: string
  model?: string
  description?: string
  price?: number
  mileage?: number
  year?: number
  firstRegistration?: number
  bodyType?: string
  doorCount?: number
  seatCount?: number
  airbagCount?: number
  fuel?: string
  engineVolume?: number
  power?: number
  avgConsumption?: number
  transmission?: string
  gearCount?: number
  airConditioning?: string
  drivetrain?: string
  condition?: string
  technicalCheckUntil?: string
  countryOfOrigin?: string
  euroStandard?: string
  warrantyUntil?: string
  ecoTaxPaid?: boolean
  isFirstOwner?: boolean
  isDisabledAdapted?: boolean
  wasCrashed?: boolean
  hasServiceBook?: boolean
  contactName?: string
  contactPhone?: string
  contactEmail?: string
  color?: string
  colorFinish?: string
  images?: AdImage[]
  latitude?: number
  longitude?: number
  address?: string
  // ✅ New fields
  safetyFeatures?: string
  assistSystems?: string
  securityFeatures?: string
  interiorComfort?: string
}

// ✅ Add default props
export default function AdCreateForm({ 
  mode = 'create', 
  adId, 
  initialData 
}: AdCreateFormProps = {}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [success, setSuccess] = useState(false)
  const [createdAdId, setCreatedAdId] = useState<string | null>(null)
  const [images, setImages] = useState<File[]>([])
  // ✅ Add state for existing images (edit mode)
  const [existingImages, setExistingImages] = useState<AdImage[]>([])
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

  // ✅ Add state for ad data and loading
  const [adData, setAdData] = useState<AdData | null>(null)
  const [initialLoading, setInitialLoading] = useState(false)

  // ✅ Add new state for drag & drop (add after existing state)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // ✅ Add state for drag & drop for existing images
  const [draggedExistingIndex, setDraggedExistingIndex] = useState<number | null>(null)
  const [dragOverExistingIndex, setDragOverExistingIndex] = useState<number | null>(null)

  const modelsList = getModelsList(selectedBrand)

  // Validation rules remain the same
  const validationRules: ValidationRules = {
    title: {
      required: true,
      minLength: 5,
      maxLength: 100,
      message: 'Název musí mít 5-100 znaků'
    },
    description: {
      required: true,
      minLength: 10,
      maxLength: 5000,
      message: 'Popis musí mít 10-5000 znaků'
    },
    price: {
      required: true,
      min: 1,
      max: 1000000000,
      message: 'Cena musí být 1 - 1 000 000 000 Kč'
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
      max: 100,
      message: 'Spotřeba musí být 0.1-100 l/100km'
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
    }
  };

  // ✅ Add function to fetch ad data for edit mode
  const fetchAdData = useCallback(async () => {
    if (mode === 'create') return

    try {
      setInitialLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/ad/${adId}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include'
      })

      if (!res.ok) {
        throw new Error('Nepodařilo se načíst data inzerátu')
      }

      const data: AdData = await res.json()
      setAdData(data)
      populateFormData(data)
    } catch (err) {
      console.error('Error fetching ad data:', err)
      setError(err instanceof Error ? err.message : 'Chyba při načítání dat')
      showError('Chyba při načítání', 'Nepodařilo se načíst data inzerátu')
    } finally {
      setInitialLoading(false)
    }
  }, [mode, adId, showError])

  // ✅ Add function to populate form with existing data
  const populateFormData = (data: AdData) => {
    setSelectedBrand(data.brand || '')
    setSelectedModel(data.model || '')
    setSelectedColor(data.color || '')
    setSelectedColorFinish(data.colorFinish || 'standard')
    setExistingImages(data.images || [])

    if (data.latitude && data.longitude && data.address) {
      setLocation({
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address
      })
    }
  }

  // Validation functions remain the same
  const validateField = (name: string, value: FormFieldValue): string | null => {
    const rule = validationRules[name];
    if (!rule) return null;

    if (value instanceof File) {
      return null;
    }

    if (rule.required && (!value || value.toString().trim() === '')) {
      return rule.message || `${name} je povinné`;
    }

    if (!value || value.toString().trim() === '') return null;

    const stringValue = value.toString().trim();
    const numberValue = Number(value);

    if (rule.minLength && stringValue.length < rule.minLength) {
      return rule.message || `Minimálně ${rule.minLength} znaků`;
    }
    if (rule.maxLength && stringValue.length > rule.maxLength) {
      return rule.message || `Maximálně ${rule.maxLength} znaků`;
    }

    if (rule.min !== undefined && numberValue < rule.min) {
      return rule.message || `Minimální hodnota je ${rule.min}`;
    }
    if (rule.max !== undefined && numberValue > rule.max) {
      return rule.message || `Maximální hodnota je ${rule.max}`;
    }

    if (rule.pattern && !rule.pattern.test(stringValue)) {
      return rule.message || 'Neplatný formát';
    }

    return null;
  };

  // ✅ Update validateForm to handle both modes
  const validateForm = (formData: FormData): FieldErrors => {
    const errors: FieldErrors = {};

    Object.keys(validationRules).forEach(fieldName => {
      const value = formData.get(fieldName);
      const error = validateField(fieldName, value);
      if (error) {
        errors[fieldName] = error;
      }
    });

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

    const year = Number(formData.get('year'));
    const firstRegistration = Number(formData.get('firstRegistration'));
    if (year && firstRegistration && firstRegistration < year) {
      errors.firstRegistration = 'První registrace nemůže být před rokem výroby';
    }

    // ✅ Update image validation for both modes
    const totalImages = existingImages.length + images.length;
    if (totalImages < 2) {
      errors.images = 'Přidejte alespoň 2 obrázky';
    }

    return errors;
  };

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

  // ✅ Update useEffect to handle both modes
  useEffect(() => {
    if (mode === 'create') {
      // Original create mode logic
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
    } else if (mode === 'edit') {
      // Load ad data for edit mode
      if (initialData) {
        setAdData(initialData)
        populateFormData(initialData)
      } else if (adId) {
        fetchAdData()
      }
    }
  }, [mode, adId, initialData, fetchAdData])

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
    
    const totalImages = existingImages.length + newImages.length
    if (totalImages < 2) {
      setImageError('Musíte mít alespoň dva obrázky.')
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

  // ✅ Add function to handle existing image removal
  const handleExistingImageRemove = (imageId: string) => {
    setExistingImages(prev => prev.filter(img => img.id !== imageId))
    showWarning('Obrázek bude smazán', 'Existující obrázek bude smazán při uložení')
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

  // ✅ Add reorder functions (add after existing functions)
  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    setImages(newImages)
    showSuccess('Pořadí změněno', `Obrázek přesunut na pozici ${toIndex + 1}`)
  }

  const moveImageUp = (index: number) => {
    if (index > 0) {
      moveImage(index, index - 1)
    }
  }

  const moveImageDown = (index: number) => {
    if (index < images.length - 1) {
      moveImage(index, index + 1)
    }
  }


  // ✅ Add reorder functions for existing images
  const moveExistingImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...existingImages]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    setExistingImages(newImages)
    showSuccess('Pořadí změněno', `Obrázek přesunut na pozici ${toIndex + 1}`)
  }

  const moveExistingImageUp = (index: number) => {
    if (index > 0) {
      moveExistingImage(index, index - 1)
    }
  }

  const moveExistingImageDown = (index: number) => {
    if (index < existingImages.length - 1) {
      moveExistingImage(index, index + 1)
    }
  }

  // ✅ Add drag handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', '')
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveImage(draggedIndex, dropIndex)
    }
    
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // ✅ Drag handlers for existing images
  const handleExistingDragStart = (e: React.DragEvent, index: number) => {
    setDraggedExistingIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', '')
  }

  const handleExistingDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverExistingIndex(index)
  }

  const handleExistingDragLeave = () => {
    setDragOverExistingIndex(null)
  }

  const handleExistingDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedExistingIndex !== null && draggedExistingIndex !== dropIndex) {
      moveExistingImage(draggedExistingIndex, dropIndex)
    }
    
    setDraggedExistingIndex(null)
    setDragOverExistingIndex(null)
  }

  const handleExistingDragEnd = () => {
    setDraggedExistingIndex(null)
    setDragOverExistingIndex(null)
  }

  // ✅ Update validateAndAddFiles for both modes
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

    const currentTotal = existingImages.length + images.length
    if (currentTotal + validFiles.length > 15) {
      errors.push(`Můžete mít maximálně 15 obrázků. Aktuálně máte ${currentTotal}, snažíte se přidat ${validFiles.length}.`)
    } else {
      setImages(prev => [...prev, ...validFiles])
      if (validFiles.length > 0) {
        showSuccess('Obrázky přidány', `Přidáno ${validFiles.length} ${validFiles.length === 1 ? 'obrázek' : 'obrázků'}`)
        
        if (currentTotal + validFiles.length >= 2) {
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

  // ✅ Update handleSubmit for both modes
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    if (mode === 'create' && adCount !== null && adCount >= 10) {
      setShowLimitModal(true)
      return
    }

    try {
      setLoading(true)
      setError(null)
      setFieldErrors({})

      const form = e.currentTarget
      const formData = new FormData(form)

      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setFieldErrors(validationErrors);
        setError('Zkontrolujte všechna pole formuláře');
        setLoading(false);
        
        const firstError = Object.values(validationErrors)[0];
        showError('Chyba ve formuláři', firstError);
        
        const firstErrorField = Object.keys(validationErrors)[0];
        const element = document.querySelector(`[name="${firstErrorField}"], #${firstErrorField}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // Build FormData for submission
      const submitFormData = new FormData()
      
      submitFormData.append('brand', selectedBrand)
      submitFormData.append('model', selectedModel)
      submitFormData.append('color', selectedColor)
      submitFormData.append('colorFinish', selectedColorFinish || 'standard')

      // ✅ Updated string fields to include new ones
      const stringFields = ['title', 'description', 'bodyType', 
                           'fuel', 'transmission', 'drivetrain', 'airConditioning', 'condition', 
                           'countryOfOrigin', 'euroStandard', 'contactPhone', 'contactEmail', 'contactName',
                           'safetyFeatures', 'assistSystems', 'securityFeatures', 'interiorComfort']
      
      stringFields.forEach(field => {
        const value = formData.get(field)
        if (value && value.toString().trim()) {
          submitFormData.append(field, value.toString().trim())
        }
      })

      // Integer fields (removed airbagCount from required)
      const integerFields = ['price', 'mileage', 'year', 'firstRegistration', 'doorCount', 
                            'seatCount', 'engineVolume', 'power', 'gearCount']
      
      integerFields.forEach(field => {
        const value = formData.get(field)
        if (value && value.toString().trim()) {
          submitFormData.append(field, value.toString())
        }
      })

      // ✅ Optional airbagCount
      const airbagCountValue = formData.get('airbagCount')
      if (airbagCountValue && airbagCountValue.toString().trim()) {
        submitFormData.append('airbagCount', airbagCountValue.toString())
      }

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

      // ✅ Handle existing images order for edit mode
      if (mode === 'edit' && existingImages.length > 0) {
        const existingImageIds = existingImages.map(img => img.id)
        submitFormData.append('existingImagesOrder', JSON.stringify(existingImageIds))
      }

      // Location
      if (location) {
        submitFormData.append('latitude', location.latitude.toString())
        submitFormData.append('longitude', location.longitude.toString())
        submitFormData.append('address', location.address)
      }

      // ✅ Handle image deletion for edit mode
      if (mode === 'edit' && adData) {
        const imagesToDelete = adData.images?.filter((img) =>
          !existingImages.find(existing => existing.id === img.id)
        )

        if (imagesToDelete && imagesToDelete.length > 0) {
          const idsToDelete = imagesToDelete.map((img) => img.id)
          submitFormData.append('imagesToDelete', JSON.stringify(idsToDelete))
        }
      }

      // Images
      if (images.length > 0) {
        setUploading(true)
        setUploadStep('Nahrávám obrázky...')
        for (let i = 0; i < images.length; i++) {
          setUploadStep(`Nahrávám obrázek ${i + 1} z ${images.length}`)
          setUploadProgress(Math.round(((i + 1) / images.length) * 100))
          submitFormData.append('images', images[i])
        }
      }

      setUploadStep(mode === 'create' ? 'Ukládám inzerát...' : 'Ukládám změny...')
      setUploadProgress(null)

      // ✅ Dynamic endpoint and method based on mode
      const token = localStorage.getItem('token')
      const url = mode === 'create' ? `${API_URL}/ad` : `${API_URL}/ad/${adId}`
      const method = mode === 'create' ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: submitFormData,
        credentials: 'include'
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        console.error('❌ Backend error response:', errData);
        
        let errorMessage = mode === 'create' ? 'Chyba při ukládání inzerátu' : 'Chyba při aktualizaci inzerátu';
        const serverFieldErrors: FieldErrors = {};
        
        if (errData.message) {
          if (Array.isArray(errData.message)) {
            errData.message.forEach((msg: string) => {
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
        }
        
        if (Object.keys(serverFieldErrors).length > 0) {
          setFieldErrors(serverFieldErrors);
        }
        
        throw new Error(errorMessage);
      }

      const result = await res.json()
      setSuccess(true)
      
      if (mode === 'create') {
        setCreatedAdId(result.id)
        form.reset()
        setImages([])
        setSelectedBrand('')
        setSelectedModel('')
        setSelectedColor('')
        setLocation(null)
        showSuccess('Inzerát vytvořen', 'Váš inzerát byl úspěšně publikován')
      } else {
        showSuccess('Inzerát aktualizován', 'Všechny změny byly úspěšně uloženy')
      }

      setFieldErrors({})

      setTimeout(() => {
        const targetId = mode === 'create' ? result.id : adId
        if (targetId) {
          router.push(`/ads/${targetId}`)
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

  // ✅ Loading state for edit mode
  if (mode === 'edit' && initialLoading && !adData) {
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

  if (mode === 'edit' && !adData) {
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

  // ✅ Calculate total images for both modes
  const totalImages = existingImages.length + images.length

  return (
    <div className="ad-create-form">
      <div className="form-container" style={{ position: 'relative' }}>
        {/* ✅ Dynamic titles */}
        <h2>{mode === 'create' ? 'Přidat inzerát' : 'Upravit inzerát'}</h2>
        <p className="form-subtitle">
          {mode === 'create' 
            ? 'Vytvořte nový inzerát a prodejte své vozidlo rychle a snadno'
            : 'Upravte údaje vašeho inzerátu'
          }
        </p>

        <form onSubmit={handleSubmit} id={mode === 'create' ? 'ad-create-form' : 'ad-edit-form'}>
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
                  defaultValue={mode === 'edit' ? adData?.title : ''}
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
                  defaultValue={mode === 'edit' ? adData?.description : ''}
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
                  defaultValue={mode === 'edit' ? adData?.price : ''}
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
                  defaultValue={mode === 'edit' ? adData?.mileage : ''}
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
                  defaultValue={mode === 'edit' ? adData?.year : ''}
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
                  defaultValue={mode === 'edit' ? adData?.firstRegistration : ''}
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
                  defaultValue={mode === 'edit' ? adData?.bodyType : ''}
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
                  defaultValue={mode === 'edit' ? adData?.doorCount : ''}
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
                  defaultValue={mode === 'edit' ? adData?.seatCount : ''}
                />
                {fieldErrors.seatCount && <div className="field-error">{fieldErrors.seatCount}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="airbagCount">Počet airbagů</label>
                <input 
                  name="airbagCount" 
                  id="airbagCount" 
                  type="number" 
                  placeholder="6"
                  min="0"
                  max="20"
                  className={fieldErrors.airbagCount ? 'error' : ''}
                  onChange={() => handleFieldChange('airbagCount')}
                  defaultValue={mode === 'edit' ? adData?.airbagCount || '' : ''}
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
                <select 
                  name="fuel" 
                  id="fuel" 
                  required
                  defaultValue={mode === 'edit' ? adData?.fuel : ''}
                >
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
                  defaultValue={mode === 'edit' ? adData?.engineVolume : ''}
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
                  defaultValue={mode === 'edit' ? adData?.power : ''}
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
                  defaultValue={mode === 'edit' ? adData?.avgConsumption : ''}
                />
                {fieldErrors.avgConsumption && <div className="field-error">{fieldErrors.avgConsumption}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="transmission">Převodovka <span className="required">*</span></label>
                <select 
                  name="transmission" 
                  id="transmission" 
                  required
                  defaultValue={mode === 'edit' ? adData?.transmission : ''}
                >
                  <option value="">Vyberte převodovku</option>
                  <option value="manual">Manuální</option>
                  <option value="automatic">Automatická</option>
                  <option value="cvt">CVT</option>
                  <option value="sequential">Sekvenční</option>
                </select>
              </div>

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
                  defaultValue={mode === 'edit' ? adData?.gearCount : ''}
                />
                {fieldErrors.gearCount && <div className="field-error">{fieldErrors.gearCount}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="airConditioning">Klimatizace</label>
                <select 
                  name="airConditioning" 
                  id="airConditioning"
                  defaultValue={mode === 'edit' ? adData?.airConditioning : ''}
                >
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
                <select 
                  name="drivetrain" 
                  id="drivetrain" 
                  required
                  defaultValue={mode === 'edit' ? adData?.drivetrain : ''}
                >
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
            <h3 className="form-section__title">Stav vozidla</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="condition">Stav vozidla <span className="required">*</span></label>
                <select 
                  name="condition" 
                  id="condition" 
                  required
                  defaultValue={mode === 'edit' ? adData?.condition : ''}
                >
                  <option value="">Vyberte stav</option>
                  <option value="new">Nové</option>
                  <option value="used">Použité</option>           
                  <option value="crashed">Havárie</option>
                  <option value="demo">Demo</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="technicalCheckUntil">STK do</label>
                <input 
                  name="technicalCheckUntil" 
                  id="technicalCheckUntil" 
                  type="date"
                  defaultValue={mode === 'edit' && adData?.technicalCheckUntil ? 
                    new Date(adData.technicalCheckUntil).toISOString().split('T')[0] : ''}
                />
              </div>

              <div className="form-group">
                <label htmlFor="countryOfOrigin">Země původu <span className="required">*</span></label>
                <input 
                  name="countryOfOrigin" 
                  id="countryOfOrigin" 
                  required 
                  placeholder="ČR"
                  defaultValue={mode === 'edit' ? adData?.countryOfOrigin : ''}
                />
              </div>

              <div className="form-group">
                <label htmlFor="euroStandard">Emisní norma</label>
                <select 
                  name="euroStandard" 
                  id="euroStandard"
                  defaultValue={mode === 'edit' ? adData?.euroStandard : ''}
                >
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
                <input 
                  name="warrantyUntil" 
                  id="warrantyUntil" 
                  type="date"
                  defaultValue={mode === 'edit' && adData?.warrantyUntil ? 
                    new Date(adData.warrantyUntil).toISOString().split('T')[0] : ''}
                />
              </div>
            </div>

            {/* Checkboxy */}
            <div className="form-grid" style={{ marginTop: '1rem' }}>
              {/* <label className="checkbox-label">
                <input 
                  name="ecoTaxPaid" 
                  type="checkbox" 
                  defaultChecked={mode === 'edit' ? adData?.ecoTaxPaid : false}
                /> Eko daň zaplacena
              </label> */}
              <label className="checkbox-label">
                <input 
                  name="isFirstOwner" 
                  type="checkbox" 
                  defaultChecked={mode === 'edit' ? adData?.isFirstOwner : false}
                /> První majitel
              </label>
              <label className="checkbox-label">
                <input 
                  name="isDisabledAdapted" 
                  type="checkbox" 
                  defaultChecked={mode === 'edit' ? adData?.isDisabledAdapted : false}
                /> Úprava pro ZTP
              </label>
              <label className="checkbox-label">
                <input 
                  name="wasCrashed" 
                  type="checkbox" 
                  defaultChecked={mode === 'edit' ? adData?.wasCrashed : false}
                /> Bylo havarované
              </label>
              <label className="checkbox-label">
                <input 
                  name="hasServiceBook" 
                  type="checkbox" 
                  defaultChecked={mode === 'edit' ? adData?.hasServiceBook : false}
                /> Servisní knížka
              </label>
            </div>
          </div>

          {/* ✅ NOVÁ SEKCE - Další informace */}
          <div className="form-section">
            <h3 className="form-section__title">Další informace o vozidle</h3>
            <div className="form-grid">
              <div className="form-group form-group--full-width">
                <label htmlFor="safetyFeatures">Bezpečnostní systémy</label>
                <textarea 
                  name="safetyFeatures" 
                  id="safetyFeatures" 
                  placeholder="ABS, ESP, ASR, airbagů řidiče a spolujezdce..."
                  rows={3}
                  defaultValue={mode === 'edit' ? adData?.safetyFeatures || '' : ''}
                />
                <small className="form-help">
                  Uveďte bezpečnostní vybavení vozidla (ABS, ESP, airbags, atd.)
                </small>
              </div>

              <div className="form-group form-group--full-width">
                <label htmlFor="assistSystems">Asistenční systémy</label>
                <textarea 
                  name="assistSystems" 
                  id="assistSystems" 
                  placeholder="Adaptivní tempomat, asistent jízdy v pruzích, parkovací asistent..."
                  rows={3}
                  defaultValue={mode === 'edit' ? adData?.assistSystems || '' : ''}
                />
                <small className="form-help">
                  Uveďte asistenční systémy (tempomat, parkovací asistent, atd.)
                </small>
              </div>

              <div className="form-group form-group--full-width">
                <label htmlFor="securityFeatures">Zabezpečení vozidla</label>
                <textarea 
                  name="securityFeatures" 
                  id="securityFeatures" 
                  placeholder="Alarm, imobilizér, centrální zamykání, GPS tracking..."
                  rows={3}
                  defaultValue={mode === 'edit' ? adData?.securityFeatures || '' : ''}
                />
                <small className="form-help">
                  Uveďte zabezpečovací prvky vozidla
                </small>
              </div>

              <div className="form-group form-group--full-width">
                <label htmlFor="interiorComfort">Vnitřní výbava a komfort</label>
                <textarea 
                  name="interiorComfort" 
                  id="interiorComfort" 
                  placeholder="Kožené sedačky, vyhřívání sedadel, elektrické okna, navigace..."
                  rows={3}
                  defaultValue={mode === 'edit' ? adData?.interiorComfort || '' : ''}
                />
                <small className="form-help">
                  Popište komfortní vybavení interiéru
                </small>
              </div>
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
                  defaultValue={mode === 'edit' ? adData?.contactName || '' : ''}
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
                  defaultValue={mode === 'edit' ? adData?.contactPhone || '' : ''}
                />
                <small className="form-help">
                  Telefon se zobrazí pouze registrovaným uživatelům
                </small>
                {fieldErrors.contactPhone && <div className="field-error">{fieldErrors.contactPhone}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="contactEmail">Email</label>
                <input 
                  name="contactEmail" 
                  id="contactEmail" 
                  type="email" 
                  placeholder="vase@email.cz (volitelné)"
                  className={fieldErrors.contactEmail ? 'error' : ''}
                  onChange={() => handleFieldChange('contactEmail')}
                  defaultValue={mode === 'edit' ? adData?.contactEmail || '' : ''}
                />
                <small className="form-help">
                  Email se zobrazí pouze registrovaným uživatelům
                </small>
                {fieldErrors.contactEmail && <div className="field-error">{fieldErrors.contactEmail}</div>}
              </div>
            </div>
            
            <div className="contact-notice">
              <svg className="contact-notice__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
              <p>
                Telefon bude zobrazen zájemcům přímo u vašeho inzerátu. Email je volitelný.
                Můžete použít jiné kontakty než ty z vašeho profilu.
              </p>
            </div>
          </div>

          {/* ✅ UPDATED Image Upload Section - supports both modes and 15 images */}
          <div className="image-upload-section">
            <h3>Obrázky inzerátu <span className="required">*</span></h3>
            <p className="image-requirement">
              {mode === 'create' 
                ? 'Přidejte alespoň 2 kvalitní obrázky vašeho vozidla'
                : 'Musíte mít alespoň 2 obrázky, maximálně 15'
              }
              <br />
              <small style={{ color: '#6c757d' }}>
                Maximální velikost: 10MB na obrázek | Povolené formáty: JPEG, PNG, WebP | Maximum: 15 obrázků
              </small>
            </p>

            {/* ✅ Existing Images with Reordering */}
            {mode === 'edit' && existingImages.length > 0 && (
              <div className="existing-images">
                <h4>
                  Současné obrázky: 
                  <span style={{ fontWeight: 'normal', fontSize: '0.9rem', color: '#64748b' }}>
                    ({existingImages.length} {existingImages.length === 1 ? 'obrázek' : 'obrázků'})
                  </span>
                </h4>
                
                {/* ✅ Reorder help for existing images */}
                <div className="image-reorder-help">
                  <span className="help-icon">💡</span>
                  <strong>První obrázek</strong> se zobrazí jako hlavní v seznamu aut. 
                  Přetáhněte obrázky pro změnu pořadí.
                </div>

                {/* ✅ Quick actions for existing images */}
                {existingImages.length > 1 && (
                  <div className="image-quick-actions">
                    <button
                      type="button"
                      className="quick-action-btn"
                      onClick={() => {
                        const reversed = [...existingImages].reverse()
                        setExistingImages(reversed)
                        showSuccess('Pořadí obráceno', 'Pořadí existujících obrázků bylo obráceno')
                      }}
                    >
                      🔄 Obrátit pořadí
                    </button>
                  </div>
                )}
                
                <div className="image-gallery reorderable">
                  {existingImages.map((image, index) => (
                    <div 
                      key={image.id}
                      className={`image-preview ${index === 0 ? 'main-image' : ''} ${
                        draggedExistingIndex === index ? 'dragging' : ''
                      } ${dragOverExistingIndex === index ? 'drag-over' : ''}`}
                      draggable
                      onDragStart={(e) => handleExistingDragStart(e, index)}
                      onDragOver={(e) => handleExistingDragOver(e, index)}
                      onDragLeave={handleExistingDragLeave}
                      onDrop={(e) => handleExistingDrop(e, index)}
                      onDragEnd={handleExistingDragEnd}
                    >
                      <Image
                        src={image.url}
                        alt={`Současný obrázek ${index + 1}`}
                        width={180}
                        height={80}
                        style={{ objectFit: 'cover', borderRadius: '6px 6px 0 0' }}
                      />
                      
                      {/* ✅ Remove button */}
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => handleExistingImageRemove(image.id)}
                        title="Odstranit obrázek"
                      >
                        ×
                      </button>
                      
                      {/* ✅ Drag handle */}
                      <div className="drag-handle" title="Přetáhněte pro změnu pořadí">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7 5h2v2H7zm0 8h2v2H7zm0-4h2v2H7zm4-4h2v2h-2zm0 8h2v2h-2zm0-4h2v2h-2z"/>
                        </svg>
                      </div>
                      
                      <div className="image-info">
                        <span className="image-name">Existující #{index + 1}</span>
                        <span className="image-size">Uložený obrázek</span>
                        
                        {/* ✅ Order number */}
                        <div className="image-order">{index + 1}</div>
                        
                        {/* ✅ Move buttons */}
                        <div className="move-buttons">
                          <button
                            type="button"
                            className="move-btn"
                            onClick={() => moveExistingImageUp(index)}
                            disabled={index === 0}
                            title="Posunout nahoru"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            className="move-btn"
                            onClick={() => moveExistingImageDown(index)}
                            disabled={index === existingImages.length - 1}
                            title="Posunout dolů"
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
                      {/* ✅ New Images */}
          {images.length > 0 && (
            <div className="new-images">
              <h4>
                {mode === 'edit' ? 'Nové obrázky:' : 'Náhled obrázků:'} 
                <span style={{ fontWeight: 'normal', fontSize: '0.9rem', color: '#64748b' }}>
                  ({images.length} {images.length === 1 ? 'obrázek' : 'obrázků'})
                </span>
              </h4>
              
              {/* ✅ Reorder help */}
              <div className="image-reorder-help">
                <span className="help-icon">💡</span>
                <strong>První obrázek</strong> se zobrazí jako hlavní v seznamu aut. 
                Přetáhněte obrázky pro změnu pořadí nebo použijte tlačítka.
              </div>
              
              {/* ✅ Quick actions */}
              {images.length > 1 && (
                <div className="image-quick-actions">
                  <button
                    type="button"
                    className="quick-action-btn"
                    onClick={() => {
                      const reversed = [...images].reverse()
                      setImages(reversed)
                      showSuccess('Pořadí obráceno', 'Pořadí všech obrázků bylo obráceno')
                    }}
                  >
                    🔄 Obrátit pořadí
                  </button>
                  <button
                    type="button"
                    className="quick-action-btn"
                    onClick={() => {
                      const shuffled = [...images].sort(() => Math.random() - 0.5)
                      setImages(shuffled)
                      showSuccess('Pořadí zamícháno', 'Obrázky byly náhodně zamíchány')
                    }}
                  >
                    🎲 Zamíchat
                  </button>
                </div>
              )}
              
              <div className="image-gallery reorderable">
                {images.map((image, index) => (
                  <div 
                    key={`${image.name}-${index}`}
                    className={`image-preview ${index === 0 ? 'main-image' : ''} ${
                      draggedIndex === index ? 'dragging' : ''
                    } ${dragOverIndex === index ? 'drag-over' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={URL.createObjectURL(image)} 
                      alt={`Náhled ${index + 1}`}
                      onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
                    />
                    
                    {/* ✅ OPRAVENO - Only remove button (top right) */}
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => handleImageRemove(index)}
                      title="Odstranit obrázek"
                    >
                      ×
                    </button>
                    
                    {/* ✅ OPRAVENO - Drag handle (bottom left) */}
                    <div className="drag-handle" title="Přetáhněte pro změnu pořadí">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 5h2v2H7zm0 8h2v2H7zm0-4h2v2H7zm4-4h2v2h-2zm0 8h2v2h-2zm0-4h2v2h-2z"/>
                      </svg>
                    </div>
                    
                    <div className="image-info">
                      <span className="image-name">{image.name}</span>
                      <span className="image-size">{(image.size / 1024 / 1024).toFixed(1)} MB</span>
                      
                      {/* ✅ OPRAVENO - Order number (top right of info) */}
                      <div className="image-order">{index + 1}</div>
                      
                      {/* ✅ OPRAVENO - Move buttons (centered at bottom, no overlap) */}
                      <div className="move-buttons">
                        <button
                          type="button"
                          className="move-btn"
                          onClick={() => moveImageUp(index)}
                          disabled={index === 0}
                          title="Posunout nahoru"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className="move-btn"
                          onClick={() => moveImageDown(index)}
                          disabled={index === images.length - 1}
                          title="Posunout dolů"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

            {/* Image Counter */}
            <div className="image-counter">
              <span className={`counter ${totalImages >= 2 ? 'valid' : 'invalid'} ${totalImages >= 15 ? 'full' : ''}`}>
                {totalImages} / 15 obrázků (min. 2)
                {totalImages >= 15 && <span className="limit-reached"> - limit dosažen</span>}
              </span>
            </div>

            {/* Drop Zone */}
            <div 
              className={`drop-zone ${dragActive ? 'active' : ''} ${totalImages >= 15 ? 'disabled' : ''}`}
              onDragEnter={totalImages < 15 ? handleDrag : undefined}
              onDragLeave={totalImages < 15 ? handleDrag : undefined}
              onDragOver={totalImages < 15 ? handleDrag : undefined}
              onDrop={totalImages < 15 ? (e => { e.preventDefault(); setDragActive(false); }) : undefined}
            >
              <div className="drop-zone-content">
                {totalImages >= 15 ? (
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

       
          <button type="submit" disabled={loading || (mode === 'create' && adCount !== null && adCount >= 10) || Object.keys(fieldErrors).length > 0}>
            {loading ? <ButtonLoading /> : (mode === 'create' ? 'Přidat inzerát' : 'Uložit změny')}
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