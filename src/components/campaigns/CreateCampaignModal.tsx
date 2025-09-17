'use client'

import { useState } from 'react'
import { X, Calendar, DollarSign, Users, Target, Package, AlertCircle, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CreateCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (campaignData: any) => void
}

export default function CreateCampaignModal({
  isOpen,
  onClose,
  onSave
}: CreateCampaignModalProps) {
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
  const [activeSection, setActiveSection] = useState<'basic' | 'requirements' | 'deliverables'>('basic')

  const availablePlatforms = [
    'Instagram', 'TikTok', 'YouTube', 'Twitter', 'LinkedIn', 'Facebook'
  ]

  const commonDeliverables = [
    'Instagram post', 'Instagram story', 'TikTok video', 'YouTube video',
    'YouTube Short', 'Twitter post', 'LinkedIn post', 'Blog post'
  ]

  const commonGoals = [
    'Brand awareness', 'Product launch', 'Lead generation', 'Sales conversion',
    'Community engagement', 'User-generated content', 'Event promotion'
  ]

  const handleInputChange = (field: string, value: string | string[] | object) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
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

  const handlePlatformToggle = (platform: string) => {
    const platforms = formData.requirements.platforms.includes(platform)
      ? formData.requirements.platforms.filter(p => p !== platform)
      : [...formData.requirements.platforms, platform]
    handleInputChange('requirements.platforms', platforms)
  }

  const handleDeliverableToggle = (deliverable: string) => {
    const deliverables = formData.deliverables.includes(deliverable)
      ? formData.deliverables.filter(d => d !== deliverable)
      : [...formData.deliverables, deliverable]
    handleInputChange('deliverables', deliverables)
  }

  const handleGoalToggle = (goal: string) => {
    const goals = formData.goals.includes(goal)
      ? formData.goals.filter(g => g !== goal)
      : [...formData.goals, goal]
    handleInputChange('goals', goals)
  }

  const getValidationErrors = () => {
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

    if (formData.requirements.platforms.length === 0) {
      newErrors['requirements.platforms'] = 'Please select at least one platform in the Requirements section'
    }

    if (formData.deliverables.length === 0) {
      newErrors.deliverables = 'Please select at least one deliverable in the Requirements section'
    }

    if (formData.goals.length === 0) {
      newErrors.goals = 'Please select at least one campaign goal in the Requirements section'
    }

    return newErrors
  }

  const validateForm = () => {
    const newErrors = getValidationErrors()
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    const validationErrors = getValidationErrors()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      // Switch to the section with the first error
      const errorKeys = Object.keys(validationErrors)
      if (errorKeys.some(key => key.startsWith('requirements.') || key === 'deliverables' || key === 'goals')) {
        setActiveSection('requirements')
      } else if (errorKeys.some(key => key.startsWith('timeline.'))) {
        setActiveSection('basic')
      } else {
        setActiveSection('basic')
      }
      return
    }

    setIsLoading(true)
    try {
      const campaignData = {
        name: formData.name,
        brand: formData.brand,
        description: formData.description,
        status: 'DRAFT',
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
        deliverables: formData.deliverables
      }
      
      await onSave(campaignData)
      
      // Reset form
      setFormData({
        name: '',
        brand: '',
        description: '',
        budget: { total: '', perInfluencer: '' },
        timeline: { startDate: '', endDate: '' },
        requirements: {
          minFollowers: '1000',
          maxFollowers: '1000000',
          minEngagement: '2.0',
          platforms: [],
          contentGuidelines: ''
        },
        deliverables: [],
        goals: []
      })
      setActiveSection('basic')
      onClose()
    } catch (error) {
      console.error('Error creating campaign:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    // Just close the modal, keep the form data in case user wants to continue later
    onClose()
  }

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
                  <h2 className="text-2xl font-bold text-gray-900">Create New Campaign</h2>
                  <p className="text-gray-600 mt-1">Set up a new influencer marketing campaign</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={24} className="text-gray-500" />
                </button>
              </div>

              {/* Section Tabs */}
              <div className="px-8 py-4 border-b border-gray-200">
                <div className="flex space-x-1">
                  {[
                    { key: 'basic', label: 'Basic Info', icon: Package },
                    { key: 'requirements', label: 'Requirements', icon: Target },
                    { key: 'deliverables', label: 'Deliverables', icon: CheckCircle }
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setActiveSection(key as any)}
                      className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium transition-colors ${
                        activeSection === key
                          ? 'bg-black text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Content */}
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

                    {/* Brand Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand Name *
                      </label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => handleInputChange('brand', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                          errors.brand ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Enter brand name"
                      />
                      {errors.brand && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle size={14} className="mr-1" />
                          {errors.brand}
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

                    {/* Goals */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Campaign Goals
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {commonGoals.map((goal) => (
                          <button
                            key={goal}
                            onClick={() => handleGoalToggle(goal)}
                            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                              formData.goals.includes(goal)
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                            }`}
                          >
                            {goal}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Requirements Section */}
                {activeSection === 'requirements' && (
                  <div className="space-y-6">
                    {/* Platforms */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Target Platforms *
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {availablePlatforms.map((platform) => (
                          <button
                            key={platform}
                            onClick={() => handlePlatformToggle(platform)}
                            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                              formData.requirements.platforms.includes(platform)
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                            }`}
                          >
                            {platform}
                          </button>
                        ))}
                      </div>
                      {errors['requirements.platforms'] && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle size={14} className="mr-1" />
                          {errors['requirements.platforms']}
                        </p>
                      )}
                    </div>

                    {/* Follower Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Min Followers
                        </label>
                        <input
                          type="number"
                          value={formData.requirements.minFollowers}
                          onChange={(e) => handleInputChange('requirements.minFollowers', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                          placeholder="1000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Followers
                        </label>
                        <input
                          type="number"
                          value={formData.requirements.maxFollowers}
                          onChange={(e) => handleInputChange('requirements.maxFollowers', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                          placeholder="1000000"
                        />
                      </div>
                    </div>

                    {/* Engagement Rate */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Engagement Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.requirements.minEngagement}
                        onChange={(e) => handleInputChange('requirements.minEngagement', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        placeholder="2.0"
                      />
                    </div>

                    {/* Content Guidelines */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content Guidelines
                      </label>
                      <textarea
                        value={formData.requirements.contentGuidelines}
                        onChange={(e) => handleInputChange('requirements.contentGuidelines', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        placeholder="Specify content guidelines, brand voice, dos and don'ts..."
                      />
                    </div>
                  </div>
                )}

                {/* Deliverables Section */}
                {activeSection === 'deliverables' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Expected Deliverables *
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {commonDeliverables.map((deliverable) => (
                          <button
                            key={deliverable}
                            onClick={() => handleDeliverableToggle(deliverable)}
                            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                              formData.deliverables.includes(deliverable)
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                            }`}
                          >
                            {deliverable}
                          </button>
                        ))}
                      </div>
                      {errors.deliverables && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle size={14} className="mr-1" />
                          {errors.deliverables}
                        </p>
                      )}
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
                
                <div className="flex space-x-3">
                  {activeSection !== 'basic' && (
                    <button
                      onClick={() => {
                        const sections = ['basic', 'requirements', 'deliverables']
                        const currentIndex = sections.indexOf(activeSection)
                        setActiveSection(sections[currentIndex - 1] as any)
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium"
                    >
                      Previous
                    </button>
                  )}
                  
                  {activeSection !== 'deliverables' ? (
                    <button
                      onClick={() => {
                        const sections = ['basic', 'requirements', 'deliverables']
                        const currentIndex = sections.indexOf(activeSection)
                        setActiveSection(sections[currentIndex + 1] as any)
                      }}
                      className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} />
                          <span>Create Campaign</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 