'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, DollarSign, Users, Target, Package, AlertCircle, CheckCircle, List, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHeartedInfluencers, Shortlist, HeartedInfluencer } from '../../lib/context/HeartedInfluencersContext'

interface CreateCampaignFromShortlistsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (campaignData: any) => void
  preSelectedShortlists?: string[] // Optional pre-selected shortlists
}

export default function CreateCampaignFromShortlistsModal({
  isOpen,
  onClose,
  onSave,
  preSelectedShortlists = []
}: CreateCampaignFromShortlistsModalProps) {
  const { shortlists } = useHeartedInfluencers()
  
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
    goals: [] as string[],
    selectedShortlists: preSelectedShortlists
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [activeSection, setActiveSection] = useState<'basic' | 'shortlists' | 'requirements' | 'deliverables'>('basic')

  // Reset selected shortlists when preSelectedShortlists change
  useEffect(() => {
    if (preSelectedShortlists.length > 0) {
      setFormData(prev => ({
        ...prev,
        selectedShortlists: preSelectedShortlists
      }))
    }
  }, [preSelectedShortlists])

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

  const handleShortlistToggle = (shortlistId: string) => {
    const selectedShortlists = formData.selectedShortlists.includes(shortlistId)
      ? formData.selectedShortlists.filter(id => id !== shortlistId)
      : [...formData.selectedShortlists, shortlistId]
    handleInputChange('selectedShortlists', selectedShortlists)
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

  // Get selected influencers from shortlists
  const getSelectedInfluencers = (): HeartedInfluencer[] => {
    const selectedInfluencers: HeartedInfluencer[] = []
    const influencerIds = new Set<string>()

    formData.selectedShortlists.forEach(shortlistId => {
      const shortlist = shortlists.find(s => s.id === shortlistId)
      if (shortlist) {
        shortlist.influencers.forEach(influencer => {
          if (!influencerIds.has(influencer.id)) {
            selectedInfluencers.push(influencer)
            influencerIds.add(influencer.id)
          }
        })
      }
    })

    return selectedInfluencers
  }

  const selectedInfluencers = getSelectedInfluencers()

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

    if (formData.selectedShortlists.length === 0) {
      newErrors.selectedShortlists = 'At least one shortlist must be selected'
    }

    if (formData.requirements.platforms.length === 0) {
      newErrors['requirements.platforms'] = 'At least one platform is required'
    }

    if (formData.deliverables.length === 0) {
      newErrors.deliverables = 'At least one deliverable is required'
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
        deliverables: formData.deliverables,
        selectedShortlists: formData.selectedShortlists,
        selectedInfluencers: selectedInfluencers,
        createdFromShortlists: true
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
        goals: [],
        selectedShortlists: []
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
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create Campaign from Shortlists</h2>
              <p className="text-sm text-gray-500 mt-1">
                Create a new campaign using influencers from your shortlists
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Progress Pills */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <div className="flex space-x-4">
              {[
                { key: 'basic', label: 'Basic Info', icon: Target },
                { key: 'shortlists', label: 'Shortlists', icon: List },
                { key: 'requirements', label: 'Requirements', icon: Users },
                { key: 'deliverables', label: 'Deliverables', icon: Package }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveSection(key as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeSection === key
                      ? 'bg-black text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            {/* Basic Info Section */}
            {activeSection === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Campaign Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                        errors.name ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="Enter campaign name"
                    />
                    {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Brand Name *
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                        errors.brand ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="Enter brand name"
                    />
                    {errors.brand && <p className="text-red-600 text-sm mt-1">{errors.brand}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Campaign Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none ${
                      errors.description ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="Describe your campaign goals, messaging, and expectations..."
                  />
                  {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Total Budget ($) *
                    </label>
                    <input
                      type="number"
                      value={formData.budget.total}
                      onChange={(e) => handleInputChange('budget.total', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                        errors['budget.total'] ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="10000"
                    />
                    {errors['budget.total'] && <p className="text-red-600 text-sm mt-1">{errors['budget.total']}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Budget per Influencer ($)
                    </label>
                    <input
                      type="number"
                      value={formData.budget.perInfluencer}
                      onChange={(e) => handleInputChange('budget.perInfluencer', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                      placeholder="500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.timeline.startDate}
                      onChange={(e) => handleInputChange('timeline.startDate', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                        errors['timeline.startDate'] ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                    {errors['timeline.startDate'] && <p className="text-red-600 text-sm mt-1">{errors['timeline.startDate']}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={formData.timeline.endDate}
                      onChange={(e) => handleInputChange('timeline.endDate', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                        errors['timeline.endDate'] ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                    {errors['timeline.endDate'] && <p className="text-red-600 text-sm mt-1">{errors['timeline.endDate']}</p>}
                  </div>
                </div>

                {/* Campaign Goals */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Campaign Goals
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {commonGoals.map(goal => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => handleGoalToggle(goal)}
                        className={`px-4 py-2 text-sm rounded-xl border-2 transition-all ${
                          formData.goals.includes(goal)
                            ? 'border-black bg-black text-white'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Shortlists Selection */}
            {activeSection === 'shortlists' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Select Shortlists *
                  </label>
                  {errors.selectedShortlists && (
                    <p className="text-red-600 text-sm mb-3">{errors.selectedShortlists}</p>
                  )}
                  
                  {shortlists.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <List size={48} className="mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No shortlists found</h3>
                      <p className="text-gray-500">
                        You need to create shortlists first before creating a campaign.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {shortlists.map(shortlist => (
                        <div
                          key={shortlist.id}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            formData.selectedShortlists.includes(shortlist.id)
                              ? 'border-black bg-black text-white'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleShortlistToggle(shortlist.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{shortlist.name}</h4>
                            <span className={`text-sm px-2 py-1 rounded-full ${
                              formData.selectedShortlists.includes(shortlist.id)
                                ? 'bg-white text-black'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {shortlist.influencers.length} influencers
                            </span>
                          </div>
                          {shortlist.description && (
                            <p className={`text-sm ${
                              formData.selectedShortlists.includes(shortlist.id)
                                ? 'text-gray-200'
                                : 'text-gray-600'
                            }`}>
                              {shortlist.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Influencers Preview */}
                {selectedInfluencers.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Selected Influencers ({selectedInfluencers.length})
                    </h4>
                    <div className="bg-gray-50 rounded-xl p-4 max-h-60 overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedInfluencers.map(influencer => (
                          <div key={influencer.id} className="flex items-center space-x-3 bg-white p-3 rounded-lg">
                            {influencer.profilePicture ? (
                              <img
                                src={influencer.profilePicture}
                                alt={influencer.displayName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <Users size={20} className="text-gray-500" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{influencer.displayName}</p>
                              <p className="text-sm text-gray-500">
                                {(influencer.followers / 1000).toFixed(0)}K followers
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Requirements Section */}
            {activeSection === 'requirements' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Min Followers
                    </label>
                    <input
                      type="number"
                      value={formData.requirements.minFollowers}
                      onChange={(e) => handleInputChange('requirements.minFollowers', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Max Followers
                    </label>
                    <input
                      type="number"
                      value={formData.requirements.maxFollowers}
                      onChange={(e) => handleInputChange('requirements.maxFollowers', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Min Engagement Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.requirements.minEngagement}
                      onChange={(e) => handleInputChange('requirements.minEngagement', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Platforms *
                  </label>
                  {errors['requirements.platforms'] && (
                    <p className="text-red-600 text-sm mb-3">{errors['requirements.platforms']}</p>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availablePlatforms.map(platform => (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => handlePlatformToggle(platform)}
                        className={`px-4 py-3 text-sm rounded-xl border-2 transition-all ${
                          formData.requirements.platforms.includes(platform)
                            ? 'border-black bg-black text-white'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {platform}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Content Guidelines
                  </label>
                  <textarea
                    value={formData.requirements.contentGuidelines}
                    onChange={(e) => handleInputChange('requirements.contentGuidelines', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none"
                    placeholder="Describe any specific requirements for content creation, brand guidelines, hashtags, etc."
                  />
                </div>
              </div>
            )}

            {/* Deliverables Section */}
            {activeSection === 'deliverables' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Required Deliverables *
                  </label>
                  {errors.deliverables && (
                    <p className="text-red-600 text-sm mb-3">{errors.deliverables}</p>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {commonDeliverables.map(deliverable => (
                      <button
                        key={deliverable}
                        type="button"
                        onClick={() => handleDeliverableToggle(deliverable)}
                        className={`px-4 py-3 text-sm rounded-xl border-2 transition-all ${
                          formData.deliverables.includes(deliverable)
                            ? 'border-black bg-black text-white'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {deliverable}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Campaign Summary */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div><span className="font-medium">Campaign:</span> {formData.name || 'Not set'}</div>
                      <div><span className="font-medium">Brand:</span> {formData.brand || 'Not set'}</div>
                      <div><span className="font-medium">Budget:</span> ${formData.budget.total || '0'}</div>
                      <div><span className="font-medium">Timeline:</span> {formData.timeline.startDate && formData.timeline.endDate ? `${formData.timeline.startDate} to ${formData.timeline.endDate}` : 'Not set'}</div>
                    </div>
                    <div className="space-y-2">
                      <div><span className="font-medium">Shortlists:</span> {formData.selectedShortlists.length}</div>
                      <div><span className="font-medium">Influencers:</span> {selectedInfluencers.length}</div>
                      <div><span className="font-medium">Platforms:</span> {formData.requirements.platforms.join(', ') || 'None'}</div>
                      <div><span className="font-medium">Deliverables:</span> {formData.deliverables.length}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={handleCancel}
              className="px-6 py-2 text-gray-600 font-medium hover:text-gray-800 transition-colors"
            >
              Exit
            </button>
            
            <div className="flex items-center space-x-3">
              {activeSection !== 'basic' && (
                <button
                  onClick={() => {
                    const sections = ['basic', 'shortlists', 'requirements', 'deliverables']
                    const currentIndex = sections.indexOf(activeSection)
                    if (currentIndex > 0) {
                      setActiveSection(sections[currentIndex - 1] as any)
                    }
                  }}
                  className="px-4 py-2 text-gray-600 font-medium hover:text-gray-800 transition-colors"
                >
                  Previous
                </button>
              )}
              
              {activeSection !== 'deliverables' ? (
                <button
                  onClick={() => {
                    const sections = ['basic', 'shortlists', 'requirements', 'deliverables']
                    const currentIndex = sections.indexOf(activeSection)
                    if (currentIndex < sections.length - 1) {
                      setActiveSection(sections[currentIndex + 1] as any)
                    }
                  }}
                  className="px-6 py-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-6 py-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
