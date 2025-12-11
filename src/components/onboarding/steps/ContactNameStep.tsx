import React from 'react'
import { motion } from 'framer-motion'
import { User } from 'lucide-react'
import { OnboardingInput } from '../OnboardingInput'

interface ContactNameStepProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export function ContactNameStep({ value, onChange, error }: ContactNameStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <OnboardingInput
        type="text"
        icon={User}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="John Smith"
        autoFocus
        aria-label="Brand contact name"
        aria-required="true"
        error={error}
      />
    </motion.div>
  )
}
