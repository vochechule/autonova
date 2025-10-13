/**
 * Development helper for monitoring image transformations
 * Only runs in development mode to help track usage
 */

let imageTransformationCount = 0;

/**
 * Track image loads in development
 */
export const trackImageTransformation = (
  src: string, 
  width?: number, 
  height?: number, 
  quality?: number
) => {
  if (process.env.NODE_ENV !== 'development') return;
  
  imageTransformationCount++;
  
  console.log(`[Image Optimization] Transformation #${imageTransformationCount}:`, {
    src: src.substring(0, 50) + '...',
    dimensions: width && height ? `${width}x${height}` : 'responsive',
    quality: quality || 75,
    timestamp: new Date().toISOString()
  });
  
  // Warning at different thresholds
  if (imageTransformationCount === 50) {
    console.warn('🟡 [Image Optimization] 50 transformations loaded - monitor usage');
  }
  
  if (imageTransformationCount === 100) {
    console.warn('🟠 [Image Optimization] 100 transformations loaded - consider optimizations');  
  }
  
  if (imageTransformationCount === 200) {
    console.error('🔴 [Image Optimization] 200+ transformations - urgent optimization needed!');
  }
};

/**
 * Get current session transformation count
 */
export const getTransformationCount = () => imageTransformationCount;

/**
 * Reset counter (useful for testing)
 */
export const resetTransformationCount = () => {
  imageTransformationCount = 0;
};

/**
 * Log usage summary for monitoring
 */
export const logUsageSummary = () => {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.log(`[Image Optimization] Session Summary:`, {
    totalTransformations: imageTransformationCount,
    estimatedMonthlyCost: imageTransformationCount * 30,
    remainingFreeTransformations: Math.max(0, 1000 - (imageTransformationCount * 30))
  });
};