import { Suspense } from 'react'
import AdsPageContent from './AdsPageContent'
import { generateMetadata } from '../lib/seo'

export const metadata = generateMetadata(
  'Všechna auta na prodej - Ojetá i nová vozidla',
  'Procházejte kompletní nabídku vozidel na Carta.cz. Filtrujte podle značky, ceny, roku výroby a dalších parametrů. Najděte své ideální auto.',
  ['všechna auta prodej', 'kompletní nabídka vozidel', 'filtr aut', 'hledat auto', 'carta auta'],
  undefined,
  'https://carta.cz/ads'
)

export default function AdsPage() {
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
        <AdsPageContent />
      </Suspense>
    </>
  )
}