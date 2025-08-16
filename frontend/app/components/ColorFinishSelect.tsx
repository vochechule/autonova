'use client'
import { colorFinishes, getColorFinishByValue } from '../data/colorData'

interface ColorFinishSelectProps {
  value: string
  onChange: (value: string) => void
  required?: boolean
  className?: string
  placeholder?: string
}

export default function ColorFinishSelect({ 
  value, 
  onChange, 
  required = false,
  className = "",
  placeholder = "Vyberte povrchovou úpravu"
}: ColorFinishSelectProps) {
  const selectedFinish = getColorFinishByValue(value)

  return (
    <div className={`color-finish-select ${className}`}>
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="color-finish-select__select"
      >
        {/* ✅ ZMĚNĚNO - nebudeme mít prázdnou možnost pokud je required */}
        {!required && <option value="">{placeholder}</option>}
        {colorFinishes.map(finish => (
          <option key={finish.value} value={finish.value}>
            {finish.label}
          </option>
        ))}
      </select>
      
      {/* Hidden input pro form submission */}
      <input 
        type="hidden" 
        name="colorFinish" 
        value={value}
        required={required}
      />
    </div>
  )
}
