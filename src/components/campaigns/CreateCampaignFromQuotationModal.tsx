'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, DollarSign, Users, Target, Package, AlertCircle, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CreateCampaignFromQuotationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (campaignData: any) => void
  quotation: any
}

export default function CreateCampaignFromQuotationModal({
  isOpen,
  onClose,
  onSave,
  quotation
}: CreateCampaignFromQuotationModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    description: '',
    budget: {
      total: '',
      perInfluencer: ''
    },
    timeline: {
      startDate: '',
      endDate: ''
    },
    requirements: {
      minFollowers: '1000',
      maxFollowers: '1000000',
      minEngagement: '2.0',
      platforms: [] as string[],
      contentGuidelines: ''
    },
    deliverables: [] as string[],
    goals: [] as string[]
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Pre-populate form with quotation data when quotation changes
  useEffect(() => {
    if (quotation) {
      const totalBudget = quotation.total_quote ? parseFloat(quotation.total_quote.replace('$', '').replace(',', '')) : 0
      const influencerCount = quotation.influencers?.length || 1
      const perInfluencerBudget = influencerCount > 0 ? (totalBudget / influencerCount).toFixed(0) : '0'

      setFormData({
        name: quotation.campaign_name || '',
        brand: quotation.brand_name || '',
        description: quotation.description || '',
        budget: {
          total: totalBudget.toString(),
          perInfluencer: perInfluencerBudget
        },
        timeline: {
          startDate: '',
          endDate: ''
        },
        requirements: {
          minFollowers: '1000',
          maxFollowers: '1000000', 
          minEngagement: '2.0',
          platforms: quotation.deliverables?.includes('Instagram') ? ['Instagram'] : 
                    quotation.deliverables?.includes('TikTok') ? ['TikTok'] :
                    quotation.deliverables?.includes('YouTube') ? ['YouTube'] : [],
          contentGuidelines: quotation.notes || ''
        },
        deliverables: quotation.deliverables || [],
        goals: ['Brand awareness'] // Default goal
      })
    }
  }, [quotation])

  const handleInputChange = (field: string, value: string | string[] | object) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent as string]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child as string]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required'
    }

    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand name is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.budget.total || isNaN(Number(formData.budget.total)) || Number(formData.budget.total) <= 0) {
      newErrors['budget.total'] = 'Valid total budget is required'
    }

    if (!formData.timeline.startDate) {
      newErrors['timeline.startDate'] = 'Start date is required'
    }

    if (!formData.timeline.endDate) {
      newErrors['timeline.endDate'] = 'End date is required'
    }

    if (formData.timeline.startDate && formData.timeline.endDate && 
        new Date(formData.timeline.endDate) <= new Date(formData.timeline.startDate)) {
      newErrors['timeline.endDate'] = 'End date must be after start date'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      const campaignData = {
        name: formData.name,
        brand: formData.brand,
        description: formData.description,
        status: 'active', // Start as active since quotation is already approved
        goals: formData.goals,
        timeline: {
          startDate: formData.timeline.startDate,
          endDate: formData.timeline.endDate,
          applicationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          contentDeadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        budget: {
          total: Number(formData.budget.total),
          perInfluencer: Number(formData.budget.perInfluencer) || 0
        },
        requirements: {
          minFollowers: Number(formData.requirements.minFollowers),
          maxFollowers: Number(formData.requirements.maxFollowers),
          minEngagement: Number(formData.requirements.minEngagement),
          platforms: formData.requirements.platforms,
          demographics: {},
          contentGuidelines: formData.requirements.contentGuidelines
        },
        deliverables: formData.deliverables,
        // Add quotation reference
        quotation_id: quotation?.id,
        selected_influencers: quotation?.influencers || [],
        auto_created_from_quotation: true
      }
      
      await onSave(campaignData)
      onClose()
    } catch (error) {
      console.error('Error creating campaign:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    onClose()
  }

  if (!quotation) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Create Campaign from Quotation</h2>
                  <p className="text-gray-600 mt-1">
                    Convert quotation "{quotation.campaign_name}" to an active campaign
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={24} className="text-gray-500" />
                </button>
              </div>

              {/* Quotation Summary */}
              <div className="px-8 py-4 bg-blue-50 border-b border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Package size={16} className="text-blue-600" />
                    <div>
                      <div className="font-medium text-blue-900">Brand</div>
                      <div className="text-blue-700">{quotation.brand_name}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign size={16} className="text-blue-600" />
                    <div>
                      <div className="font-medium text-blue-900">Budget</div>
                      <div className="text-blue-700">${quotation.total_quote || 'Not set'}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users size={16} className="text-blue-600" />
                    <div>
                      <div className="font-medium text-blue-900">Influencers</div>
                      <div className="text-blue-700">{quotation.influencers?.length || 0} selected</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target size={16} className="text-blue-600" />
                    <div>
                      <div className="font-medium text-blue-900">Duration</div>
                      <div className="text-blue-700">{quotation.campaign_duration || 'Not set'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="space-y-6">
                  {/* Campaign Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter campaign name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Describe the campaign objectives and key messages"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors.description}
                      </p>
                    )}
                  </div>

                  {/* Budget */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Budget (£) *
                      </label>
                      <input
                        type="number"
                        value={formData.budget.total}
                        onChange={(e) => handleInputChange('budget.total', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                          errors['budget.total'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="10000"
                      />
                      {errors['budget.total'] && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle size={14} className="mr-1" />
                          {errors['budget.total']}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Per Influencer Budget (£)
                      </label>
                      <input
                        type="number"
                        value={formData.budget.perInfluencer}
                        onChange={(e) => handleInputChange('budget.perInfluencer', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        placeholder="1500"
                      />
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={formData.timeline.startDate}
                        onChange={(e) => handleInputChange('timeline.startDate', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                          errors['timeline.startDate'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {errors['timeline.startDate'] && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle size={14} className="mr-1" />
                          {errors['timeline.startDate']}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        value={formData.timeline.endDate}
                        onChange={(e) => handleInputChange('timeline.endDate', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                          errors['timeline.endDate'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {errors['timeline.endDate'] && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle size={14} className="mr-1" />
                          {errors['timeline.endDate']}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Content Guidelines */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content Guidelines
                    </label>
                    <textarea
                      value={formData.requirements.contentGuidelines}
                      onChange={(e) => handleInputChange('requirements.contentGuidelines', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      placeholder="Specify content guidelines, brand voice, dos and don'ts..."
                    />
                  </div>

                  {/* Selected Influencers Preview */}
                  {quotation.influencers && quotation.influencers.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Selected Influencers ({quotation.influencers.length})
                      </label>
                      <div className="bg-gray-50 rounded-xl p-4 max-h-40 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {quotation.influencers.map((influencer: any, index: number) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="font-medium">{influencer.name}</span>
                              <span className="text-gray-500">({influencer.followers})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium"
                >
                  Exit
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Creating Campaign...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      <span>Create Campaign</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 