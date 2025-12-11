import React from 'react'
import { motion } from 'framer-motion'
import { User, Tag, Mail, Phone } from 'lucide-react'
import { OnboardingInput } from '../OnboardingInput'

interface ContactStepProps {
  name: string
  role: string
  email: string
  phone: string
  onNameChange: (value: string) => void
  onRoleChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPhoneChange: (value: string) => void
  errors?: {
    name?: string
    role?: string
    email?: string
    phone?: string
  }
}

export function ContactStep({
  name,
  role,
  email,
  phone,
  onNameChange,
  onRoleChange,
  onEmailChange,
  onPhoneChange,
  errors
}: ContactStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <OnboardingInput
        type="text"
        icon={User}
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="John Smith"
        autoFocus
        aria-label="Brand contact name"
        aria-required="true"
        error={errors?.name}
      />
      <OnboardingInput
        type="text"
        icon={Tag}
        value={role}
        onChange={(e) => onRoleChange(e.target.value)}
        placeholder="e.g. Marketing Manager"
        aria-label="Contact role"
        aria-required="true"
        error={errors?.role}
      />
      <OnboardingInput
        type="email"
        icon={Mail}
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        placeholder="john@company.com"
        aria-label="Brand contact email address"
        aria-required="true"
        error={errors?.email}
      />
      <OnboardingInput
        type="tel"
        icon={Phone}
        value={phone}
        onChange={(e) => onPhoneChange(e.target.value)}
        placeholder="+44 20 1234 5678"
        aria-label="Brand contact phone number"
        aria-required="true"
        error={errors?.phone}
      />
    </motion.div>
  )
}
