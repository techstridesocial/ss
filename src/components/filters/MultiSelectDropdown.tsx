'use client'

import React, { useState, useRef, useEffect } from 'react'

interface MultiSelectDropdownProps {
  label: string
  selectedValues: string[]
  onChange: (values: string[]) => void
  options: { value: string; label: string }[]
  placeholder?: string
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  selectedValues,
  onChange,
  options,
  placeholder = "Select options..."
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleOption = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value))
    } else {
      onChange([...selectedValues, value])
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="grid grid-cols-1 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Platforms</label>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm text-left bg-white"
            >
              {selectedValues.length === 0 
                ? placeholder 
                : `${selectedValues.length} selected`}
            </button>
            
            {isOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {options.map((option) => (
                  <label key={option.value} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(option.value)}
                      onChange={() => toggleOption(option.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Selected Options Display */}
          {selectedValues.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedValues.map((value) => {
                const option = options.find(opt => opt.value === value)
                return (
                  <span
                    key={value}
                    className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                  >
                    {option?.label}
                    <button
                      onClick={() => toggleOption(value)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MultiSelectDropdown 