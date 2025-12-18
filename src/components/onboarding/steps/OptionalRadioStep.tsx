import React from 'react'
import { motion } from 'framer-motion'
import { OnboardingRadioGroup } from '../OnboardingRadioGroup'

interface OptionalRadioStepProps {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  label?: string
}

export function OptionalRadioStep({ value, onChange, options, label }: OptionalRadioStepProps) {
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
        columns={1}
      />
      {label && (
        <p className="text-blue-200 text-sm text-center">
          Optional - {label}
        </p>
      )}
    </motion.div>
  )
}

