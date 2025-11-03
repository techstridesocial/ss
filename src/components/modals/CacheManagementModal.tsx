'use client'

import React, { useState, useEffect } from 'react'
import { X, RefreshCw, Clock, Database, AlertCircle } from 'lucide-react'

interface CacheStats {
  total_cached_profiles: number
  profiles_needing_update: number
  last_update_run: string | null
  credits_used_this_month: number
}

interface CacheManagementModalProps {
  isOpen: boolean
  onClose: () => void
  influencerPlatformId?: string
  platform?: string
  modashUserId?: string
}

export default function CacheManagementModal({
  isOpen,
  onClose,
  influencerPlatformId,
  platform,
  modashUserId
}: CacheManagementModalProps) {
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadCacheStats()
    }
  }, [isOpen])

  const loadCacheStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/modash/update-cache')
      if (response.ok) {
        const data = await response.json()
        setCacheStats(data.data)
      }
    } catch (_error) {
      console.error('Error loading cache stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshProfile = async () => {
    if (!influencerPlatformId || !platform) return

    try {
      setIsRefreshing(true)
      const response = await fetch('/api/modash/refresh-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          influencerPlatformId,
          platform,
          modashUserId
        })
      })

      if (response.ok) {
        const data = await response.json()
        setLastRefresh(data.refreshedAt)
        await loadCacheStats() // Refresh stats
      } else {
        const error = await response.json()
        console.error('Refresh failed:', error)
      }
    } catch (_error) {
      console.error('Error refreshing profile:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const runFullUpdate = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch('/api/modash/update-cache', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_MODASH_UPDATE_TOKEN || 'update-cache-token'}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        await loadCacheStats() // Refresh stats
      }
    } catch (_error) {
      console.error('Error running full update:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Cache Management</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Cache Statistics */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Database size={20} className="mr-2" />
              Cache Statistics
            </h3>
            
            {isLoading ? (
              <div className="text-center py-4">
                <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
                <p className="text-gray-600">Loading stats...</p>
              </div>
            ) : cacheStats ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded p-3">
                  <p className="text-sm text-gray-600">Total Cached Profiles</p>
                  <p className="text-2xl font-bold text-blue-600">{cacheStats.total_cached_profiles}</p>
                </div>
                <div className="bg-white rounded p-3">
                  <p className="text-sm text-gray-600">Needing Update</p>
                  <p className="text-2xl font-bold text-orange-600">{cacheStats.profiles_needing_update}</p>
                </div>
                <div className="bg-white rounded p-3">
                  <p className="text-sm text-gray-600">Credits Used This Month</p>
                  <p className="text-2xl font-bold text-green-600">{cacheStats.credits_used_this_month}</p>
                </div>
                <div className="bg-white rounded p-3">
                  <p className="text-sm text-gray-600">Last Update</p>
                  <p className="text-sm font-medium text-gray-900">
                    {cacheStats.last_update_run 
                      ? new Date(cacheStats.last_update_run).toLocaleDateString()
                      : 'Never'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">Failed to load statistics</p>
            )}
          </div>

          {/* Individual Profile Refresh */}
          {influencerPlatformId && platform && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <RefreshCw size={20} className="mr-2" />
                Refresh This Profile
              </h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Platform: <span className="font-medium capitalize">{platform}</span></p>
                  {modashUserId && (
                    <p className="text-sm text-gray-600">Modash ID: <span className="font-medium">{modashUserId}</span></p>
                  )}
                  {lastRefresh && (
                    <p className="text-sm text-green-600">Last refreshed: {new Date(lastRefresh).toLocaleString()}</p>
                  )}
                </div>
                <button
                  onClick={refreshProfile}
                  disabled={isRefreshing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isRefreshing ? (
                    <>
                      <RefreshCw className="animate-spin" size={16} />
                      <span>Refreshing...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={16} />
                      <span>Refresh Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* System-wide Update */}
          <div className="bg-orange-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock size={20} className="mr-2" />
              System-wide Cache Update
            </h3>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Update all expired profiles (4+ weeks old)</p>
                <div className="flex items-center mt-1 text-sm text-orange-600">
                  <AlertCircle size={16} className="mr-1" />
                  <span>This will consume Modash credits</span>
                </div>
              </div>
              <button
                onClick={runFullUpdate}
                disabled={isRefreshing}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Clock size={16} />
                    <span>Run Update</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Cache Information */}
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">How Cache Updates Work</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Profiles are automatically updated every 4 weeks</li>
              <li>• Manual refreshes fetch the latest data from Modash</li>
              <li>• Each update consumes 1 Modash credit</li>
              <li>• Cached data is displayed with timestamps</li>
              <li>• High-priority profiles may be updated more frequently</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 
