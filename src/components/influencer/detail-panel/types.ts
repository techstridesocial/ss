// Type definitions for the influencer detail panel
export interface InfluencerData {
  id: string
  name?: string
  handle: string
  profilePicture?: string
  bio?: string
  followers: number
  engagement_rate?: number
  avgViews?: number
  avgLikes?: number
  avgComments?: number
  avgShares?: number
  postCount?: number
  fake_followers_percentage?: number
  fake_followers_quality?: 'below_average' | 'average' | 'above_average'
  estimated_impressions?: number
  estimated_reach?: number
  growth_trends?: {
    follower_growth?: {
      value: number
      trend: 'up' | 'down' | 'stable'
      percentage: number
    }
    engagement_growth?: {
      value: number
      trend: 'up' | 'down' | 'stable'
      percentage: number
    }
    likes_growth?: {
      value: number
      trend: 'up' | 'down' | 'stable'
      percentage: number
    }
  }
  content_performance?: {
    reels?: {
      avg_plays?: number
      engagement_rate?: number
      avg_likes?: number
      avg_comments?: number
      avg_shares?: number
    }
    posts?: {
      total?: number
      posts_with_hidden_comments?: number
      likes?: {
        mean?: Array<{ numberOfItems: number; value: number }>
        min?: Array<{ numberOfItems: number; value: number }>
        max?: Array<{ numberOfItems: number; value: number }>
        median?: Array<{ numberOfItems: number; value: number }>
      }
      comments?: {
        mean?: Array<{ numberOfItems: number; value: number }>
        min?: Array<{ numberOfItems: number; value: number }>
        max?: Array<{ numberOfItems: number; value: number }>
        median?: Array<{ numberOfItems: number; value: number }>
      }
      views?: {
        mean?: Array<{ numberOfItems: number; value: number }>
        min?: Array<{ numberOfItems: number; value: number }>
        max?: Array<{ numberOfItems: number; value: number }>
        median?: Array<{ numberOfItems: number; value: number }>
      }
      shares?: {
        mean?: Array<{ numberOfItems: number; value: number }>
        min?: Array<{ numberOfItems: number; value: number }>
        max?: Array<{ numberOfItems: number; value: number }>
        median?: Array<{ numberOfItems: number; value: number }>
      }
      engagement_rate?: Array<{ numberOfItems: number; value: number }>
      posting_statistics?: {
        weekDayHour?: {
          mean?: { numberOfItems: number; value: number }
        }
        daily?: {
          mean?: { numberOfItems: number; value: number }
        }
      }
    }
    stories?: {
      estimated_reach?: number
      estimated_impressions?: number
    }
  }
  paid_vs_organic?: {
    paid_engagement_rate?: number
    organic_engagement_rate?: number
    paid_performance_ratio?: number
  }
  audience?: {
    gender?: Record<string, number>
    age_ranges?: Record<string, number>
    locations?: Array<{
      country: string
      city?: string
      percentage: number
    }>
    languages?: Array<{
      language: string
      percentage: number
    }>
    interests?: Array<{
      interest: string
      percentage: number
    }>
  }
  engagement?: {
    avg_likes?: number
    avg_comments?: number
    avg_shares?: number
    engagement_rate?: number
    estimated_impressions?: number
    estimated_reach?: number
  }
  
  // Additional contextual data from comprehensive APIs
  relevant_hashtags?: string[]
  brand_partnerships?: Array<{
    id?: number
    name: string
    count?: number
  }>
  content_topics?: string[]
  raw_performance_data?: any
  performance_data_status?: 'processing' | 'unavailable' | 'error'
  
  // New Modash API data fields
  audience_interests?: Array<{
    id?: number
    name: string
    percentage?: number
  }> | string[]
  audience_languages?: Array<{
    id?: number
    name: string
    percentage?: number
  }> | string[]
  
  // 🆕 NEW: Missing fields from API
  statHistory?: Array<{
    month: string
    followers: number
    following: number
    avgLikes: number
    avgViews: number
    avgComments: number
    avgShares: number
  }>
  postsCount?: number
  postsCounts?: number
  mentions?: Array<{
    tag: string
    weight: number
  }>
  statsByContentType?: {
    all?: any
    reels?: any
  }
  city?: string
  state?: string
  country?: string
  ageGroup?: string
  gender?: string
  language?: {
    code: string
    name: string
  }
  contacts?: Array<{
    type: string
    value: string
  }>
  isPrivate?: boolean
  accountType?: string
  avgReelsPlays?: number
  recentPosts?: Array<any>
  popularPosts?: Array<any>
  audience_notable?: number
  audience_credibility?: number
  audience_notable_users?: Array<any>
  audience_lookalikes?: Array<any>
  audience_ethnicities?: Array<any>
  audience_reachability?: Array<any>
  audience_types?: Array<any>
  audience_genders_per_age?: Array<any>
  audience_geo_cities?: Array<any>
  audience_geo_states?: Array<any>
  stats_compared?: any
  audienceExtra?: any
  paidPostPerformance?: number
  paidPostPerformanceViews?: number
  sponsoredPostsMedianViews?: number
  sponsoredPostsMedianLikes?: number
  nonSponsoredPostsMedianViews?: number
  nonSponsoredPostsMedianLikes?: number
  creator_interests?: Array<any>
  creator_brand_affinity?: Array<any>
  lookalikes?: Array<any>

}

export interface InfluencerDetailPanelProps {
  influencer: InfluencerData | null
  isOpen: boolean
  onClose: () => void
  selectedPlatform?: string
  onPlatformSwitch?: (platform: string) => void
  onSave?: (data: InfluencerData) => void
  city?: string
  country?: string
  loading?: boolean
}

export interface MetricRowProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  secondaryValue?: string
  trend?: number
  quality?: 'below_average' | 'average' | 'above_average'
}

export interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}