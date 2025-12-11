import React, { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AssignInfluencerModalProps {
  isOpen: boolean
  onClose: () => void
  influencer: {
    id: string
    display_name: string
    email?: string
    first_name?: string
    last_name?: string
  } | null
  onAssign: (assignmentData: AssignmentData) => Promise<void>
}

interface AssignmentData {
  influencer_type: 'SIGNED' | 'PARTNERED' | 'AGENCY_PARTNER'
  content_type: 'STANDARD' | 'UGC' | 'SEEDING'
  agency_name?: string
}



export default function AssignInfluencerModal({ 
  isOpen, 
  onClose, 
  influencer,
  onAssign
}: AssignInfluencerModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const firstInputRef = useRef<HTMLSelectElement>(null)
  
  const [formData, setFormData] = useState<AssignmentData>({
    influencer_type: 'SIGNED',
    content_type: 'STANDARD',
    agency_name: ''
  })

  // Reset form state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError('')
      setFormData({
        influencer_type: 'SIGNED',
        content_type: 'STANDARD',
        agency_name: ''
      })
    }
  }, [isOpen])

  // Focus first input when modal animation completes
  const handleAnimationComplete = () => {
    if (isOpen && firstInputRef.current) {
      firstInputRef.current.focus()
    }
  }

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validate required fields
    if (!formData.influencer_type || !formData.content_type) {
      setError('Please select both influencer type and content type')
      return
    }

    if (formData.influencer_type === 'AGENCY_PARTNER' && !formData.agency_name?.trim()) {
      setError('Agency name is required for agency partners')
      return
    }

    setIsLoading(true)
    try {
      await onAssign(formData)
      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to assign influencer')
    } finally {
      setIsLoading(false)
    }
  }


  if (!isOpen || !influencer) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onAnimationComplete={handleAnimationComplete}
          className="relative bg-white rounded-2xl shadow-xl border border-gray-100 max-w-lg w-full"
          role="dialog"
          aria-modal="true"
          aria-labelledby="assign-modal-title"
          aria-describedby="assign-modal-description"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 id="assign-modal-title" className="text-xl font-semibold text-gray-900">
                  Assign Influencer
                </h2>
                <p id="assign-modal-description" className="text-sm text-gray-500 mt-1">
                  Set type and assign to staff member
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Influencer Info */}
            <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-gray-100">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium text-lg">
                  {influencer.display_name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {influencer.display_name}
                </h3>
                {influencer.email && (
                  <p className="text-sm text-gray-500">{influencer.email}</p>
                )}
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mt-1">
                  Pending Assignment
                </span>
              </div>
            </div>

            <form ref={formRef} id="assign-influencer-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div 
                  className="bg-red-50 border border-red-200 rounded-lg p-3"
                  role="alert"
                  aria-live="polite"
                >
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Influencer Type */}
              <div>
                <label 
                  htmlFor="influencer-type"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Influencer Type *
                </label>
                <select
                  id="influencer-type"
                  ref={firstInputRef}
                  value={formData.influencer_type}
                  onChange={(e) => setFormData({
                    ...formData,
                    influencer_type: e.target.value as 'SIGNED' | 'PARTNERED' | 'AGENCY_PARTNER'
                    // Preserve agency_name - don't clear it when switching types
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-required="true"
                  aria-invalid={!formData.influencer_type}
                >
                  <option value="SIGNED">Signed</option>
                  <option value="PARTNERED">Partnered</option>
                  <option value="AGENCY_PARTNER">Agency Partner</option>
                </select>
              </div>

              {/* Content Type */}
              <div>
                <label 
                  htmlFor="content-type"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Content Type *
                </label>
                <select
                  id="content-type"
                  value={formData.content_type}
                  onChange={(e) => setFormData({
                    ...formData,
                    content_type: e.target.value as 'STANDARD' | 'UGC' | 'SEEDING'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-required="true"
                  aria-invalid={!formData.content_type}
                >
                  <option value="STANDARD">Standard</option>
                  <option value="UGC">UGC</option>
                  <option value="SEEDING">Seeding</option>
                </select>
              </div>

              {/* Agency Name (only for Agency Partners) */}
              {formData.influencer_type === 'AGENCY_PARTNER' && (
                <div>
                  <label 
                    htmlFor="agency-name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Agency Name *
                  </label>
                  <input
                    id="agency-name"
                    type="text"
                    value={formData.agency_name}
                    onChange={(e) => setFormData({
                      ...formData,
                      agency_name: e.target.value
                    })}
                    placeholder="Enter agency or company name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-required="true"
                    aria-invalid={formData.influencer_type === 'AGENCY_PARTNER' && !formData.agency_name?.trim()}
                  />
                </div>
              )}

            </form>
          </div>

          {/* Footer with border-top for visual separation */}
          <div className="border-t border-gray-100 px-8 py-6">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                aria-label="Cancel assignment"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="assign-influencer-form"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
                aria-label={isLoading ? 'Assigning influencer' : 'Assign influencer'}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                    <span>Assigning...</span>
                  </>
                ) : (
                  <span>Assign Influencer</span>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
