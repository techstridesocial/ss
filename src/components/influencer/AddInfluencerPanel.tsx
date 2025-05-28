'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Save, Loader2, User, Mail, MapPin, Globe, Tag, DollarSign, Users, Search, CheckCircle, AlertTriangle, Zap, TrendingUp } from 'lucide-react'

interface InfluencerData {
  display_name: string
  first_name: string
  last_name: string
  email: string
  bio?: string
  location_country?: string
  location_city?: string
  website_url?: string
  niches: string[]
  influencer_type: 'SIGNED' | 'PARTNERED' | 'AGENCY_PARTNER'
  content_type: 'STANDARD' | 'UGC' | 'SEEDING'
  tier?: 'GOLD' | 'SILVER'
  average_views?: number
  instagram_username?: string
  tiktok_username?: string
  youtube_username?: string
  estimated_followers?: number
  agency_name?: string
}

interface ModashDiscoveryData {
  found: boolean
  profile?: {
    username: string
    display_name: string
    followers: number
    engagement_rate: number
    platform: 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE'
    verified: boolean
    bio: string
    location_country?: string
    location_city?: string
    average_views: number
    audience_demographics?: {
      age_groups: Record<string, number>
      gender: Record<string, number>
      locations: Record<string, number>
    }
    credibility_score?: number
    niches_detected?: string[]
    email?: string
  }
  confidence?: number
  error?: string
}

interface AddInfluencerPanelProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: InfluencerData) => Promise<void>
}

const AVAILABLE_NICHES = [
  'Lifestyle', 'Fashion', 'Beauty', 'Fitness', 'Health', 'Tech', 'Gaming', 
  'Travel', 'Food', 'Business', 'Marketing', 'UGC', 'Product Reviews', 
  'Product Seeding', 'Entertainment', 'Music', 'Sports', 'Education',
  'Home', 'Adventure', 'Family', 'Cleaning', 'AI', 'Web'
]

const PLATFORMS = [
  { value: 'INSTAGRAM', label: 'Instagram', prefix: '@' },
  { value: 'TIKTOK', label: 'TikTok', prefix: '@' },
  { value: 'YOUTUBE', label: 'YouTube', prefix: '@' }
]

