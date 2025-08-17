'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import ViewToggle from './ViewToggle'

type ViewMode = 'grid' | 'list'

interface SortBarProps {
  totalCount?: number
  onViewChange?: (view: ViewMode) => void
}

export default function SortBar({ totalCount, onViewChange }: SortBarProps) {
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

  const handleViewChange = (view: ViewMode) => {
    onViewChange?.(view)
  }

  const formatCount = (count: number) => {
    if (count === 0) return 'Žádné výsledky'
    if (count === 1) return '1 inzerát'
    if (count < 5) return `${count.toLocaleString()} inzeráty`
    return `${count.toLocaleString()} inzerátů`
  }

  return (
    <div className="sort-bar">
      <div className="sort-bar__info">
        {totalCount !== undefined && (
          <span className="sort-bar__count">
            {formatCount(totalCount)}
          </span>
        )}
      </div>

      <div className="sort-bar__controls">
        {/* View Toggle */}
        <div className="sort-bar__view-toggle">
          <ViewToggle onViewChange={handleViewChange} />
        </div>

        {/* Sort Controls */}
        <div className="sort-bar__sort">
          <label htmlFor="sort" className="sort-bar__sort-label">
            Řadit podle:
          </label>
          <select 
            id="sort"
            className="sort-bar__sort-select" 
            value={`${sortBy}:${sortOrder}`}
            onChange={handleSortChange}
          >
            <option value="newest:desc">Nejnovější</option>
            <option value="oldest:asc">Nejstarší</option>
            <option value="price:asc">Cena (od nejlevnějších)</option>
            <option value="price:desc">Cena (od nejdražších)</option>
            <option value="mileage:asc">Nájezd (od nejmenších)</option>
            <option value="mileage:desc">Nájezd (od největších)</option>
            <option value="year:desc">Rok výroby (od nejnovějších)</option>
            <option value="year:asc">Rok výroby (od nejstarších)</option>
            <option value="views:desc">Nejprohlíženější</option>
            <option value="views:asc">Nejméně zobrazované</option>
            <option value="title:asc">A-Z (název)</option>
            <option value="title:desc">Z-A (název)</option>
            {searchParams.get('nearLatitude') && (
              <option value="distance:asc">Vzdálenost (od nejbližších)</option>
            )}
          </select>
        </div>
      </div>
    </div>
  )
}