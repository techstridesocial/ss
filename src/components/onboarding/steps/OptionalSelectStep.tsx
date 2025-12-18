import React from 'react'
import { motion } from 'framer-motion'
import { OnboardingSelectGrid } from '../OnboardingSelectGrid'

interface OptionalSelectStepProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  label?: string
}

export function OptionalSelectStep({ value, onChange, options, label }: OptionalSelectStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <OnboardingSelectGrid
        options={options}
        value={value}
        onChange={onChange}
        columns={2}
        maxHeight="max-h-96"
      />
      {label && (
        <p className="text-blue-200 text-sm text-center">
          Optional - {label}
        </p>
      )}
    </motion.div>
  )
}

