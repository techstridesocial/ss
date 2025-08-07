'use client'

import React, { useState, useEffect } from 'react'
import { InfluencerProtectedRoute } from '../../../components/auth/ProtectedRoute'
import ModernInfluencerHeader from '../../../components/nav/ModernInfluencerHeader'
import { BarChart3, TrendingUp, Users, Eye, Heart, MessageCircle, Share } from 'lucide-react'

export default function InfluencerStats() {
  const [statsData, setStatsData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

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
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

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
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Followers</span>
                      <span className="font-medium">
                        {isConnected ? formatNumber(platformData.followers) : 'Not connected'}
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

          {/* Connect Accounts CTA */}
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect your social accounts</h3>
            <p className="text-gray-600 mb-6">
              Connect your Instagram, TikTok, and YouTube accounts to view detailed performance analytics and make yourself discoverable to brands.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all">
                Connect Instagram
              </button>
              <button className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                Connect TikTok
              </button>
              <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Connect YouTube
              </button>
            </div>
          </div>
        </div>
      </div>
    </InfluencerProtectedRoute>
  )
} 