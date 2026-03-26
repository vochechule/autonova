import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://carta.cz'
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  
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

  if (!apiUrl) {
    return staticPages
  }

  try {
    // Get all ads for dynamic pages
    const response = await fetch(`${apiUrl}/ad?limit=1000`)
    
    if (response.ok) {
      const data = await response.json()
      const ads = data?.ads || []
      
      interface Ad {
        id: string;
        updatedAt?: string;
        createdAt: string;
      }

      const adPages: MetadataRoute.Sitemap = ads.map((ad: Ad) => {
        const dateStr = ad.updatedAt || ad.createdAt;
        const date = new Date(dateStr);
        const lastModified = isNaN(date.getTime()) ? new Date() : date;
        
        return {
          url: `${baseUrl}/ads/${ad.id}`,
          lastModified: lastModified,
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        };
      })

      return [...staticPages, ...adPages]
    }
  } catch {
    return staticPages
  }

  return staticPages
}
