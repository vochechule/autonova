'use client'
import { colorFinishes, getColorFinishByValue } from '../data/colorData'

interface ColorFinishSelectProps {
  value: string
  onChange: (value: string) => void
  required?: boolean
  className?: string
}

export default function ColorFinishSelect({ 
  value, 
  onChange, 
  required = false,
  className = ""
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
        <option value="">Vyberte povrchovou úpravu</option>
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