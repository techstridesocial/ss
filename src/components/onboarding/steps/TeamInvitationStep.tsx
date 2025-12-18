import React from 'react'
import { motion } from 'framer-motion'
import { Mail, CheckCircle, Users } from 'lucide-react'
import { OnboardingInput } from '../OnboardingInput'
import { isValidEmail, hasDuplicateEmails } from '../../../lib/utils/validation'

interface TeamInvitationStepProps {
  email1: string
  email2: string
  onEmail1Change: (value: string) => void
  onEmail2Change: (value: string) => void
  errors?: {
    email1?: string
    email2?: string
  }
}

export function TeamInvitationStep({
  email1,
  email2,
  onEmail1Change,
  onEmail2Change,
  errors
}: TeamInvitationStepProps) {
  const emails = [email1, email2].filter(e => e.trim())
  const hasDuplicates = emails.length > 1 && hasDuplicateEmails(emails)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-start space-x-3 mb-4">
          <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
            <Users size={14} className="text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Invite Team Members</h4>
            <p className="text-sm text-blue-200 leading-relaxed">
              Add up to 2 team members who will have access to the brand portal. They'll receive an invitation to join your team.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
        >
          <h4 className="text-base font-bold text-white">Team Member 1</h4>
          <OnboardingInput
            type="email"
            icon={Mail}
            value={email1}
            onChange={(e) => onEmail1Change(e.target.value)}
            placeholder="john.smith@company.com"
            aria-label="Team member 1 email"
            error={errors?.email1 || (hasDuplicates && email1 ? 'Duplicate email address' : undefined)}
          />
          {email1 && isValidEmail(email1) && !hasDuplicates && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-3 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl p-3"
            >
              <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
              <span className="font-medium">Ready to invite {email1}</span>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
        >
          <h4 className="text-base font-bold text-white">Team Member 2</h4>
          <OnboardingInput
            type="email"
            icon={Mail}
            value={email2}
            onChange={(e) => onEmail2Change(e.target.value)}
            placeholder="jane.doe@company.com"
            aria-label="Team member 2 email"
            error={errors?.email2 || (hasDuplicates && email2 ? 'Duplicate email address' : undefined)}
          />
          {email2 && isValidEmail(email2) && !hasDuplicates && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center space-x-3 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl p-3"
            >
              <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
              <span className="font-medium">Ready to invite {email2}</span>
            </motion.div>
          )}
        </motion.div>
      </div>

      <p className="text-blue-200 text-sm text-center">
        Optional - Leave blank if you don't want to invite anyone right now
      </p>
    </motion.div>
  )
}

