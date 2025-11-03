'use client'

import React, { useState, useEffect } from 'react'
import { X, Send, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface RequestQuoteModalProps {
  isOpen: boolean
  onClose: () => void
  selectedInfluencers?: any[]
}

export default function RequestQuoteModal({
  isOpen,
  onClose,
  selectedInfluencers = []
}: RequestQuoteModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [staffMembers, setStaffMembers] = useState<any[]>([])
  const [loadingStaff, setLoadingStaff] = useState(false)
  const [formData, setFormData] = useState({
    campaign_name: '',
    description: '',
    target_demographics: '',
    budget_range: '',
    campaign_duration: '',
    deliverables: [] as string[],
    target_niches: [] as string[],
    target_platforms: [] as string[],
    assigned_staff_id: '', // New field for staff assignment
  })

  const deliverableOptions = [
    'Instagram Post',
    'Instagram Story',
    'Instagram Reel',
    'TikTok Video',
    'YouTube Video',
    'YouTube Short',
    'Twitter Post',
    'Facebook Post',
  ]

  const platformOptions = [
    'Instagram',
    'TikTok',
    'YouTube',
    'Twitter',
    'Facebook',
    'LinkedIn',
  ]

  const nicheOptions = [
    'Fashion',
    'Beauty',
    'Fitness',
    'Gaming',
    'Lifestyle',
    'Technology',
    'Food',
    'Travel',
    'Business',
    'Entertainment',
  ]

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
      }
    } catch (error) {
      console.error('Error loading staff members:', error)
    } finally {
      setLoadingStaff(false)
    }
  }

  const handleDeliverableToggle = (deliverable: string) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.includes(deliverable)
        ? prev.deliverables.filter(d => d !== deliverable)
        : [...prev.deliverables, deliverable]
    }))
  }

  const handlePlatformToggle = (_platform: string) => {
    setFormData(prev => ({
      ...prev,
      target_platforms: prev.target_platforms.includes(platform)
        ? prev.target_platforms.filter(p => p !== platform)
        : [...prev.target_platforms, platform]
    }))
  }

  const handleNicheToggle = (niche: string) => {
    setFormData(prev => ({
      ...prev,
      target_niches: prev.target_niches.includes(niche)
        ? prev.target_niches.filter(n => n !== niche)
        : [...prev.target_niches, niche]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.campaign_name.trim()) {
      setError('Campaign name is required')
      return
    }

    if (!formData.description.trim()) {
      setError('Campaign description is required')
      return
    }

    if (selectedInfluencers.length === 0) {
      setError('Please select at least one influencer')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/brand/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_name: formData.campaign_name,
          description: formData.description,
          target_demographics: formData.target_demographics,
          budget_range: formData.budget_range,
          campaign_duration: formData.campaign_duration,
          deliverables: formData.deliverables,
          target_niches: formData.target_niches,
          target_platforms: formData.target_platforms,
          influencer_count: selectedInfluencers.length,
          selected_influencers: selectedInfluencers.map(inf => inf.id || inf.influencerId),
          assigned_staff_id: formData.assigned_staff_id || null
        })
      })

      if (response.ok) {
        alert('Quotation request submitted successfully! Our team will review and get back to you.')
        onClose()
        // Reset form
        setFormData({
          campaign_name: '',
          description: '',
          target_demographics: '',
          budget_range: '',
          campaign_duration: '',
          deliverables: [],
          target_niches: [],
          target_platforms: [],
          assigned_staff_id: '',
        })
      } else {
        const result = await response.json()
        setError(result.error || 'Failed to submit quotation request')
      }
    } catch (error) {
      console.error('Error submitting quotation:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden flex flex-col max-h-[calc(100vh-4rem)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Request Quote</h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedInfluencers.length} influencer{selectedInfluencers.length !== 1 ? 's' : ''} selected
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Campaign Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.campaign_name}
                onChange={(e) => setFormData(prev => ({ ...prev, campaign_name: e.target.value }))}
                placeholder="e.g., Summer Product Launch"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your campaign goals, messaging, and key requirements..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Target Demographics */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience
              </label>
              <input
                type="text"
                value={formData.target_demographics}
                onChange={(e) => setFormData(prev => ({ ...prev, target_demographics: e.target.value }))}
                placeholder="e.g., Women 18-34, fitness enthusiasts"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Budget Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Range
              </label>
              <input
                type="text"
                value={formData.budget_range}
                onChange={(e) => setFormData(prev => ({ ...prev, budget_range: e.target.value }))}
                placeholder="e.g., $5,000 - $10,000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Timeline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Duration
              </label>
              <input
                type="text"
                value={formData.campaign_duration}
                onChange={(e) => setFormData(prev => ({ ...prev, campaign_duration: e.target.value }))}
                placeholder="e.g., 2 weeks, 1 month"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Staff Assignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Team Member
              </label>
              <select
                value={formData.assigned_staff_id}
                onChange={(e) => setFormData(prev => ({ ...prev, assigned_staff_id: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loadingStaff}
              >
                <option value="">Auto-assign to your account manager</option>
                {staffMembers.map(staff => (
                  <option key={staff.id} value={staff.id}>
                    {staff.fullName} ({staff.role})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {loadingStaff ? 'Loading team members...' : 
                 formData.assigned_staff_id ? 'Quote will be assigned to selected team member' :
                 'Quote will be automatically assigned to your account manager (if available)'}
              </p>
            </div>

            {/* Deliverables */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Deliverables
              </label>
              <div className="grid grid-cols-2 gap-3">
                {deliverableOptions.map(deliverable => (
                  <button
                    key={deliverable}
                    type="button"
                    onClick={() => handleDeliverableToggle(deliverable)}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                      formData.deliverables.includes(deliverable)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {deliverable}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Platforms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Target Platforms
              </label>
              <div className="grid grid-cols-3 gap-3">
                {platformOptions.map(platform => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => handlePlatformToggle(platform)}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                      formData.target_platforms.includes(platform)
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Niches */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Target Niches
              </label>
              <div className="grid grid-cols-2 gap-3">
                {nicheOptions.map(niche => (
                  <button
                    key={niche}
                    type="button"
                    onClick={() => handleNicheToggle(niche)}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                      formData.target_niches.includes(niche)
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {niche}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-white flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

