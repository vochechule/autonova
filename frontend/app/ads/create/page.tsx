'use client'
import dynamic from 'next/dynamic'

// Dynamicky načti celý formulář
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
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <p style={{ marginTop: '16px', color: '#4a5568' }}>Načítám formulář...</p>
    </div>
  )
})

export default function CreateAdPage() {
  return (
    <main>
      <AdCreateForm />
    </main>
  )
}