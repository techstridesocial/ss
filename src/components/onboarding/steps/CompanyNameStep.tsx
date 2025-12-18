import React from 'react'
import { motion } from 'framer-motion'
import { Building2 } from 'lucide-react'
import { OnboardingInput } from '../OnboardingInput'

interface CompanyNameStepProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export function CompanyNameStep({ value, onChange, error }: CompanyNameStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <OnboardingInput
        type="text"
        icon={Building2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Luxe Beauty Co."
        autoFocus
        aria-label="Company name"
        aria-required="true"
        aria-invalid={error ? 'true' : 'false'}
        error={error}
      />
    </motion.div>
  )
}

