/**
 * Utility functions for optimizing image loading and reducing Vercel transformations
 */

export const IMAGE_QUALITY = {
  HIGH: 90,     // For hero images, main carousel
  MEDIUM: 85,   // For card images, profile avatars  
  LOW: 75,      // For thumbnails, preload images
  MINIMAL: 60   // For blur placeholders
} as const

export const IMAGE_SIZES = {
  CARD: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw",
  CAROUSEL: "(max-width: 768px) 100vw, 800px", 
  THUMBNAIL: "120px",
  AVATAR: "96px"
} as const

/**
 * Generate optimized blur data URL for placeholders
 */
export const generateBlurDataURL = (): string => {
  return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
}

/**
 * Check if an image should be preloaded
 */
export const shouldPreloadImage = (index: number, currentIndex: number, totalImages: number): boolean => {
  // Only preload adjacent images and first few
  const isAdjacent = Math.abs(index - currentIndex) <= 1 || 
                    (currentIndex === 0 && index === totalImages - 1) ||
                    (currentIndex === totalImages - 1 && index === 0)
  const isEarly = index < 2
  
  return isAdjacent || isEarly
}

/**
 * Get optimized image props for different use cases
 */
export const getImageProps = (type: 'card' | 'carousel' | 'thumbnail' | 'avatar' | 'preload') => {
  const baseProps = {
    placeholder: "blur" as const,
    blurDataURL: generateBlurDataURL()
  }

  switch (type) {
    case 'card':
      return {
        ...baseProps,
        quality: IMAGE_QUALITY.MEDIUM,
        sizes: IMAGE_SIZES.CARD,
        priority: false
      }
    
    case 'carousel':
      return {
        ...baseProps,
        quality: IMAGE_QUALITY.HIGH,
        sizes: IMAGE_SIZES.CAROUSEL,
        priority: true
      }
      
    case 'thumbnail':
      return {
        quality: IMAGE_QUALITY.LOW,
        sizes: IMAGE_SIZES.THUMBNAIL,
        priority: false
      }
      
    case 'avatar':
      return {
        quality: IMAGE_QUALITY.MEDIUM,
        sizes: IMAGE_SIZES.AVATAR,
        priority: false
      }
      
    case 'preload':
      return {
        quality: IMAGE_QUALITY.LOW,
        priority: false
      }
      
    default:
      return baseProps
  }
}