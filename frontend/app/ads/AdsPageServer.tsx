import { Suspense } from 'react'
import AdsPageContent from './AdsPageContent'
import { Metadata } from 'next'

// Server-side fetch pro initial data
async function fetchInitialAds(searchParams: { [key: string]: string | string[] | undefined }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  
  try {
    // Vytvoř query string z search params
    const queryParams = new URLSearchParams()
    
    // Přidáme základní parametry pro SEO (první stránka, rozumné limity)
    queryParams.set('page', '1')
    queryParams.set('limit', '12')
    
    // Přidáme search params pokud existují
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'page') { // page už jsme nastavili
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v))
        } else {
          queryParams.set(key, value)
        }
      }
    })
    
    const response = await fetch(`${API_URL}/ad/search?${queryParams.toString()}`, {
      next: { revalidate: 300 } // 5 minut cache
    })
    
    if (!response.ok) {
      return { ads: [], pagination: null, totalCount: 0 }
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch initial ads:', error)
    return { ads: [], pagination: null, totalCount: 0 }
  }
}

// Dynamické generování metadata na základě filtrů
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }): Promise<Metadata> {
  const resolvedSearchParams = await searchParams
  const brand = resolvedSearchParams.brand as string
  const model = resolvedSearchParams.model as string
  const priceFrom = resolvedSearchParams.priceFrom as string
  const priceTo = resolvedSearchParams.priceTo as string
  const fuel = resolvedSearchParams.fuel as string
  
  let title = 'Všechna auta na prodej - Ojetá i nová vozidla | Carta.cz'
  let description = 'Procházejte kompletní nabídku vozidel na Carta.cz. Filtrujte podle značky, ceny, roku výroby a dalších parametrů. Najděte své ideální auto.'
  
  // Dynamicky upravíme title a description podle filtrů
  if (brand && model) {
    title = `${brand} ${model} na prodej - ${brand} ${model} bazar | Carta.cz`
    description = `Najděte ${brand} ${model} na prodej. Velký výběr ojetých i nových vozů ${brand} ${model} za skvělé ceny. Ověření prodejci na Carta.cz.`
  } else if (brand) {
    title = `${brand} na prodej - ${brand} bazar | Carta.cz`
    description = `Velký výběr vozů značky ${brand} na prodej. Ojeté i nové automobily ${brand} za nejlepší ceny. Ověření prodejci na Carta.cz.`
  } else if (fuel) {
    title = `${fuel} auta na prodej - ${fuel} bazar | Carta.cz`
    description = `Najděte auta na ${fuel} na prodej. Široký výběr ${fuel} vozidel za skvělé ceny. Ověření prodejci na Carta.cz.`
  }
  
  if (priceFrom && priceTo) {
    description += ` Ceny od ${parseInt(priceFrom).toLocaleString('cs-CZ')} do ${parseInt(priceTo).toLocaleString('cs-CZ')} Kč.`
  }
  
  return {
    title,
    description,
    keywords: [
      'auta na prodej',
      'autobazar',
      'ojeté auto',
      'bazar vozidel',
      'carta.cz',
      ...(brand ? [brand, `${brand} na prodej`, `${brand} bazar`] : []),
      ...(model ? [model, `${brand} ${model}`, `${model} bazar`] : []),
      ...(fuel ? [`${fuel} auto`, `${fuel} vozidla`] : []),
      'nejlepší ceny aut',
      'ověření prodejci'
    ],
    openGraph: {
      title,
      description,
      url: 'https://carta.cz/ads',
      siteName: 'Carta.cz',
      images: [
        {
          url: 'https://carta.cz/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Carta.cz - Moderní autobazar',
        },
      ],
      type: 'website',
      locale: 'cs_CZ',
    },
    alternates: {
      canonical: 'https://carta.cz/ads',
    },
  }
}

interface AdsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AdsPage({ searchParams }: AdsPageProps) {
  // Načteme initial data na serveru pro SEO
  const resolvedSearchParams = await searchParams
  const initialData = await fetchInitialAds(resolvedSearchParams)
  
  return (
    <>
      {/* Breadcrumb structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
              }
            ]
          })
        }}
      />

      <Suspense fallback={<div>Načítám inzeráty...</div>}>
        <AdsPageContent initialData={initialData} />
      </Suspense>
    </>
  )
}