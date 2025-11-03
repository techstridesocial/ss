'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, DollarSign, Users, Target, Package, AlertCircle, CheckCircle, ChevronDown, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CreateCampaignModalProps {
  isOpen: boolean
  onCloseAction: () => void
  onSaveAction: (campaignData: any) => void
}

export default function CreateCampaignModal({
  isOpen,
  onCloseAction,
  onSaveAction
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
  const [activeSection, setActiveSection] = useState<'basic' | 'requirements' | 'deliverables' | 'influencers'>('basic')
  const [brands, setBrands] = useState<Array<{id: string, company_name: string}>>([])
  const [showBrandDropdown, setShowBrandDropdown] = useState(false)
  const [filteredBrands, setFilteredBrands] = useState<Array<{id: string, company_name: string}>>([])
  const [influencers, setInfluencers] = useState<Array<any>>([])
  const [selectedInfluencers, setSelectedInfluencers] = useState<Array<string>>([])
  const [influencersLoading, setInfluencersLoading] = useState(false)
  const [influencerSearch, setInfluencerSearch] = useState('')
  const [filteredInfluencers, setFilteredInfluencers] = useState<Array<any>>([])

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

  // Fetch brands on component mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('/api/brands?limit=100')
        if (response.ok) {
          const _result = await response.json()
          setBrands(result.data || [])
          setFilteredBrands(result.data || [])
        }
      } catch (_error) {
        console.error('Error fetching brands:', error)
      }
    }
    
    if (isOpen) {
      fetchBrands()
    }
  }, [isOpen])

  // Filter brands based on input
  useEffect(() => {
    if (formData.brand) {
      const filtered = brands.filter(brand => 
        brand.company_name.toLowerCase().includes(formData.brand.toLowerCase())
      )
      setFilteredBrands(filtered)
    } else {
      setFilteredBrands(brands)
    }
  }, [formData.brand, brands])

  // Fetch influencers on component mount
  useEffect(() => {
    const fetchInfluencers = async () => {
      if (!isOpen) return
      
      setInfluencersLoading(true)
      try {
        const response = await fetch('/api/influencers')
        if (response.ok) {
          const _result = await response.json()
          setInfluencers(result.data || [])
          setFilteredInfluencers(result.data || [])
        }
      } catch (_error) {
        console.error('Error fetching influencers:', error)
      } finally {
        setInfluencersLoading(false)
      }
    }
    
    fetchInfluencers()
  }, [isOpen])

  // Filter influencers based on search
  useEffect(() => {
    if (influencerSearch) {
      const filtered = influencers.filter(influencer => {
        const searchLower = influencerSearch.toLowerCase()
        const name = (influencer.display_name || `${influencer.first_name} ${influencer.last_name}`.trim()).toLowerCase()
        const niches = (influencer.niches || []).join(' ').toLowerCase()
        return name.includes(searchLower) || niches.includes(searchLower)
      })
      setFilteredInfluencers(filtered)
    } else {
      setFilteredInfluencers(influencers)
    }
  }, [influencerSearch, influencers])

  const handleInputChange = (field: string, value: string | string[] | object) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      const parentKey = parent as keyof typeof formData
      const childKey = child as string
      
      setFormData(prev => ({
        ...prev,
        [parentKey]: {
          ...(prev[parentKey] as any || {}),
          [childKey]: value
        }
      }))
    } else {
      const fieldKey = field as keyof typeof formData
      setFormData(prev => ({ ...prev, [fieldKey]: value }))
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handlePlatformToggle = (_platform: string) => {
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

  const handleBrandSelect = (brand: {id: string, company_name: string}) => {
    handleInputChange('brand', brand.company_name)
    setShowBrandDropdown(false)
  }

  const handleBrandInputChange = (value: string) => {
    handleInputChange('brand', value)
    setShowBrandDropdown(true)
  }

  const handleInfluencerToggle = (influencerId: string) => {
    setSelectedInfluencers(prev => 
      prev.includes(influencerId)
        ? prev.filter(id => id !== influencerId)
        : [...prev, influencerId]
    )
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
        deliverables: formData.deliverables,
        selectedInfluencers: selectedInfluencers
      }
      
      await onSaveAction(campaignData)
      
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
      setSelectedInfluencers([])
        onCloseAction()
    } catch (_error) {
      console.error('Error creating campaign:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    // Just close the modal, keep the form data in case user wants to continue later
        onCloseAction()
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.brand-autocomplete')) {
        setShowBrandDropdown(false)
      }
    }

    if (showBrandDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showBrandDropdown])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseAction}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
              {/* Header */}
              <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Create New Campaign</h2>
                  <p className="text-gray-600 mt-1">Set up a new influencer marketing campaign</p>
                </div>
                <button
                  onClick={onCloseAction}
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
                    { key: 'deliverables', label: 'Deliverables', icon: CheckCircle },
                    { key: 'influencers', label: 'Influencers', icon: Users }
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
              <div className="p-8 overflow-y-auto max-h-[calc(95vh-200px)]">
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
                    <div className="relative brand-autocomplete">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.brand}
                          onChange={(e) => handleBrandInputChange(e.target.value)}
                          onFocus={() => setShowBrandDropdown(true)}
                          className={`w-full px-4 py-3 pr-10 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                            errors.brand ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Search and select brand"
                        />
                        <ChevronDown 
                          size={20} 
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                          onClick={() => setShowBrandDropdown(!showBrandDropdown)}
                        />
                        
                        {/* Dropdown */}
                        {showBrandDropdown && filteredBrands.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {filteredBrands.map((brand) => (
                              <div
                                key={brand.id}
                                onClick={() => handleBrandSelect(brand)}
                                className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium text-gray-900">{brand.company_name}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
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

                {/* Influencers Section */}
                {activeSection === 'influencers' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Influencers (Optional)
                      </label>
                      <p className="text-sm text-gray-600 mb-4">
                        Choose influencers from your roster to invite to this campaign. You can also add influencers later.
                      </p>
                      
                      {/* Search Bar */}
                      <div className="relative mb-4">
                        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={influencerSearch}
                          onChange={(e) => setInfluencerSearch(e.target.value)}
                          placeholder="Search influencers by name or niche..."
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        />
                      </div>
                      
                      {influencersLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                          <span className="ml-3 text-gray-600">Loading influencers...</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[28rem] overflow-y-auto">
                          {filteredInfluencers.map((influencer) => (
                            <div
                              key={influencer.id}
                              onClick={() => handleInfluencerToggle(influencer.id)}
                              className={`p-4 border rounded-xl cursor-pointer transition-all ${
                                selectedInfluencers.includes(influencer.id)
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-medium">
                                  {influencer.display_name?.charAt(0) || influencer.first_name?.charAt(0) || '?'}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">
                                    {influencer.display_name || `${influencer.first_name} ${influencer.last_name}`.trim()}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {influencer.total_followers ? `${(influencer.total_followers / 1000).toFixed(0)}K followers` : 'No followers data'}
                                  </div>
                                  {influencer.niches && influencer.niches.length > 0 && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      {influencer.niches.slice(0, 2).join(', ')}
                                    </div>
                                  )}
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  selectedInfluencers.includes(influencer.id)
                                    ? 'border-blue-500 bg-blue-500'
                                    : 'border-gray-300'
                                }`}>
                                  {selectedInfluencers.includes(influencer.id) && (
                                    <CheckCircle size={12} className="text-white" />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {selectedInfluencers.length > 0 && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            {selectedInfluencers.length} influencer{selectedInfluencers.length !== 1 ? 's' : ''} selected
                          </p>
                        </div>
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
                  Exit
                </button>
                
                <div className="flex space-x-3">
                  {activeSection !== 'basic' && (
                    <button
                      onClick={() => {
                        const sections = ['basic', 'requirements', 'deliverables', 'influencers']
                        const currentIndex = sections.indexOf(activeSection)
                        setActiveSection(sections[currentIndex - 1] as any)
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium"
                    >
                      Previous
                    </button>
                  )}
                  
                  {activeSection !== 'influencers' ? (
                    <button
                      onClick={() => {
                        const sections = ['basic', 'requirements', 'deliverables', 'influencers']
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