// Type definitions for the influencer detail panel

export interface SocialContact {
  type: string
  value: string
}

export interface PlatformData {
  followers?: number
  engagementRate?: number
  avgLikes?: number
  avgComments?: number
  avgShares?: number
  fake_followers_percentage?: number
  credibility?: number
  audience?: any
  audience_interests?: any
  audience_languages?: any
  relevant_hashtags?: string[]
  brand_partnerships?: Array<{ id?: number; name: string; count?: number }>
  content_topics?: string[]
  statsByContentType?: any
  topContent?: any
  content_performance?: any
  growth_trends?: any
  profile_picture?: string
  profilePicture?: string
  // Catch-all for other platform-specific fields
  [key: string]: any
}

export interface PlatformsData {
  instagram?: PlatformData
  tiktok?: PlatformData
  youtube?: PlatformData
}

export interface InfluencerData {
  id: string
  name?: string
  displayName?: string // Alternative display name
  display_name?: string // API field variation
  handle: string
  username?: string // Alternative handle field
  profilePicture?: string
  profile_picture?: string // API field variation
  picture?: string // API field variation
  bio?: string
  url?: string // Profile URL
  description?: string // Channel/profile description
  followers: number
  engagement_rate?: number
  engagementRate?: number // API field variation
  isVerified?: boolean // Verification status
  // Roster-specific properties
  isRosterInfluencer?: boolean
  hasPreservedAnalytics?: boolean
  rosterId?: string
  // 🎯 Platform-specific data storage
  platforms?: PlatformsData
  // Platform details from database (for username extraction)
  platform_details?: Array<{
    id?: string
    platform?: string
    username?: string
    followers?: number
    engagement_rate?: number
    avg_views?: number
    is_connected?: boolean
    profile_url?: string
    [key: string]: any
  }>
  avgViews?: number
  avgLikes?: number
  avgComments?: number
  avgShares?: number
  postCount?: number
  fake_followers_percentage?: number
  fake_followers_quality?: 'below_average' | 'average' | 'above_average'
  estimated_impressions?: number
  estimated_reach?: number
  contacts?: SocialContact[] // Connected social media platforms
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
      saves?: {
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
  // TikTok-specific paid performance data
  paidPostPerformance?: number
  paidPostPerformanceViews?: number
  sponsoredPostsMedianViews?: number
  sponsoredPostsMedianLikes?: number
  nonSponsoredPostsMedianViews?: number
  nonSponsoredPostsMedianLikes?: number
  
  // TikTok profile additional data
  engagements?: number
  averageViews?: number
  totalLikes?: number
  
  // YouTube-specific profile data (extends existing fields)
  totalViews?: number // Total channel views (YouTube-specific)
  audience?: {
    notable?: number
    gender?: Record<string, number>
    genders?: Array<{
      code: string
      weight: number
    }>
    age_ranges?: Record<string, number>
    ages?: Array<{
      code: string
      weight: number
    }>
    locations?: Array<{
      country: string
      city?: string
      percentage: number
    }>
    geoCountries?: Array<{
      name: string
      weight: number
      code: string
    }>
    geoCities?: Array<any>
    geoStates?: Array<any>
    languages?: Array<{
      language: string
      percentage: number
    }>
    gendersPerAge?: Array<{
      code: string
      male: number
      female: number
    }>
    interests?: Array<{
      interest: string
      percentage: number
    }>
    notableUsers?: Array<{
      userId: string
      fullname: string
      username: string
      url: string
      picture: string
      followers: number
      engagements: number
    }>
    audienceLookalikes?: Array<{
      userId: string
      fullname: string
      username: string
      url: string
      picture: string
      followers: number
      engagements: number
    }>
    ethnicities?: Array<any>
    audienceReachability?: any
    audienceTypes?: Array<any>
    brandAffinity?: Array<any>
    credibility?: number
    fake_followers_percentage?: number
    // Catch-all for other audience fields
    [key: string]: any
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
    all?: {
      engagements?: number
      engagementRate?: number
      avgLikes?: number
      avgComments?: number
      avgPosts4weeks?: number
      statHistory?: Array<{
        month: string
        avgEngagements?: number
        avgViews?: number
        avgShares?: number
        avgSaves?: number
      }>
    }
    reels?: any
    // YouTube-specific content types
    videos?: {
      engagements?: number
      engagementRate?: number
      avgLikes?: number
      avgComments?: number
      avgViews?: number
    }
    shorts?: {
      engagements?: number
      engagementRate?: number
      avgLikes?: number
      avgComments?: number
      avgViews?: number
    }
    streams?: {
      engagements?: number
      engagementRate?: number
      avgLikes?: number
      avgComments?: number
      avgViews?: number
    }
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
  // contacts already defined above with SocialContact type
  isPrivate?: boolean
  accountType?: string
  avgReelsPlays?: number
  recentPosts?: Array<{
    id: string
    text?: string
    url: string
    created: string
    likes?: number
    comments?: number
    views?: number
    video?: string
    thumbnail?: string // YouTube-specific
    type: string // YouTube: 'video', 'short', 'stream'
    title?: string // YouTube-specific
  }>
  popularPosts?: Array<any>
  sponsoredPosts?: Array<{
    id: string
    text?: string
    url: string
    created: string
    likes?: number
    comments?: number
    views?: number
    video?: string
    thumbnail?: string
    type: string
    title?: string
    sponsors?: Array<{
      domain: string
      logo_url: string
      name: string
    }>
  }>
  audience_notable?: number
  audience_credibility?: number
  audience_notable_users?: Array<any>
  audience_lookalikes?: Array<any>
  
  // YouTube API additional audience fields
  audienceCommenters?: {
    notable?: number
    genders?: Array<{
      code: string
      weight: number
    }>
    geoCountries?: Array<{
      name: string
      weight: number
      code: string
    }>
    ages?: Array<{
      code: string
      weight: number
    }>
    gendersPerAge?: Array<{
      code: string
      male: number
      female: number
    }>
    languages?: Array<{
      code: string
      name: string
      weight: number
    }>
    notableUsers?: Array<any>
    audienceLookalikes?: Array<any>
  }
  lookalikesByTopics?: Array<{
    userId: string
    fullname: string
    username: string
    url: string
    picture: string
    followers: number
    engagements: number
  }>
  audienceExtra?: {
    followersRange?: {
      leftNumber: number
      rightNumber: number
    }
    engagementRateDistribution?: Array<{
      min: number
      max: number
      total: number
      median?: boolean
    }>
    credibilityDistribution?: Array<any>
    // Catch-all for other audienceExtra fields
    [key: string]: any
  }
  audience_ethnicities?: Array<any>
  audience_reachability?: Array<any>
  audience_types?: Array<any>
  audience_genders_per_age?: Array<any>
  audience_geo_cities?: Array<any>
  audience_geo_states?: Array<any>
  stats_compared?: any
  creator_interests?: Array<any>
  creator_brand_affinity?: Array<any>
  lookalikes?: Array<any>
  
  // Additional Modash API fields that were missing
  hashtags?: Array<{ tag: string; weight: number }> | string[]
  genders?: Array<{ code: string; weight: number }>
  ages?: Array<{ code: string; weight: number }>
  ethnicities?: Array<any>
  geoStates?: Array<any>
  geoCountries?: Array<any>
  geoCities?: Array<any>
  languages?: Array<{ code: string; name: string; weight: number }>
  audienceReachability?: any
  audienceTypes?: Array<any>
  brandAffinity?: Array<any>
  credibility?: number
  notable?: number
  notableUsers?: Array<any>
  audienceLikers?: any
  audienceLookalikes?: Array<any>
  stats?: any
  fullname?: string
  recent_posts?: Array<any>
  stats_by_content_type?: any
  
  // Catch-all for any other Modash fields we haven't explicitly typed
  [key: string]: any
}

export interface InfluencerDetailPanelProps {
  influencer: InfluencerData | null
  isOpen: boolean
  onClose: () => void
  selectedPlatform?: 'instagram' | 'tiktok' | 'youtube'
  onPlatformSwitch?: (platform: 'instagram' | 'tiktok' | 'youtube') => void
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
  quality?: 'below_average' | 'average' | 'above_average' | 'low' | 'medium' | 'high' | string
}

export interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}