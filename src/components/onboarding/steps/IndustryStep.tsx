import React from 'react'
import { motion } from 'framer-motion'
import { OnboardingSelectGrid } from '../OnboardingSelectGrid'

interface IndustryStepProps {
  value: string
  onChange: (value: string) => void
  error?: string
  options: string[]
}

export function IndustryStep({ value, onChange, error, options }: IndustryStepProps) {
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
        error={error}
        columns={2}
        maxHeight="max-h-96"
      />
    </motion.div>
  )
}

