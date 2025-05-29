'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, DollarSign, Users, Target, Package, Play, Pause, CheckCircle, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface EditCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  campaign: any
  onSave: (campaignData: any) => void
}

export default function EditCampaignModal({
  isOpen,
  onClose,
  campaign,
  onSave
}: EditCampaignModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: '',
    start_date: '',
    end_date: '',
    status: 'ACTIVE',
    target_niches: [] as string[],
    target_platforms: [] as string[]
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [activeSection, setActiveSection] = useState<'basic' | 'targeting' | 'advanced'>('basic')

  // Initialize form with campaign data
  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name || '',
        description: campaign.description || '',
        budget: campaign.budget?.toString() || '',
        start_date: campaign.start_date ? new Date(campaign.start_date).toISOString().split('T')[0] : '',
        end_date: campaign.end_date ? new Date(campaign.end_date).toISOString().split('T')[0] : '',
        status: campaign.status || 'ACTIVE',
        target_niches: campaign.target_niches || [],
        target_platforms: campaign.target_platforms || []
      })
    }
  }, [campaign])

  const availableNiches = [
    'Beauty', 'Fashion', 'Fitness', 'Tech', 'Gaming', 'Travel', 'Food', 
    'Lifestyle', 'Parenting', 'Business', 'Health', 'Education', 'Arts', 'Music'
  ]

  const availablePlatforms = [
    'INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'TWITTER', 'LINKEDIN', 'PINTEREST', 'FACEBOOK'
  ]

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active', color: 'green', icon: <Play size={16} /> },
    { value: 'PAUSED', label: 'Paused', color: 'yellow', icon: <Pause size={16} /> },
    { value: 'COMPLETED', label: 'Completed', color: 'blue', icon: <CheckCircle size={16} /> },
    { value: 'CANCELLED', label: 'Cancelled', color: 'red', icon: <X size={16} /> }
  ]

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleNicheToggle = (niche: string) => {
    const newNiches = formData.target_niches.includes(niche)
      ? formData.target_niches.filter(n => n !== niche)
      : [...formData.target_niches, niche]
    handleInputChange('target_niches', newNiches)
  }

  const handlePlatformToggle = (platform: string) => {
    const newPlatforms = formData.target_platforms.includes(platform)
      ? formData.target_platforms.filter(p => p !== platform)
      : [...formData.target_platforms, platform]
    handleInputChange('target_platforms', newPlatforms)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.budget || isNaN(Number(formData.budget)) || Number(formData.budget) <= 0) {
      newErrors.budget = 'Valid budget amount is required'
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required'
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required'
    }

    if (formData.start_date && formData.end_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
      newErrors.end_date = 'End date must be after start date'
    }

    if (formData.target_niches.length === 0) {
      newErrors.target_niches = 'At least one target niche is required'
    }

    if (formData.target_platforms.length === 0) {
      newErrors.target_platforms = 'At least one target platform is required'
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
      const updatedCampaign = {
        ...campaign,
        ...formData,
        budget: Number(formData.budget)
      }
      
      await onSave(updatedCampaign)
      onClose()
    } catch (error) {
      console.error('Error saving campaign:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    // Reset form to original data
    if (campaign) {
      setFormData({
        name: campaign.name || '',
        description: campaign.description || '',
        budget: campaign.budget?.toString() || '',
        start_date: campaign.start_date ? new Date(campaign.start_date).toISOString().split('T')[0] : '',
        end_date: campaign.end_date ? new Date(campaign.end_date).toISOString().split('T')[0] : '',
        status: campaign.status || 'ACTIVE',
        target_niches: campaign.target_niches || [],
        target_platforms: campaign.target_platforms || []
      })
    }
    setErrors({})
    onClose()
  }

  if (!campaign) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleCancel}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Edit Campaign</h2>
                    <p className="text-sm text-gray-600 mt-1">Update campaign settings and configuration</p>
                  </div>
                  <button
                    onClick={handleCancel}
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>

                {/* Section Navigation */}
                <div className="mt-6 border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    {[
                      { id: 'basic', label: 'Basic Info' },
                      { id: 'targeting', label: 'Targeting' },
                      { id: 'advanced', label: 'Advanced' }
                    ].map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id as any)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeSection === section.id
                            ? 'border-black text-black'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {section.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Basic Info Section */}
                {activeSection === 'basic' && (
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
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${
                          errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Describe your campaign goals and requirements"
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle size={14} className="mr-1" />
                          {errors.description}
                        </p>
                      )}
                    </div>

                    {/* Budget */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Campaign Budget *
                      </label>
                      <div className="relative">
                        <DollarSign size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          value={formData.budget}
                          onChange={(e) => handleInputChange('budget', e.target.value)}
                          className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                            errors.budget ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="0"
                          min="0"
                          step="100"
                        />
                      </div>
                      {errors.budget && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle size={14} className="mr-1" />
                          {errors.budget}
                        </p>
                      )}
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date *
                        </label>
                        <div className="relative">
                          <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="date"
                            value={formData.start_date}
                            onChange={(e) => handleInputChange('start_date', e.target.value)}
                            className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                              errors.start_date ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {errors.start_date && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle size={14} className="mr-1" />
                            {errors.start_date}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date *
                        </label>
                        <div className="relative">
                          <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="date"
                            value={formData.end_date}
                            onChange={(e) => handleInputChange('end_date', e.target.value)}
                            className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                              errors.end_date ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {errors.end_date && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle size={14} className="mr-1" />
                            {errors.end_date}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Targeting Section */}
                {activeSection === 'targeting' && (
                  <div className="space-y-8">
                    {/* Target Niches */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4 flex items-center">
                        <Target size={16} className="mr-2" />
                        Target Niches *
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {availableNiches.map((niche) => (
                          <button
                            key={niche}
                            type="button"
                            onClick={() => handleNicheToggle(niche)}
                            className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
                              formData.target_niches.includes(niche)
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            {niche}
                          </button>
                        ))}
                      </div>
                      {errors.target_niches && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle size={14} className="mr-1" />
                          {errors.target_niches}
                        </p>
                      )}
                    </div>

                    {/* Target Platforms */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4 flex items-center">
                        <Package size={16} className="mr-2" />
                        Target Platforms *
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {availablePlatforms.map((platform) => (
                          <button
                            key={platform}
                            type="button"
                            onClick={() => handlePlatformToggle(platform)}
                            className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
                              formData.target_platforms.includes(platform)
                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            {platform}
                          </button>
                        ))}
                      </div>
                      {errors.target_platforms && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle size={14} className="mr-1" />
                          {errors.target_platforms}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Advanced Section */}
                {activeSection === 'advanced' && (
                  <div className="space-y-6">
                    {/* Campaign Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Campaign Status
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {statusOptions.map((status) => (
                          <button
                            key={status.value}
                            type="button"
                            onClick={() => handleInputChange('status', status.value)}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                              formData.status === status.value
                                ? `border-${status.color}-500 bg-${status.color}-50 text-${status.color}-700`
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            {status.icon}
                            <span className="text-sm font-medium">{status.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Campaign Statistics (Read-only) */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Statistics</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{campaign.assigned_influencers || 0}</div>
                          <div className="text-sm text-gray-600">Influencers</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">${(campaign.spent || 0).toLocaleString()}</div>
                          <div className="text-sm text-gray-600">Spent</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{(campaign.actual_reach || 0).toLocaleString()}</div>
                          <div className="text-sm text-gray-600">Reach</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{campaign.engagement_rate || 0}%</div>
                          <div className="text-sm text-gray-600">Engagement</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      <span>Save Changes</span>
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