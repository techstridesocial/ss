import React from 'react'
import { motion } from 'framer-motion'
import { Globe } from 'lucide-react'
import { OnboardingInput } from '../OnboardingInput'

interface WebsiteStepProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export function WebsiteStep({ value, onChange, error }: WebsiteStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <OnboardingInput
        type="url"
        icon={Globe}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://www.yourcompany.com"
        autoFocus
        aria-label="Website URL"
        aria-required="true"
        aria-invalid={error ? 'true' : 'false'}
        error={error}
      />
    </motion.div>
  )
}

