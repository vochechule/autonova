export const siteConfig = {
  name: 'Carta.cz',
  description: 'Jednoduchý a bezplatný prodej a nákup aut online. Nový český autobazar pro všechny, kteří chtějí prodávat nebo hledat auto pohodlně a bez zbytečných poplatků.',
  url: 'https://carta.cz/', // ✅ FIX: Add trailing slash for consistency
  ogImage: 'https://carta.cz/og-image.png',
  keywords: [
    'autobazar',
    'inzerce aut',
    'prodej aut',
    'ojetá auta',
    'koupě auta',
    'auto na prodej',
    'bazar vozidel',
    'carta',
    'auta zdarma',
    'nejlevnější auta'
  ]
}

export const generateMetadata = (
  title: string,
  description?: string,
  keywords?: string[],
  ogImage?: string,
  canonical?: string,
  noIndex?: boolean
) => {
  const fullTitle = title === 'Carta.cz' ? title : `${title} | Carta.cz`
  
  return {
    title: fullTitle,
    description: description || siteConfig.description,
    keywords: keywords ? [...siteConfig.keywords, ...keywords] : siteConfig.keywords,
    robots: noIndex ? 'noindex,nofollow' : 'index,follow',
    openGraph: {
      title: fullTitle,
      description: description || siteConfig.description,
      url: canonical || siteConfig.url,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage || siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: fullTitle
        }
      ],
      locale: 'cs_CZ',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: description || siteConfig.description,
      images: [ogImage || siteConfig.ogImage]
    },
    alternates: {
      canonical: canonical || siteConfig.url
    }
  }
}