import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://carta.cz'
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/ads`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ads/create`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }
  ]

  try {
    // Get all ads for dynamic pages
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
    const response = await fetch(`${API_URL}/ad?limit=1000`)
    
    if (response.ok) {
      const data = await response.json()
      const ads = data?.ads || []
      
      interface Ad {
        id: string;
        updatedAt?: string;
        createdAt: string;
      }

      const adPages: MetadataRoute.Sitemap = ads.map((ad: Ad) => ({
        url: `${baseUrl}/ads/${ad.id}`,
        lastModified: new Date(ad.updatedAt || ad.createdAt),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))

      return [...staticPages, ...adPages]
    }
  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  return staticPages
}