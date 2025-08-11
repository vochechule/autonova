'use client'
import { useState, useRef, useEffect } from 'react'
import { colors, getColorByValue, type Color } from '../data/colorData'
import '../styles/components/ColorSelect.scss'

interface ColorSelectProps {
  value: string
  onChange: (value: string) => void
  required?: boolean
  placeholder?: string
  className?: string
}

export default function ColorSelect({ 
  value, 
  onChange, 
  required = false, 
  placeholder = "Vyberte barvu",
  className = ""
}: ColorSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const selectRef = useRef<HTMLDivElement>(null)

  const selectedColor = getColorByValue(value)
  
  const filteredColors = colors.filter(color =>
    color.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleColorSelect = (color: Color) => {
    onChange(color.value)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleClear = () => {
    onChange('')
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className={`color-select ${className}`} ref={selectRef}>
      <div 
        className={`color-select__trigger ${isOpen ? 'color-select__trigger--open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="color-select__selected">
          {selectedColor ? (
            <>
              <div 
                className="color-select__color-dot"
                style={{ backgroundColor: selectedColor.hex }}
              />
              <span className="color-select__color-label">
                {selectedColor.label}
                {selectedColor.metallic && (
                  <span className="color-select__metallic-badge">M</span>
                )}
              </span>
            </>
          ) : (
            <span className="color-select__placeholder">{placeholder}</span>
          )}
        </div>
        
        <div className="color-select__actions">
          {selectedColor && (
            <button
              type="button"
              className="color-select__clear"
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
              title="Vymazat výběr"
            >
              ×
            </button>
          )}
          <svg 
            className={`color-select__arrow ${isOpen ? 'color-select__arrow--up' : ''}`}
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor"
          >
            <polyline points="6,9 12,15 18,9" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="color-select__dropdown">
          <div className="color-select__search">
            <input
              type="text"
              placeholder="Hledat barvu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="color-select__search-input"
              autoFocus
            />
          </div>
          
          <div className="color-select__options">
            {!required && (
              <div 
                className="color-select__option color-select__option--clear"
                onClick={handleClear}
              >
                <span className="color-select__option-label">Žádná barva</span>
              </div>
            )}
            
            {filteredColors.map(color => (
              <div
                key={color.value}
                className={`color-select__option ${value === color.value ? 'color-select__option--selected' : ''}`}
                onClick={() => handleColorSelect(color)}
              >
                <div 
                  className="color-select__color-dot"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="color-select__option-label">
                  {color.label}
                  {color.metallic && (
                    <span className="color-select__metallic-badge">M</span>
                  )}
                </span>
              </div>
            ))}
            
            {filteredColors.length === 0 && (
              <div className="color-select__no-results">
                Žádná barva nenalezena
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Hidden input pro form submission */}
      <input 
        type="hidden" 
        name="color" 
        value={value}
        required={required}
      />
    </div>
  )
}