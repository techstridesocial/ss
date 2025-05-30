'use client'

import React from 'react'
import CustomDropdown from './CustomDropdown'

interface MinMaxSelectorProps {
  label: string
  minValue: string
  maxValue: string
  onMinChange: (value: string) => void
  onMaxChange: (value: string) => void
  options: string[]
  placeholder?: string
}

const MinMaxSelector: React.FC<MinMaxSelectorProps> = ({
  label,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  options,
  placeholder = "Any"
}) => {
  // Convert string options to dropdown format
  const dropdownOptions = [
    { value: '', label: placeholder },
    ...options.map(option => ({ value: option, label: option }))
  ]

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Min</label>
          <CustomDropdown
            value={minValue}
            onChange={onMinChange}
            options={dropdownOptions}
            placeholder={placeholder}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Max</label>
          <CustomDropdown
            value={maxValue}
            onChange={onMaxChange}
            options={dropdownOptions}
            placeholder={placeholder}
          />
        </div>
      </div>
    </div>
  )
}

export default MinMaxSelector 