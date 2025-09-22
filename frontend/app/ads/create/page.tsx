import dynamic from 'next/dynamic'
import { generateMetadata } from '../../lib/seo'

export const metadata = generateMetadata(
  'Přidat inzerát zdarma - Prodejte své auto',
  'Vytvořte inzerát vašeho vozidla zdarma na Carta.cz. Jednoduché přidání, kvalitní fotografie, rychlý prodej.',
  ['přidat inzerát zdarma', 'prodej auta', 'inzerce vozidla', 'carta prodej'],
  undefined,
  'https://carta.cz/ads/create'
)

// ✅ Simple loading without animation
const AdCreateForm = dynamic(() => import('../../components/AdCreateForm'), {
  ssr: false,
  loading: () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '400px',
      flexDirection: 'column'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid #e2e8f0',
        borderTop: '3px solid #0070f3',
        borderRadius: '50%'
        // ✅ Removed the problematic animation property
      }}></div>
      <p style={{ marginTop: '16px', color: '#4a5568' }}>Načítám formulář...</p>
    </div>
  )
})

export default function CreateAdPage() {
  return (
    <main>
      <h1 style={{ position: 'absolute', left: '-9999px' }}>
        Přidat inzerát auta zdarma na Carta.cz
      </h1>
      <AdCreateForm />
    </main>
  )
}