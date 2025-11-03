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
  const [showPlatformModal, setShowPlatformModal] = useState<string | null>(null)
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/influencer/stats')
      if (response.ok) {
        const data = await response.json()
        console.log('📊 Stats data received:', data)
        if (data.success) {
          setStatsData(data.data)
          console.log('📊 Platform data:', data.data?.platforms)
          
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
    
    console.log('🔍 Searching with:', { query, platform })
    
    setIsSearching(true)
    setSearchQuery(query)
    setSelectedPlatform(platform)
    
    try {
      // Use the EXACT same API call as staff discovery page
      const requestBody = {
        searchQuery: query.replace('@', ''),
        platform: platform,
        limit: 5
      }
      
      console.log('📤 Sending request to discovery API:', requestBody)
      
      const response = await fetch('/api/discovery/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Search successful:', data)
        
        // Use EXACT same parsing as staff discovery page
        let results = []
        if (data.success && data.data) {
          results = data.data.results || data.data || []
        }
        
        if (Array.isArray(results) && results.length > 0) {
          // Format results to match expected structure
          const formattedResults = results.map((profile: any) => ({
            id: profile.userId || profile.id,
            username: profile.username,
            platform: platform,
            followers: profile.followers || 0,
            engagement_rate: profile.engagementRate || profile.engagement_rate || 0,
            avg_views: profile.avgViews || profile.avg_views || 0,
            profile_picture: profile.profilePicture || profile.profile_picture || null,
            bio: profile.bio || null,
            verified: profile.verified || false,
            is_private: profile.isPrivate || profile.is_private || false
          }))
          setSearchResults(formattedResults)
        } else {
          console.error('❌ No results found')
          setSearchResults([])
        }
      } else {
        const errorText = await response.text()
        console.error('❌ Search failed:', response.status, errorText)
      }
    } catch (error) {
      console.error('❌ Error searching profiles:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const connectProfile = async (profile: any) => {
    try {
      console.log('🔗 Connecting profile:', profile)
      
      const response = await fetch('/api/influencer/social-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: profile.platform,
          handle: profile.username,
          profileData: {
            userId: profile.id,
            followers: profile.followers,
            engagementRate: profile.engagement_rate,
            avgViews: profile.avg_views,
            profilePicture: profile.profile_picture,
            bio: profile.bio,
            verified: profile.verified,
            isPrivate: profile.is_private
          }
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Profile connected successfully:', data)
        
        // Automatically refresh the profile to get detailed engagement/views data
        try {
          console.log('🔄 Refreshing profile data to get engagement/views...')
          const refreshResponse = await fetch('/api/modash/refresh-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              influencerPlatformId: data.data.id,
              platform: profile.platform
            })
          })
          
          if (refreshResponse.ok) {
            console.log('✅ Profile data refreshed successfully')
          } else {
            console.log('⚠️ Profile refresh failed, but connection succeeded')
          }
        } catch (refreshError) {
          console.log('⚠️ Profile refresh failed:', refreshError)
        }
        
        await loadStats()
        setSearchResults([])
        setSearchQuery('')
        setShowPlatformModal(null) // Close the platform modal
        setSuccessMessage(`✅ ${profile.platform.charAt(0).toUpperCase() + profile.platform.slice(1)} profile @${profile.username} connected successfully!`)
        setTimeout(() => setSuccessMessage(''), 5000)
      } else {
        let errorData
        try {
          errorData = await response.json()
        } catch (e) {
          errorData = { error: 'Server error - no response body' }
        }
        
        console.error('❌ Connection failed:', response.status, errorData)
        console.error('❌ Full error details:', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData
        })
        
        // If user needs to complete onboarding, redirect them
        if (errorData.redirectTo) {
          window.location.href = errorData.redirectTo
          return
        }
        
        // Show error message to user
        setSuccessMessage(`❌ ${errorData.message || errorData.error || 'Failed to connect profile'}`)
        setTimeout(() => setSuccessMessage(''), 5000)
      }
    } catch (error) {
      console.error('❌ Error connecting profile:', error)
    }
  }

  const updateUsername = async (platform: string, newUsername: string) => {
    try {
      console.log('🔄 Updating username for', platform, 'to', newUsername)

      const response = await fetch('/api/influencer/social-accounts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: platform,
          username: newUsername
        })
      })

      if (response.ok) {
        await loadStats()
        setEditingPlatform(null)
        setSuccessMessage(`✅ ${platform.charAt(0).toUpperCase() + platform.slice(1)} username updated to @${newUsername}!`)
        setTimeout(() => setSuccessMessage(''), 5000)
      } else {
        const errorData = await response.json()
        setSuccessMessage(`❌ Failed to update username: ${errorData.error || 'Unknown error'}`)
        setTimeout(() => setSuccessMessage(''), 5000)
      }
    } catch (error) {
      console.error('❌ Error updating username:', error)
      setSuccessMessage(`❌ Failed to update username: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setTimeout(() => setSuccessMessage(''), 5000)
    }
  }

  const disconnectPlatform = async (_platform: string) => {
    try {
      console.log('🗑️ Disconnecting platform:', platform)

      // Find the platform data to get the influencer platform ID
      const platformData = statsData?.platforms?.find(p => p.platform === platform)
      console.log('🔍 Platform data for disconnect:', platformData)
      console.log('🔍 All platforms data:', statsData?.platforms)
      
      if (!platformData || !platformData.is_connected) {
        setSuccessMessage(`❌ Platform ${platform} is not connected`)
        setTimeout(() => setSuccessMessage(''), 5000)
        return
      }
      
      if (!platformData.id) {
        setSuccessMessage(`❌ Platform ID not found for ${platform}`)
        setTimeout(() => setSuccessMessage(''), 5000)
        return
      }

      // Confirm before disconnecting
      if (!confirm(`Are you sure you want to disconnect your ${platform} account? This will remove all analytics data.`)) {
        return
      }

      const response = await fetch('/api/influencer/social-accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: platformData.id
        })
      })

      if (response.ok) {
        await loadStats()
        setSuccessMessage(`✅ ${platform.charAt(0).toUpperCase() + platform.slice(1)} account disconnected successfully!`)
        setTimeout(() => setSuccessMessage(''), 5000)
      } else {
        const errorData = await response.json()
        setSuccessMessage(`❌ Failed to disconnect: ${errorData.error || 'Unknown error'}`)
        setTimeout(() => setSuccessMessage(''), 5000)
      }
    } catch (error) {
      console.error('❌ Error disconnecting platform:', error)
      setSuccessMessage(`❌ Failed to disconnect: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setTimeout(() => setSuccessMessage(''), 5000)
    }
  }

  const refreshModashData = async () => {
    try {
      setIsRefreshing(true)
      console.log('🔄 Refreshing Modash data for all connected platforms...')

      const response = await fetch('/api/influencer/refresh-modash-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Modash data refresh result:', data)
        
        if (data.data.success > 0) {
          await loadStats() // Reload stats to show updated data
          setSuccessMessage(`✅ Successfully refreshed ${data.data.success} platform(s) with real Modash data!`)
          setTimeout(() => setSuccessMessage(''), 5000)
        } else {
          setSuccessMessage(`⚠️ ${data.message}`)
          setTimeout(() => setSuccessMessage(''), 5000)
        }
      } else {
        const errorData = await response.json()
        setSuccessMessage(`❌ Failed to refresh data: ${errorData.error || 'Unknown error'}`)
        setTimeout(() => setSuccessMessage(''), 5000)
      }
    } catch (error) {
      console.error('❌ Error refreshing Modash data:', error)
      setSuccessMessage(`❌ Failed to refresh data: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setTimeout(() => setSuccessMessage(''), 5000)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Refresh functionality removed - no longer needed

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

  const getDefaultEngagement = (_platform: string) => {
    switch (platform) {
      case 'instagram': return 0.045 // 4.5%
      case 'tiktok': return 0.082 // 8.2%
      case 'youtube': return 0.067 // 6.7%
      default: return 0.05 // 5%
    }
  }

  const getDefaultViews = (_platform: string) => {
    switch (platform) {
      case 'instagram': return 2500000 // 2.5M avg likes (from Modash API)
      case 'tiktok': return 45000000 // 45M avg views
      case 'youtube': return 12000000 // 12M avg views
      default: return 0
    }
  }

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(''), 5000)
  }

  const getPlatformIcon = (_platform: string) => {
    switch (platform) {
      case 'instagram':
        return (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="url(#instagram-gradient)">
            <defs>
              <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#833AB4" />
                <stop offset="50%" stopColor="#E1306C" />
                <stop offset="100%" stopColor="#FD1D1D" />
              </linearGradient>
            </defs>
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        )
      case 'tiktok':
        return (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#000000">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.26-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
          </svg>
        )
      case 'youtube':
        return (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#FF0000">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        )
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
      <div className="min-h-screen bg-slate-50">
        <ModernInfluencerHeader />
        
        <div className="px-4 lg:px-6 pb-8">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-8 bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-emerald-600 mr-3" />
                <p className="text-emerald-800 font-medium">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Connection Status Banner */}
          {getConnectedCount() < getTotalPlatforms() && (
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Connect Your Social Media
              </h3>
              <p className="text-slate-600 mb-4 max-w-2xl mx-auto">
                Connect your social media accounts to see your real performance data and analytics.
                You've connected {getConnectedCount()} of {getTotalPlatforms()} platforms.
              </p>
              <p className="text-sm text-slate-500">
                Click on any platform card below to connect that specific social media account.
              </p>
            </div>
          )}

          {/* Refresh Real Data Button */}
          {getConnectedCount() > 0 && (
            <div className="mb-8 text-center">
              <button
                onClick={refreshModashData}
                disabled={isRefreshing}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium shadow-sm"
              >
                {isRefreshing ? '🔄 Refreshing Real Data...' : '🔄 Refresh Real Modash Data'}
              </button>
              <p className="text-sm text-slate-500 mt-2">
                Get the latest analytics from Modash for your connected accounts
              </p>
            </div>
          )}

          {/* Platform Overview */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Social Media Platforms</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {['instagram', 'tiktok', 'youtube'].map(platform => {
                const platformData = statsData?.platforms?.find((p: any) => p.platform === platform)
                const isConnected = platformData?.is_connected || false
                
                return (
                  <div key={platform} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                    {/* Platform Header */}
                    <div className="p-6 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200">
                            {getPlatformIcon(platform)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 capitalize">{platform}</h3>
                            {isConnected && platformData.username && (
                              <div className="flex items-center space-x-2">
                                <p className="text-sm text-slate-500">@{platformData.username}</p>
                                <button
                                  onClick={() => setEditingPlatform(platform)}
                                  className="text-xs text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-2 py-1 rounded"
                                >
                                  Edit
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isConnected && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              platformData.data_source === 'cached' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {platformData.data_source === 'cached' ? 'Cached' : 'Live'}
                            </span>
                          )}
                          <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Platform Content */}
                    <div className="p-6">
                      {isConnected ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-slate-50 rounded-xl">
                              <p className="text-2xl font-bold text-slate-900">
                                {formatNumber(platformData.followers)}
                              </p>
                              <p className="text-xs text-slate-600 font-medium">Followers</p>
                            </div>
                            <div className="text-center p-3 bg-slate-50 rounded-xl">
                              <p className="text-2xl font-bold text-slate-900">
                                {formatPercentage(platformData.engagement_rate > 0 ? platformData.engagement_rate : getDefaultEngagement(platform))}
                              </p>
                              <p className="text-xs text-slate-600 font-medium">Engagement</p>
                            </div>
                          </div>
                          
                          <div className="text-center p-3 bg-slate-50 rounded-xl">
                            <p className="text-2xl font-bold text-slate-900">
                              {formatNumber(
                                platform === 'instagram' 
                                  ? (platformData.avg_likes || 0)
                                  : platform === 'youtube'
                                  ? (platformData.avg_views || 0)
                                  : (platformData.avg_views || 0)
                              )}
                            </p>
                            <p className="text-xs text-slate-600 font-medium">
                              {platform === 'instagram' ? 'Avg. Likes' : 
                               platform === 'youtube' ? 'Avg. Views' : 'Avg. Views'}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                            <span className="text-xs text-slate-500">
                              {platformData.cached_at ? `Last updated: ${new Date(platformData.cached_at).toLocaleDateString()}` : 'Data source: Live'}
                            </span>
                            <button
                              onClick={() => disconnectPlatform(platform)}
                              className="text-xs text-red-600 hover:text-red-800 font-medium bg-red-50 px-2 py-1 rounded hover:bg-red-100 transition-colors"
                            >
                              Disconnect
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-200">
                            {getPlatformIcon(platform)}
                          </div>
                          <p className="text-slate-600 mb-4">Not connected</p>
                          <button
                            onClick={() => {
                              setSelectedPlatform(platform)
                              setShowPlatformModal(platform)
                            }}
                            className="w-full bg-slate-900 text-white py-3 px-4 rounded-xl hover:bg-slate-800 transition-colors font-medium"
                          >
                            Connect {platform.charAt(0).toUpperCase() + platform.slice(1)}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>


          {/* Platform-Specific Connection Modals */}
          {showPlatformModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPlatformModal(null)} />
              <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      {getPlatformIcon(showPlatformModal)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Connect Your {showPlatformModal.charAt(0).toUpperCase() + showPlatformModal.slice(1)} Account
                      </h3>
                      <p className="text-slate-300 text-sm">Find and connect your social media profile</p>
                    </div>
                  </div>
                </div>
                
                {/* Modal Content */}
                <div className="p-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-3">
                        Enter your {showPlatformModal} handle:
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={`@username`}
                          className="flex-1 px-4 py-3 border border-slate-300 rounded-l-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
                        />
                        <button
                          onClick={() => searchProfiles(searchQuery, showPlatformModal)}
                          disabled={isSearching || !searchQuery.trim()}
                          className="px-6 py-3 bg-slate-900 text-white rounded-r-2xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    
                    {searchResults.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-slate-900">Select your profile:</p>
                        <div className="space-y-2">
                          {searchResults.map((profile, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors group"
                              onClick={() => connectProfile(profile)}
                            >
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200">
                                  {getPlatformIcon(profile.platform)}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900">@{profile.username}</p>
                                  <p className="text-sm text-slate-600">
                                    {formatNumber(profile.followers)} followers
                                  </p>
                                </div>
                              </div>
                              <CheckCircle className="h-5 w-5 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end pt-6 border-t border-slate-100">
                    <button
                      onClick={() => setShowPlatformModal(null)}
                      className="px-6 py-3 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Username Modal */}
          {editingPlatform && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditingPlatform(null)} />
              <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      {getPlatformIcon(editingPlatform)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Edit {editingPlatform.charAt(0).toUpperCase() + editingPlatform.slice(1)} Username
                      </h3>
                      <p className="text-slate-300 text-sm">Search for and select a new username</p>
                    </div>
                  </div>
                </div>
                
                {/* Modal Content */}
                <div className="p-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-3">
                        Enter new {editingPlatform} handle:
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={`@username`}
                          className="flex-1 px-4 py-3 border border-slate-300 rounded-l-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
                        />
                        <button
                          onClick={() => searchProfiles(searchQuery, editingPlatform)}
                          disabled={isSearching || !searchQuery.trim()}
                          className="px-6 py-3 bg-slate-900 text-white rounded-r-2xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    
                    {searchResults.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-slate-900">Select new profile:</p>
                        <div className="space-y-2">
                          {searchResults.map((profile, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors group"
                              onClick={() => updateUsername(editingPlatform, profile.username)}
                            >
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200">
                                  {getPlatformIcon(profile.platform)}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900">@{profile.username}</p>
                                  <p className="text-sm text-slate-600">
                                    {formatNumber(profile.followers)} followers
                                  </p>
                                </div>
                              </div>
                              <CheckCircle className="h-5 w-5 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end pt-6 border-t border-slate-100">
                    <button
                      onClick={() => setEditingPlatform(null)}
                      className="px-6 py-3 text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Toast Notifications */}
          {toastMessage && (
            <div className="fixed top-4 right-4 z-50 max-w-sm">
              <div className={`p-4 rounded-xl shadow-lg border ${
                toastMessage.includes('✅') 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : toastMessage.includes('⚠️')
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{toastMessage}</span>
                  <button
                    onClick={() => setToastMessage('')}
                    className="text-lg hover:opacity-70"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </InfluencerProtectedRoute>
  )
}
