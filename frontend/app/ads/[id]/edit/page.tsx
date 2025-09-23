'use client'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'

// ✅ Use your enhanced AdCreateForm component
const AdCreateForm = dynamic(() => import('../../../components/AdCreateForm'), {
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
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <p style={{ marginTop: '16px', color: '#4a5568' }}>Načítám formulář...</p>
    </div>
  ),
  ssr: false // ✅ Disable SSR for edit page since it's client-only
})

export default function EditAdPage() {
  const params = useParams()
  const adId = params.id as string

  return (
    <main>
      <div className="container">
        <h1 style={{ position: 'absolute', left: '-9999px' }}>
          Upravit inzerát - Carta.cz
        </h1>
        {/* ✅ Using enhanced AdCreateForm in edit mode */}
        <AdCreateForm mode="edit" adId={adId} />
      </div>
    </main>
  )
}