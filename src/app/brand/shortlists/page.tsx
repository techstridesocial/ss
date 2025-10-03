'use client'

import React, { useState } from 'react'
import { BrandProtectedRoute } from '../../../components/auth/ProtectedRoute'
import ModernBrandHeader from '../../../components/nav/ModernBrandHeader'
import InfluencerDetailPanel from '../../../components/influencer/InfluencerDetailPanel'
import { useHeartedInfluencers, Shortlist } from '../../../lib/context/HeartedInfluencersContext'
import { 
  Heart, 
  Users, 
  TrendingUp, 
  Eye, 
  MapPin, 
  Trash2, 
  Plus, 
  Edit3, 
  Copy, 
  MoreHorizontal,
  FolderOpen,
  Calendar,
  Send,
  ExternalLink
} from 'lucide-react'
import { Platform, InfluencerDetailView } from '../../../types/database'
import { 
  CreateShortlistModal, 
  EditShortlistModal, 
  DuplicateShortlistModal, 
  DeleteShortlistModal 
} from '../../../components/shortlists/ShortlistManagement'
import CreateCampaignFromShortlistsModal from '../../../components/campaigns/CreateCampaignFromShortlistsModal'
import RequestQuoteModal from '../../../components/campaigns/RequestQuoteModal'

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
    // score: null, // Not in InfluencerDetailView type
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
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedShortlist, setSelectedShortlist] = useState<Shortlist | null>(null)
  const [createCampaignModalOpen, setCreateCampaignModalOpen] = useState(false)
  const [selectedShortlistsForCampaign, setSelectedShortlistsForCampaign] = useState<string[]>([])
  const [requestQuoteModalOpen, setRequestQuoteModalOpen] = useState(false)
  
  // Selected shortlist to view
  const [currentShortlistId, setCurrentShortlistId] = useState<string>('default')
  
  // Removal confirmations
  const [confirmRemove, setConfirmRemove] = useState<{ shortlistId: string; influencerId: string; name: string } | null>(null)

  const { shortlists, isLoading, removeInfluencerFromShortlist } = useHeartedInfluencers()

  // Get current shortlist
  const currentShortlist = shortlists.find(s => s.id === currentShortlistId) || shortlists[0]
  
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

  // Handle remove from current shortlist
  const handleRemoveFromShortlist = (influencerId: string, name: string) => {
    if (!currentShortlist) return
    setConfirmRemove({ 
      shortlistId: currentShortlist.id, 
      influencerId, 
      name 
    })
  }

  // Confirm remove from shortlist
  const confirmRemoveFromShortlist = async () => {
    if (confirmRemove) {
      try {
        await removeInfluencerFromShortlist(confirmRemove.shortlistId, confirmRemove.influencerId)
      } catch (error) {
        console.error('Error removing influencer:', error)
      } finally {
        setConfirmRemove(null)
      }
    }
  }

  // Handle shortlist actions
  const handleEditShortlist = (shortlist: Shortlist) => {
    setSelectedShortlist(shortlist)
    setEditModalOpen(true)
  }

  const handleDuplicateShortlist = (shortlist: Shortlist) => {
    setSelectedShortlist(shortlist)
    setDuplicateModalOpen(true)
  }

  const handleDeleteShortlist = (shortlist: Shortlist) => {
    setSelectedShortlist(shortlist)
    setDeleteModalOpen(true)
  }

  const handleRequestQuote = (shortlist: Shortlist) => {
    setSelectedShortlistsForCampaign([shortlist.id])
    setCreateCampaignModalOpen(true)
  }

  const handleCreateCampaign = async (campaignData: any) => {
    try {
      console.log('Creating campaign from shortlists:', campaignData)
      
      // In a real app, this would make an API call to create the campaign
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(campaignData)
      })
      
      if (response.ok) {
        alert(`Campaign "${campaignData.name}" created successfully!`)
        setCreateCampaignModalOpen(false)
        setSelectedShortlistsForCampaign([])
      } else {
        throw new Error('Failed to create campaign')
      }
    } catch (error) {
      console.error('Error creating campaign:', error)
      alert('Failed to create campaign. Please try again.')
    }
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
                  {shortlists.length} shortlist{shortlists.length !== 1 ? 's' : ''} with {shortlists.reduce((total, s) => total + s.influencers.length, 0)} total influencers
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setRequestQuoteModalOpen(true)}
                  disabled={shortlists.length === 0 || shortlists.reduce((total, s) => total + s.influencers.length, 0) === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                  Request Quote
                </button>
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  New Shortlist
                </button>
              </div>
            </div>
          </div>

          {/* Shortlists Overview Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-3 text-gray-600">Loading shortlists...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 overflow-visible">
              {shortlists.map((shortlist) => (
              <div key={shortlist.id} className="bg-white rounded-2xl shadow-xl border border-white/30 overflow-visible hover:shadow-2xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{shortlist.name}</h3>
                      {shortlist.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{shortlist.description}</p>
                      )}
                    </div>
                    
                    {/* Dropdown Menu */}
                    <div className="relative group">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreHorizontal size={16} className="text-gray-500" />
                      </button>
                      
                      {/* Dropdown */}
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="py-1">
                          <button
                            onClick={() => handleEditShortlist(shortlist)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Edit3 size={14} />
                            Edit Details
                          </button>
                          <button
                            onClick={() => handleDuplicateShortlist(shortlist)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Copy size={14} />
                            Duplicate
                          </button>
                          <button
                            onClick={() => handleRequestQuote(shortlist)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            disabled={shortlist.influencers.length === 0}
                          >
                            <Send size={14} />
                            Request Quote
                          </button>
                          <hr className="my-1" />
                          <button
                            onClick={() => handleDeleteShortlist(shortlist)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            disabled={shortlist.id === 'default'}
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users size={16} />
                      <span>{shortlist.influencers.length} influencers</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={16} />
                      <span>{new Date(shortlist.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setCurrentShortlistId(shortlist.id)}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        currentShortlistId === shortlist.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <FolderOpen size={16} />
                      {currentShortlistId === shortlist.id ? 'Viewing' : 'View'}
                    </button>
                    {shortlist.influencers.length > 0 && (
                      <button
                        onClick={() => handleRequestQuote(shortlist)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Send size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}

          {/* Current Shortlist Details */}
          {currentShortlist && (
            <div className="bg-white rounded-2xl shadow-xl border border-white/30">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{currentShortlist.name}</h2>
                    {currentShortlist.description && (
                      <p className="text-gray-600 mt-1">{currentShortlist.description}</p>
                    )}
                  </div>
                  {currentShortlist.influencers.length > 0 && (
                    <button
                      onClick={() => handleRequestQuote(currentShortlist)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Send size={16} />
                      Request Quote
                    </button>
                  )}
                </div>
              </div>

              {/* Influencers Grid */}
              {currentShortlist.influencers.length === 0 ? (
                <div className="p-12 text-center">
                  <Heart size={64} className="mx-auto text-gray-400 mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">No influencers in this shortlist yet</h3>
                  <p className="text-gray-600 mb-6">
                    Start adding influencers by browsing the influencer directory and clicking the heart icon.
                  </p>
                  <a
                    href="/brand/influencers"
                    className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors gap-2"
                  >
                    <ExternalLink size={16} />
                    Browse Influencers
                  </a>
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentShortlist.influencers.map((influencer) => (
                      <div key={influencer.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
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
                            <h4 className="font-semibold text-gray-900 truncate">{influencer.displayName}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <PlatformIcon platform={influencer.platform} size={14} />
                              <span className="text-sm text-gray-500 capitalize">@{influencer.username}</span>
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center">
                            <div className="flex items-center justify-center text-xs text-gray-500 mb-1">
                              <Users size={12} className="mr-1" />
                              Followers
                            </div>
                            <div className="font-semibold text-gray-900 text-sm">{formatNumber(influencer.followers)}</div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center text-xs text-gray-500 mb-1">
                              <TrendingUp size={12} className="mr-1" />
                              Engagement
                            </div>
                            <div className="font-semibold text-gray-900 text-sm">
                              {(influencer.engagement_rate * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewInfluencer(influencer)}
                            className="flex-1 px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-sm"
                          >
                            <Eye size={14} />
                            View
                          </button>
                          <button
                            onClick={() => handleRemoveFromShortlist(influencer.id, influencer.displayName)}
                            className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors flex items-center justify-center rounded-lg"
                            title="Remove from shortlist"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modals */}
        <CreateShortlistModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onCreateSuccess={(newShortlistId) => setCurrentShortlistId(newShortlistId)}
        />

        <EditShortlistModal
          shortlist={selectedShortlist}
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setSelectedShortlist(null)
          }}
        />

        <DuplicateShortlistModal
          shortlist={selectedShortlist}
          isOpen={duplicateModalOpen}
          onClose={() => {
            setDuplicateModalOpen(false)
            setSelectedShortlist(null)
          }}
          onDuplicateSuccess={(newShortlistId) => setCurrentShortlistId(newShortlistId)}
        />

        <DeleteShortlistModal
          shortlist={selectedShortlist}
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false)
            setSelectedShortlist(null)
          }}
          onDeleteConfirm={() => {
            // Switch to default shortlist if current was deleted
            if (selectedShortlist?.id === currentShortlistId) {
              setCurrentShortlistId('default')
            }
          }}
        />

        {/* Detail Panel */}
        {selectedInfluencerDetail && (
          <InfluencerDetailPanel
            influencer={{
              id: selectedInfluencerDetail.id,
              handle: selectedInfluencerDetail.display_name,
              followers: selectedInfluencerDetail.total_followers || 0,
              profilePicture: selectedInfluencerDetail.avatar_url || undefined,
              bio: selectedInfluencerDetail.bio || undefined,
              engagement_rate: selectedInfluencerDetail.total_engagement_rate || undefined,
              avgViews: selectedInfluencerDetail.total_avg_views || undefined,
            }}
            isOpen={detailPanelOpen}
            onClose={handleCloseDetailPanel}
            selectedPlatform={selectedPlatform as 'instagram' | 'tiktok' | 'youtube'}
            onPlatformSwitch={setSelectedPlatform as (platform: 'instagram' | 'tiktok' | 'youtube') => void}
          />
        )}

        {/* Confirmation Modal - Remove Individual */}
        {confirmRemove && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Remove from Shortlist</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove <strong>{confirmRemove.name}</strong> from this shortlist?
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

        {/* Create Campaign Modal */}
        <CreateCampaignFromShortlistsModal
          isOpen={createCampaignModalOpen}
          onClose={() => {
            setCreateCampaignModalOpen(false)
            setSelectedShortlistsForCampaign([])
          }}
          onSave={handleCreateCampaign}
          preSelectedShortlists={selectedShortlistsForCampaign}
        />

        {/* Request Quote Modal */}
        <RequestQuoteModal
          isOpen={requestQuoteModalOpen}
          onClose={() => setRequestQuoteModalOpen(false)}
          selectedInfluencers={shortlists.flatMap(s => s.influencers)}
        />
      </div>
    </BrandProtectedRoute>
  )
} 