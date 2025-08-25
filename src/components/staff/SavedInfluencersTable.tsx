'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Plus, 
  Trash2, 
  Eye, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Heart,
  ExternalLink
} from 'lucide-react'
import { useStaffSavedInfluencers, StaffSavedInfluencer } from '../../lib/hooks/useStaffSavedInfluencers'
import { formatNumber } from '../../components/influencer/detail-panel/utils'

interface SavedInfluencersTableProps {
  selectedPlatform: 'instagram' | 'tiktok' | 'youtube'
  onViewProfile?: (influencer: StaffSavedInfluencer) => void
}

function SavedInfluencersTable({ 
  selectedPlatform, 
  onViewProfile 
}: SavedInfluencersTableProps) {
  const {
    savedInfluencers,
    isLoading,
    error,
    removeSavedInfluencer,
    addToRoster
  } = useStaffSavedInfluencers(selectedPlatform)

  const [rosterMessages, setRosterMessages] = useState<Record<string, { type: 'success' | 'error', message: string }>>({})
  const [addingToRoster, setAddingToRoster] = useState<string | null>(null)
  const [removingInfluencer, setRemovingInfluencer] = useState<string | null>(null)

  // Format percentage
  const toPct = (n: number): string => {
    if (!n) return '0.00%'
    return n > 1 ? `${n.toFixed(2)}%` : `${(n * 100).toFixed(2)}%`
  }

  // Handle adding to roster
  const handleAddToRoster = async (influencer: StaffSavedInfluencer) => {
    if (influencer.added_to_roster) {
      setRosterMessages(prev => ({
        ...prev,
        [influencer.id]: {
          type: 'error',
          message: 'Already in roster'
        }
      }))
      return
    }

    setAddingToRoster(influencer.id)
    setRosterMessages(prev => ({ ...prev, [influencer.id]: { type: 'success', message: 'Adding to roster...' } }))

    try {
      await addToRoster(influencer.id)
      setRosterMessages(prev => ({
        ...prev,
        [influencer.id]: {
          type: 'success',
          message: 'Added to roster successfully!'
        }
      }))
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setRosterMessages(prev => {
          const { [influencer.id]: _, ...rest } = prev
          return rest
        })
      }, 3000)
    } catch (error) {
      console.error('Failed to add to roster:', error)
      setRosterMessages(prev => ({
        ...prev,
        [influencer.id]: {
          type: 'error',
          message: error instanceof Error ? error.message : 'Failed to add to roster'
        }
      }))
    } finally {
      setAddingToRoster(null)
    }
  }

  // Handle removing saved influencer
  const handleRemoveInfluencer = async (influencer: StaffSavedInfluencer) => {
    if (!confirm(`Are you sure you want to remove @${influencer.username} from saved influencers?`)) {
      return
    }

    setRemovingInfluencer(influencer.id)
    
    try {
      await removeSavedInfluencer(influencer.username, influencer.platform)
    } catch (error) {
      console.error('Failed to remove influencer:', error)
      alert(error instanceof Error ? error.message : 'Failed to remove influencer')
    } finally {
      setRemovingInfluencer(null)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600">Loading saved influencers...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8">
        <div className="flex items-center justify-center text-red-600">
          <AlertCircle className="w-6 h-6 mr-2" />
          <span>Error loading saved influencers: {error}</span>
        </div>
      </div>
    )
  }

  if (savedInfluencers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-600 font-medium mb-2">No saved influencers yet</div>
          <div className="text-gray-500 text-sm">
            Heart influencers from the Search tab to save them here
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Saved Influencers
            </h3>
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {savedInfluencers.length}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Influencer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Followers
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Engagement
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Saved By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {savedInfluencers.map((influencer) => (
              <motion.tr
                key={influencer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* Influencer Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10">
                      <img 
                        className="w-10 h-10 rounded-full object-cover bg-gray-100" 
                        src={influencer.profile_picture || '/default-avatar.svg'} 
                        alt={influencer.display_name}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/default-avatar.svg';
                        }}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {influencer.display_name || influencer.username}
                      </div>
                      <div className="text-sm text-gray-500">
                        @{influencer.username}
                      </div>
                      {influencer.niches && influencer.niches.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {influencer.niches.slice(0, 2).map((niche, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {niche}
                            </span>
                          ))}
                          {influencer.niches.length > 2 && (
                            <span className="text-xs text-gray-400">
                              +{influencer.niches.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Followers */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatNumber(influencer.followers)}
                  </div>
                </td>

                {/* Engagement */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {toPct(influencer.engagement_rate)}
                  </div>
                </td>

                {/* Saved By */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {influencer.saved_by_email}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(influencer.saved_at).toLocaleDateString()}
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {influencer.added_to_roster ? (
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-700 font-medium">In Roster</span>
                      {influencer.added_to_roster_at && (
                        <div className="text-xs text-gray-400 ml-2">
                          {new Date(influencer.added_to_roster_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Saved
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    {/* View Profile Button */}
                    <button 
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" 
                      title="View Profile"
                      onClick={() => {
                        // Restore the complete Modash data format for the popup
                        const restoredInfluencer = {
                          // If we have saved modash_data, use it (complete analytics)
                          ...(influencer.modash_data || {}),
                          // Override with current saved metadata
                          username: influencer.username,
                          displayName: influencer.display_name,
                          followers: influencer.followers,
                          engagement_rate: influencer.engagement_rate,
                          engagementRate: influencer.engagement_rate,
                          avgLikes: influencer.avg_likes,
                          avgViews: influencer.avg_views,
                          avgComments: influencer.avg_comments,
                          picture: influencer.profile_picture,
                          profilePicture: influencer.profile_picture,
                          bio: influencer.bio,
                          location: influencer.location,
                          url: influencer.profile_url,
                          userId: influencer.modash_user_id,
                          creatorId: influencer.modash_user_id,
                          platform: influencer.platform,
                          niches: influencer.niches,
                          // Ensure platforms data is available for popup
                          platforms: influencer.modash_data?.platforms || {
                            [influencer.platform]: {
                              followers: influencer.followers,
                              engagement_rate: influencer.engagement_rate,
                              avgLikes: influencer.avg_likes,
                              avgViews: influencer.avg_views,
                              avgComments: influencer.avg_comments
                            }
                          }
                        }
                        
                        console.log('👁️ Opening saved influencer popup with restored data:', {
                          username: influencer.username,
                          hasModashData: !!influencer.modash_data,
                          hasExtendedAnalytics: !!influencer.modash_data?.extended_analytics,
                          dataKeys: Object.keys(influencer.modash_data || {})
                        })
                        
                        onViewProfile?.(restoredInfluencer)
                      }}
                    >
                      <Eye size={16} />
                    </button>

                    {/* External Link */}
                    {influencer.profile_url && (
                      <a
                        href={influencer.profile_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View on platform"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}

                    {/* Add to Roster Button */}
                    {!influencer.added_to_roster && (
                      <button 
                        className={`p-2 transition-colors rounded-lg ${
                          addingToRoster === influencer.id
                            ? 'text-blue-500 bg-blue-50'
                            : 'text-green-500 hover:text-green-600 hover:bg-green-50'
                        }`}
                        title="Add to Roster"
                        onClick={() => handleAddToRoster(influencer)}
                        disabled={addingToRoster === influencer.id}
                      >
                        {addingToRoster === influencer.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Plus size={16} />
                        )}
                      </button>
                    )}

                    {/* Remove Button */}
                    <button 
                      className={`p-2 transition-colors rounded-lg ${
                        removingInfluencer === influencer.id
                          ? 'text-red-500 bg-red-50'
                          : 'text-red-400 hover:text-red-600 hover:bg-red-50'
                      }`}
                      title="Remove from saved"
                      onClick={() => handleRemoveInfluencer(influencer)}
                      disabled={removingInfluencer === influencer.id}
                    >
                      {removingInfluencer === influencer.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                  
                  {/* Status Message */}
                  {rosterMessages[influencer.id] && (
                    <div className={`mt-1 text-xs ${
                      rosterMessages[influencer.id]?.type === 'success' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {rosterMessages[influencer.id]?.message}
                    </div>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SavedInfluencersTable
