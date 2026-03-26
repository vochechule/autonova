// Create: frontend/app/components/AdForm/index.tsx
'use client'
import React, { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import '../../styles/components/AdCreateForm.scss'
import '../../styles/components/SuccessMessage.scss'
import '../../styles/components/ProgressModal.scss'
import { useToast } from '../../contexts/ToastContext'

// Hooks
import { useAdForm } from './hooks/useAdForm'
import { useImageUpload } from './hooks/useImageUpload'
import { useAdLimits } from './hooks/useAdLimits'
import { useProgressModal } from './hooks/useProgressModal'

// Components
import { ProgressModal } from './sections/ProgressModal'
import { BasicInfoSection } from './sections/BasicInfoSection'
import { PriceSection } from './sections/PriceSection'
import { ContactSection } from './sections/ContactSection'
import { LocationSection } from './sections/LocationSection'
import { FormActions } from './sections/FormActions'
import { AppearanceSection } from './sections/AppearanceSection'
import { EngineSection } from './sections/EngineSection'
import { ConditionSection } from './sections/ConditionSection'
import { AdditionalInfoSection } from './sections/AdditionalInfoSection'
import { ImageUploadSection } from './sections/ImageUploadSection'
  import type { AdData } from './types' // Make sure this type exists and matches your ad data shape


// Types and utils
import type { AdCreateFormProps } from './types'
import { validateForm } from './utils/validation'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function AdForm({ 
  mode = 'create', 
  adId, 
  initialData 
}: AdCreateFormProps = {}) {
  const router = useRouter()
  const { showSuccess, showError } = useToast()

  // ✅ Add state for fetched data
  // Replace 'AdData' with the correct type if you have a more specific one
  const [fetchedData, setFetchedData] = React.useState<AdData | null>(null)
  
  // ✅ Determine which data to use
  const currentAdData = mode === 'edit' ? (fetchedData || initialData) : initialData

  // Custom hooks
  const formState = useAdForm({ mode, initialData: currentAdData })
  const imageState = useImageUpload({ mode, initialImages: currentAdData?.images })
  const limitsState = useAdLimits(mode)
  const progressModal = useProgressModal()

  // ✅ Update fetchAdData to use setState
  const fetchAdData = useCallback(async () => {
    if (mode === 'create' || !adId) return

    try {
      console.log('🔍 Fetching ad data for ID:', adId)
      
      formState.setLoading(true)
      formState.setError(null)
      
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/ad/${adId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include'
      })

      if (!res.ok) {
        let errorMessage = 'Chyba při načítání dat'
        if (res.status === 404) {
          errorMessage = 'Inzerát nenalezen'
        } else if (res.status === 403) {
          errorMessage = 'Nemáte oprávnění upravovat tento inzerát'
        }
        throw new Error(errorMessage)
      }

      const data = await res.json()
      console.log('✅ Ad data loaded:', data)
      
      // ✅ Store fetched data in state
      setFetchedData(data)
      
      // Update form states
      formState.setSelectedBrand(data.brand || '')
      formState.setSelectedModel(data.model || '')
      formState.setSelectedColor(data.color || '')
      formState.setSelectedColorFinish(data.colorFinish || 'standard')
      
      if (data.latitude && data.longitude && data.address) {
        formState.setLocation({
          lat: data.latitude,
          lng: data.longitude,
          address: data.address
        })
      }

      if (data.images && Array.isArray(data.images)) {
        imageState.setExistingImages(data.images)
      }

      console.log('✅ Form state updated with data')
      formState.setLoading(false)

    } catch (err) {
      console.error('❌ Error fetching ad data:', err)
      const errorMessage = err instanceof Error ? err.message : 'Chyba při načítání dat'
      formState.setError(errorMessage)
      formState.setLoading(false)
      showError('Chyba při načítání', errorMessage)
    }
  }, [mode, adId, formState, imageState, showError])

  // ✅ Simplified useEffect
  useEffect(() => {
    if (mode === 'create') {
      const token = localStorage.getItem('token')
      if (!token) {
        formState.setShowLoginModal(true)
        return
      }
    } else if (mode === 'edit' && adId && !fetchedData && !initialData) {
      fetchAdData()
    }
  }, [mode, adId, fetchAdData, fetchedData, initialData, formState])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Check limits for create mode
    if (mode === 'create' && !limitsState.checkLimits()) {
      formState.setShowLimitModal(true)
      return
    }

    try {
      formState.setLoading(true)
      formState.setFieldErrors({})
      
      // Open progress modal
      const modalTitle = mode === 'create' ? 'Vytvářím inzerát' : 'Ukládám změny'
      const modalMessage = mode === 'create' 
        ? 'Prosím počkejte, zpracovávám váš inzerát...' 
        : 'Prosím počkejte, ukládám změny...'
      
      progressModal.openModal(modalTitle, modalMessage)
      
      // Initialize progress steps
      const hasImages = imageState.images.length > 0
      const steps = [
        'Validace formuláře',
        ...(hasImages ? ['Nahrávání obrázků'] : []),
        mode === 'create' ? 'Vytvoření inzerátu' : 'Uložení změn'
      ]
      progressModal.initializeSteps(steps)
      
      let currentStep = 1

      const form = e.currentTarget
      const formData = new FormData(form)

      // Step 1: Validation
      progressModal.updateCurrentStep('Kontroluji údaje formuláře...')
      progressModal.updateProgress(10)
      
      await new Promise(resolve => setTimeout(resolve, 300)) // Brief pause for UX

      const validationErrors = validateForm(
        formData,
        formState.selectedBrand,
        formState.selectedModel,
        formState.selectedColor,
        formState.location,
        imageState.existingImages,
        imageState.images
      )

      if (Object.keys(validationErrors).length > 0) {
        progressModal.closeModal()
        formState.setFieldErrors(validationErrors)
        
        const firstError = Object.values(validationErrors)[0]
        showError('Chyba ve formuláři', firstError)
        
        const firstErrorField = Object.keys(validationErrors)[0]
        const element = document.querySelector(`[name="${firstErrorField}"], #${firstErrorField}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
        
        formState.setLoading(false)
        return
      }

      // Complete validation step
      progressModal.completeStep(currentStep)
      currentStep++
      progressModal.updateProgress(25)

      // Build submission data
      const submitFormData = new FormData()
      
      // Add form fields
      submitFormData.append('brand', formState.selectedBrand)
      submitFormData.append('model', formState.selectedModel)
      submitFormData.append('color', formState.selectedColor)
      submitFormData.append('colorFinish', formState.selectedColorFinish || 'standard')

      // Add location
      if (formState.location) {
        submitFormData.append('latitude', formState.location.lat.toString())
        submitFormData.append('longitude', formState.location.lng.toString())
        submitFormData.append('address', formState.location.address || '')
      }

      // Handle images
      if (imageState.images.length > 0) {
        progressModal.updateCurrentStep('Připravuji obrázky k nahrání...')
        progressModal.updateProgress(35)
        
        // Initialize image progress
        progressModal.setImageProgress(0, imageState.images.length)
        
        for (let i = 0; i < imageState.images.length; i++) {
          const image = imageState.images[i]
          const imageName = image.name.length > 20 
            ? image.name.substring(0, 17) + '...' 
            : image.name
          
          progressModal.updateCurrentStep(`Nahrávám obrázek ${i + 1} z ${imageState.images.length}`)
          progressModal.setImageProgress(i, imageState.images.length, imageName)
          
          // Brief pause for better UX
          await new Promise(resolve => setTimeout(resolve, 200))
          
          submitFormData.append('images', image)
          
          // Update progress
          progressModal.setImageProgress(i + 1, imageState.images.length, imageName)
        }
        
        // Complete image upload step
        progressModal.completeStep(currentStep)
        currentStep++
        progressModal.clearImageProgress()
        progressModal.updateProgress(60)
      }

      // Handle existing images for edit mode
      if (mode === 'edit') {
        const existingImageIds = imageState.existingImages.map(img => img.id)
        const initialExistingImageIds = (currentAdData?.images || []).map(img => img.id)
        const imagesToDelete = initialExistingImageIds.filter(
          imageId => !existingImageIds.includes(imageId)
        )

        submitFormData.append('existingImagesOrder', JSON.stringify(existingImageIds))

        if (imagesToDelete.length > 0) {
          submitFormData.append('imagesToDelete', JSON.stringify(imagesToDelete))
        }
      }

      // Add all form fields to submitFormData
      const formFields = [
        'title', 'description', 'price', 'mileage', 'year', 'firstRegistration',
        'bodyType', 'doorCount', 'seatCount', 'airbagCount', 'fuel', 'engineVolume',
        'power', 'avgConsumption', 'transmission', 'gearCount', 'airConditioning',
        'drivetrain', 'condition', 'technicalCheckUntil', 'countryOfOrigin',
        'euroStandard', 'warrantyUntil', 'windowNote', 'contactName', 'contactPhone',
        'contactEmail', 'safetyFeatures', 'assistSystems', 'securityFeatures',
        'interiorComfort'
      ]

      formFields.forEach(field => {
        const value = formData.get(field)
        if (value !== null && value !== '') {
          submitFormData.append(field, value as string)
        }
      })

      // Add boolean fields (checkboxes)
      const booleanFields = [
        'ecoTaxPaid', 'isFirstOwner', 'isDisabledAdapted', 'wasCrashed', 'hasServiceBook'
      ]

      booleanFields.forEach(field => {
        const isChecked = formData.get(field) === 'on'
        submitFormData.append(field, isChecked.toString())
      })

      // Final step - saving to database
      progressModal.updateCurrentStep(mode === 'create' ? 'Ukládám inzerát do databáze...' : 'Ukládám změny do databáze...')
      progressModal.updateProgress(75)

      // Submit to API
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
        console.error('❌ Backend error response:', errData)
        
        let errorMessage = mode === 'create' ? 'Chyba při ukládání inzerátu' : 'Chyba při aktualizaci inzerátu'
        
        if (errData.message) {
          errorMessage = Array.isArray(errData.message) ? errData.message[0] : errData.message
        }
        
        throw new Error(errorMessage)
      }

      const result = await res.json()
      
      // Complete final step
      progressModal.completeStep(currentStep)
      progressModal.updateProgress(100)
      progressModal.updateCurrentStep('Dokončeno! ✅')
      
      formState.setSuccess(true)
      
      if (mode === 'create') {
        formState.setCreatedAdId(result.id)
        progressModal.updateMessage('Váš inzerát byl úspěšně publikován!')
        showSuccess('Inzerát vytvořen', 'Váš inzerát byl úspěšně publikován')
      } else {
        progressModal.updateMessage('Všechny změny byly úspěšně uloženy!')
        showSuccess('Inzerát aktualizován', 'Všechny změny byly úspěšně uloženy')
      }

      // Wait a bit to show completion, then redirect
      setTimeout(() => {
        progressModal.closeModal()
        const targetId = mode === 'create' ? result.id : adId
        if (targetId) {
          router.push(`/ads/${targetId}`)
        } else {
          router.push('/ads')
        }
      }, 2500)

    } catch (err) {
      console.error('🔍 Submit error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Neznámá chyba'
      
      // Close progress modal and show error
      progressModal.closeModal()
      
      if (mode === 'create') {
        formState.setError(errorMessage)
      }
      showError('Chyba při ukládání', errorMessage)
    } finally {
      formState.setLoading(false)
      imageState.setUploading(false)
      imageState.setUploadProgress(null)
      imageState.setUploadStep('')
    }
  }

  // ✅ Better loading state logic
  const isLoadingEditData = mode === 'edit' && formState.loading && !currentAdData && !formState.error
  
  if (isLoadingEditData) {
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
            <p style={{ color: '#718096', marginTop: '8px' }}>ID: {adId}</p>
          </div>
        </div>
      </div>
    )
  }

  // ✅ Show error state only for data loading errors, not form submission errors
  if (mode === 'edit' && formState.error && !formState.loading && !currentAdData) {
    return (
      <div className="ad-create-form">
        <div className="form-container">
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
            <h3 style={{ color: '#dc2626', margin: '0 0 8px 0' }}>Chyba při načítání</h3>
            <p style={{ color: '#718096', marginBottom: '20px' }}>{formState.error}</p>
            <button 
              onClick={() => router.back()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Zpět
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ad-create-form">
      <div className="form-container" style={{ position: 'relative' }}>
        <h2>{mode === 'create' ? 'Přidat inzerát' : 'Upravit inzerát'}</h2>
        <p className="form-subtitle">
          {mode === 'create' 
            ? 'Vytvořte nový inzerát a prodejte své vozidlo rychle a snadno'
            : 'Upravte údaje vašeho inzerátu'
          }
        </p>

        <form onSubmit={handleSubmit} id={mode === 'create' ? 'ad-create-form' : 'ad-edit-form'}>
          {/* ✅ Show validation error summary */}
          {Object.keys(formState.fieldErrors).length > 0 && (
            <div className="form-validation-summary" style={{
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>⚠️</span>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#dc2626', fontSize: '14px' }}>
                    Opravte následující chyby:
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#7f1d1d' }}>
                    {Object.entries(formState.fieldErrors).slice(0, 5).map(([field, error]) => (
                      <li key={field} style={{ marginBottom: '4px', fontSize: '13px' }}>
                        {error}
                      </li>
                    ))}
                    {Object.keys(formState.fieldErrors).length > 5 && (
                      <li style={{ fontStyle: 'italic', color: '#9ca3af' }}>
                        ... a dalších {Object.keys(formState.fieldErrors).length - 5} chyb
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
          {/* Basic Info Section */}
          <BasicInfoSection
            selectedBrand={formState.selectedBrand}
            selectedModel={formState.selectedModel}
            fieldErrors={formState.fieldErrors}
            adData={currentAdData}  // ✅ Change from initialData
            mode={mode}
            onBrandChange={formState.handleBrandChange}
            onModelChange={formState.handleModelChange}
            onFieldChange={formState.handleFieldChange}
          />

          {/* Price Section */}
          <PriceSection
            fieldErrors={formState.fieldErrors}
            adData={currentAdData}  // ✅ Change from initialData
            mode={mode}
            onFieldChange={formState.handleFieldChange}
          />

          {/* Appearance Section */}
          <AppearanceSection
            selectedColor={formState.selectedColor}
            selectedColorFinish={formState.selectedColorFinish}
            fieldErrors={formState.fieldErrors}
            adData={currentAdData}  // ✅ Change from initialData
            mode={mode}
            onColorChange={formState.setSelectedColor}
            onColorFinishChange={formState.setSelectedColorFinish}
            onFieldChange={formState.handleFieldChange}
          />

          {/* Engine Section */}
          <EngineSection
            fieldErrors={formState.fieldErrors}
            adData={currentAdData}  // ✅ Change from initialData
            mode={mode}
            onFieldChange={formState.handleFieldChange}
          />

          {/* Condition Section */}
          <ConditionSection
            fieldErrors={formState.fieldErrors}
            adData={currentAdData}  // ✅ Change from initialData
            mode={mode}
            onFieldChange={formState.handleFieldChange}
          />

          {/* Additional Info Section */}
          <AdditionalInfoSection
            fieldErrors={formState.fieldErrors}
            adData={currentAdData}  // ✅ Change from initialData
            mode={mode}
            onFieldChange={formState.handleFieldChange}
          />

          {/* Contact Section */}
          <ContactSection
            fieldErrors={formState.fieldErrors}
            adData={currentAdData}  // ✅ Change from initialData
            mode={mode}
            onFieldChange={formState.handleFieldChange}
          />

          {/* Image Upload Section */}
          <ImageUploadSection
            images={imageState.images}
            existingImages={imageState.existingImages}
            imageError={imageState.imageError}
            dragActive={imageState.dragActive}
            totalImages={imageState.totalImages}
            fieldErrors={formState.fieldErrors}
            draggedIndex={imageState.draggedIndex}
            dragOverIndex={imageState.dragOverIndex}
            draggedExistingIndex={imageState.draggedExistingIndex}
            dragOverExistingIndex={imageState.dragOverExistingIndex}
            mode={mode}
            onFileSelect={imageState.handleFileSelect}
            onDrag={imageState.handleDrag}
            onImageRemove={imageState.handleImageRemove}
            onExistingImageRemove={imageState.handleExistingImageRemove}
            onValidateAndAddFiles={imageState.validateAndAddFiles}
            onDragStart={imageState.handleDragStart}
            onDragOver={imageState.handleDragOver}
            onDragLeave={imageState.handleDragLeave}
            onDrop={imageState.handleDrop}
            onDragEnd={imageState.handleDragEnd}
            onExistingDragStart={imageState.handleExistingDragStart}
            onExistingDragOver={imageState.handleExistingDragOver}
            onExistingDragLeave={imageState.handleExistingDragLeave}
            onExistingDrop={imageState.handleExistingDrop}
            onExistingDragEnd={imageState.handleExistingDragEnd}
          />

          {/* Location Section */}
          <LocationSection
            fieldErrors={formState.fieldErrors}
            onLocationSelect={formState.handleLocationSelect}
          />

          {/* Progress Modal */}
          <ProgressModal
            isOpen={progressModal.progressState.isOpen}
            title={progressModal.progressState.title}
            message={progressModal.progressState.message}
            progress={progressModal.progressState.progress}
            currentStep={progressModal.progressState.currentStep}
            totalSteps={progressModal.progressState.totalSteps}
            currentStepNumber={progressModal.progressState.currentStepNumber}
            imageProgress={progressModal.progressState.imageProgress}
          />

          {/* Form Actions */}
          <FormActions
            mode={mode}
            loading={formState.loading}
            success={formState.success}
            error={formState.error}
            fieldErrors={formState.fieldErrors}
            createdAdId={formState.createdAdId}
            showLimitModal={formState.showLimitModal}
            showLoginModal={formState.showLoginModal}
            adLimits={limitsState.adLimits}
            onCloseLimitModal={() => formState.setShowLimitModal(false)}
            onCloseLoginModal={() => formState.setShowLoginModal(false)}
          />
        </form>


      </div>
    </div>
  )
}
