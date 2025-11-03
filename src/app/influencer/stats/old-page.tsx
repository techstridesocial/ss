'use client'

import React, { useState, useEffect } from 'react'
import { InfluencerProtectedRoute } from '../../../components/auth/ProtectedRoute'
import ModernInfluencerHeader from '../../../components/nav/ModernInfluencerHeader'
import { BarChart3, TrendingUp, Users, Eye, Heart, MessageCircle, Share } from 'lucide-react'

export default function InfluencerStats() {
  const [statsData, setStatsData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [refreshingPlatform, setRefreshingPlatform] = useState('')

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/influencer/stats')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setStatsData(data.data)
          }
        }
      } catch (_error) {
        console.error('Error loading stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  const searchProfiles = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    setShowResults(false)
    
    try {
      const response = await fetch('/api/discovery/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: searchQuery.replace('@', ''),
          platform: 'all' // Search across all platforms
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.results) {
          setSearchResults(data.results)
          setShowResults(true)
        }
      }
    } catch (_error) {
      console.error('Error searching profiles:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const selectProfile = async (profile: any) => {
    // Save selected profile and refresh stats
    try {
      const response = await fetch('/api/influencer/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedProfile: profile,
          platform: profile.platform
        })
      })
      
      if (response.ok) {
        // Refresh the stats data
        const statsResponse = await fetch('/api/influencer/stats')
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          if (statsData.success) {
            setStatsData(statsData.data)
            setShowResults(false)
            setSearchQuery('')
            setSuccessMessage(`✅ ${profile.platform.charAt(0).toUpperCase() + profile.platform.slice(1)} profile @${profile.username} connected successfully!`)
            setTimeout(() => setSuccessMessage(''), 5000) // Clear message after 5 seconds
          }
        }
      }
    } catch (_error) {
      console.error('Error selecting profile:', error)
    }
  }

  const refreshPlatform = async (_platform: string) => {
    setRefreshingPlatform(platform)
    
    try {
      // Find the platform data to get the influencer platform ID
      const platformData = statsData?.platforms?.find((p: any) => p.platform === platform)
      
      const response = await fetch('/api/modash/refresh-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          influencerPlatformId: platformData?.id,
          platform: platform
        })
      })
      
      if (response.ok) {
        // Refresh the stats data
        const statsResponse = await fetch('/api/influencer/stats')
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          if (statsData.success) {
            setStatsData(statsData.data)
            setSuccessMessage(`✅ ${platform.charAt(0).toUpperCase() + platform.slice(1)} data refreshed successfully!`)
            setTimeout(() => setSuccessMessage(''), 5000)
          }
        }
      }
    } catch (_error) {
      console.error('Error refreshing platform:', error)
    } finally {
      setRefreshingPlatform('')
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatPercentage = (num: number) => {
    return (num * 100).toFixed(2) + '%'
  }

  if (isLoading) {
    return (
      <InfluencerProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <ModernInfluencerHeader />
          <div className="px-4 lg:px-6 pb-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading stats...</div>
            </div>
          </div>
        </div>
      </InfluencerProtectedRoute>
    )
  }

  return (
    <InfluencerProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <ModernInfluencerHeader />
        
        <div className="px-4 lg:px-6 pb-8">
          {/* Platform Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {['instagram', 'tiktok', 'youtube'].map(platform => {
              const platformData = statsData?.platforms?.find((p: any) => p.platform === platform)
              const isConnected = platformData?.is_connected || false
              
              return (
                <div key={platform} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">{platform}</h3>
                    <div className={`flex items-center space-x-2`}>
                      {isConnected && (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          platformData.data_source === 'cached' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {platformData.data_source === 'cached' ? 'Cached Data' : 'Live Data'}
                        </span>
                      )}
                      <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Followers</span>
                      <span className="font-medium">
                        {isConnected ? formatNumber(platformData.followers) : 'Search to connect'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Engagement Rate</span>
                      <span className="font-medium">
                        {isConnected ? formatPercentage(platformData.engagement_rate) : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        {platform === 'youtube' ? 'Avg. Views' : 'Avg. Views'}
                      </span>
                      <span className="font-medium">
                        {isConnected ? formatNumber(platformData.avg_views) : '-'}
                      </span>
                    </div>
                    {isConnected && platformData.username && (
                      <div className="flex justify-between pt-2 border-t border-gray-100">
                        <span className="text-sm text-gray-600">Username</span>
                        <span className="font-medium text-blue-600">@{platformData.username}</span>
                      </div>
                    )}
                    {isConnected && platformData.cached_at && (
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-xs text-gray-500">Last updated</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {new Date(platformData.cached_at).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => refreshPlatform(platform)}
                            disabled={refreshingPlatform === platform}
                            className="text-xs text-blue-600 hover:text-blue-800 underline disabled:text-gray-400 disabled:no-underline"
                          >
                            {refreshingPlatform === platform ? 'Refreshing...' : 'Refresh'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Overall Performance Metrics */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Overall Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(statsData?.overall?.total_followers || 0)}
                </p>
                <p className="text-sm text-gray-600">Total Followers</p>
              </div>
              <div className="text-center">
                <Eye className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(statsData?.overall?.total_views || 0)}
                </p>
                <p className="text-sm text-gray-600">Total Views</p>
              </div>
              <div className="text-center">
                <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentage(statsData?.overall?.avg_engagement_rate || 0)}
                </p>
                <p className="text-sm text-gray-600">Avg. Engagement</p>
              </div>
              <div className="text-center">
                <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">0%</p>
                <p className="text-sm text-gray-600">Growth Rate</p>
              </div>
            </div>
          </div>

          {/* Find My Profile CTA */}
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Find Your Profile</h3>
            <p className="text-gray-600 mb-6">
              Search for your social media profiles to view your real performance analytics and make yourself discoverable to brands.
            </p>
            
            {/* Search Interface */}
            <div className="max-w-md mx-auto mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchProfiles()}
                  placeholder="Enter your username (e.g., @johnsmith)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSearching}
                />
                <button 
                  onClick={searchProfiles}
                  disabled={isSearching || !searchQuery.trim()}
                  className="absolute right-2 top-2 px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-500 mb-4">
              We'll search across Instagram, TikTok, and YouTube to find your profiles
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="max-w-md mx-auto mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800 text-center font-medium">
                  {successMessage}
                </p>
              </div>
            )}

            {/* Search Results */}
            {showResults && searchResults.length > 0 && (
              <div className="max-w-2xl mx-auto mt-8 bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Found Profiles - Select Yours:</h4>
                <div className="space-y-3">
                  {searchResults.map((profile, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-lg font-semibold text-gray-600">
                              {profile.platform === 'instagram' ? '📷' : profile.platform === 'tiktok' ? '🎵' : '📹'}
                            </span>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-900">@{profile.username}</h5>
                            <p className="text-sm text-gray-600 capitalize">{profile.platform}</p>
                            <p className="text-xs text-gray-500">
                              {formatNumber(profile.followers || 0)} followers • {formatPercentage(profile.engagement_rate || 0)} engagement
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => selectProfile(profile)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          This is me
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showResults && searchResults.length === 0 && (
              <div className="max-w-md mx-auto mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 text-center">
                  No profiles found. Try a different username or make sure you have at least 1k followers.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </InfluencerProtectedRoute>
  )
} 