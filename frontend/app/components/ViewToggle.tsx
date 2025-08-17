'use client'
import { useState, useEffect } from 'react'
import '../styles/components/ViewToggle.scss'

type ViewMode = 'grid' | 'list'

interface ViewToggleProps {
  onViewChange: (view: ViewMode) => void
  defaultView?: ViewMode
}

export default function ViewToggle({ onViewChange, defaultView = 'list' }: ViewToggleProps) {
  const [currentView, setCurrentView] = useState<ViewMode>(defaultView)

  // Load saved preference from localStorage
  useEffect(() => {
    const savedView = localStorage.getItem('adsViewMode') as ViewMode
    if (savedView && (savedView === 'grid' || savedView === 'list')) {
      setCurrentView(savedView)
      onViewChange(savedView)
    }
  }, [onViewChange])

  const handleViewChange = (view: ViewMode) => {
    setCurrentView(view)
    onViewChange(view)
    localStorage.setItem('adsViewMode', view)
  }

  return (
    <div className="view-toggle">
      <button
        className={`view-toggle__btn ${currentView === 'grid' ? 'view-toggle__btn--active' : ''}`}
        onClick={() => handleViewChange('grid')}
        aria-label="Zobrazit jako kartičky"
        title="Velké kartičky"
      >
        <svg className="view-toggle__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
        </svg>
        <span className="view-toggle__label">Kartičky</span>
      </button>

      <button
        className={`view-toggle__btn ${currentView === 'list' ? 'view-toggle__btn--active' : ''}`}
        onClick={() => handleViewChange('list')}
        aria-label="Zobrazit jako seznam"
        title="Kompaktní seznam"
      >
        <svg className="view-toggle__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="8" y1="6" x2="21" y2="6"/>
          <line x1="8" y1="12" x2="21" y2="12"/>
          <line x1="8" y1="18" x2="21" y2="18"/>
          <line x1="3" y1="6" x2="3.01" y2="6"/>
          <line x1="3" y1="12" x2="3.01" y2="12"/>
          <line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
        <span className="view-toggle__label">Seznam</span>
      </button>
    </div>
  )
}