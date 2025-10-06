import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import AdDetailClient from './AdDetailClient'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface AdDetailServerProps {
  params: Promise<{ id: string }>
}

interface Ad {
  id: number
  title: string
  description: string
  price: number
  currency: string
  year: number
  mileage: number
  location: string
  images: Array<{ id: string; url: string; order: number }>
  brand: { name: string }
  model: { name: string }
  fuel: string
  transmission: string
  condition: string
  bodyType: string
  color: string
  user: {
    name: string
    location: string
  }
  createdAt: string
  updatedAt: string
}

// Fetch ad data for server-side rendering
async function fetchAdDetail(id: string): Promise<Ad | null> {
  try {
    const response = await fetch(`${API_URL}/ad/${id}`, {
      next: { revalidate: 300 } // Revalidate every 5 minutes
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching ad detail:', error)
    return null
  }
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: AdDetailServerProps): Promise<Metadata> {
  const { id } = await params
  const ad = await fetchAdDetail(id)

  if (!ad) {
    return {
      title: 'Inzerát nenalezen - Carta.cz',
      description: 'Požadovaný inzerát nebyl nalezen.',
    }
  }

  const carTitle = `${ad.brand.name} ${ad.model.name}`
  const title = `${carTitle} ${ad.year} - ${ad.price.toLocaleString('cs-CZ')} ${ad.currency} | Carta.cz`
  const description = ad.description 
    ? `${carTitle} ${ad.year}, ${ad.mileage.toLocaleString('cs-CZ')} km, ${ad.fuel}, ${ad.location}. ${ad.description.substring(0, 120)}...`
    : `${carTitle} ${ad.year}, ${ad.mileage.toLocaleString('cs-CZ')} km, ${ad.fuel}, ${ad.location}. Prohlédněte si detaily a kontaktujte prodejce.`

  const images = ad.images
    .sort((a, b) => a.order - b.order)
    .map(img => img.url)

  return {
    title,
    description,
    keywords: [
      carTitle,
      ad.brand.name,
      ad.model.name,
      `${ad.brand.name} ${ad.model.name} ${ad.year}`,
      ad.fuel,
      ad.transmission,
      ad.location,
      'ojeté auto',
      'auto na prodej',
      'carta.cz'
    ],
    openGraph: {
      title,
      description,
      url: `https://carta.cz/ads/${ad.id}`,
      siteName: 'Carta.cz',
      images: images.length > 0 ? [{
        url: images[0],
        width: 1200,
        height: 630,
        alt: carTitle,
      }] : [],
      locale: 'cs_CZ',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.length > 0 ? [images[0]] : [],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: `https://carta.cz/ads/${ad.id}`,
    },
  }
}

export default async function AdDetailServer({ params }: AdDetailServerProps) {
  const { id } = await params
  const ad = await fetchAdDetail(id)

  if (!ad) {
    notFound()
  }

  const carTitle = `${ad.brand.name} ${ad.model.name}`
  
  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Car",
    "name": carTitle,
    "description": ad.description,
    "image": ad.images
      .sort((a, b) => a.order - b.order)
      .map(img => img.url),
    "brand": {
      "@type": "Brand",
      "name": ad.brand.name
    },
    "model": ad.model.name,
    "vehicleModelDate": ad.year.toString(),
    "mileageFromOdometer": {
      "@type": "QuantitativeValue",
      "value": ad.mileage,
      "unitCode": "KMT"
    },
    "fuelType": ad.fuel,
    "vehicleTransmission": ad.transmission,
    "vehicleConfiguration": ad.bodyType,
    "color": ad.color,
    "vehicleCondition": ad.condition,
    "offers": {
      "@type": "Offer",
      "priceCurrency": ad.currency,
      "price": ad.price,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Person",
        "name": ad.user.name,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": ad.user.location
        }
      }
    },
    "url": `https://carta.cz/ads/${ad.id}`,
    "dateCreated": ad.createdAt,
    "dateModified": ad.updatedAt
  }

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Domů",
        "item": "https://carta.cz"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Všechna auta",
        "item": "https://carta.cz/ads"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": carTitle,
        "item": `https://carta.cz/ads/${ad.id}`
      }
    ]
  }

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData)
        }}
      />

      {/* Client component with pre-fetched data */}
      <AdDetailClient initialAd={{ ...ad, id: ad.id.toString() }} />
    </>
  )
}