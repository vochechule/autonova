'use client'
import { useState, useRef, useEffect } from 'react'
import { getBrandsGroupedByLetter } from '../data/carData'
import Image from 'next/image'
import './BrandSelect.scss'

interface BrandSelectProps {
  value: string
  onChange: (value: string) => void
  required?: boolean
  disabled?: boolean
  className?: string // ✅ Add className prop
}

export default function BrandSelect({ value, onChange, className }: BrandSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const brandsGrouped = getBrandsGroupedByLetter()
  
  // Filtrování značek podle vyhledávání
  const filteredBrands = Object.entries(brandsGrouped).reduce((acc, [letter, brands]) => {
    const filteredBrandsInGroup = brands.filter(brand =>
      brand.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    // Rozdělit na normální značky a "jiné"
    const normalBrands = filteredBrandsInGroup.filter(brand => 
      !brand.label.toLowerCase().includes('jiné')
    )
    const otherBrands = filteredBrandsInGroup.filter(brand => 
      brand.label.toLowerCase().includes('jiné')
    )
    
    // Přidat normální značky do původní skupiny
    if (normalBrands.length > 0) {
      acc[letter] = normalBrands
    }
    
    // Přidat "jiné" značky do speciální skupiny na konci
    if (otherBrands.length > 0) {
      if (!acc['Ostatní']) {
        acc['Ostatní'] = []
      }
      acc['Ostatní'].push(...otherBrands)
    }
    
    return acc
  }, {} as { [key: string]: typeof brandsGrouped[string] })

  // Najít vybranou značku pro zobrazení
  const selectedBrand = Object.values(brandsGrouped)
    .flat()
    .find(brand => brand.value === value)

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

  const handleBrandSelect = (brandValue: string) => {
    onChange(brandValue)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleToggle = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setSearchTerm('')
    }
  }

  return (
    <div className={`brand-select ${className || ''}`} ref={dropdownRef}>
      {/* Hidden input pro form submission */}
      <input type="hidden" name="brand" value={value} />
      
      {/* Trigger button */}
      <button
        type="button"
        className={`brand-select__trigger ${isOpen ? 'open' : ''} ${className || ''}`}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="brand-select__value">
          {selectedBrand ? (
            <>
              {selectedBrand.logo && (
                <Image 
                  src={selectedBrand.logo} 
                  alt={`${selectedBrand.label} logo`}
                  className="brand-select__logo"
                  width={24}
                  height={24}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              )}
              <span>{selectedBrand.label}</span>
            </>
          ) : (
            <span className="placeholder">Vyberte značku…</span>
          )}
        </div>
        <div className={`brand-select__arrow ${isOpen ? 'open' : ''}`}>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="brand-select__dropdown">
          {/* Search input */}
          <div className="brand-select__search">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Hledat značku…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="brand-select__search-input"
            />
          </div>

          {/* Options list */}
          <div className="brand-select__options">
            {Object.keys(filteredBrands).length === 0 ? (
              <div className="brand-select__no-results">
                Žádné výsledky pro &quot;{searchTerm}&quot;
              </div>
            ) : (
              Object.entries(filteredBrands)
                .sort(([a], [b]) => {
                  // "Ostatní" skupina vždy na konec
                  if (a === 'Ostatní') return 1
                  if (b === 'Ostatní') return -1
                  return a.localeCompare(b)
                })
                .map(([letter, brands]) => (
                  <div key={letter} className="brand-select__group">
                    <div className="brand-select__group-label">{letter}</div>
                    {brands.map(brand => (
                      <button
                        key={brand.value}
                        type="button"
                        className={`brand-select__option ${brand.value === value ? 'selected' : ''}`}
                        onClick={() => handleBrandSelect(brand.value)}
                      >
                        <img 
                          src={brand.logo} 
                          alt={`${brand.label} logo`}
                          className="brand-select__option-logo"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <span>{brand.label}</span>
                      </button>
                    ))}
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
