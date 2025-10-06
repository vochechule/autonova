import { MetadataRoute } from 'next'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Fetch all ads for sitemap
    const response = await fetch(`${API_URL}/ad?limit=1000&status=active`, {
      next: { revalidate: 3600 } // Revalidate every hour
    })

    if (!response.ok) {
      console.error('Failed to fetch ads for sitemap:', response.status)
      return []
    }

    const data = await response.json()
    const ads = data?.ads || []

    // Generate sitemap entries for individual ads
    const adEntries: MetadataRoute.Sitemap = ads.map((ad: { id: number; updatedAt: string }) => ({
      url: `https://carta.cz/ads/${ad.id}`,
      lastModified: new Date(ad.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

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
  } catch (error) {
    console.error('Error generating ads sitemap:', error)
    return [
      {
        url: 'https://carta.cz/ads',
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      }
    ]
  }
}