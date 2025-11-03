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
  influencer_type: 'GOLD' | 'SILVER' | 'PARTNERED'
  average_views?: number
  instagram_username?: string
  tiktok_username?: string
  youtube_username?: string
  estimated_followers?: number
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

interface AddInfluencerModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: InfluencerData) => Promise<void>
}

const AVAILABLE_NICHES = [
  'Tech', 'Lifestyle', 'Product review', 'Home', 'Gaming', 'AI', 'Web',
  'Education', 'Food', 'Fitness', 'Cleaning', 'Adventure', 'Travel', 
  'Family', 'Sports', 'Entertainment', 'Music', 'Fashion', 'Beauty', 'Health'
]

const PLATFORMS = [
  { value: 'INSTAGRAM', label: 'Instagram', prefix: '@' },
  { value: 'TIKTOK', label: 'TikTok', prefix: '@' },
  { value: 'YOUTUBE', label: 'YouTube', prefix: '@' }
]

export default function AddInfluencerModal({ 
  isOpen, 
  onClose, 
  onSave 
}: AddInfluencerModalProps) {
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
    influencer_type: 'GOLD',
    average_views: undefined,
    instagram_username: '',
    tiktok_username: '',
    youtube_username: '',
    estimated_followers: undefined
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const searchModashProfile = async (handle: string, platform: string): Promise<ModashDiscoveryData> => {
    // Mock Modash Discovery API call
    // In real implementation, this would call the actual Modash API
    
    setIsSearching(true)
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Return "not found" only for very specific test cases
      if (handle.toLowerCase() === 'notfound' || handle.toLowerCase() === 'test404') {
        return {
          found: false,
          error: 'Profile not found in Modash database or below 1k followers threshold'
        }
      }
      
      // Generate realistic mock data for any other handle
      const displayName = handle.charAt(0).toUpperCase() + handle.slice(1)
      
      // Generate different data based on handle characteristics
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
          niches_detected: ['Tech', 'Product review', 'Gaming']
        }
      } else if (handle.toLowerCase().includes('fitness') || handle.toLowerCase().includes('gym')) {
        mockData = {
          followers: 95000 + Math.floor(Math.random() * 60000),
          engagement_rate: 4.5 + Math.random() * 2,
          bio: `Fitness coach | Workout tips | Healthy lifestyle 💪`,
          location_country: "Australia",
          location_city: "Sydney", 
          average_views: 45000 + Math.floor(Math.random() * 25000),
          credibility_score: 0.82 + Math.random() * 0.15,
          niches_detected: ['Fitness', 'Health', 'Lifestyle']
        }
      } else if (handle.toLowerCase().includes('travel') || handle.toLowerCase().includes('adventure')) {
        mockData = {
          followers: 78000 + Math.floor(Math.random() * 45000),
          engagement_rate: 3.9 + Math.random() * 2,
          bio: `Travel blogger | Adventure seeker | Exploring the world 🌍`,
          location_country: "Canada",
          location_city: "Vancouver",
          average_views: 38000 + Math.floor(Math.random() * 20000),
          credibility_score: 0.79 + Math.random() * 0.15,
          niches_detected: ['Travel', 'Adventure', 'Lifestyle']
        }
      } else {
        // Default generic influencer data for any other handle
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
          display_name: `${displayName} ${mockData.niches_detected[0]}`,
          followers: mockData.followers,
          engagement_rate: parseFloat(mockData.engagement_rate.toFixed(1)),
          platform: platform as any,
          verified: Math.random() > 0.7, // 30% chance of being verified
          bio: mockData.bio,
          location_country: mockData.location_country,
          location_city: mockData.location_city,
          average_views: mockData.average_views,
          audience_demographics: {
            age_groups: { "18-24": 0.3 + Math.random() * 0.2, "25-34": 0.4 + Math.random() * 0.2, "35-44": 0.2 + Math.random() * 0.1 },
            gender: { "female": 0.4 + Math.random() * 0.4, "male": 0.4 + Math.random() * 0.4 },
            locations: { 
              [mockData.location_country.substring(0, 2).toUpperCase()]: 0.6 + Math.random() * 0.2,
              "US": 0.2 + Math.random() * 0.15,
              "CA": 0.1 + Math.random() * 0.1 
            }
          },
          credibility_score: parseFloat(mockData.credibility_score.toFixed(2)),
          niches_detected: mockData.niches_detected,
          email: `contact@${handle.toLowerCase()}.com`
        },
        confidence: 80 + Math.floor(Math.random() * 15) // 80-95% confidence
      }
    } finally {
      setIsSearching(false)
    }
  }

  const handleDiscoverySearch = async () => {
    if (!discoveryHandle.trim()) return
    
    const cleanHandle = discoveryHandle.replace('@', '').trim()
    const _result = await searchModashProfile(cleanHandle, selectedPlatform)
    setDiscoveryData(result)
    
    if (result.found && result.profile) {
      setShowPreview(true)
      
      // Auto-populate form with discovered data
      setFormData({
        display_name: result.profile.username,
        first_name: result.profile.display_name.split(' ')[0] || '',
        last_name: result.profile.display_name.split(' ').slice(1).join(' ') || '',
        email: result.profile.email || '',
        bio: result.profile.bio,
        location_country: result.profile.location_country || '',
        location_city: result.profile.location_city || '',
        website_url: '',
        niches: result.profile.niches_detected || [],
        influencer_type: 'GOLD',
        average_views: result.profile.average_views,
        instagram_username: selectedPlatform === 'INSTAGRAM' ? cleanHandle : '',
        tiktok_username: selectedPlatform === 'TIKTOK' ? cleanHandle : '',
        youtube_username: selectedPlatform === 'YOUTUBE' ? cleanHandle : '',
        estimated_followers: result.profile.followers
      })
    }
  }

  const handleConfirmDiscovery = () => {
    setMode('manual')
    setShowPreview(false)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.display_name.trim()) newErrors.display_name = 'Display name is required'
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required'
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (formData.niches.length === 0) newErrors.niches = 'Select at least one niche'
    
    // At least one social platform should be provided
    const hasSocialMedia = formData.instagram_username || formData.tiktok_username || 
                          formData.youtube_username
    if (!hasSocialMedia) {
      newErrors.social = 'Please provide at least one social media username'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

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
        influencer_type: 'GOLD',
        average_views: undefined,
        instagram_username: '',
        tiktok_username: '',
        youtube_username: '',
        estimated_followers: undefined
      })
      setErrors({})
      setMode('discovery')
      setDiscoveryHandle('')
      setDiscoveryData(null)
      setShowPreview(false)
      onClose()
    } catch (error) {
      console.error('Error adding influencer:', error)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Influencer</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Mode Selection */}
        {mode === 'discovery' && !showPreview && (
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <Zap size={20} className="text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Quick Discovery</h3>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Enter a social media handle and we'll automatically fetch their profile data using Modash Discovery API
              </p>
              
              {/* Platform Selection */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {PLATFORMS.map((platform) => (
                  <button
                    key={platform.value}
                    type="button"
                    onClick={() => setSelectedPlatform(platform.value as any)}
                    className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                      selectedPlatform === platform.value
                        ? 'bg-blue-100 border-blue-300 text-blue-800'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {platform.label}
                  </button>
                ))}
              </div>

              {/* Handle Input */}
              <div className="flex space-x-2">
                <div className="flex-1">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {PLATFORMS.find(p => p.value === selectedPlatform)?.prefix}
                    </span>
                    <input
                      type="text"
                      value={discoveryHandle}
                      onChange={(e) => setDiscoveryHandle(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="username"
                      onKeyPress={(e) => e.key === 'Enter' && handleDiscoverySearch()}
                    />
                  </div>
                </div>
                <button
                  onClick={handleDiscoverySearch}
                  disabled={!discoveryHandle.trim() || isSearching}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isSearching ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Search size={16} />
                  )}
                  <span>{isSearching ? 'Searching...' : 'Discover'}</span>
                </button>
              </div>

              {/* Discovery Results */}
              {discoveryData && !discoveryData.found && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle size={16} className="text-yellow-600 mr-2" />
                    <span className="text-sm text-yellow-800">
                      {discoveryData.error}
                    </span>
                  </div>
                  <button
                    onClick={() => setMode('manual')}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Add manually instead →
                  </button>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setMode('manual')}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Skip discovery and add manually
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Discovery Preview */}
        {showPreview && discoveryData?.found && discoveryData.profile && (
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle size={20} className="text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Profile Found!</h3>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                    <User size={24} className="text-gray-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{discoveryData.profile.display_name}</h4>
                    {discoveryData.profile.verified && (
                      <CheckCircle size={16} className="text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">@{discoveryData.profile.username}</p>
                  <p className="text-sm text-gray-700 mb-3">{discoveryData.profile.bio}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Followers:</span>
                      <div className="font-semibold">{discoveryData.profile.followers.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Engagement:</span>
                      <div className="font-semibold">{discoveryData.profile.engagement_rate}%</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Location:</span>
                      <div className="font-semibold">{discoveryData.profile.location_country}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Avg Views:</span>
                      <div className="font-semibold">{discoveryData.profile.average_views.toLocaleString()}</div>
                    </div>
                  </div>

                  {discoveryData.profile.credibility_score && (
                    <div className="mt-3">
                      <span className="text-sm text-gray-500">Credibility Score: </span>
                      <span className={`text-sm font-semibold ${
                        discoveryData.profile.credibility_score > 0.85 ? 'text-green-600' : 
                        discoveryData.profile.credibility_score > 0.7 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {Math.round(discoveryData.profile.credibility_score * 100)}%
                      </span>
                      <span className="text-xs text-gray-500 ml-1">
                        ({Math.round((1 - discoveryData.profile.credibility_score) * 100)}% fake followers)
                      </span>
                    </div>
                  )}

                  {discoveryData.profile.niches_detected && (
                    <div className="mt-3">
                      <span className="text-sm text-gray-500">Detected Niches: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {discoveryData.profile.niches_detected.map((niche) => (
                          <span key={niche} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            {niche}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setShowPreview(false)
                  setDiscoveryData(null)
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Search Again
              </button>
              <button
                onClick={handleConfirmDiscovery}
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <CheckCircle size={16} />
                <span>Continue with This Profile</span>
              </button>
            </div>
          </div>
        )}

        {/* Manual Entry Form */}
        {mode === 'manual' && (
          <div className="p-6 space-y-6">
            {discoveryData?.found && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  ✨ Data pre-filled from Modash Discovery. You can edit any field below before saving.
                </p>
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.display_name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="@beautybybella"
                />
                {errors.display_name && <p className="text-red-500 text-xs mt-1">{errors.display_name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Mail size={16} className="mr-1" />
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="bella@example.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.first_name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Bella"
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
                  className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.last_name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Johnson"
                />
                {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of the influencer and their content style..."
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <MapPin size={16} className="mr-1" />
                  Country
                </label>
                <input
                  type="text"
                  value={formData.location_country}
                  onChange={(e) => setFormData({ ...formData, location_country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="London"
                />
              </div>
            </div>

            {/* Website & Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Globe size={16} className="mr-1" />
                  Website URL
                </label>
                <input
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <TrendingUp size={16} className="mr-1" />
                  Average Views
                </label>
                <input
                  type="number"
                  value={formData.average_views || ''}
                  onChange={(e) => setFormData({ ...formData, average_views: parseInt(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="125000"
                />
              </div>
            </div>

            {/* Social Media Usernames */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Social Media Platforms * (At least one required)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Instagram Username</label>
                  <input
                    type="text"
                    value={formData.instagram_username}
                    onChange={(e) => setFormData({ ...formData, instagram_username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="username (without @)"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">TikTok Username</label>
                  <input
                    type="text"
                    value={formData.tiktok_username}
                    onChange={(e) => setFormData({ ...formData, tiktok_username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="username (without @)"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">YouTube Username</label>
                  <input
                    type="text"
                    value={formData.youtube_username}
                    onChange={(e) => setFormData({ ...formData, youtube_username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="username (without @)"
                  />
                </div>
              </div>
              {errors.social && <p className="text-red-500 text-xs mt-1">{errors.social}</p>}
            </div>

            {/* Influencer Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Influencer Type *
              </label>
              <select
                value={formData.influencer_type}
                onChange={(e) => setFormData({ ...formData, influencer_type: e.target.value as 'GOLD' | 'SILVER' | 'PARTNERED' })}
                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="GOLD">GOLD</option>
                <option value="SILVER">SILVER</option>
                <option value="PARTNERED">PARTNERED</option>
              </select>
            </div>

            {/* Niches */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Tag size={16} className="mr-1" />
                Content Niches * ({formData.niches.length} selected)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {AVAILABLE_NICHES.map((niche) => (
                  <button
                    key={niche}
                    type="button"
                    onClick={() => toggleNiche(niche)}
                    className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                      formData.niches.includes(niche)
                        ? 'bg-blue-100 border-blue-300 text-blue-800'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
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

        {/* Footer */}
        {(mode === 'manual' || showPreview) && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={() => {
                if (mode === 'manual') {
                  setMode('discovery')
                  setShowPreview(false)
                } else {
                  onClose()
                }
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              {mode === 'manual' ? 'Back to Discovery' : 'Cancel'}
            </button>
            {mode === 'manual' && (
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
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
        )}
      </motion.div>
    </div>
  )
} 