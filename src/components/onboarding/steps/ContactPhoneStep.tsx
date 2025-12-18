import React from 'react'
import { motion } from 'framer-motion'
import { Phone } from 'lucide-react'
import { OnboardingInput } from '../OnboardingInput'

interface ContactPhoneStepProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export function ContactPhoneStep({ value, onChange, error }: ContactPhoneStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <OnboardingInput
        type="tel"
        icon={Phone}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="+44 20 1234 5678"
        autoFocus
        aria-label="Brand contact phone number"
        aria-required="true"
        error={error}
      />
    </motion.div>
  )
}

