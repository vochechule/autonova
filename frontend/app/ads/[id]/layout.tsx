// Create: frontend/app/ads/[id]/layout.tsx
import { generateMetadata as generateSEOMetadata } from '../../lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  try {
    // ✅ Await params before using its properties
    const { id } = await params
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
    const response = await fetch(`${API_URL}/ad/${id}`, { 
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return generateSEOMetadata(
        'Inzerát nenalezen',
        'Požadovaný inzerát nebyl nalezen.',
        undefined,
        undefined,
        undefined,
        true
      )
    }

    const ad = await response.json()
    
    const title = `${ad.brand} ${ad.model} ${ad.year} na prodej`
    const description = `${ad.brand} ${ad.model} z roku ${ad.year}, ${ad.mileage?.toLocaleString()} km, ${ad.price?.toLocaleString()} Kč. ${ad.description?.substring(0, 120)}...`
    const keywords = [
      `${ad.brand} ${ad.model}`,
      `${ad.brand} na prodej`,
      `${ad.year} ${ad.brand}`,
      `${ad.bodyType} ${ad.brand}`,
      `${ad.fuel} motor`,
      `auto ${ad.price?.toLocaleString()} kč`
    ]

    return generateSEOMetadata(
      title, 
      description, 
      keywords, 
      ad.images?.[0]?.url,
      `https://carta.cz/ads/${id}` // ✅ Use awaited id
    )
  } catch {
    return generateSEOMetadata(
      'Chyba při načítání inzerátu',
      'Došlo k chybě při načítání detailu inzerátu.',
      undefined,
      undefined,
      undefined,
      true
    )
  }
}

export default function AdLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}