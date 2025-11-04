'use client'

import React, { useState, useEffect } from 'react'
import { InfluencerProtectedRoute } from '../../../components/auth/ProtectedRoute'
import ModernInfluencerHeader from '../../../components/nav/ModernInfluencerHeader'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share,
  Search,
  CheckCircle,
  AlertCircle,
  Loader2,
  Instagram,
  Youtube,
  Music
} from 'lucide-react'

interface SocialAccount {
  platform: string
  handle: string
  followers: number
  engagement_rate: number
  avg_views: number
  is_connected: boolean
  data_source: 'cached' | 'live'
  username?: string
  cached_at?: string
}

interface StatsData {
  platforms: SocialAccount[]
  overall: {
    total_followers: number
    avg_engagement: number
    total_views: number
  }
}

export default function EnhancedInfluencerStats() {
  const [statsData, setStatsData] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showConnectionModal, setShowConnectionModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedPlatform, setSelectedPlatform] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState('')
  const [refreshingPlatform, setRefreshingPlatform] = useState('')

  useEffect(() => {
    loadStats()
  }, [])

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
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const searchProfiles = async (query: string, platform: string) => {
    if (!query.trim()) return
    
    setIsSearching(true)
    setSearchQuery(query)
    setSelectedPlatform(platform)
    
    try {
      const response = await fetch('/api/discovery/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: query.replace('@', ''),
          platform: platform
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.results) {
          setSearchResults(data.results)
        }
      }
    } catch (error) {
      console.error('Error searching profiles:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const connectProfile = async (profile: any) => {
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
        await loadStats()
        setSearchResults([])
        setSearchQuery('')
        setSuccessMessage(`✅ ${profile.platform.charAt(0).toUpperCase() + profile.platform.slice(1)} profile @${profile.username} connected successfully!`)
        setTimeout(() => setSuccessMessage(''), 5000)
      }
    } catch (error) {
      console.error('Error connecting profile:', error)
    }
  }

  const refreshPlatform = async (_platform: string) => {
    setRefreshingPlatform(_platform)
    
    try {
      const platformData = statsData?.platforms?.find((p: any) => p.platform === _platform)
      
      const response = await fetch('/api/modash/refresh-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          influencerPlatformId: (platformData as any)?.id,
          platform: _platform
        })
      })
      
      if (response.ok) {
        await loadStats()
        setSuccessMessage(`✅ ${_platform.charAt(0).toUpperCase() + _platform.slice(1)} data refreshed successfully!`)
        setTimeout(() => setSuccessMessage(''), 5000)
      }
    } catch (error) {
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

  const getPlatformIcon = (_platform: string) => {
    switch (_platform) {
      case 'instagram':
        return <Instagram className="h-5 w-5 text-pink-600" />
      case 'tiktok':
        return <Music className="h-5 w-5 text-black" />
      case 'youtube':
        return <Youtube className="h-5 w-5 text-red-600" />
      default:
        return <BarChart3 className="h-5 w-5 text-gray-600" />
    }
  }

  const getConnectedCount = () => {
    return statsData?.platforms?.filter(p => p.is_connected).length || 0
  }

  const getTotalPlatforms = () => {
    return statsData?.platforms?.length || 3
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
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <p className="text-green-800">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Connection Status Banner */}
          {getConnectedCount() < getTotalPlatforms() && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start">
                <AlertCircle className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Connect Your Social Media
                  </h3>
                  <p className="text-blue-800 mb-4">
                    Connect your social media accounts to see your real performance data and analytics.
                    You've connected {getConnectedCount()} of {getTotalPlatforms()} platforms.
                  </p>
                  <button
                    onClick={() => setShowConnectionModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Connect Accounts
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Platform Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {['instagram', 'tiktok', 'youtube'].map(platform => {
              const platformData = statsData?.platforms?.find((p: any) => p.platform === platform)
              const isConnected = platformData?.is_connected || false
              
              return (
                <div key={platform} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getPlatformIcon(platform)}
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">{platform}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isConnected && platformData && (
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
                        {isConnected && platformData ? formatNumber(platformData.followers) : 'Not connected'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Engagement Rate</span>
                      <span className="font-medium">
                        {isConnected && platformData ? formatPercentage(platformData.engagement_rate) : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg. Views</span>
                      <span className="font-medium">
                        {isConnected && platformData ? formatNumber(platformData.avg_views) : '-'}
                      </span>
                    </div>
                    
                    {isConnected && platformData && platformData.username && (
                      <div className="flex justify-between pt-2 border-t border-gray-100">
                        <span className="text-sm text-gray-600">Username</span>
                        <span className="font-medium text-blue-600">@{platformData.username}</span>
                      </div>
                    )}
                    
                    {isConnected && platformData && platformData.cached_at && (
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
                  
                  {/* Connect Button for Unconnected Platforms */}
                  {!isConnected && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setSelectedPlatform(platform)
                          setShowConnectionModal(true)
                        }}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Connect {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </button>
                    </div>
                  )}
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
                <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentage(statsData?.overall?.avg_engagement || 0)}
                </p>
                <p className="text-sm text-gray-600">Avg Engagement</p>
              </div>
              <div className="text-center">
                <Eye className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(statsData?.overall?.total_views || 0)}
                </p>
                <p className="text-sm text-gray-600">Total Views</p>
              </div>
              <div className="text-center">
                <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {getConnectedCount()}/{getTotalPlatforms()}
                </p>
                <p className="text-sm text-gray-600">Platforms Connected</p>
              </div>
            </div>
          </div>

          {/* Connection Modal */}
          {showConnectionModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowConnectionModal(false)} />
              <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Connect Your {selectedPlatform ? selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1) : 'Social Media'} Account
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enter your {selectedPlatform || 'social media'} handle:
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={`@username`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          onClick={() => searchProfiles(searchQuery, selectedPlatform)}
                          disabled={isSearching || !searchQuery.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    {searchResults.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Select your profile:</p>
                        {searchResults.map((profile, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                            onClick={() => connectProfile(profile)}
                          >
                            <div className="flex items-center space-x-3">
                              {getPlatformIcon(profile.platform)}
                              <div>
                                <p className="font-medium">@{profile.username}</p>
                                <p className="text-sm text-gray-600">
                                  {formatNumber(profile.followers)} followers
                                </p>
                              </div>
                            </div>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setShowConnectionModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </InfluencerProtectedRoute>
  )
}
