import React from 'react'
import { motion } from 'framer-motion'
import { OnboardingTextarea } from '../OnboardingTextarea'

interface DescriptionStepProps {
  value: string
  onChange: (value: string) => void
  error?: string
  maxLength?: number
}

export function DescriptionStep({ value, onChange, error, maxLength = 300 }: DescriptionStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <OnboardingTextarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="We're a clean beauty brand focused on sustainable, cruelty-free cosmetics..."
        maxLength={maxLength}
        rows={4}
        autoFocus
        showCharCount
        error={error}
        aria-label="Company description"
        aria-required="true"
      />
    </motion.div>
  )
}
