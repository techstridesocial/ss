'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Eye, Users, TrendingUp, MapPin } from 'lucide-react'
import { InfluencerWithProfile, InfluencerDetailView } from '@/types/database'
import InfluencerDetailPanel from './InfluencerDetailPanel'
import { fetchInfluencerDetails } from '@/lib/api/influencers'

interface InfluencerRosterWithPanelProps {
  influencers: InfluencerWithProfile[]
}

export default function InfluencerRosterWithPanel({ influencers }: InfluencerRosterWithPanelProps) {
  const [selectedInfluencer, setSelectedInfluencer] = useState<InfluencerDetailView | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<string>('INSTAGRAM')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  // Handle URL state for influencer selection
  useEffect(() => {
    const influencerId = searchParams.get('influencer')
    const platform = searchParams.get('platform')
    
    if (influencerId && influencerId !== selectedInfluencer?.id) {
      // Load influencer from URL
      handleInfluencerFromUrl(influencerId)
    } else if (!influencerId && isPanelOpen) {
      // Close panel if no influencer in URL
      setIsPanelOpen(false)
      setSelectedInfluencer(null)
    }
    
    if (platform) {
      setSelectedPlatform(platform)
    }
  }, [searchParams])

  const handleInfluencerFromUrl = async (influencerId: string) => {
    setIsLoading(true)
    try {
      const detailedInfluencer = await fetchInfluencerDetails(influencerId)
      setSelectedInfluencer(detailedInfluencer)
      setIsPanelOpen(true)
    } catch (error) {
      console.error('Failed to fetch influencer details:', error)
      // Remove invalid influencer from URL
      updateUrl(null)
    } finally {
      setIsLoading(false)
    }
  }

  const updateUrl = (influencerId: string | null, platform?: string) => {
    const params = new URLSearchParams(searchParams)
    
    if (influencerId) {
      params.set('influencer', influencerId)
      if (platform) {
        params.set('platform', platform)
      }
    } else {
      params.delete('influencer')
      params.delete('platform')
    }
    
    const newUrl = `${pathname}?${params.toString()}`
    router.replace(newUrl, { scroll: false })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toString()
  }

  const handleInfluencerClick = async (influencer: InfluencerWithProfile) => {
    setIsLoading(true)
    
    // Update URL immediately
    updateUrl(influencer.id, selectedPlatform)
    
    try {
      const detailedInfluencer = await fetchInfluencerDetails(influencer.id)
      setSelectedInfluencer(detailedInfluencer)
      setIsPanelOpen(true)
    } catch (error) {
      console.error('Failed to fetch influencer details:', error)
      // Revert URL on error
      updateUrl(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePanelClose = () => {
    setIsPanelOpen(false)
    setSelectedInfluencer(null)
    // Remove influencer from URL
    updateUrl(null)
  }

  const handlePlatformSwitch = (_platform: string) => {
    setSelectedPlatform(platform)
    // Update URL with new platform
    if (selectedInfluencer) {
      updateUrl(selectedInfluencer.id, platform)
    }
  }

  const getEngagementColor = (rate: number) => {
    if (rate >= 6) return 'text-green-600'
    if (rate >= 3) return 'text-blue-600'
    if (rate >= 1) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="bg-white">
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 z-30 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-600">Loading influencer details...</p>
          </div>
        </div>
      )}

      {/* Table Header */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="col-span-3">Influencer</div>
          <div className="col-span-2">Followers</div>
          <div className="col-span-2">Platforms</div>
          <div className="col-span-2">Engagement</div>
          <div className="col-span-2">Location</div>
          <div className="col-span-1">Actions</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200">
        {influencers.map((influencer) => (
          <div
            key={influencer.id}
            className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => handleInfluencerClick(influencer)}
          >
            {/* Influencer Info */}
            <div className="col-span-3 flex items-center space-x-3">
              <img
                src={influencer.avatar_url || '/default-avatar.svg'}
                alt={influencer.display_name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="font-medium text-gray-900">{influencer.display_name}</div>
                <div className="text-sm text-gray-500">
                  {influencer.first_name} {influencer.last_name}
                </div>
              </div>
            </div>

            {/* Followers */}
            <div className="col-span-2 flex items-center">
              <div>
                <div className="font-semibold text-gray-900">{formatNumber(influencer.total_followers)}</div>
                <div className="text-sm text-gray-500">followers</div>
              </div>
            </div>

            {/* Platforms */}
            <div className="col-span-2 flex items-center">
              <div className="flex flex-wrap gap-1">
                {influencer.platforms.map(platform => (
                  <span 
                    key={platform}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>

            {/* Engagement */}
            <div className="col-span-2 flex items-center">
              <div>
                <div className={`font-semibold ${getEngagementColor(influencer.total_engagement_rate)}`}>
                  {influencer.total_engagement_rate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">engagement</div>
              </div>
            </div>

            {/* Location */}
            <div className="col-span-2 flex items-center">
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{influencer.location_country || 'Unknown'}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="col-span-1 flex items-center">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleInfluencerClick(influencer)
                }}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {influencers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No influencers found</h3>
          <p className="text-gray-500">Try adjusting your filters or search criteria.</p>
        </div>
      )}

      {/* Detail Panel */}
      <InfluencerDetailPanel
        influencer={selectedInfluencer}
        isOpen={isPanelOpen}
        onClose={handlePanelClose}
        selectedPlatform={selectedPlatform}
        onPlatformSwitch={handlePlatformSwitch}
      />
    </div>
  )
} 