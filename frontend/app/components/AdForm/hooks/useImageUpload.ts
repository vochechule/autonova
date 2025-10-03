// Create: frontend/app/components/AdForm/hooks/useImageUpload.ts
import { useState, useCallback } from 'react'
import { useToast } from '../../../contexts/ToastContext'
import type { AdImage } from '../types'

interface UseImageUploadProps {
  mode: 'create' | 'edit'
  initialImages?: AdImage[]
}

export const useImageUpload = ({ initialImages = [] }: UseImageUploadProps) => {
  const { showSuccess, showWarning } = useToast()

  // Image state
  const [images, setImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<AdImage[]>(initialImages)
  const [imageError, setImageError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  // Upload state
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [uploadStep, setUploadStep] = useState<string>('')

  // Drag & drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [draggedExistingIndex, setDraggedExistingIndex] = useState<number | null>(null)
  const [dragOverExistingIndex, setDragOverExistingIndex] = useState<number | null>(null)

  // Calculate total images
  const totalImages = existingImages.length + images.length

  // Validation
  const validateAndAddFiles = useCallback((newFiles: File[]) => {
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
        }
      }
    }

    if (errors.length > 0) {
      setImageError(errors.join('\n'))
      showWarning('Problém s obrázky', errors[0])
    } else if (validFiles.length > 0) {
      setImageError(null)
    }
  }, [existingImages.length, images.length, showSuccess, showWarning])

  // Image removal
  const handleImageRemove = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    
    const totalImages = existingImages.length + newImages.length
    if (totalImages < 2) {
      setImageError('Musíte mít alespoň dva obrázky.')
    } else {
      setImageError(null)
    }
    
    showSuccess('Obrázek odebrán', 'Obrázek byl odebrán ze seznamu')
  }, [images, existingImages.length, showSuccess])

  const handleExistingImageRemove = useCallback((imageId: string) => {
    setExistingImages(prev => prev.filter(img => img.id !== imageId))
    showWarning('Obrázek bude smazán', 'Existující obrázek bude smazán při uložení')
  }, [showWarning])

  // Image reordering
  const moveImage = useCallback((fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    setImages(newImages)
    showSuccess('Pořadí změněno', `Obrázek přesunut na pozici ${toIndex + 1}`)
  }, [images, showSuccess])

  const moveExistingImage = useCallback((fromIndex: number, toIndex: number) => {
    const newImages = [...existingImages]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    setExistingImages(newImages)
    showSuccess('Pořadí změněno', `Obrázek přesunut na pozici ${toIndex + 1}`)
  }, [existingImages, showSuccess])

  // Drag handlers for new images
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', '')
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveImage(draggedIndex, dropIndex)
    }
    
    setDraggedIndex(null)
    setDragOverIndex(null)
  }, [draggedIndex, moveImage])

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }, [])

  // Drag handlers for existing images
  const handleExistingDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedExistingIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', '')
  }, [])

  const handleExistingDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverExistingIndex(index)
  }, [])

  const handleExistingDragLeave = useCallback(() => {
    setDragOverExistingIndex(null)
  }, [])

  const handleExistingDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedExistingIndex !== null && draggedExistingIndex !== dropIndex) {
      moveExistingImage(draggedExistingIndex, dropIndex)
    }
    
    setDraggedExistingIndex(null)
    setDragOverExistingIndex(null)
  }, [draggedExistingIndex, moveExistingImage])

  const handleExistingDragEnd = useCallback(() => {
    setDraggedExistingIndex(null)
    setDragOverExistingIndex(null)
  }, [])

  // General drag handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    validateAndAddFiles(files)
  }, [validateAndAddFiles])

  return {
    // State
    images,
    existingImages,
    imageError,
    dragActive,
    uploading,
    uploadProgress,
    uploadStep,
    totalImages,
    draggedIndex,
    dragOverIndex,
    draggedExistingIndex,
    dragOverExistingIndex,

    // Actions
    setImages,
    setExistingImages,
    setImageError,
    setUploading,
    setUploadProgress,
    setUploadStep,

    // Handlers
    validateAndAddFiles,
    handleImageRemove,
    handleExistingImageRemove,
    moveImage,
    moveExistingImage,
    handleDrag,
    handleFileSelect,

    // Drag handlers
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    handleExistingDragStart,
    handleExistingDragOver,
    handleExistingDragLeave,
    handleExistingDrop,
    handleExistingDragEnd,
  }
}