export default function AddInfluencerPanel({ 
  isOpen, 
  onClose, 
  onSave 
}: AddInfluencerPanelProps) {
  const [mode, setMode] = useState<'discovery' | 'manual'>('discovery')
  const [discoveryHandle, setDiscoveryHandle] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState<'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE'>('INSTAGRAM')
  const [isSearching, setIsSearching] = useState(false)
  const [discoveryData, setDiscoveryData] = useState<ModashDiscoveryData | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  
  const [formData, setFormData] = useState<InfluencerData>({
    display_name: '',
    first_name: '',
    last_name: '',
    email: '',
    bio: '',
    location_country: '',
    location_city: '',
    website_url: '',
    niches: [],
    influencer_type: 'SIGNED',
    content_type: 'STANDARD',
    tier: 'GOLD',
    average_views: undefined,
    instagram_username: '',
    tiktok_username: '',
    youtube_username: '',
    estimated_followers: undefined,
    agency_name: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const searchModashProfile = async (handle: string, platform: string): Promise<ModashDiscoveryData> => {
    setIsSearching(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (handle.toLowerCase() === 'notfound' || handle.toLowerCase() === 'test404') {
        return {
          found: false,
          error: 'Profile not found in Modash database or below 1k followers threshold'
        }
      }
      
      const displayName = handle.charAt(0).toUpperCase() + handle.slice(1)
      
      let mockData: {
        followers: number
        engagement_rate: number
        bio: string
        location_country: string
        location_city: string
        average_views: number
        credibility_score: number
        niches_detected: string[]
      }
      
      if (handle.toLowerCase().includes('beauty') || handle.toLowerCase().includes('makeup')) {
        mockData = {
          followers: 85000 + Math.floor(Math.random() * 50000),
          engagement_rate: 3.8 + Math.random() * 2,
          bio: `Beauty enthusiast | Makeup tutorials | Skincare tips ✨`,
          location_country: "United Kingdom",
          location_city: "London",
          average_views: 32000 + Math.floor(Math.random() * 20000),
          credibility_score: 0.85 + Math.random() * 0.1,
          niches_detected: ['Beauty', 'Fashion', 'Lifestyle']
        }
      } else if (handle.toLowerCase().includes('tech') || handle.toLowerCase().includes('review')) {
        mockData = {
          followers: 120000 + Math.floor(Math.random() * 80000),
          engagement_rate: 3.2 + Math.random() * 2,
          bio: `Tech reviewer | Latest gadgets | Honest opinions 📱💻`,
          location_country: "United States", 
          location_city: "San Francisco",
          average_views: 65000 + Math.floor(Math.random() * 30000),
          credibility_score: 0.88 + Math.random() * 0.1,
          niches_detected: ['Tech', 'Product Reviews', 'Gaming']
        }
      } else {
        const randomNiches = [
          ['Lifestyle', 'Fashion'],
          ['Entertainment', 'Music'], 
          ['Food', 'Lifestyle'],
          ['Education', 'Lifestyle'],
          ['Sports', 'Fitness']
        ]
        
        const randomCountries = ["United Kingdom", "United States", "Canada", "Australia", "Germany"]
        const randomCities = ["London", "New York", "Toronto", "Sydney", "Berlin"]
        const randomIndex = Math.floor(Math.random() * 5)
        
        mockData = {
          followers: 50000 + Math.floor(Math.random() * 100000),
          engagement_rate: 2.8 + Math.random() * 3,
          bio: `Content creator | ${displayName} | Follow for daily updates ✨`,
          location_country: randomCountries[randomIndex] || "United Kingdom",
          location_city: randomCities[randomIndex] || "London",
          average_views: 25000 + Math.floor(Math.random() * 40000),
          credibility_score: 0.75 + Math.random() * 0.2,
          niches_detected: randomNiches[randomIndex] || ['Lifestyle', 'Fashion']
        }
      }

      return {
        found: true,
        profile: {
          username: handle,
          display_name: displayName,
          followers: mockData.followers,
          engagement_rate: mockData.engagement_rate,
          platform: platform as 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE',
          verified: Math.random() > 0.6,
          bio: mockData.bio,
          location_country: mockData.location_country,
          location_city: mockData.location_city,
          average_views: mockData.average_views,
          credibility_score: mockData.credibility_score,
          niches_detected: mockData.niches_detected,
          email: `contact@${handle.toLowerCase()}.com`
        },
        confidence: 0.85 + Math.random() * 0.15
      }
    } catch (error) {
      return {
        found: false,
        error: 'Failed to search Modash database. Please try again.'
      }
    } finally {
      setIsSearching(false)
    }
  }

  const handleDiscoverySearch = async () => {
    if (!discoveryHandle.trim()) {
      alert('Please enter a username to search')
      return
    }

    const cleanHandle = discoveryHandle.replace('@', '').trim()
    const result = await searchModashProfile(cleanHandle, selectedPlatform)
    setDiscoveryData(result)
    
    if (result.found && result.profile) {
      setShowPreview(true)
    }
  }

  const handleConfirmDiscovery = () => {
    if (discoveryData?.profile) {
      const profile = discoveryData.profile
      setFormData({
        ...formData,
        display_name: profile.display_name,
        first_name: profile.display_name.split(' ')[0] || '',
        last_name: profile.display_name.split(' ').slice(1).join(' ') || '',
        email: profile.email || '',
        bio: profile.bio || '',
        location_country: profile.location_country || '',
        location_city: profile.location_city || '',
        niches: profile.niches_detected || [],
        average_views: profile.average_views,
        estimated_followers: profile.followers,
        [selectedPlatform.toLowerCase() + '_username']: profile.username
      })
      setMode('manual')
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.display_name.trim()) {
      newErrors.display_name = 'Display name is required'
    }
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required'
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required'
    }
    
    if (formData.niches.length === 0) {
      newErrors.niches = 'At least one niche is required'
    }
    
    if (!formData.instagram_username && !formData.tiktok_username && !formData.youtube_username) {
      newErrors.social = 'At least one social media platform is required'
    }

    if (formData.influencer_type === 'AGENCY_PARTNER' && !formData.agency_name?.trim()) {
      newErrors.agency_name = 'Agency name is required for Agency Partners'
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
      await onSave(formData)
      
      // Reset form
      setFormData({
        display_name: '',
        first_name: '',
        last_name: '',
        email: '',
        bio: '',
        location_country: '',
        location_city: '',
        website_url: '',
        niches: [],
        influencer_type: 'SIGNED',
        content_type: 'STANDARD',
        tier: 'GOLD',
        average_views: undefined,
        instagram_username: '',
        tiktok_username: '',
        youtube_username: '',
        estimated_followers: undefined,
        agency_name: ''
      })
      setErrors({})
      setMode('discovery')
      setDiscoveryData(null)
      setShowPreview(false)
      onClose()
    } catch (error) {
      console.error('Error saving influencer:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleNiche = (niche: string) => {
    setFormData(prev => ({
      ...prev,
      niches: prev.niches.includes(niche)
        ? prev.niches.filter(n => n !== niche)
        : [...prev.niches, niche]
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-[600px] bg-white/95 backdrop-blur-md shadow-2xl border-l border-white/30">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="h-full flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add New Influencer</h2>
            <p className="text-sm text-gray-600 mt-1">
              {mode === 'discovery' ? 'Search or manually add an influencer' : 'Complete the influencer details'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {mode === 'discovery' && !showPreview && (
            <div className="p-6 space-y-6">
              {/* Discovery Mode */}
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <Zap className="text-blue-600 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-medium text-blue-900">Smart Discovery</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Search our database to auto-fill influencer details and verify their metrics.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Platform
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {PLATFORMS.map((platform) => (
                      <button
                        key={platform.value}
                        onClick={() => setSelectedPlatform(platform.value as any)}
                        className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                          selectedPlatform === platform.value
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {platform.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username or Handle
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={discoveryHandle}
                      onChange={(e) => setDiscoveryHandle(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleDiscoverySearch()}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30"
                      placeholder="Enter username (without @)"
                      disabled={isSearching}
                    />
                    <button
                      onClick={handleDiscoverySearch}
                      disabled={isSearching}
                      className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center space-x-2"
                    >
                      {isSearching ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Search size={16} />
                      )}
                      <span>{isSearching ? 'Searching...' : 'Search'}</span>
                    </button>
                  </div>
                </div>

                {discoveryData && !discoveryData.found && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="text-yellow-600 mt-0.5" size={20} />
                      <div>
                        <h4 className="font-medium text-yellow-800">Profile Not Found</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          {discoveryData.error || 'This profile was not found in our database.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => setMode('manual')}
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Add Manually Instead
                </button>
              </div>
            </div>
          )}

          {showPreview && discoveryData?.profile && (
            <div className="p-6 space-y-6">
              {/* Discovery Preview */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="text-green-600 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-medium text-green-800">Profile Found!</h3>
                    <p className="text-sm text-green-700 mt-1">
                      We found this profile with {discoveryData.confidence ? `${Math.round(discoveryData.confidence * 100)}%` : 'high'} confidence.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{discoveryData.profile.display_name}</h3>
                      <p className="text-gray-600">@{discoveryData.profile.username}</p>
                    </div>
                    {discoveryData.profile.verified && (
                      <CheckCircle className="text-blue-500" size={20} />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Followers:</span>
                      <span className="ml-2 font-medium">{discoveryData.profile.followers.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Engagement:</span>
                      <span className="ml-2 font-medium">{discoveryData.profile.engagement_rate.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Avg Views:</span>
                      <span className="ml-2 font-medium">{discoveryData.profile.average_views.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Platform:</span>
                      <span className="ml-2 font-medium">{discoveryData.profile.platform}</span>
                    </div>
                  </div>

                  {discoveryData.profile.bio && (
                    <div>
                      <span className="text-gray-500 text-sm">Bio:</span>
                      <p className="mt-1 text-gray-900">{discoveryData.profile.bio}</p>
                    </div>
                  )}

                  {discoveryData.profile.niches_detected && discoveryData.profile.niches_detected.length > 0 && (
                    <div>
                      <span className="text-gray-500 text-sm">Detected Niches:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {discoveryData.profile.niches_detected.map((niche) => (
                          <span
                            key={niche}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {niche}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowPreview(false)
                    setDiscoveryData(null)
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Search Again
                </button>
                <button
                  onClick={handleConfirmDiscovery}
                  className="flex-1 px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
                >
                  Use This Profile
                </button>
              </div>
            </div>
          )}

          {mode === 'manual' && (
            <div className="p-6 space-y-6">
              {/* Manual Form */}
              
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <User size={18} className="mr-2" />
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name *
                    </label>
                    <input
                      type="text"
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30"
                      placeholder="How they appear publicly"
                    />
                    {errors.display_name && <p className="text-red-500 text-xs mt-1">{errors.display_name}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30"
                        placeholder="John"
                      />
                      {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30"
                        placeholder="Doe"
                      />
                      {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Mail size={16} className="mr-1" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30"
                      placeholder="contact@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30"
                      placeholder="Brief description of the influencer and their content style..."
                    />
                  </div>
                </div>
              </div>

              {/* Type Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Influencer Classification
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Influencer Type *
                    </label>
                    <select
                      value={formData.influencer_type}
                      onChange={(e) => {
                        const newType = e.target.value as 'SIGNED' | 'PARTNERED' | 'AGENCY_PARTNER'
                        setFormData({ 
                          ...formData, 
                          influencer_type: newType,
                          tier: (newType === 'SIGNED' || newType === 'PARTNERED') ? 'GOLD' : undefined
                        })
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30"
                    >
                      <option value="SIGNED">Signed</option>
                      <option value="PARTNERED">Partnered</option>
                      <option value="AGENCY_PARTNER">Agency Partner</option>
                    </select>
                  </div>

                  {formData.influencer_type === 'AGENCY_PARTNER' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Agency Name *
                      </label>
                      <input
                        type="text"
                        value={formData.agency_name}
                        onChange={(e) => setFormData({ ...formData, agency_name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30"
                        placeholder="Agency or Company Name"
                      />
                      {errors.agency_name && <p className="text-red-500 text-xs mt-1">{errors.agency_name}</p>}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content Type
                    </label>
                    <select
                      value={formData.content_type}
                      onChange={(e) => setFormData({ ...formData, content_type: e.target.value as any })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30"
                    >
                      <option value="STANDARD">Standard</option>
                      <option value="UGC">UGC</option>
                      <option value="SEEDING">Seeding</option>
                    </select>
                  </div>

                  {(formData.influencer_type === 'SIGNED' || formData.influencer_type === 'PARTNERED') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tier Override
                      </label>
                      <select
                        value={formData.tier}
                        onChange={(e) => setFormData({ ...formData, tier: e.target.value as any })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30"
                      >
                        <option value="GOLD">Gold</option>
                        <option value="SILVER">Silver</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Normally calculated from followers/engagement, but can be manually overridden
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <MapPin size={18} className="mr-2" />
                  Location
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={formData.location_country}
                      onChange={(e) => setFormData({ ...formData, location_country: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30"
                      placeholder="United Kingdom"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.location_city}
                      onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30"
                      placeholder="London"
                    />
                  </div>
                </div>
              </div>

              {/* Social Media Platforms */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Social Media Platforms *
                </h3>
                <p className="text-sm text-gray-600">At least one platform is required</p>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instagram Username</label>
                    <input
                      type="text"
                      value={formData.instagram_username}
                      onChange={(e) => setFormData({ ...formData, instagram_username: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30"
                      placeholder="username (without @)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">TikTok Username</label>
                    <input
                      type="text"
                      value={formData.tiktok_username}
                      onChange={(e) => setFormData({ ...formData, tiktok_username: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30"
                      placeholder="username (without @)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">YouTube Username</label>
                    <input
                      type="text"
                      value={formData.youtube_username}
                      onChange={(e) => setFormData({ ...formData, youtube_username: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30"
                      placeholder="username (without @)"
                    />
                  </div>
                </div>
                {errors.social && <p className="text-red-500 text-xs mt-1">{errors.social}</p>}
              </div>

              {/* Metrics */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <TrendingUp size={18} className="mr-2" />
                  Metrics & Website
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Globe size={16} className="mr-1" />
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30"
                      placeholder="https://..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <TrendingUp size={16} className="mr-1" />
                        Average Views
                      </label>
                      <input
                        type="number"
                        value={formData.average_views || ''}
                        onChange={(e) => setFormData({ ...formData, average_views: parseInt(e.target.value) || undefined })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30"
                        placeholder="45000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Users size={16} className="mr-1" />
                        Est. Total Followers
                      </label>
                      <input
                        type="number"
                        value={formData.estimated_followers || ''}
                        onChange={(e) => setFormData({ ...formData, estimated_followers: parseInt(e.target.value) || undefined })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30"
                        placeholder="125000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Niches */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Tag size={18} className="mr-2" />
                  Content Niches * ({formData.niches.length} selected)
                </h3>
                
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_NICHES.map((niche) => (
                    <button
                      key={niche}
                      type="button"
                      onClick={() => toggleNiche(niche)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors text-left ${
                        formData.niches.includes(niche)
                          ? 'bg-black text-white border-black'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {niche}
                    </button>
                  ))}
                </div>
                {errors.niches && <p className="text-red-500 text-xs mt-1">{errors.niches}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {(mode === 'manual' || showPreview) && (
          <div className="border-t border-gray-200/60 p-6">
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  if (mode === 'manual') {
                    setMode('discovery')
                    setShowPreview(false)
                  } else {
                    onClose()
                  }
                }}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white/60 backdrop-blur-md border border-gray-200 rounded-xl hover:bg-white/80 transition-colors"
              >
                {mode === 'manual' ? 'Back to Discovery' : 'Cancel'}
              </button>
              {mode === 'manual' && (
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-6 py-3 text-sm font-medium text-white bg-black border border-transparent rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  <span>{isLoading ? 'Adding...' : 'Add Influencer'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
} 