export type Platform = 'instagram' | 'tiktok' | 'youtube'

export interface Contact {
  type: string
  value: string
}

export interface PlatformData {
  followers?: number
  engagement_rate?: number
  engagementRate?: number
  avgLikes?: number
  avgComments?: number
  avgShares?: number
  fake_followers_percentage?: number
  credibility?: number
  audience?: any
  audience_interests?: any
  audience_languages?: any
  relevant_hashtags?: any
  brand_partnerships?: any
  content_topics?: any
  statsByContentType?: any
  topContent?: any
  content_performance?: any
  profile_picture?: string
  profilePicture?: string
  recentPosts?: any[]
  popularPosts?: any[]
  sponsoredPosts?: any[]
  statHistory?: any
  paidPostPerformance?: any
  username?: string
  url?: string
  userId?: string
  [key: string]: any
}

export interface Influencer {
  discoveredId?: string
  userId?: string
  creatorId?: string
  id?: string
  username?: string
  displayName?: string
  display_name?: string
  name?: string
  handle?: string
  picture?: string
  profilePicture?: string
  profile_picture?: string
  avatar_url?: string
  followers?: number
  engagement_rate?: number
  engagementRate?: number
  avgLikes?: number
  avgComments?: number
  avgViews?: number
  avgShares?: number
  bio?: string
  location?: string
  verified?: boolean
  url?: string
  platform?: Platform
  platforms?: Record<Platform, PlatformData>
  contacts?: Contact[]
  niches?: string[]
  niche?: string
  totalFollowers?: number
  // Platform-specific handles (legacy support)
  instagram_handle?: string
  tiktok_handle?: string
  youtube_handle?: string
  // Extended analytics fields
  fake_followers_percentage?: number
  credibility?: number
  audience?: any
  audience_interests?: any
  audience_languages?: any
  relevant_hashtags?: any
  brand_partnerships?: any
  content_topics?: any
  recentPosts?: any[]
  popularPosts?: any[]
  sponsoredPosts?: any[]
  statHistory?: any
  paidPostPerformance?: any
  partnerships_aggregate_metrics?: any
  extended_analytics?: any
  lastUpdated?: number
  currentPlatform?: Platform
  [key: string]: any
}

export interface DiscoveryFilters {
  platform: Platform
  searchQuery?: string
  followersMin?: number
  followersMax?: number
  engagementRate?: number
  avgViewsMin?: number
  avgViewsMax?: number
  bio?: string
  hashtags?: string
  mentions?: string
  captions?: string
  topics?: string
  transcript?: string
  collaborations?: string
  selectedContentCategories?: string[]
  selectedLocations?: string[]
  selectedGender?: string
  selectedAge?: string
  selectedLanguage?: string
  accountType?: string
  selectedSocials?: string[]
  fakeFollowers?: string
  lastPosted?: string
  verifiedOnly?: boolean
  hideProfilesInRoster?: boolean
}

export interface SearchResult {
  success: boolean
  data?: Influencer[] | { results: Influencer[]; creditsUsed?: number }
  influencers?: Influencer[]
  creditsUsed?: number
  warning?: string
  error?: string
  details?: string
}

export interface AddToRosterResult {
  success: boolean
  newInfluencerId?: string
  hasCompleteData?: boolean
  error?: string
}

export interface SortConfig {
  key: string | null
  direction: 'asc' | 'desc'
}

export interface RosterMessage {
  type: 'success' | 'error'
  message: string
}

export interface ExpandedSections {
  demographics: boolean
  performance: boolean
  content: boolean
  account: boolean
}

export interface PerformanceOptions {
  followersLabel: string
  viewsLabel: string
  engagement: Array<{ value: string; label: string }>
}

export interface ContentOptions {
  categories: Array<{ value: string; label: string }>
  hashtags: string
  captions: string
  collaborations?: string
  mentions?: string
  topics?: string
  transcript?: string
}

export interface AccountOptions {
  accountTypes: Array<{ value: string; label: string }>
  verifiedLabel: string
  fakeFollowers: Array<{ value: string; label: string }>
}
