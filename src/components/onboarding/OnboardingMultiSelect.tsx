import React from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface OnboardingMultiSelectProps {
  options: string[]
  value: string[]
  onChange: (value: string[]) => void
  error?: string
  label?: string
  columns?: 2 | 3 | 4
  maxHeight?: string
}

export function OnboardingMultiSelect({ 
  options, 
  value, 
  onChange, 
  error,
  label,
  columns = 3,
  maxHeight = 'max-h-96'
}: OnboardingMultiSelectProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  }[columns]

  const toggleOption = (option: string) => {
    const isSelected = value.includes(option)
    const updated = isSelected
      ? value.filter(v => v !== option)
      : [...value, option]
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      {label && (
        <label className="text-white text-sm font-medium">{label}</label>
      )}
      <div className={`grid ${gridCols} gap-3 ${maxHeight} overflow-y-auto`}>
        {options.map((option) => {
          const isSelected = value.includes(option)
          return (
            <motion.button
              key={option}
              onClick={() => toggleOption(option)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-3 rounded-xl text-center transition-all duration-200 ${
                isSelected
                  ? 'bg-white text-blue-600 shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
              type="button"
              aria-pressed={isSelected}
            >
              <span className="font-medium text-sm">{option}</span>
              {isSelected && (
                <Check className="w-4 h-4 mx-auto mt-1" />
              )}
            </motion.button>
          )
        })}
      </div>
      {value.length > 0 && (
        <p className="text-blue-200 text-sm text-center">
          Selected: {value.length} {value.length === 1 ? 'item' : 'items'}
        </p>
      )}
      {error && (
        <p className="text-red-300 text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
