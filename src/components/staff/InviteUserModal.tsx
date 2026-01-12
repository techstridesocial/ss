'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, CheckCircle, Send } from 'lucide-react'
import { UserRole } from '@/types/database'
import { useToast } from '@/components/ui/use-toast'

interface InviteUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const roleOptions = [
  { value: 'BRAND', label: 'Brand', description: 'Client access to browse influencers and manage campaigns' },
  { value: 'INFLUENCER_SIGNED', label: 'Signed Influencer', description: 'Formally signed creator with full platform access' },
  { value: 'INFLUENCER_PARTNERED', label: 'Partnered Influencer', description: 'Invited creator with limited access' },
  { value: 'STAFF', label: 'Team Member', description: 'Internal team member with management access' },
  { value: 'ADMIN', label: 'Admin', description: 'Full system control and user management' }
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

  useEffect(() => {
    if (isOpen) {
      setFormData({ email: '', firstName: '', lastName: '', role: 'BRAND' })
      setError('')
      setSuccess(false)
    }
  }, [isOpen])

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to send invitation')
      
      setSuccess(true)
      toast({
        title: 'Invitation Sent',
        description: `Successfully invited ${formData.email}`,
      })
      onSuccess()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  const handleClose = () => {
    if (!isLoading) onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Invite User</h2>
              <p className="text-sm text-gray-500 mt-1">Send an invitation to join the platform</p>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-8"
              >
                <div className="text-center py-8">
                  <div className="mx-auto w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mb-5">
                    <CheckCircle className="h-7 w-7 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Invitation Sent</h3>
                  <p className="text-gray-500 mb-8">
                    An email has been sent to <span className="font-medium text-gray-900">{formData.email}</span>
                  </p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => {
                        setSuccess(false)
                        setFormData({ email: '', firstName: '', lastName: '', role: 'BRAND' })
                      }}
                      className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Invite Another
                    </button>
                    <button
                      onClick={handleClose}
                      className="px-5 py-2.5 text-white bg-gray-900 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="p-8"
              >
                <div className="space-y-6">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                      placeholder="name@company.com"
                    />
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Role
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {roleOptions.map((option) => {
                        const isSelected = formData.role === option.value
                        return (
                          <label
                            key={option.value}
                            className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${
                              isSelected
                                ? 'border-gray-900 bg-gray-50'
                                : 'border-gray-200 hover:border-gray-300'
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
                            <span className={`font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                              {option.label}
                            </span>
                            <span className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {option.description}
                            </span>
                            {isSelected && (
                              <div className="absolute top-3 right-3 w-2 h-2 bg-gray-900 rounded-full" />
                            )}
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !formData.email}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Invitation
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
