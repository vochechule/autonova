import { MetadataRoute } from 'next'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const FALLBACK_SITEMAP: MetadataRoute.Sitemap = [
  {
    url: 'https://carta.cz/ads',
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!API_URL) {
    return FALLBACK_SITEMAP
  }

  try {
    // Fetch all ads for sitemap
    const response = await fetch(`${API_URL}/ad?limit=1000&status=active`, {
      next: { revalidate: 3600 } // Revalidate every hour
    })

    if (!response.ok) {
      return FALLBACK_SITEMAP
    }

    const data = await response.json()
    const ads = data?.ads || []

    // Generate sitemap entries for individual ads
    const adEntries: MetadataRoute.Sitemap = ads.map((ad: { id: number; updatedAt: string; createdAt?: string }) => {
      // Validate and create a proper date
      let lastModified = new Date()
      
      // Try updatedAt first, then createdAt, then fallback to current date
      if (ad.updatedAt) {
        const updatedDate = new Date(ad.updatedAt)
        if (!isNaN(updatedDate.getTime())) {
          lastModified = updatedDate
        }
      } else if (ad.createdAt) {
        const createdDate = new Date(ad.createdAt)
        if (!isNaN(createdDate.getTime())) {
          lastModified = createdDate
        }
      }
      
      return {
        url: `https://carta.cz/ads/${ad.id}`,
        lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }
    })

    // Add main ads page
    const mainEntry: MetadataRoute.Sitemap = [
      {
        url: 'https://carta.cz/ads',
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      }
    ]

    return [...mainEntry, ...adEntries]
  } catch {
    return FALLBACK_SITEMAP
  }
}
