'use client'
import { useState, useRef, useEffect } from 'react'
import './ModelSelect.scss'

interface ModelSelectProps {
  value: string
  onChange: (value: string) => void
  models: { value: string; label: string }[]
  disabled?: boolean
  required?: boolean
}

export default function ModelSelect({ 
  value, 
  onChange, 
  models, 
  disabled = false, 
  required = false 
}: ModelSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filtrování a řazení modelů - "jiný model" vždy na konec
  const filteredModels = models
    .filter(model =>
      model.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aIsOther = a.label.toLowerCase().includes('jiný')
      const bIsOther = b.label.toLowerCase().includes('jiný')
      
      // Pokud jeden je "jiný" a druhý ne, "jiný" jde na konec
      if (aIsOther && !bIsOther) return 1
      if (!aIsOther && bIsOther) return -1
      
      // Jinak zachovat původní pořadí
      return 0
    })

  // Najít vybraný model pro zobrazení
  const selectedModel = models.find(model => model.value === value)

  // Zavření dropdownu při kliknutí mimo
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus na search input když se dropdown otevře
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleModelSelect = (modelValue: string) => {
    onChange(modelValue)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleToggle = () => {
    if (disabled) return
    setIsOpen(!isOpen)
    if (!isOpen) {
      setSearchTerm('')
    }
  }

  const placeholderText = disabled 
    ? "Nejdříve vyberte značku" 
    : "Vyberte model..."

  return (
    <div className={`model-select ${disabled ? 'disabled' : ''}`} ref={dropdownRef}>
      {/* Hidden input pro form submission */}
      <input type="hidden" name="model" value={value} />
      
      {/* Trigger button */}
      <button
        type="button"
        className={`model-select__trigger ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={handleToggle}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="model-select__value">
          {selectedModel ? (
            <span>{selectedModel.label}</span>
          ) : (
            <span className="placeholder">{placeholderText}</span>
          )}
        </div>
        <div className={`model-select__arrow ${isOpen ? 'open' : ''}`}>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>

      {/* Dropdown menu */}
      {isOpen && !disabled && (
        <div className="model-select__dropdown">
          {/* Search input - pouze pokud je více než 5 modelů */}
          {models.length > 5 && (
            <div className="model-select__search">
              <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="Hledat model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="model-select__search-input"
              />
            </div>
          )}

          {/* Options list */}
          <div className="model-select__options">
            {filteredModels.length === 0 ? (
              <div className="model-select__no-results">
                {searchTerm ? `Žádné výsledky pro "${searchTerm}"` : 'Žádné modely'}
              </div>
            ) : (
              filteredModels.map(model => (
                <button
                  key={model.value}
                  type="button"
                  className={`model-select__option ${model.value === value ? 'selected' : ''}`}
                  onClick={() => handleModelSelect(model.value)}
                >
                  <span>{model.label}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
