import React from 'react'
import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import { OnboardingInput } from '../OnboardingInput'

interface ContactEmailStepProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export function ContactEmailStep({ value, onChange, error }: ContactEmailStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <OnboardingInput
        type="email"
        icon={Mail}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="john@company.com"
        autoFocus
        aria-label="Brand contact email address"
        aria-required="true"
        error={error}
      />
    </motion.div>
  )
}

