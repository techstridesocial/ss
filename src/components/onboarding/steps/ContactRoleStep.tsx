import React from 'react'
import { motion } from 'framer-motion'
import { Tag } from 'lucide-react'
import { OnboardingInput } from '../OnboardingInput'

interface ContactRoleStepProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export function ContactRoleStep({ value, onChange, error }: ContactRoleStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <OnboardingInput
        type="text"
        icon={Tag}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Marketing Manager"
        autoFocus
        aria-label="Contact role"
        aria-required="true"
        error={error}
      />
    </motion.div>
  )
}
