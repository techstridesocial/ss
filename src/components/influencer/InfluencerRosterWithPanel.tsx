'use client'

import { useState } from 'react'
import { Eye, Users, TrendingUp, MapPin } from 'lucide-react'
import { InfluencerWithProfile, InfluencerDetailView } from '@/types/database'
import InfluencerDetailPanel from './InfluencerDetailPanel'

interface InfluencerRosterWithPanelProps {
  influencers: InfluencerWithProfile[]
}

// Mock function to simulate fetching detailed influencer data
const fetchInfluencerDetails = async (influencerId: string): Promise<InfluencerDetailView> => {
  // In real implementation, this would call your API or database
  // For now, return mock detailed data
  const mockInfluencer = {
    id: influencerId,
    user_id: 'user_1',
    display_name: 'Sarah Creator',
    niches: ['Lifestyle', 'Fashion'],
    total_followers: 125000,
    total_engagement_rate: 3.8,
    total_avg_views: 45000,
    estimated_promotion_views: 38250,
    price_per_post: 850,
    is_active: true,
    first_name: 'Sarah',
    last_name: 'Creator',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
    location_country: 'United Kingdom',
    location_city: 'Birmingham',
    platforms: ['INSTAGRAM', 'TIKTOK'],
    platform_count: 2,
    
    // Additional required properties
    relationship_status: 'ACTIVE' as const,
    assigned_to: null,
    labels: [],
    notes: null,
    tier: 'MICRO' as const,
    priority_score: 7.5,
    last_contacted: null,
    bio: 'Lifestyle and fashion content creator passionate about sharing daily inspiration.',
    website_url: 'https://sarahcreator.com',
    email: 'hello@sarahcreator.com',
    
    // Detailed platform information
    platform_details: [
      {
        id: 'plat_1',
        influencer_id: influencerId,
        platform: 'INSTAGRAM' as const,
        username: 'sarah.creator',
        followers: 85000,
        following: 1200,
        engagement_rate: 4.2,
        avg_views: 35000,
        avg_likes: 3500,
        avg_comments: 180,
        last_post_date: new Date('2024-01-15'),
        profile_url: 'https://instagram.com/sarah.creator',
        is_verified: false,
        is_connected: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'plat_2',
        influencer_id: influencerId,
        platform: 'TIKTOK' as const,
        username: 'sarahcreates',
        followers: 40000,
        following: 500,
        engagement_rate: 3.4,
        avg_views: 10000,
        avg_likes: 1200,
        avg_comments: 85,
        last_post_date: new Date('2024-01-14'),
        profile_url: 'https://tiktok.com/@sarahcreates',
        is_verified: false,
        is_connected: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ],
    
    // Recent content
    recent_content: [
      {
        id: 'content_1',
        influencer_platform_id: 'plat_1',
        post_url: 'https://instagram.com/p/abc123',
        thumbnail_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop',
        caption: 'Beautiful sunset at the beach! 🌅 #lifestyle #travel',
        views: 45000,
        likes: 4200,
        comments: 156,
        shares: 23,
        posted_at: new Date('2024-01-15'),
        created_at: new Date()
      },
      {
        id: 'content_2',
        influencer_platform_id: 'plat_1',
        post_url: 'https://instagram.com/p/def456',
        thumbnail_url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300&h=300&fit=crop',
        caption: 'New outfit inspiration for spring! 🌸 #fashion #ootd',
        views: 38000,
        likes: 3800,
        comments: 142,
        shares: 31,
        posted_at: new Date('2024-01-12'),
        created_at: new Date()
      }
    ],
    
    // Demographics (aggregated)
    demographics: {
      id: 'demo_1',
      influencer_platform_id: 'plat_1',
      age_13_17: 5.2,
      age_18_24: 32.1,
      age_25_34: 28.7,
      age_35_44: 18.4,
      age_45_54: 12.1,
      age_55_plus: 3.5,
      gender_male: 45.3,
      gender_female: 52.2,
      gender_other: 2.5,
      updated_at: new Date()
    },
    
    // Audience locations
    audience_locations: [
      {
        id: 'loc_1',
        influencer_platform_id: 'plat_1',
        country_name: 'United Kingdom',
        country_code: 'GB',
        percentage: 65.2
      },
      {
        id: 'loc_2',
        influencer_platform_id: 'plat_1',
        country_name: 'United States',
        country_code: 'US',
        percentage: 18.7
      },
      {
        id: 'loc_3',
        influencer_platform_id: 'plat_1',
        country_name: 'Canada',
        country_code: 'CA',
        percentage: 8.1
      }
    ],
    
    // Audience languages
    audience_languages: [
      {
        id: 'lang_1',
        influencer_platform_id: 'plat_1',
        language_name: 'English',
        language_code: 'en',
        percentage: 85.4
      },
      {
        id: 'lang_2',
        influencer_platform_id: 'plat_1',
        language_name: 'Spanish',
        language_code: 'es',
        percentage: 8.2
      },
      {
        id: 'lang_3',
        influencer_platform_id: 'plat_1',
        language_name: 'French',
        language_code: 'fr',
        percentage: 6.4
      }
    ],
    
    // Campaign participation
    campaign_participation: []
  } as any as InfluencerDetailView
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return mockInfluencer
}

export default function InfluencerRosterWithPanel({ influencers }: InfluencerRosterWithPanelProps) {
  const [selectedInfluencer, setSelectedInfluencer] = useState<InfluencerDetailView | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toString()
  }

  const handleInfluencerClick = async (influencer: InfluencerWithProfile) => {
    setIsLoading(true)
    try {
      const detailedInfluencer = await fetchInfluencerDetails(influencer.id)
      setSelectedInfluencer(detailedInfluencer)
      setIsPanelOpen(true)
    } catch (error) {
      console.error('Failed to fetch influencer details:', error)
    } finally {
      setIsLoading(false)
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
                src={influencer.avatar_url || '/default-avatar.png'}
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
        onClose={() => {
          setIsPanelOpen(false)
          setSelectedInfluencer(null)
        }}
      />
    </div>
  )
} 