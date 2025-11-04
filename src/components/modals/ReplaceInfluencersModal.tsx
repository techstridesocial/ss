import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Search, 
  Users, 
  Instagram, 
  Youtube, 
  Hash,
  MapPin,
  TrendingUp,
  Eye,
  UserCheck,
  AlertCircle,
  ChevronDown,
  FilterIcon,
  UserMinus,
  UserPlus
} from 'lucide-react'

// Mock available influencers for replacement
const MOCK_AVAILABLE_INFLUENCERS = [
  {
    id: 'inf_available_1',
    name: 'Emma Styles',
    handle: '@emmastyles',
    avatar: '/avatars/emma.jpg',
    followers: 125000,
    engagement_rate: 4.8,
    platforms: ['INSTAGRAM', 'TIKTOK'],
    niche: ['Fashion', 'Lifestyle'],
    location: 'London, UK',
    recent_performance: 'High',
    estimated_rate: 1200,
    status: 'AVAILABLE'
  },
  {
    id: 'inf_available_2',
    name: 'FitnessMax',
    handle: '@fitnessmax',
    avatar: '/avatars/max.jpg',
    followers: 89000,
    engagement_rate: 5.2,
    platforms: ['INSTAGRAM', 'YOUTUBE'],
    niche: ['Fitness', 'Health'],
    location: 'Manchester, UK',
    recent_performance: 'Excellent',
    estimated_rate: 950,
    status: 'AVAILABLE'
  },
  {
    id: 'inf_available_3',
    name: 'TechReviewer',
    handle: '@techreview',
    avatar: '/avatars/tech.jpg',
    followers: 156000,
    engagement_rate: 3.9,
    platforms: ['YOUTUBE', 'TWITTER'],
    niche: ['Tech', 'Gaming'],
    location: 'Birmingham, UK',
    recent_performance: 'Good',
    estimated_rate: 1400,
    status: 'AVAILABLE'
  },
  {
    id: 'inf_available_4',
    name: 'Beauty Guru',
    handle: '@beautyguru',
    avatar: '/avatars/beauty.jpg',
    followers: 203000,
    engagement_rate: 4.5,
    platforms: ['INSTAGRAM', 'TIKTOK', 'YOUTUBE'],
    niche: ['Beauty', 'Skincare'],
    location: 'London, UK',
    recent_performance: 'High',
    estimated_rate: 1800,
    status: 'AVAILABLE'
  },
  {
    id: 'inf_available_5',
    name: 'Fashion Forward',
    handle: '@fashionforward',
    avatar: '/avatars/fashion.jpg',
    followers: 178000,
    engagement_rate: 4.1,
    platforms: ['INSTAGRAM', 'TIKTOK'],
    niche: ['Fashion', 'Style'],
    location: 'Edinburgh, UK',
    recent_performance: 'Good',
    estimated_rate: 1500,
    status: 'AVAILABLE'
  }
]

interface DeclinedInfluencer {
  id: string
  name: string
  decline_reason: string
  original_offer: number
  declined_at: string
}

interface ReplaceInfluencersModalProps {
  isOpen: boolean
  onClose: () => void
  campaign: any
  declinedInfluencers: DeclinedInfluencer[]
  onReplace: (replacements: { declined_id: string, replacement_id: string }[]) => void
}

