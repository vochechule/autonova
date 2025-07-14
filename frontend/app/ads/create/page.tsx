'use client'
import { useState } from 'react'
import AdCreateWizard from './AdCreateWizard'

export default function CreateAdPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <AdCreateWizard />
    </main>
  )
}