// Create: frontend/app/components/AdForm/hooks/useAdForm.ts
import { useState, useCallback } from 'react'
import { validateForm } from '../utils/validation'
import type { AdData, FieldErrors } from '../types'

interface UseAdFormProps {
  mode: 'create' | 'edit'
  initialData?: AdData
}

export const useAdForm = ({ initialData }: UseAdFormProps) => {
  // Form state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [success, setSuccess] = useState(false)
  const [createdAdId, setCreatedAdId] = useState<string | null>(null)

  // Selection state
  const [selectedBrand, setSelectedBrand] = useState<string>(initialData?.brand || '')
  const [selectedModel, setSelectedModel] = useState<string>(initialData?.model || '')
  const [selectedColor, setSelectedColor] = useState<string>(initialData?.color || '')
  const [selectedColorFinish, setSelectedColorFinish] = useState<string>(initialData?.colorFinish || 'standard')
  
  // Location state
  const [location, setLocation] = useState<{
    lat: number
    lng: number
    address: string
  } | null>(
    initialData?.latitude && initialData?.longitude && initialData?.address 
      ? {
          lat: initialData.latitude,
          lng: initialData.longitude,
          address: initialData.address
        }
      : null
  )

  // Modal state
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)

  // Ad limits state
  const [adCount, setAdCount] = useState<number | null>(null)
  const [adLimits, setAdLimits] = useState<{
    maxAds: number
    remainingAds: number
    currentAds: number
    isDealer: boolean
    tier?: string
  } | null>(null)

  // Form validation
  const handleFieldChange = useCallback((fieldName: string) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
    if (error) setError(null)
  }, [fieldErrors, error])

  // Brand/Model handlers
  const handleBrandChange = useCallback((brandValue: string) => {
    setSelectedBrand(brandValue)
    setSelectedModel('') // Reset model when brand changes
    handleFieldChange('brand')
  }, [handleFieldChange])

  const handleModelChange = useCallback((modelValue: string) => {
    setSelectedModel(modelValue)
    handleFieldChange('model')
  }, [handleFieldChange])

  // Location handler
  const handleLocationSelect = useCallback((selectedLocation: {
    lat: number
    lng: number
    address: string
  }) => {
    setLocation(selectedLocation)
    handleFieldChange('location')
  }, [handleFieldChange])

  // Form validation
  const validateFormData = useCallback((formData: FormData, totalImages: number) => {
    const errors = validateForm(
      formData,
      selectedBrand,
      selectedModel,
      selectedColor,
      location,
      [], // existingImages handled in parent
      [] // images handled in parent
    )

    // Override image validation with total count
    if (totalImages < 2) {
      errors.images = 'Přidejte alespoň 2 obrázky'
    }

    return errors
  }, [selectedBrand, selectedModel, selectedColor, location])

  // Reset form
  const resetForm = useCallback(() => {
    setLoading(false)
    setError(null)
    setFieldErrors({})
    setSuccess(false)
    setCreatedAdId(null)
    setSelectedBrand('')
    setSelectedModel('')
    setSelectedColor('')
    setSelectedColorFinish('standard')
    setLocation(null)
  }, [])

  return {
    // State
    loading,
    error,
    fieldErrors,
    success,
    createdAdId,
    selectedBrand,
    selectedModel,
    selectedColor,
    selectedColorFinish,
    location,
    showLoginModal,
    showLimitModal,
    adCount,
    adLimits,

    // Actions
    setLoading,
    setError,
    setFieldErrors,
    setSuccess,
    setCreatedAdId,
    setSelectedBrand,
    setSelectedModel,
    setSelectedColor,
    setSelectedColorFinish,
    setLocation,
    setShowLoginModal,
    setShowLimitModal,
    setAdCount,
    setAdLimits,

    // Handlers
    handleFieldChange,
    handleBrandChange,
    handleModelChange,
    handleLocationSelect,
    validateFormData,
    resetForm,
  }
}