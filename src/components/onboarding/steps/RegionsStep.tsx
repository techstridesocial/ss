import React from 'react'
import { motion } from 'framer-motion'
import { OnboardingMultiSelect } from '../OnboardingMultiSelect'

interface RegionsStepProps {
  value: string[]
  onChange: (value: string[]) => void
  error?: string
  options: string[]
}

export function RegionsStep({ value, onChange, error, options }: RegionsStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <OnboardingMultiSelect
        options={options}
        value={value}
        onChange={onChange}
        error={error}
        columns={2}
      />
    </motion.div>
  )
}