export default function ReplaceInfluencersModal({
  isOpen,
  onClose,
  campaign,
  declinedInfluencers,
  onReplace
}: ReplaceInfluencersModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReplacements, setSelectedReplacements] = useState<{[key: string]: string}>({})
  const [filters, setFilters] = useState({
    platform: '',
    niche: '',
    engagement: '',
    followers: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  // Filter available influencers based on campaign requirements and filters
  const filteredInfluencers = useMemo(() => {
    let filtered = MOCK_AVAILABLE_INFLUENCERS

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(inf => 
        inf.name.toLowerCase().includes(query) ||
        inf.handle.toLowerCase().includes(query) ||
        inf.niche.some(n => n.toLowerCase().includes(query))
      )
    }

    // Platform filter
    if (filters.platform) {
      filtered = filtered.filter(inf => 
        inf.platforms.includes(filters.platform)
      )
    }

    // Niche filter (match with campaign target niches)
    if (filters.niche) {
      filtered = filtered.filter(inf => 
        inf.niche.includes(filters.niche)
      )
    }

    // Engagement filter
    if (filters.engagement) {
      filtered = filtered.filter(inf => {
        switch (filters.engagement) {
          case 'high': return inf.engagement_rate >= 4.5
          case 'medium': return inf.engagement_rate >= 3.5 && inf.engagement_rate < 4.5
          case 'low': return inf.engagement_rate < 3.5
          default: return true
        }
      })
    }

    // Followers filter
    if (filters.followers) {
      filtered = filtered.filter(inf => {
        switch (filters.followers) {
          case 'mega': return inf.followers >= 1000000
          case 'macro': return inf.followers >= 100000 && inf.followers < 1000000
          case 'micro': return inf.followers >= 10000 && inf.followers < 100000
          case 'nano': return inf.followers < 10000
          default: return true
        }
      })
    }

    // Prioritize influencers that match campaign niches
    if (campaign?.target_niches) {
      filtered = filtered.sort((a, b) => {
        const aMatches = a.niche.filter(n => campaign.target_niches.includes(n)).length
        const bMatches = b.niche.filter(n => campaign.target_niches.includes(n)).length
        return bMatches - aMatches
      })
    }

    return filtered
  }, [searchQuery, filters, campaign])

  const handleReplaceInfluencer = (declinedId: string, replacementId: string) => {
    setSelectedReplacements(prev => ({
      ...prev,
      [declinedId]: replacementId
    }))
  }

  const handleRemoveReplacement = (declinedId: string) => {
    setSelectedReplacements(prev => {
      const updated = { ...prev }
      delete updated[declinedId]
      return updated
    })
  }

  const handleSubmitReplacements = () => {
    const replacements = Object.entries(selectedReplacements).map(([declined_id, replacement_id]) => ({
      declined_id,
      replacement_id
    }))
    onReplace(replacements)
    onClose()
  }

  const getPlatformIcon = (_platform: string) => {
    switch (_platform) {
      case 'INSTAGRAM': return <Instagram size={14} className="text-pink-500" />
      case 'YOUTUBE': return <Youtube size={14} className="text-red-500" />
      case 'TIKTOK': return <Hash size={14} className="text-black" />
      default: return null
    }
  }

  const getPerformanceBadge = (performance: string) => {
    const config = {
      'Excellent': 'bg-green-100 text-green-800',
      'High': 'bg-blue-100 text-blue-800',
      'Good': 'bg-yellow-100 text-yellow-800',
      'Average': 'bg-gray-100 text-gray-800'
    }
    return config[performance as keyof typeof config] || config.Average
  }

  const filterOptions = {
    platform: [
      { value: '', label: 'All Platforms' },
      { value: 'INSTAGRAM', label: 'Instagram' },
      { value: 'YOUTUBE', label: 'YouTube' },
      { value: 'TIKTOK', label: 'TikTok' },
      { value: 'TWITTER', label: 'Twitter' }
    ],
    niche: [
      { value: '', label: 'All Niches' },
      { value: 'Beauty', label: 'Beauty' },
      { value: 'Fashion', label: 'Fashion' },
      { value: 'Fitness', label: 'Fitness' },
      { value: 'Tech', label: 'Tech' },
      { value: 'Lifestyle', label: 'Lifestyle' },
      { value: 'Health', label: 'Health' },
      { value: 'Gaming', label: 'Gaming' }
    ],
    engagement: [
      { value: '', label: 'All Engagement' },
      { value: 'high', label: 'High (4.5%+)' },
      { value: 'medium', label: 'Medium (3.5-4.5%)' },
      { value: 'low', label: 'Low (<3.5%)' }
    ],
    followers: [
      { value: '', label: 'All Followers' },
      { value: 'mega', label: 'Mega (1M+)' },
      { value: 'macro', label: 'Macro (100K-1M)' },
      { value: 'micro', label: 'Micro (10K-100K)' },
      { value: 'nano', label: 'Nano (<10K)' }
    ]
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Replace Declined Influencers</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Campaign: {campaign?.name} • {declinedInfluencers.length} declined influencer{declinedInfluencers.length !== 1 ? 's' : ''} to replace
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex h-[calc(90vh-200px)]">
                {/* Left Panel - Declined Influencers */}
                <div className="w-1/3 border-r border-gray-200 bg-red-50/30">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <UserMinus size={16} className="mr-2 text-red-500" />
                      Declined Influencers
                    </h3>
                  </div>
                  
                  <div className="overflow-y-auto h-full">
                    {declinedInfluencers.map((declined) => {
                      const replacement = selectedReplacements[declined.id]
                      const replacementInfluencer = replacement ? 
                        MOCK_AVAILABLE_INFLUENCERS.find(inf => inf.id === replacement) : null

                      return (
                        <div key={declined.id} className="p-4 border-b border-gray-100">
                          <div className="mb-2">
                            <div className="font-medium text-gray-900">{declined.name}</div>
                            <div className="text-sm text-gray-600">${declined.original_offer} offer</div>
                          </div>
                          
                          <div className="mb-3 p-2 bg-red-100 rounded-lg">
                            <div className="flex items-start space-x-2">
                              <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                              <div className="text-xs text-red-700">
                                <div className="font-medium">Decline reason:</div>
                                <div>{declined.decline_reason}</div>
                              </div>
                            </div>
                          </div>

                          {replacementInfluencer ? (
                            <div className="p-2 bg-green-100 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-xs font-medium text-green-800">Replacement Selected:</div>
                                  <div className="text-sm font-medium text-green-900">{replacementInfluencer.name}</div>
                                  <div className="text-xs text-green-700">${replacementInfluencer.estimated_rate} estimated</div>
                                </div>
                                <button
                                  onClick={() => handleRemoveReplacement(declined.id)}
                                  className="p-1 hover:bg-green-200 rounded transition-colors"
                                >
                                  <X size={14} className="text-green-600" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-2 bg-yellow-100 rounded-lg">
                              <div className="text-xs font-medium text-yellow-800">No replacement selected</div>
                              <div className="text-xs text-yellow-700">Choose from available influencers →</div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Right Panel - Available Influencers */}
                <div className="flex-1 flex flex-col">
                  {/* Search and Filters */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex-1 relative">
                        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search available influencers..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <FilterIcon size={16} />
                        <span>Filters</span>
                        <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {showFilters && (
                      <div className="grid grid-cols-4 gap-3">
                        {Object.entries(filterOptions).map(([key, options]) => (
                          <select
                            key={key}
                            value={filters[key as keyof typeof filters]}
                            onChange={(e) => setFilters(prev => ({ ...prev, [key]: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          >
                            {options.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Available Influencers List */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <UserPlus size={16} className="mr-2 text-green-500" />
                        Available Influencers ({filteredInfluencers.length})
                      </h3>
                      
                      <div className="space-y-3">
                        {filteredInfluencers.map((influencer) => {
                          const isSelected = Object.values(selectedReplacements).includes(influencer.id)
                          const isRecommended = influencer.niche.some(n => campaign?.target_niches?.includes(n))

                          return (
                            <div
                              key={influencer.id}
                              className={`p-4 border rounded-lg transition-all ${
                                isSelected 
                                  ? 'border-green-500 bg-green-50' 
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <div className="font-medium text-gray-900">{influencer.name}</div>
                                    <div className="text-sm text-gray-500">{influencer.handle}</div>
                                    {isRecommended && (
                                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                                        Recommended
                                      </span>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div className="space-y-1">
                                      <div className="flex items-center space-x-2 text-sm">
                                        <Users size={14} className="text-gray-400" />
                                        <span className="text-gray-600">{influencer.followers.toLocaleString()} followers</span>
                                      </div>
                                      <div className="flex items-center space-x-2 text-sm">
                                        <TrendingUp size={14} className="text-gray-400" />
                                        <span className="text-gray-600">{influencer.engagement_rate}% engagement</span>
                                      </div>
                                      <div className="flex items-center space-x-2 text-sm">
                                        <MapPin size={14} className="text-gray-400" />
                                        <span className="text-gray-600">{influencer.location}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-1">
                                      <div className="text-sm">
                                        <span className="text-gray-600">Rate: </span>
                                        <span className="font-medium">${influencer.estimated_rate}</span>
                                      </div>
                                      <div className="text-sm">
                                        <span className="text-gray-600">Performance: </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceBadge(influencer.recent_performance)}`}>
                                          {influencer.recent_performance}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-1">
                                      {influencer.platforms.map(platform => (
                                        <div key={platform} className="flex items-center">
                                          {getPlatformIcon(platform)}
                                        </div>
                                      ))}
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-1">
                                      {influencer.niche.map(niche => (
                                        <span key={niche} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                          {niche}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div className="ml-4 flex flex-col space-y-2">
                                  {!isSelected ? (
                                    <div className="space-y-1">
                                      {declinedInfluencers.map(declined => (
                                        <button
                                          key={declined.id}
                                          onClick={() => handleReplaceInfluencer(declined.id, influencer.id)}
                                          disabled={!!selectedReplacements[declined.id]}
                                          className="w-full px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                          Replace {declined.name}
                                        </button>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="flex items-center space-x-2 text-green-600">
                                      <UserCheck size={16} />
                                      <span className="text-sm font-medium">Selected</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {Object.keys(selectedReplacements).length} of {declinedInfluencers.length} replacements selected
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitReplacements}
                      disabled={Object.keys(selectedReplacements).length === 0}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Replace {Object.keys(selectedReplacements).length} Influencer{Object.keys(selectedReplacements).length !== 1 ? 's' : ''}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 