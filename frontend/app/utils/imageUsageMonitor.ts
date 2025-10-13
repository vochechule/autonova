/**
 * Image Usage Monitor
 * 
 * This file helps track and optimize Vercel image transformations
 * to stay within free tier limits (1000 transformations/month)
 */

// Image transformation cost tracking
export const TRANSFORMATION_COSTS = {
  // Main carousel images (800x600, quality 85)
  CAROUSEL_MAIN: 1,
  
  // Preloaded images (200x150, quality 60) 
  CAROUSEL_PRELOAD: 0.5,
  
  // Card images (responsive, quality 85)
  CARD_IMAGES: 1,
  
  // Profile avatars (96x96, quality 85)
  AVATARS: 0.5,
  
  // Thumbnails (80x60 or 120x90, quality 75)
  THUMBNAILS: 0.3
} as const

// Estimated transformations per page view
export const PAGE_COSTS = {
  // Home page: ~20 car cards = 20 transformations
  HOME: 20,
  
  // Ad detail: 1 main + 2 preload = 2 transformations  
  AD_DETAIL: 2,
  
  // Profile: 1 avatar + variable ads/saved = 1-10 transformations
  PROFILE: 5,
  
  // Search results: variable cards = 5-50 transformations
  SEARCH: 15
} as const

/**
 * Calculate estimated monthly usage based on traffic
 */
export const estimateMonthlyUsage = (dailyPageViews: {
  home: number
  adDetail: number
  profile: number
  search: number
}) => {
  const daily = 
    (dailyPageViews.home * PAGE_COSTS.HOME) +
    (dailyPageViews.adDetail * PAGE_COSTS.AD_DETAIL) +
    (dailyPageViews.profile * PAGE_COSTS.PROFILE) +
    (dailyPageViews.search * PAGE_COSTS.SEARCH)
  
  return {
    daily,
    monthly: daily * 30,
    remaining: Math.max(0, 1000 - (daily * 30))
  }
}

// Optimization recommendations
export const OPTIMIZATION_TIPS = [
  "Reduce image quality from 90 to 80 for cards",
  "Use smaller preload sizes (200x150 instead of 400x300)",
  "Limit preload to only adjacent images",
  "Add proper sizes attribute for responsive images",
  "Use webp/avif formats when possible",
  "Increase cache TTL to reduce repeated transformations"
] as const