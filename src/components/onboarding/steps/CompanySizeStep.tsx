import React from 'react'
import { motion } from 'framer-motion'
import { OnboardingRadioGroup } from '../OnboardingRadioGroup'

interface CompanySizeStepProps {
  value: string
  onChange: (value: string) => void
  error?: string
  options: Array<{ value: string; label: string }>
}

export function CompanySizeStep({ value, onChange, error, options }: CompanySizeStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <OnboardingRadioGroup
        options={options}
        value={value}
        onChange={onChange}
        error={error}
        columns={1}
      />
    </motion.div>
  )
}
