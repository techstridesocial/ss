'use client'

import React, { useState } from 'react'
import { BrandProtectedRoute } from '../../../components/auth/ProtectedRoute'
import ModernBrandHeader from '../../../components/nav/ModernBrandHeader'
import InfluencerDetailPanel from '../../../components/influencer/InfluencerDetailPanel'
import { useHeartedInfluencers } from '../../../lib/context/HeartedInfluencersContext'
import { Heart, Users, TrendingUp, Eye, MapPin, Trash2 } from 'lucide-react'
import { Platform, InfluencerDetailView } from '../../../types/database'

// Helper function to format numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

// Helper function to generate detailed influencer data for the panel
const generateDetailedInfluencerData = (heartedInfluencer: any): InfluencerDetailView => {
  return {
    id: heartedInfluencer.id,
    user_id: `user_${heartedInfluencer.id}`,
    display_name: heartedInfluencer.displayName,
    first_name: heartedInfluencer.displayName.split(' ')[0] || '',
    last_name: heartedInfluencer.displayName.split(' ').slice(1).join(' ') || '',
    avatar_url: heartedInfluencer.profilePicture || '',
    bio: heartedInfluencer.bio || '',
    website_url: '',
    location_country: heartedInfluencer.location?.split(', ')[1] || '',
    location_city: heartedInfluencer.location?.split(', ')[0] || '',
    niches: heartedInfluencer.niches || [],
    total_followers: heartedInfluencer.followers,
    total_engagement_rate: heartedInfluencer.engagement_rate,
    total_avg_views: Math.round(heartedInfluencer.followers * heartedInfluencer.engagement_rate * 0.1),
    estimated_promotion_views: Math.round(heartedInfluencer.followers * heartedInfluencer.engagement_rate * 0.08),
    influencer_type: 'SIGNED' as const,
    content_type: 'STANDARD' as const,
    tier: 'GOLD' as const,
    is_active: true,
    price_per_post: null,
    score: null,
    relationship_status: null,
    assigned_to: null,
    labels: [],
    notes: null,
    email: null,
    platforms: [heartedInfluencer.platform.toUpperCase() as Platform],
    platform_count: 1,
    platform_details: [],
    recent_content: [],
    demographics: null,
    audience_locations: [],
    audience_languages: [],
    campaign_participation: []
  }
}

