import React from 'react'
import { motion } from 'framer-motion'

interface OnboardingSelectGridProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  error?: string
  label?: string
  columns?: 2 | 3 | 4
  maxHeight?: string
}

export function OnboardingSelectGrid({ 
  options, 
  value, 
  onChange, 
  error,
  label,
  columns = 2,
  maxHeight = 'max-h-96'
}: OnboardingSelectGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  }[columns]

  return (
    <div className="space-y-4">
      {label && (
        <label className="text-white text-sm font-medium">{label}</label>
      )}
      <div className={`grid ${gridCols} gap-3 ${maxHeight} overflow-y-auto`}>
        {options.map((option) => (
          <motion.button
            key={option}
            onClick={() => onChange(option)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 rounded-xl text-left transition-all duration-200 ${
              value === option
                ? 'bg-white text-blue-600 shadow-lg'
                : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
            }`}
            type="button"
            aria-pressed={value === option}
          >
            <span className="font-medium">{option}</span>
          </motion.button>
        ))}
      </div>
      {error && (
        <p className="text-red-300 text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
