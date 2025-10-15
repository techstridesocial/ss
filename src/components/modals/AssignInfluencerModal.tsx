import React, { useState, useEffect } from 'react'
import { X, User, Tag, FileText, Users } from 'lucide-react'
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
  assigned_to: string | null
  agency_name?: string
  notes?: string
  labels?: string[]
}

interface StaffMember {
  id: string
  email: string
  first_name?: string
  last_name?: string
}

const AVAILABLE_LABELS = [
  'High Priority',
  'Top Performer', 
  'New Contact',
  'Active Campaign',
  'Follow Up',
  'UGC Creator',
  'Brand Ambassador',
  'Micro Influencer',
  'Macro Influencer',
  'Celebrity'
]

export default function AssignInfluencerModal({ 
  isOpen, 
  onClose, 
  influencer,
  onAssign
}: AssignInfluencerModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [loadingStaff, setLoadingStaff] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState<AssignmentData>({
    influencer_type: 'SIGNED',
    content_type: 'STANDARD',
    assigned_to: null,
    agency_name: '',
    notes: '',
    labels: []
  })

  // Load staff members when modal opens
  useEffect(() => {
    if (isOpen) {
      loadStaffMembers()
    }
  }, [isOpen])

  const loadStaffMembers = async () => {
    setLoadingStaff(true)
    try {
      const response = await fetch('/api/staff/members')
      if (response.ok) {
        const result = await response.json()
        setStaffMembers(result.data || [])
      } else {
        console.error('Failed to load staff members')
        setError('Failed to load staff members')
      }
    } catch (error) {
      console.error('Error loading staff members:', error)
      setError('Error loading staff members')
    } finally {
      setLoadingStaff(false)
    }
  }

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
      console.error('Error assigning influencer:', error)
      setError(error instanceof Error ? error.message : 'Failed to assign influencer')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleLabel = (label: string) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels?.includes(label)
        ? prev.labels.filter(l => l !== label)
        : [...(prev.labels || []), label]
    }))
  }

  if (!isOpen || !influencer) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Assign Influencer
                  </h2>
                  <p className="text-orange-100 text-sm">
                    Set type and assign to staff member
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 max-h-[calc(90vh-140px)] overflow-y-auto">
            {/* Influencer Info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {influencer.display_name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {influencer.display_name}
                  </h3>
                  {influencer.email && (
                    <p className="text-sm text-gray-600">{influencer.email}</p>
                  )}
                  <p className="text-xs text-orange-600 font-medium">
                    Pending Assignment
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Influencer Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="h-4 w-4 mr-2 text-orange-500" />
                    Influencer Type *
                  </label>
                  <select
                    value={formData.influencer_type}
                    onChange={(e) => setFormData({
                      ...formData,
                      influencer_type: e.target.value as 'SIGNED' | 'PARTNERED' | 'AGENCY_PARTNER',
                      agency_name: e.target.value === 'AGENCY_PARTNER' ? formData.agency_name : ''
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="SIGNED">Signed</option>
                    <option value="PARTNERED">Partnered</option>
                    <option value="AGENCY_PARTNER">Agency Partner</option>
                  </select>
                </div>

                {/* Content Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-orange-500" />
                    Content Type *
                  </label>
                  <select
                    value={formData.content_type}
                    onChange={(e) => setFormData({
                      ...formData,
                      content_type: e.target.value as 'STANDARD' | 'UGC' | 'SEEDING'
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="UGC">UGC</option>
                    <option value="SEEDING">Seeding</option>
                  </select>
                </div>
              </div>

              {/* Agency Name (only for Agency Partners) */}
              {formData.influencer_type === 'AGENCY_PARTNER' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Agency Name *
                  </label>
                  <input
                    type="text"
                    value={formData.agency_name}
                    onChange={(e) => setFormData({
                      ...formData,
                      agency_name: e.target.value
                    })}
                    placeholder="Enter agency or company name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              )}

              {/* Assigned To */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Users className="h-4 w-4 mr-2 text-orange-500" />
                  Assign To Staff Member
                </label>
                {loadingStaff ? (
                  <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50">
                    <p className="text-gray-500 text-sm">Loading staff members...</p>
                  </div>
                ) : (
                  <select
                    value={formData.assigned_to || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      assigned_to: e.target.value || null
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Unassigned</option>
                    {staffMembers.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.first_name && staff.last_name 
                          ? `${staff.first_name} ${staff.last_name} (${staff.email})`
                          : staff.email
                        }
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Labels */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Tag className="h-4 w-4 mr-2 text-orange-500" />
                  Labels ({formData.labels?.length || 0} selected)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {AVAILABLE_LABELS.map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toggleLabel(label)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        formData.labels?.includes(label)
                          ? 'bg-orange-100 border-orange-300 text-orange-800'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({
                    ...formData,
                    notes: e.target.value
                  })}
                  placeholder="Add any notes about this assignment..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Assigning...</span>
                </>
              ) : (
                <span>Assign Influencer</span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
