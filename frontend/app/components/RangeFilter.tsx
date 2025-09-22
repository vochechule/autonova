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
  
  // ✅ Add separate state for input display values (allows empty/partial input)
  const [fromInputValue, setFromInputValue] = useState(valueFrom.toString())
  const [toInputValue, setToInputValue] = useState(valueTo.toString())
  
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Synchronizace s props při změně
  useEffect(() => {
    setFromValue(valueFrom)
    setToValue(valueTo)
    setFromInputValue(valueFrom.toString())
    setToInputValue(valueTo.toString())
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

  // ✅ New input handlers that allow empty/partial input
  const handleFromInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setFromInputValue(inputValue)
    
    // Only update actual value if input is a valid number
    if (inputValue !== '' && !isNaN(Number(inputValue))) {
      const numValue = parseInt(inputValue)
      const clampedValue = Math.max(min, Math.min(max, numValue))
      handleFromChange(clampedValue)
    }
  }

  const handleToInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setToInputValue(inputValue)
    
    // Only update actual value if input is a valid number
    if (inputValue !== '' && !isNaN(Number(inputValue))) {
      const numValue = parseInt(inputValue)
      const clampedValue = Math.max(min, Math.min(max, numValue))
      handleToChange(clampedValue)
    }
  }

  // ✅ Handle blur events to validate and correct invalid input
  const handleFromInputBlur = () => {
    if (fromInputValue === '' || isNaN(Number(fromInputValue))) {
      // Reset to current valid value if input is empty or invalid
      setFromInputValue(fromValue.toString())
    } else {
      const numValue = parseInt(fromInputValue)
      const clampedValue = Math.max(min, Math.min(max, numValue))
      const finalValue = Math.min(clampedValue, toValue)
      
      setFromValue(finalValue)
      setFromInputValue(finalValue.toString())
      onValueChange?.(finalValue, toValue)
    }
  }

  const handleToInputBlur = () => {
    if (toInputValue === '' || isNaN(Number(toInputValue))) {
      // Reset to current valid value if input is empty or invalid
      setToInputValue(toValue.toString())
    } else {
      const numValue = parseInt(toInputValue)
      const clampedValue = Math.max(min, Math.min(max, numValue))
      const finalValue = Math.max(clampedValue, fromValue)
      
      setToValue(finalValue)
      setToInputValue(finalValue.toString())
      onValueChange?.(fromValue, finalValue)
    }
  }

  // ✅ Handle Enter key to apply changes immediately
  const handleFromInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleFromInputBlur()
      e.currentTarget.blur()
    }
  }

  const handleToInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleToInputBlur()
      e.currentTarget.blur()
    }
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
          
          {/* ✅ Updated input fields with better handling */}
          <div className="range-filter__inputs">
            <div className="range-filter__input-group">
              <label>Od</label>
              <input
                type="number"
                value={fromInputValue}
                onChange={handleFromInputChange}
                onBlur={handleFromInputBlur}
                onKeyDown={handleFromInputKeyDown}
                min={min}
                max={max}
                step={step}
                placeholder={min.toString()}
              />
            </div>
            <div className="range-filter__input-group">
              <label>Do</label>
              <input
                type="number"
                value={toInputValue}
                onChange={handleToInputChange}
                onBlur={handleToInputBlur}
                onKeyDown={handleToInputKeyDown}
                min={min}
                max={max}
                step={step}
                placeholder={max.toString()}
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
              onChange={(e) => {
                const newValue = parseInt(e.target.value)
                handleFromChange(newValue)
                setFromInputValue(newValue.toString()) // ✅ Update input display
              }}
              className="range-filter__thumb range-filter__thumb--from"
            />
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={toValue}
              onChange={(e) => {
                const newValue = parseInt(e.target.value)
                handleToChange(newValue)
                setToInputValue(newValue.toString()) // ✅ Update input display
              }}
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
                setFromInputValue(min.toString()) // ✅ Reset input display too
                setToInputValue(max.toString())
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
