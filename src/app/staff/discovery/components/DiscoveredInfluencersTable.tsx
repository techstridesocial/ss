'use client'

import React, { useState, useMemo } from 'react'
import { RefreshCw, Users, ChevronUp, ChevronDown, CheckCircle, Eye, Heart, Plus, Loader2 } from 'lucide-react'
import { Platform, Influencer, SortConfig, RosterMessage } from '../types/discovery'
import { formatNumber, toPct, getMetricValue } from '../utils/formatting'
import { validateAndSanitizeUrl } from '../utils/validation'
import { getPlatformIconJSX, getPlatformColor, InstagramLogo, TikTokLogo, YouTubeLogo } from '../utils/platformHelpers'
import { addToRoster } from '../services/discoveryService'

export interface DiscoveredInfluencersTableProps {
  selectedPlatform: Platform
  searchResults?: Influencer[]
  isLoading?: boolean
  error?: string | null
  searchQuery?: string
  onViewProfile?: (influencer: Influencer) => void
  isInfluencerSaved?: (username: string, platform: Platform) => boolean
  handleHeartToggle?: (influencer: Influencer) => void
}

export function DiscoveredInfluencersTable({
  selectedPlatform,
  searchResults,
  isLoading,
  error,
  searchQuery,
  onViewProfile,
  isInfluencerSaved,
  handleHeartToggle
}: DiscoveredInfluencersTableProps) {
  const [addingToRoster, setAddingToRoster] = useState<string | null>(null)
  const [rosterMessages, setRosterMessages] = useState<Record<string, RosterMessage>>({})
  const discoveredCreators = searchResults || []
  const showLoading = isLoading || false
  const showError = error || null

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: 'asc'
  })

  const handleAddToRoster = async (influencer: Influencer) => {
    if (!influencer.discoveredId) {
      return
    }

    setAddingToRoster(influencer.discoveredId)

    try {
      const modashUserId = influencer.userId || influencer.id
      const platform = influencer.platform || selectedPlatform

      const result = await addToRoster(influencer.discoveredId, modashUserId, platform)

      if (result.success) {
        const message = result.hasCompleteData
          ? 'Successfully added to roster with complete analytics! 🎉'
          : 'Successfully added to roster!'

        setRosterMessages(prev => ({
          ...prev,
          [influencer.discoveredId!]: {
            type: 'success',
            message: message
          }
        }))

        setTimeout(() => {
          setRosterMessages(prev => {
            const newMessages = { ...prev }
            delete newMessages[influencer.discoveredId!]
            return newMessages
          })
        }, 4000)
      } else {
        setRosterMessages(prev => ({
          ...prev,
          [influencer.discoveredId!]: {
            type: 'error',
            message: result.error || 'Failed to add to roster'
          }
        }))
      }
    } catch (error) {
      setRosterMessages(prev => ({
        ...prev,
        [influencer.discoveredId!]: {
          type: 'error',
          message: 'Failed to add to roster'
        }
      }))
    } finally {
      setAddingToRoster(null)
    }
  }

  const getDiscoveryTitle = () => {
    return `Discovered Creators (${selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)} Stats)`
  }

  const handleSort = (key: string) => {
    const newDirection = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    setSortConfig({
      key,
      direction: newDirection
    })
  }

  const sortedInfluencers = useMemo(() => {
    const sortableInfluencers = [...discoveredCreators]

    if (sortConfig.key) {
      sortableInfluencers.sort((a, b) => {
        let aValue: any
        let bValue: any

        switch (sortConfig.key) {
          case 'display_name':
            aValue = a.displayName || a.display_name || a.username || ''
            bValue = b.displayName || b.display_name || b.username || ''
            break
          case 'followers':
            const aPlatformData = a.platforms?.[selectedPlatform] ||
              (a.platforms ? Object.values(a.platforms)[0] : a)
            const bPlatformData = b.platforms?.[selectedPlatform] ||
              (b.platforms ? Object.values(b.platforms)[0] : b)
            aValue = Number(aPlatformData?.followers || a.followers || 0) || 0
            bValue = Number(bPlatformData?.followers || b.followers || 0) || 0
            break
          case 'engagement_rate':
            const aEngagementData = a.platforms?.[selectedPlatform] ||
              (a.platforms ? Object.values(a.platforms)[0] : a)
            const bEngagementData = b.platforms?.[selectedPlatform] ||
              (b.platforms ? Object.values(b.platforms)[0] : b)
            aValue = Number(aEngagementData?.engagement_rate || a.engagement_rate || 0) || 0
            bValue = Number(bEngagementData?.engagement_rate || b.engagement_rate || 0) || 0
            break
          default:
            aValue = a[sortConfig.key as keyof Influencer]
            bValue = b[sortConfig.key as keyof Influencer]
        }

        if (aValue == null || aValue === undefined) {
          aValue = (sortConfig.key === 'followers' || sortConfig.key === 'engagement_rate') ? 0 : ''
        }
        if (bValue == null || bValue === undefined) {
          bValue = (sortConfig.key === 'followers' || sortConfig.key === 'engagement_rate') ? 0 : ''
        }

        if (sortConfig.key === 'followers' || sortConfig.key === 'engagement_rate') {
          const numA = typeof aValue === 'number' ? aValue : Number(aValue) || 0
          const numB = typeof bValue === 'number' ? bValue : Number(bValue) || 0
          return sortConfig.direction === 'asc' ? numA - numB : numB - numA
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return sortableInfluencers
  }, [discoveredCreators, sortConfig, selectedPlatform])

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    const isActive = sortConfig.key === columnKey
    const isAsc = sortConfig.direction === 'asc'

    if (!isActive) {
      return (
        <div className="flex flex-col">
          <ChevronUp size={12} className="text-gray-300 group-hover:text-gray-400 transition-colors -mb-1" />
          <ChevronDown size={12} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
        </div>
      )
    }

    return (
      <div className="flex flex-col">
        <ChevronUp size={12} className={`transition-colors -mb-1 ${isAsc ? 'text-blue-600' : 'text-gray-300'}`} />
        <ChevronDown size={12} className={`transition-colors ${!isAsc ? 'text-blue-600' : 'text-gray-300'}`} />
      </div>
    )
  }

  const getUsername = (influencer: Influencer): string => {
    return influencer.username ||
      influencer.instagram_handle?.replace('@', '') ||
      influencer.tiktok_handle?.replace('@', '') ||
      influencer.youtube_handle?.replace('@', '') ||
      'unknown'
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden h-full flex flex-col">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">{getDiscoveryTitle()}</h3>
            {searchQuery?.trim() && (
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Exact Match
                </span>
                <span className="text-sm text-gray-500">for "{searchQuery}"</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-auto flex-1">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>
              <th
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                onClick={() => handleSort('display_name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Influencer</span>
                  <SortIcon columnKey="display_name" />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platforms</th>
              <th
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                onClick={() => handleSort('followers')}
              >
                <div className="flex items-center space-x-1">
                  <span>Followers ({selectedPlatform})</span>
                  <SortIcon columnKey="followers" />
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                onClick={() => handleSort('engagement_rate')}
              >
                <div className="flex items-center space-x-1">
                  <span>Engagement ({selectedPlatform})</span>
                  <SortIcon columnKey="engagement_rate" />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {showLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center space-x-3">
                    <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                    <span className="text-gray-600">Searching Modash database...</span>
                  </div>
                </td>
              </tr>
            ) : showError ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="text-center">
                    <div className="text-red-600 font-medium mb-2">Search Failed</div>
                    <div className="text-gray-600 text-sm">{showError}</div>
                  </div>
                </td>
              </tr>
            ) : sortedInfluencers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <div className="text-gray-600 font-medium mb-2">No influencers found</div>
                    <div className="text-gray-500 text-sm">Try adjusting your filters or search terms</div>
                  </div>
                </td>
              </tr>
            ) : (
              sortedInfluencers.map((creator, index) => {
                const isMultiPlatform = creator.platforms && Object.keys(creator.platforms).length > 1
                const primaryPlatformData = creator.platforms?.[selectedPlatform] || creator
                const displayName = creator.name || creator.displayName || creator.display_name || creator.username
                const handle = creator.username || primaryPlatformData?.username
                const pictureSrc = creator.picture || creator.profilePicture || creator.profile_picture
                const engagementRaw = getMetricValue(
                  primaryPlatformData?.engagement_rate || primaryPlatformData?.engagementRate,
                  creator.engagement_rate || creator.engagementRate
                )
                const username = getUsername(creator)
                const isSaved = isInfluencerSaved?.(username, selectedPlatform) || false

                return (
                  <tr key={creator.creatorId || creator.userId || `creator-${index}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={pictureSrc}
                          alt={displayName || ''}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {displayName || creator.username}
                            {creator.verified && (
                              <CheckCircle size={14} className="ml-2 text-blue-500" />
                            )}
                          </div>
                          {isMultiPlatform ? (
                            <div className="text-xs text-gray-500 space-y-1 mt-1">
                              {Object.entries(creator.platforms!).map(([platform, data]: [string, any]) => (
                                <div key={platform} className="flex items-center space-x-1">
                                  <span className="capitalize">{platform}:</span>
                                  <span>@{data.username}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">
                              @{handle}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {isMultiPlatform ? (
                          Object.entries(creator.platforms!).map(([platform, data]: [string, any]) => (
                            <div key={platform} className="flex items-center space-x-1">
                              {platform === 'instagram' && (
                                <a
                                  href={data.url || `https://www.instagram.com/${data.username}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-pink-500 hover:bg-gray-100 p-1 rounded transition-colors cursor-pointer"
                                  title={`View on Instagram (@${data.username})`}
                                >
                                  <InstagramLogo />
                                </a>
                              )}
                              {platform === 'youtube' && (
                                <a
                                  href={data.url || `https://www.youtube.com/@${data.username}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-red-500 hover:bg-gray-100 p-1 rounded transition-colors cursor-pointer"
                                  title={`View on YouTube (@${data.username})`}
                                >
                                  <YouTubeLogo />
                                </a>
                              )}
                              {platform === 'tiktok' && (
                                <a
                                  href={data.url || `https://www.tiktok.com/@${data.username}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-900 hover:bg-gray-100 p-1 rounded transition-colors cursor-pointer"
                                  title={`View on TikTok (@${data.username})`}
                                >
                                  <TikTokLogo />
                                </a>
                              )}
                            </div>
                          ))
                        ) : (
                          <>
                            {(() => {
                              const platformData = creator.platforms?.[selectedPlatform] || creator
                              const platformUsername = platformData?.username || creator.username
                              const platformUrl = platformData?.url || creator.url

                              if (selectedPlatform === 'instagram' || !selectedPlatform) {
                                return (
                                  <a
                                    href={platformUrl || `https://www.instagram.com/${platformUsername}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-pink-500 hover:bg-gray-100 p-1 rounded transition-colors cursor-pointer"
                                    title={`View on Instagram (@${platformUsername})`}
                                  >
                                    <InstagramLogo />
                                  </a>
                                )
                              } else if (selectedPlatform === 'youtube') {
                                return (
                                  <a
                                    href={platformUrl || `https://www.youtube.com/@${platformUsername}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-red-500 hover:bg-gray-100 p-1 rounded transition-colors cursor-pointer"
                                    title={`View on YouTube (@${platformUsername})`}
                                  >
                                    <YouTubeLogo />
                                  </a>
                                )
                              } else if (selectedPlatform === 'tiktok') {
                                return (
                                  <a
                                    href={platformUrl || `https://www.tiktok.com/@${platformUsername}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-900 hover:bg-gray-100 p-1 rounded transition-colors cursor-pointer"
                                    title={`View on TikTok (@${platformUsername})`}
                                  >
                                    <TikTokLogo />
                                  </a>
                                )
                              }
                              return null
                            })()}
                          </>
                        )}

                        {creator.contacts && creator.contacts.length > 0 && (
                          <div className="flex items-center space-x-1 mt-1">
                            {creator.contacts.map((contact, contactIndex) => {
                              const platformUrl = validateAndSanitizeUrl(contact)
                              const platformIcon = getPlatformIconJSX(contact.type)
                              const platformColor = getPlatformColor(contact.type)

                              if (!platformUrl || !platformIcon || !contact.type) {
                                return null
                              }

                              const platformName = contact.type.charAt(0).toUpperCase() + contact.type.slice(1)

                              return (
                                <a
                                  key={`contact-${contactIndex}-${contact.type}`}
                                  href={platformUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className={`
                                    ${platformColor}
                                    hover:bg-gray-100 p-1 rounded transition-all duration-200 cursor-pointer
                                    opacity-75 hover:opacity-100 hover:scale-105
                                    flex items-center justify-center
                                  `.trim()}
                                  title={`Open ${platformName} profile`}
                                  aria-label={`Open ${platformName} profile in new tab`}
                                >
                                  {platformIcon}
                                </a>
                              )
                            }).filter(Boolean)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatNumber(primaryPlatformData?.followers ?? creator.followers ?? 0)}
                      </div>
                      {isMultiPlatform && (
                        <div className="text-xs text-gray-500">
                          {selectedPlatform} • {formatNumber(creator.totalFollowers || 0)} total
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {toPct(engagementRaw)}
                      </div>
                      {isMultiPlatform && (
                        <div className="text-xs text-gray-500">{selectedPlatform} only</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          className={`p-2 transition-colors rounded-lg ${
                            isSaved
                              ? 'text-red-500 hover:text-red-600 hover:bg-red-50'
                              : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'
                          }`}
                          title={isSaved ? "Already saved" : "Save to favorites"}
                          onClick={() => handleHeartToggle?.(creator)}
                        >
                          <Heart
                            size={16}
                            fill={isSaved ? 'currentColor' : 'none'}
                          />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Profile"
                          onClick={() => onViewProfile?.(creator)}
                        >
                          <Eye size={16} />
                        </button>
                        {creator.discoveredId && (
                          <button
                            className={`p-2 transition-colors rounded-lg ${
                              addingToRoster === creator.discoveredId
                                ? 'text-blue-500 bg-blue-50'
                                : 'text-green-400 hover:text-green-600 hover:bg-green-50'
                            }`}
                            title="Add to Roster"
                            onClick={() => handleAddToRoster(creator)}
                            disabled={addingToRoster === creator.discoveredId}
                          >
                            {addingToRoster === creator.discoveredId ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Plus size={16} />
                            )}
                          </button>
                        )}
                      </div>
                      {creator.discoveredId && rosterMessages[creator.discoveredId] && (
                        <div className={`mt-1 text-xs ${
                          rosterMessages[creator.discoveredId]?.type === 'success'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {rosterMessages[creator.discoveredId]?.message}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
