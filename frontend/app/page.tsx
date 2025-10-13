import { generateMetadata } from './lib/seo'

export const metadata = generateMetadata(
  'Carta.cz - Jednoduchý a moderní autobazar',
  'Objevte nový způsob prodeje a nákupu aut. Bez zbytečných poplatků, jednoduše a přehledně. Vyzkoušejte moderní autobazar na Carta.cz.',
  ['autobazar zdarma', 'nejlepší ceny aut', 'ověření prodejci', 'bezpečný nákup auta', 'carta autobazar'],
  undefined, // ogImage - use default
  'https://carta.cz/' // ✅ FIX: Explicit canonical URL with trailing slash for homepage
)

export default function Home() {
  return (
    <>
      {/* SEO-optimized structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Carta.cz",
            "url": "https://carta.cz",
            "description": "Jednoduchý a moderní autobazar",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://carta.cz/ads?search={search_term_string}",
              "query-input": "required name=search_term_string"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Carta.cz",
              "url": "https://carta.cz"
            }
          })
        }}
      />

      <main style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
        color: 'white',
        textAlign: 'center',
        padding: '2rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {/* Background animation */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
          zIndex: 1
        }} />
        
        <div style={{ 
          maxWidth: '700px', 
          zIndex: 2,
          position: 'relative',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          padding: '3rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          {/* Logo/Icon */}
          <div className="pulse-animation" style={{ 
            marginBottom: '2rem',
            fontSize: '5rem',
            lineHeight: 1
          }}>
            🚗
          </div>
          
          <h1 style={{ 
            fontSize: 'clamp(2rem, 5vw, 3.5rem)', 
            marginBottom: '1.5rem', 
            fontWeight: '800',
            background: 'linear-gradient(45deg, #ffffff, #e0e7ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.025em'
          }}>
            Carta.cz
          </h1>
          
          <div style={{
            width: '80px',
            height: '4px',
            background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
            margin: '0 auto 2rem auto',
            borderRadius: '2px'
          }} />
          
          <h2 style={{ 
            fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', 
            marginBottom: '1.5rem', 
            fontWeight: '600',
            opacity: 0.95
          }}>
            🚧 Služba dočasně nedostupná
          </h2>
          
          <p style={{ 
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', 
            marginBottom: '2rem', 
            opacity: 0.9,
            lineHeight: '1.6',
            maxWidth: '500px',
            margin: '0 auto 2rem auto'
          }}>
            Omlouváme se, ale naše služba je momentálně nedostupná z důvodu údržby. 
            Pracujeme na tom a brzy budeme zpět!
          </p>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '2rem'
          }}>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="bounce-animation"
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  borderRadius: '50%',
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>
          
          <p style={{ 
            fontSize: '1rem', 
            opacity: 0.7,
            fontStyle: 'italic'
          }}>
            Děkujeme za trpělivost ❤️
          </p>
        </div>
        
        {/* CSS animations via style tag */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
            
            @keyframes bounce {
              0%, 80%, 100% { transform: translateY(0); }
              40% { transform: translateY(-10px); }
            }
            
            .pulse-animation {
              animation: pulse 2s infinite;
            }
            
            .bounce-animation {
              animation: bounce 1.4s infinite;
            }
            
            .bounce-animation:nth-child(1) { animation-delay: 0s; }
            .bounce-animation:nth-child(2) { animation-delay: 0.2s; }
            .bounce-animation:nth-child(3) { animation-delay: 0.4s; }
          `
        }} />
      </main>
    </>
  )
}
