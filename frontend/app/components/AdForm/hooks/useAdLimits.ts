// Create: frontend/app/components/AdForm/hooks/useAdLimits.ts
import { useState, useEffect, useCallback } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface AdLimits {
  maxAds: number
  remainingAds: number
  currentAds: number
  isDealer: boolean
  tier?: string
}

export const useAdLimits = (mode: 'create' | 'edit') => {
  const [adLimits, setAdLimits] = useState<AdLimits | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAdLimits = useCallback(async () => {
    if (mode !== 'create') return

    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No token found')
      }

      // Fetch both current ads and limits
      const [adsRes, limitsRes] = await Promise.all([
        fetch(`${API_URL}/ad/my`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/ad/limits`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      const [adsData, limitsData] = await Promise.all([
        adsRes.ok ? adsRes.json() : [],
        limitsRes.ok ? limitsRes.json() : { maxAds: 10, remainingAds: 10, currentAds: 0, isDealer: false }
      ])

      const currentCount = Array.isArray(adsData) ? adsData.length : 0
      
      const limits: AdLimits = {
        maxAds: limitsData.maxAds || 10,
        remainingAds: limitsData.remainingAds || 0,
        currentAds: currentCount,
        isDealer: limitsData.isDealer || false,
        tier: limitsData.tier
      }

      setAdLimits(limits)

      console.log('📊 Ad limits loaded:', limits)

    } catch (err) {
      console.error('❌ Error fetching ad limits:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch ad limits')
      
      // Fallback limits
      setAdLimits({
        maxAds: 10,
        remainingAds: 0,
        currentAds: 0,
        isDealer: false
      })
    } finally {
      setLoading(false)
    }
  }, [mode])

  const checkLimits = useCallback((): boolean => {
    if (!adLimits) return true // Allow if limits not loaded yet

    return adLimits.remainingAds > 0
  }, [adLimits])

  const getLimitMessage = useCallback((): string => {
    if (!adLimits) return 'Načítám limity...'

    const { currentAds, maxAds, isDealer, tier } = adLimits

    if (adLimits.remainingAds <= 0) {
      const tierInfo = isDealer 
        ? `Váš ${tier || 'BASIC'} tier umožňuje ${maxAds} inzerátů.`
        : `Soukromí uživatelé mohou mít ${maxAds} inzerátů.`
      
      return `Dosáhli jste limitu aktivních inzerátů (${currentAds}/${maxAds}). ${tierInfo} ${
        isDealer 
          ? 'Pro zvýšení limitu kontaktujte administrátora.' 
          : 'Smažte některé inzeráty pro přidání nových.'
      }`
    }

    return `Můžete přidat ještě ${adLimits.remainingAds} inzerátů (${currentAds}/${maxAds})`
  }, [adLimits])

  useEffect(() => {
    fetchAdLimits()
  }, [fetchAdLimits])

  return {
    adLimits,
    loading,
    error,
    checkLimits,
    getLimitMessage,
    refetch: fetchAdLimits
  }
}