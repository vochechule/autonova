// Create: frontend/app/components/AdForm/sections/ImageUploadSection.tsx
import React, { useRef } from 'react'
import type { AdImage, FieldErrors } from '../types'

interface ImageUploadSectionProps {
  images: File[]
  existingImages: AdImage[]
  imageError: string | null
  dragActive: boolean
  totalImages: number
  fieldErrors: FieldErrors
  draggedIndex: number | null
  dragOverIndex: number | null
  draggedExistingIndex: number | null
  dragOverExistingIndex: number | null
  mode: 'create' | 'edit'
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDrag: (e: React.DragEvent) => void
  onImageRemove: (index: number) => void
  onExistingImageRemove: (imageId: string) => void
  onValidateAndAddFiles: (files: File[]) => void
  onDragStart: (e: React.DragEvent, index: number) => void
  onDragOver: (e: React.DragEvent, index: number) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent, index: number) => void
  onDragEnd: () => void
  onExistingDragStart: (e: React.DragEvent, index: number) => void
  onExistingDragOver: (e: React.DragEvent, index: number) => void
  onExistingDragLeave: () => void
  onExistingDrop: (e: React.DragEvent, index: number) => void
  onExistingDragEnd: () => void
}

export const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  images,
  existingImages,
  imageError,
  dragActive,
  totalImages,
  fieldErrors,
  draggedIndex,
  dragOverIndex,
  draggedExistingIndex,
  dragOverExistingIndex,
  mode,
  onFileSelect,
  onDrag,
  onImageRemove,
  onExistingImageRemove,
  onValidateAndAddFiles,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onExistingDragStart,
  onExistingDragOver,
  onExistingDragLeave,
  onExistingDrop,
  onExistingDragEnd
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDropZoneDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = Array.from(e.dataTransfer.files)
    onValidateAndAddFiles(files)
  }

  const handleDropZoneClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <section className="form-section">
      <h3>
        Obrázky vozidla <span className="required">*</span>
        <span className="image-counter">({totalImages}/15)</span>
      </h3>
      
      {/* Image Upload Drop Zone */}
      <div
        className={`image-upload-zone ${dragActive ? 'active' : ''} ${
          totalImages >= 15 ? 'disabled' : ''
        }`}
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={handleDropZoneDrop}
        onClick={totalImages < 15 ? handleDropZoneClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={onFileSelect}
          style={{ display: 'none' }}
          disabled={totalImages >= 15}
        />
        
        <div className="upload-content">
          <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          
          {totalImages >= 15 ? (
            <>
              <h4>Dosáhli jste limitu obrázků</h4>
              <p>Můžete mít maximálně 15 obrázků na inzerát</p>
            </>
          ) : (
            <>
              <h4>Přidejte obrázky vozidla</h4>
              <p>
                Přetáhněte obrázky sem nebo <span className="upload-link">klikněte pro výběr</span>
              </p>
              <small>
                Podporované formáty: JPEG, PNG, WebP | Max. velikost: 10MB na obrázek
                <br />
                Potřebujete alespoň 2 obrázky, maximálně 15
              </small>
            </>
          )}
        </div>
      </div>
      
      {/* Error Messages */}
      {(imageError || fieldErrors.images) && (
        <div className="field-error">
          {imageError || fieldErrors.images}
        </div>
      )}
      
      {/* Existing Images (for edit mode) */}
      {mode === 'edit' && existingImages.length > 0 && (
        <div className="image-section">
          <h4 className="image-section-title">
            Stávající obrázky ({existingImages.length})
            <small>Přetáhněte pro změnu pořadí</small>
          </h4>
          <div className="image-grid existing-images">
            {existingImages.map((image, index) => (
              <div
                key={image.id}
                className={`image-item existing-image ${
                  draggedExistingIndex === index ? 'dragging' : ''
                } ${dragOverExistingIndex === index ? 'drag-over' : ''}`}
                draggable
                onDragStart={(e) => onExistingDragStart(e, index)}
                onDragOver={(e) => onExistingDragOver(e, index)}
                onDragLeave={onExistingDragLeave}
                onDrop={(e) => onExistingDrop(e, index)}
                onDragEnd={onExistingDragEnd}
              >
                <img src={image.url} alt={`Obrázek ${index + 1}`} />
                <div className="image-overlay">
                  <span className="image-number">{index + 1}</span>
                  <button
                    type="button"
                    className="image-remove"
                    onClick={() => onExistingImageRemove(image.id)}
                    title="Smazat obrázek"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {index === 0 && <div className="main-image-badge">Hlavní</div>}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* New Images */}
      {images.length > 0 && (
        <div className="image-section">
          <h4 className="image-section-title">
            {mode === 'edit' ? 'Nové obrázky' : 'Vybrané obrázky'} ({images.length})
            <small>Přetáhněte pro změnu pořadí</small>
          </h4>
          <div className="image-grid new-images">
            {images.map((image, index) => (
              <div
                key={index}
                className={`image-item new-image ${
                  draggedIndex === index ? 'dragging' : ''
                } ${dragOverIndex === index ? 'drag-over' : ''}`}
                draggable
                onDragStart={(e) => onDragStart(e, index)}
                onDragOver={(e) => onDragOver(e, index)}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, index)}
                onDragEnd={onDragEnd}
              >
                <img src={URL.createObjectURL(image)} alt={`Nový obrázek ${index + 1}`} />
                <div className="image-overlay">
                  <span className="image-number">
                    {mode === 'edit' ? existingImages.length + index + 1 : index + 1}
                  </span>
                  <button
                    type="button"
                    className="image-remove"
                    onClick={() => onImageRemove(index)}
                    title="Odebrat obrázek"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {mode === 'create' && existingImages.length === 0 && index === 0 && (
                  <div className="main-image-badge">Hlavní</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Images Info */}
      <div className="images-info">
        <div className="info-item">
          <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/>
            <path d="M12 8h.01"/>
          </svg>
          <div>
            <strong>První obrázek bude hlavní</strong>
            <p>Zobrazí se jako náhled v seznamu inzerátů</p>
          </div>
        </div>
        
        <div className="info-item">
          <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div>
            <strong>Kvalitní obrázky zvyšují zájem</strong>
            <p>Pořiďte obrázky za dobrého světla z různých úhlů</p>
          </div>
        </div>
        
        <div className="info-item">
          <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l2 2 4-4" />
          </svg>
          <div>
            <strong>Automatická optimalizace</strong>
            <p>Obrázky se automaticky zmenší pro rychlé načítání</p>
          </div>
        </div>
      </div>
    </section>
  )
}