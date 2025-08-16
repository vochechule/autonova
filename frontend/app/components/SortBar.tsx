'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface SortBarProps {
  totalCount?: number
}

export default function SortBar({ totalCount }: SortBarProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest')
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc')

  // Synchronizace s URL
  useEffect(() => {
    setSortBy(searchParams.get('sortBy') || 'newest')
    setSortOrder(searchParams.get('sortOrder') || 'desc')
  }, [searchParams])

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    const [newSortBy, newSortOrder] = value.split(':')
    
    const newParams = new URLSearchParams(searchParams.toString())
    
    if (newSortBy === 'newest' && newSortOrder === 'desc') {
      // Default hodnoty - odstraň z URL
      newParams.delete('sortBy')
      newParams.delete('sortOrder')
    } else {
      newParams.set('sortBy', newSortBy)
      newParams.set('sortOrder', newSortOrder)
    }
    
    router.push(`/ads${newParams.toString() ? `?${newParams.toString()}` : ''}`)
  }

  return (
    <div className="sort-bar">
      <div className="sort-bar__info">
        {totalCount !== undefined && (
          <span className="sort-bar__count">
            📊 {totalCount.toLocaleString()} inzerátů
          </span>
        )}
      </div>
      
      <div className="sort-bar__controls">
        <label className="sort-bar__label">
          Řadit podle:
        </label>
        <select
          value={`${sortBy}:${sortOrder}`}
          onChange={handleSortChange}
          className="sort-bar__select"
        >
          <option value="newest:desc">🆕 Nejnovější</option>
          <option value="oldest:asc">📅 Nejstarší</option>
          <option value="price:asc">💰 Nejlevnější</option>
          <option value="price:desc">💎 Nejdražší</option>
          <option value="mileage:asc">🏃‍♂️ Nejméně km</option>
          <option value="mileage:desc">🚗 Nejvíce km</option>
          <option value="year:desc">🚀 Nejnovější rok</option>
          <option value="year:asc">🏛️ Nejstarší rok</option>
          <option value="views:desc">👀 Nejprohlíženější</option>
          <option value="views:asc">😴 Nejméně zobrazované</option>
          <option value="title:asc">🔤 A-Z (název)</option>
          <option value="title:desc">🔤 Z-A (název)</option>
        </select>
      </div>
    </div>
  )
}