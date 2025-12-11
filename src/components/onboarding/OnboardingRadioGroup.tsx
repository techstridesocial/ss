import React from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface RadioOption {
  value: string
  label: string
}

interface OnboardingRadioGroupProps {
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
  error?: string
  label?: string
  columns?: 1 | 2 | 3 | 4
}

export function OnboardingRadioGroup({ 
  options, 
  value, 
  onChange, 
  error,
  label,
  columns = 1
}: OnboardingRadioGroupProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  }[columns]

  return (
    <div className="space-y-4">
      {label && (
        <label className="text-white text-sm font-medium">{label}</label>
      )}
      <div className={`grid ${gridCols} gap-3`}>
        {options.map((option) => (
          <motion.button
            key={option.value}
            onClick={() => onChange(option.value)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-6 rounded-xl text-left transition-all duration-200 ${
              value === option.value
                ? 'bg-white text-blue-600 shadow-lg'
                : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
            }`}
            type="button"
            aria-pressed={value === option.value}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-lg">{option.label}</span>
              {value === option.value && (
                <Check className="w-5 h-5 text-blue-600" />
              )}
            </div>
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
