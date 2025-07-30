'use client'
import { useState, useRef, useEffect } from 'react'
import '../styles/components/RangeFilter.scss'

interface RangeFilterProps {
  label: string
  namePrefix: string
  min: number
  max: number
  step?: number
  valueFrom?: number
  valueTo?: number
  formatValue?: (value: number) => string
  onValueChange?: (from: number, to: number) => void
}

export default function RangeFilter({
  label,
  namePrefix,
  min,
  max,
  step = 1,
  valueFrom = min,
  valueTo = max,
  formatValue = (value) => value.toLocaleString('cs-CZ'),
  onValueChange
}: RangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [fromValue, setFromValue] = useState(valueFrom)
  const [toValue, setToValue] = useState(valueTo)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Synchronizace s props při změně
  useEffect(() => {
    setFromValue(valueFrom)
    setToValue(valueTo)
  }, [valueFrom, valueTo])

  // Zavření dropdownu při kliknutí mimo
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleFromChange = (value: number) => {
    const newFrom = Math.min(value, toValue)
    setFromValue(newFrom)
    onValueChange?.(newFrom, toValue)
  }

  const handleToChange = (value: number) => {
    const newTo = Math.max(value, fromValue)
    setToValue(newTo)
    onValueChange?.(fromValue, newTo)
  }

  const handleFromInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || min
    handleFromChange(Math.max(min, Math.min(max, value)))
  }

  const handleToInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || max
    handleToChange(Math.max(min, Math.min(max, value)))
  }

  const getDisplayText = () => {
    if (fromValue === min && toValue === max) {
      return `${label}`
    }
    return `${formatValue(fromValue)} - ${formatValue(toValue)}`
  }

  const fromPercent = ((fromValue - min) / (max - min)) * 100
  const toPercent = ((toValue - min) / (max - min)) * 100

  return (
    <div className="range-filter" ref={dropdownRef}>
      {/* Hidden inputs pro form submission */}
      <input type="hidden" name={`${namePrefix}From`} value={fromValue === min ? '' : fromValue} />
      <input type="hidden" name={`${namePrefix}To`} value={toValue === max ? '' : toValue} />
      
      {/* Trigger button */}
      <button
        type="button"
        className={`range-filter__trigger ${isOpen ? 'open' : ''} ${fromValue !== min || toValue !== max ? 'has-value' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="range-filter__value">
          <span>{getDisplayText()}</span>
        </div>
        <div className={`range-filter__arrow ${isOpen ? 'open' : ''}`}>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>

      {/* Dropdown content */}
      {isOpen && (
        <div className="range-filter__dropdown">
          <div className="range-filter__header">
            <span className="range-filter__label">{label}</span>
          </div>
          
          {/* Input fields */}
          <div className="range-filter__inputs">
            <div className="range-filter__input-group">
              <label>Od</label>
              <input
                type="number"
                value={fromValue}
                onChange={handleFromInputChange}
                min={min}
                max={max}
                step={step}
              />
            </div>
            <div className="range-filter__input-group">
              <label>Do</label>
              <input
                type="number"
                value={toValue}
                onChange={handleToInputChange}
                min={min}
                max={max}
                step={step}
              />
            </div>
          </div>

          {/* Slider */}
          <div className="range-filter__slider">
            <div className="range-filter__track">
              <div 
                className="range-filter__range"
                style={{
                  left: `${fromPercent}%`,
                  width: `${toPercent - fromPercent}%`
                }}
              />
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={fromValue}
              onChange={(e) => handleFromChange(parseInt(e.target.value))}
              className="range-filter__thumb range-filter__thumb--from"
            />
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={toValue}
              onChange={(e) => handleToChange(parseInt(e.target.value))}
              className="range-filter__thumb range-filter__thumb--to"
            />
          </div>

          {/* Quick actions */}
          <div className="range-filter__actions">
            <button
              type="button"
              onClick={() => {
                setFromValue(min)
                setToValue(max)
                onValueChange?.(min, max)
              }}
              className="range-filter__reset"
            >
              Resetovat
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
