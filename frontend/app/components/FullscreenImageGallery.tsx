'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface AdImage {
  id: string;
  url: string;
  order?: number;
}

interface FullscreenImageGalleryProps {
  images: AdImage[]
  isOpen: boolean
  onClose: () => void
  initialIndex?: number
  adTitle?: string
}

export default function FullscreenImageGallery({ 
  images, 
  isOpen, 
  onClose, 
  initialIndex = 0,
  adTitle = ''
}: FullscreenImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  // Update current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }, [images.length])

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }, [images.length])

  const goToImage = useCallback((index: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    setCurrentIndex(index)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          prevImage()
          break
        case 'ArrowRight':
          nextImage()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, nextImage, prevImage])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || images.length === 0) return null

  return (
    <div className="fullscreen-gallery" onClick={onClose}>
      <div className="fullscreen-gallery__overlay" />
      
      {/* Close button */}
      <button 
        className="fullscreen-gallery__close"
        onClick={onClose}
        aria-label="Zavřít galerii"
      >
        <X size={24} />
      </button>

      {/* Main image container */}
      <div 
        className="fullscreen-gallery__main-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="fullscreen-gallery__main-image">
          <Image
            src={images[currentIndex].url}
            alt={`${adTitle} - obrázek ${currentIndex + 1}`}
            fill
            style={{ objectFit: 'contain' }}
            priority
            unoptimized
          />
        </div>

        {/* Navigation arrows */}
        <button 
          className="fullscreen-gallery__nav-btn fullscreen-gallery__nav-btn--prev"
          onClick={prevImage}
          aria-label="Předchozí obrázek"
        >
          <ChevronLeft size={32} />
        </button>

        <button 
          className="fullscreen-gallery__nav-btn fullscreen-gallery__nav-btn--next"
          onClick={nextImage}
          aria-label="Další obrázek"
        >
          <ChevronRight size={32} />
        </button>

        {/* Image counter */}
        <div className="fullscreen-gallery__counter">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail bar */}
      <div className="fullscreen-gallery__thumbnails" onClick={(e) => e.stopPropagation()}>
        <div className="fullscreen-gallery__thumbnails-container">
          {images.map((image, index) => (
            <button
              key={image.id || index}
              className={`fullscreen-gallery__thumbnail ${index === currentIndex ? 'active' : ''}`}
              onClick={(e) => goToImage(index, e)}
              aria-label={`Přejít na obrázek ${index + 1}`}
            >
              <Image
                src={image.url}
                alt=""
                width={80}
                height={60}
                style={{ objectFit: 'cover' }}
                unoptimized
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}