// Platform Icon Component
const PlatformIcon = ({ platform, size = 20 }: { platform: string, size?: number }) => {
  if (!platform || typeof platform !== 'string') {
    return null
  }
  
  switch (platform.toLowerCase()) {
    case 'instagram':
      return (
        <div className={`rounded-lg flex items-center justify-center`} style={{ width: size, height: size }}>
          <svg className="text-pink-500" style={{ width: size * 0.8, height: size * 0.8 }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </div>
      )
    case 'tiktok':
      return (
        <div className={`rounded-lg flex items-center justify-center`} style={{ width: size, height: size }}>
          <svg className="text-gray-900" style={{ width: size * 0.8, height: size * 0.8 }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
          </svg>
        </div>
      )
    case 'youtube':
      return (
        <div className={`rounded-lg flex items-center justify-center`} style={{ width: size, height: size }}>
          <svg className="text-red-600" style={{ width: size * 0.8, height: size * 0.8 }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </div>
      )
    default:
      return null
  }
}

export default function BrandShortlistsPage() {
  const [detailPanelOpen, setDetailPanelOpen] = useState(false)
  const [selectedInfluencerDetail, setSelectedInfluencerDetail] = useState<InfluencerDetailView | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState<string>('INSTAGRAM')
  const [confirmRemove, setConfirmRemove] = useState<{ id: string; name: string } | null>(null)
  const [confirmClearAll, setConfirmClearAll] = useState(false)

  const { heartedInfluencers, removeHeartedInfluencer, clearHeartedInfluencers } = useHeartedInfluencers()

  // Handle view influencer
  const handleViewInfluencer = (heartedInfluencer: any) => {
    const detailedInfluencer = generateDetailedInfluencerData(heartedInfluencer)
    setSelectedInfluencerDetail(detailedInfluencer)
    setDetailPanelOpen(true)
    setSelectedPlatform(heartedInfluencer.platform.toUpperCase())
  }

  // Handle close detail panel
  const handleCloseDetailPanel = () => {
    setDetailPanelOpen(false)
    setSelectedInfluencerDetail(null)
  }

  // Handle remove from shortlist
  const handleRemoveFromShortlist = (id: string, name: string) => {
    setConfirmRemove({ id, name })
  }

  // Confirm remove from shortlist
  const confirmRemoveFromShortlist = () => {
    if (confirmRemove) {
      removeHeartedInfluencer(confirmRemove.id)
      setConfirmRemove(null)
    }
  }

  // Handle clear all
  const handleClearAll = () => {
    setConfirmClearAll(true)
  }

  // Confirm clear all
  const confirmClearAllInfluencers = () => {
    clearHeartedInfluencers()
    setConfirmClearAll(false)
  }

  return (
    <BrandProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <ModernBrandHeader />
        
        <div className="px-4 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Shortlists</h1>
                <p className="text-gray-600">
                  {heartedInfluencers.length} influencer{heartedInfluencers.length !== 1 ? 's' : ''} saved
                </p>
              </div>
              {heartedInfluencers.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Empty State */}
          {heartedInfluencers.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl border border-white/30 p-12 text-center">
              <Heart size={64} className="mx-auto text-gray-400 mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">No influencers in your shortlist yet</h3>
              <p className="text-gray-600 mb-6">
                Start building your shortlist by browsing influencers and clicking the heart icon.
              </p>
              <a
                href="/brand/influencers"
                className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Browse Influencers
              </a>
            </div>
          ) : (
            /* Shortlisted Influencers Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {heartedInfluencers.map((influencer) => (
                <div key={influencer.id} className="bg-white rounded-2xl shadow-xl border border-white/30 overflow-hidden hover:shadow-2xl transition-shadow">
                  {/* Header with avatar */}
                  <div className="p-6 pb-4">
                    <div className="flex items-center space-x-3 mb-4">
                      {influencer.profilePicture ? (
                        <img 
                          src={influencer.profilePicture} 
                          alt={influencer.displayName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-sm">
                          <Users size={24} className="text-gray-500" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{influencer.displayName}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <PlatformIcon platform={influencer.platform} size={16} />
                          <span className="text-sm text-gray-500 capitalize">{influencer.platform}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center text-sm text-gray-500 mb-1">
                          <Users size={14} className="mr-1" />
                          Followers
                        </div>
                        <div className="font-semibold text-gray-900">{formatNumber(influencer.followers)}</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center text-sm text-gray-500 mb-1">
                          <TrendingUp size={14} className="mr-1" />
                          Engagement
                        </div>
                        <div className="font-semibold text-gray-900">
                          {(influencer.engagement_rate * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {/* Niches */}
                    {influencer.niches && influencer.niches.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {influencer.niches.slice(0, 2).map((niche: string) => (
                            <span
                              key={niche}
                              className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100/80 text-gray-700 rounded-lg"
                            >
                              {niche}
                            </span>
                          ))}
                          {influencer.niches.length > 2 && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100/80 text-gray-700 rounded-lg">
                              +{influencer.niches.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Location */}
                    {influencer.location && (
                      <div className="flex items-center text-sm text-gray-600 mb-4">
                        <MapPin size={14} className="mr-1 text-gray-400" />
                        {influencer.location}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleViewInfluencer(influencer)}
                        className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                      <button
                        onClick={() => handleRemoveFromShortlist(influencer.id, influencer.displayName)}
                        className="px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors flex items-center justify-center rounded-lg"
                        title="Remove from shortlist"
                      >
                        <Heart size={16} fill="currentColor" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedInfluencerDetail && (
          <InfluencerDetailPanel
            influencer={selectedInfluencerDetail}
            isOpen={detailPanelOpen}
            onClose={handleCloseDetailPanel}
            selectedPlatform={selectedPlatform}
            onPlatformSwitch={setSelectedPlatform}
          />
        )}

        {/* Confirmation Modal - Remove Individual */}
        {confirmRemove && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Remove from Shortlist</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove <strong>{confirmRemove.name}</strong> from your shortlist?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setConfirmRemove(null)}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemoveFromShortlist}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal - Clear All */}
        {confirmClearAll && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Clear All Shortlists</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove all <strong>{heartedInfluencers.length} influencer{heartedInfluencers.length !== 1 ? 's' : ''}</strong> from your shortlist? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setConfirmClearAll(false)}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClearAllInfluencers}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BrandProtectedRoute>
  )
} 