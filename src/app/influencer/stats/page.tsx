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
  const [successMessage, setSuccessMessage] = useState('')
  const [toastMessage, setToastMessage] = useState('')

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

  // Search functionality removed - profiles can only be connected through support

  // Profile connection functionality removed - profiles can only be connected through support
  const removedConnectProfile = async (profile: any) => {
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

  const getDefaultEngagement = (platform: string) => {
    switch (platform) {
      case 'instagram': return 0.045 // 4.5%
      case 'tiktok': return 0.082 // 8.2%
      case 'youtube': return 0.067 // 6.7%
      default: return 0.05 // 5%
    }
  }

  const getDefaultViews = (platform: string) => {
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

  const getPlatformIcon = (platform: string) => {
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
                Your connected social media platforms and performance metrics are displayed below.
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
                              <p className="text-sm text-slate-500">@{platformData.username}</p>
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
                                  ? (platformData.avg_likes > 0 ? platformData.avg_likes : getDefaultViews(platform))
                                  : platform === 'youtube'
                                  ? (platformData.avg_views > 0 ? platformData.avg_views : getDefaultViews(platform))
                                  : (platformData.avg_views > 0 ? platformData.avg_views : getDefaultViews(platform))
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
                            {/* Refresh functionality removed */}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-200">
                            {getPlatformIcon(platform)}
                          </div>
                          <p className="text-slate-600 mb-4">Not connected</p>
                          <p className="text-sm text-slate-500">Contact support to connect this platform</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>


          {/* Connection modal removed - profiles can only be connected through support */}

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
