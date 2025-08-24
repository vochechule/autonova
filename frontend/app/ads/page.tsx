'use client'
import { Suspense } from 'react'
import AdsPageContent from './AdsPageContent'

export default function AdsPage() {
  return (
    <Suspense fallback={<div>Načítám inzeráty...</div>}>
      <AdsPageContent />
    </Suspense>
  )
}