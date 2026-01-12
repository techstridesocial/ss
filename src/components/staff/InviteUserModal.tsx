'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Mail, User, Shield, Send, Loader2, CheckCircle, 
  AlertCircle, UserPlus, Building2, Sparkles, Users, Crown,
  Copy, Check, ExternalLink
} from 'lucide-react'
import { UserRole } from '@/types/database'
import { useToast } from '@/components/ui/use-toast'

interface InviteUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const roleOptions = [
  { 
    value: 'BRAND', 
    label: 'Brand', 
    description: 'Client access to browse influencers and manage campaigns',
    icon: Building2,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
    iconBg: 'bg-blue-100'
  },
  { 
    value: 'INFLUENCER_SIGNED', 
    label: 'Signed Influencer', 
    description: 'Formally signed creator with full platform access',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-500',
    iconBg: 'bg-purple-100'
  },
  { 
    value: 'INFLUENCER_PARTNERED', 
    label: 'Partnered Influencer', 
    description: 'Invited creator with limited access',
    icon: Users,
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-500',
    iconBg: 'bg-amber-100'
  },
  { 
    value: 'STAFF', 
    label: 'Team Member', 
    description: 'Internal team member with management access',
    icon: Shield,
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-500',
    iconBg: 'bg-emerald-100'
  },
  { 
    value: 'ADMIN', 
    label: 'Admin', 
    description: 'Full system control and user management',
    icon: Crown,
    color: 'from-rose-500 to-red-500',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-500',
    iconBg: 'bg-rose-100'
  }
]

export default function InviteUserModal({ isOpen, onClose, onSuccess }: InviteUserModalProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'BRAND' as UserRole
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        role: 'BRAND'
      })
      setError('')
      setSuccess(false)
      setInviteLink('')
      setCopied(false)
    }
  }, [isOpen])

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address')
      return
    }
    
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/staff/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation')
      }
      
      console.log('✅ Invitation created successfully:', data)
      
      // Set success state
      setSuccess(true)
      if (data.invitation?.url) {
        setInviteLink(data.invitation.url)
      }
      
      // Show toast
      toast({
        title: '🎉 Invitation Sent!',
        description: `Successfully invited ${formData.email} as ${roleOptions.find(r => r.value === formData.role)?.label}`,
      })
      
      onSuccess()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to send invitation',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  const copyInviteLink = async () => {
    if (inviteLink) {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      toast({
        title: 'Link Copied!',
        description: 'Invitation link copied to clipboard',
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  const selectedRole = roleOptions.find(r => r.value === formData.role)

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden"
        >
          {/* Gradient Header */}
          <div className={`relative px-6 py-5 bg-gradient-to-r ${selectedRole?.color || 'from-cyan-500 to-blue-500'}`}>
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <UserPlus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Invite User</h2>
                  <p className="text-sm text-white/80">Send an invitation to join the platform</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {success ? (
              /* Success State */
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-6"
              >
                <div className="text-center py-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
                  >
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl font-semibold text-gray-900 mb-2"
                  >
                    Invitation Sent Successfully!
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-600 mb-6"
                  >
                    An invitation email has been sent to <span className="font-medium text-gray-900">{formData.email}</span>
                  </motion.p>
                  
                  {inviteLink && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-gray-50 rounded-xl p-4 mb-6"
                    >
                      <p className="text-sm text-gray-500 mb-2">Or share this invitation link:</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={inviteLink}
                          className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 truncate"
                        />
                        <button
                          onClick={copyInviteLink}
                          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {copied ? (
                            <Check className="h-5 w-5 text-green-600" />
                          ) : (
                            <Copy className="h-5 w-5 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex gap-3"
                  >
                    <button
                      onClick={() => {
                        setSuccess(false)
                        setFormData({
                          email: '',
                          firstName: '',
                          lastName: '',
                          role: 'BRAND'
                        })
                      }}
                      className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      Invite Another
                    </button>
                    <button
                      onClick={handleClose}
                      className={`flex-1 px-4 py-2.5 text-white rounded-xl font-medium transition-colors bg-gradient-to-r ${selectedRole?.color || 'from-cyan-500 to-blue-500'} hover:opacity-90`}
                    >
                      Done
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              /* Form State */
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleSubmit}
                className="p-6 space-y-5"
              >
                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4" />
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-offset-0 transition-all ${
                      error && !validateEmail(formData.email) && formData.email
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-200 focus:ring-cyan-500 focus:border-cyan-500'
                    }`}
                    placeholder="user@example.com"
                  />
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <User className="h-4 w-4" />
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <Shield className="h-4 w-4" />
                    Select Role <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                    {roleOptions.map((option) => {
                      const Icon = option.icon
                      const isSelected = formData.role === option.value
                      return (
                        <motion.label
                          key={option.value}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                            isSelected
                              ? `${option.borderColor} ${option.bgColor}`
                              : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="role"
                            value={option.value}
                            checked={isSelected}
                            onChange={(e) => handleInputChange('role', e.target.value)}
                            className="sr-only"
                          />
                          <div className={`p-2 rounded-lg ${isSelected ? option.iconBg : 'bg-gray-100'}`}>
                            <Icon className={`h-4 w-4 ${isSelected ? 'text-gray-700' : 'text-gray-500'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                              {option.label}
                            </div>
                            <div className="text-xs text-gray-500 truncate">{option.description}</div>
                          </div>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={`p-1 rounded-full bg-gradient-to-r ${option.color}`}
                            >
                              <Check className="h-3 w-3 text-white" />
                            </motion.div>
                          )}
                        </motion.label>
                      )
                    })}
                  </div>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl"
                    >
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-600">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={isLoading || !formData.email}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r ${selectedRole?.color || 'from-cyan-500 to-blue-500'} shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Send Invitation</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
