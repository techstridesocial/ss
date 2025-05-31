/**
 * Modash Discovery API Service
 * Implements tiered update strategy to optimize credit usage
 */

import { InfluencerTier } from '../../types/database'

// Update intervals in milliseconds
const UPDATE_INTERVALS = {
  GOLD: 28 * 24 * 60 * 60 * 1000,      // 4 weeks
  SILVER: 42 * 24 * 60 * 60 * 1000,    // 6 weeks  
  PARTNERED: 42 * 24 * 60 * 60 * 1000, // 6 weeks
  BRONZE: 56 * 24 * 60 * 60 * 1000     // 8 weeks
} as const

interface ModashProfile {
  userId: string
  username: string
  platform: string
  followers: number
  engagement_rate: number
  avg_views?: number
  profile_picture: string
  bio?: string
  location?: string
  verified: boolean
}

interface ModashReport {
  userId: string
  demographics: {
    age_ranges: Record<string, number>
    gender: Record<string, number>
    locations: Array<{ country: string; percentage: number }>
    languages: Array<{ language: string; percentage: number }>
  }
  engagement: {
    avg_likes: number
    avg_comments: number
    avg_shares?: number
    engagement_rate: number
  }
  recent_posts: Array<{
    url: string
    thumbnail: string
    caption: string
    likes: number
    comments: number
    posted_at: string
  }>
}

// Discovery search interfaces
interface ModashDiscoveryFilters {
  // Performance filters
  followers?: { min?: number; max?: number }
  engagementRate?: number
  avgViews?: { min?: number; max?: number }
  
  // Content filters
  bio?: string
  hashtags?: string[]
  mentions?: string[]
  topics?: string[]
  relevance?: string[]
  
  // Demographics
  location?: number[]
  gender?: string[]
  language?: string[]
  ageRange?: string[]
  
  // Platform specific
  platform?: 'instagram' | 'tiktok' | 'youtube'
  verified?: boolean
  lastPosted?: number // days
}

interface ModashDiscoveryResult {
  userId: string
  username: string
  display_name: string
  platform: string
  followers: number
  engagement_rate: number
  avg_views?: number
  profile_picture: string
  bio?: string
  location?: string
  verified: boolean
  score: number
  already_imported?: boolean
}

interface ModashSearchResponse {
  results: ModashDiscoveryResult[]
  total: number
  page: number
  limit: number
  hasMore: boolean
  creditsUsed: number
}

class ModashService {
  private readonly apiKey: string
  private readonly baseUrl = 'https://api.modash.io'
  private readonly maxRetries = 3
  private readonly requestDelay = 500 // 2 requests/second limit

  constructor() {
    this.apiKey = process.env.MODASH_API_KEY!
    if (!this.apiKey) {
      throw new Error('MODASH_API_KEY environment variable is required')
    }
  }

  /**
   * Discovery search with comprehensive filtering
   */
  async searchDiscovery(
    filters: ModashDiscoveryFilters,
    page: number = 0,
    limit: number = 20
  ): Promise<ModashSearchResponse> {
    try {
      // Ensure platform is specified
      if (!filters.platform) {
        throw new Error('Platform is required for discovery search')
      }

      const modashFilters = this.mapFiltersToModash(filters)
      
      // Structure request body according to Modash API docs
      const requestBody = {
        page,
        limit,
        sort: {
          field: 'followers',
          direction: 'desc'
        },
        filter: {
          influencer: {
            ...modashFilters
            // Platform is now in the URL, not in the filter
          }
        }
      }

      console.log('Modash Discovery Search:', {
        platform: filters.platform,
        endpoint: `/v1/${filters.platform}/search`,
        body: JSON.stringify(requestBody, null, 2),
        hasSearchQuery: !!filters.relevance?.length
      })

      // Use platform-specific endpoint as shown in Modash support's example
      const response = await this.makeRequest(`/v1/${filters.platform}/search`, {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })

      console.log('📦 Raw Modash Response:', {
        hasResults: !!response.results,
        hasDirects: !!response.directs,
        hasLookalikes: !!response.lookalikes,
        directsLength: response.directs?.length || 0,
        lookalikesLength: response.lookalikes?.length || 0,
        totalCount: response.total,
        responseKeys: Object.keys(response),
        firstDirect: response.directs?.[0] || 'No directs',
        isExactMatch: response.isExactMatch,
        creditsConsumed: response.creditsConsumed || response.credits_used || 1
      })
      
      // Log the first result to see available fields
      if (response.directs?.[0]) {
        console.log('🔍 First direct result fields:', Object.keys(response.directs[0]))
        console.log('📋 Full first direct result:', JSON.stringify(response.directs[0], null, 2))
      }

      // If we have a search query (relevance filter), only return exact matches (directs)
      const isSearchQuery = filters.relevance && filters.relevance.length > 0
      
      let results = []
      if (isSearchQuery) {
        // Only return exact matches for specific searches
        const directResults = response.directs?.map(this.transformDiscoveryResult) || []
        results = directResults
        console.log('🎯 Search query provided - returning only exact matches:', directResults.length)
      } else {
        // For general browsing, return both directs and lookalikes
        const directResults = response.directs?.map(this.transformDiscoveryResult) || []
        const lookalikeResults = response.lookalikes?.map(this.transformDiscoveryResult) || []
        results = [...directResults, ...lookalikeResults]
        console.log('🌐 General search - returning directs + lookalikes:', directResults.length, '+', lookalikeResults.length)
      }
      
      // Check which influencers are already imported
      const resultsWithImportStatus = await this.checkImportStatus(results)

      // Get actual credits used from the response
      const actualCreditsUsed = response.creditsConsumed || response.credits_used || response.creditsUsed || 
        // Fallback calculation: 0.01 credits per result as per Modash documentation
        (resultsWithImportStatus.length * 0.01)

      return {
        results: resultsWithImportStatus,
        total: isSearchQuery ? (response.directs?.length || 0) : (response.total || 0),
        page,
        limit,
        hasMore: !isSearchQuery && (page + 1) * limit < (response.total || 0),
        creditsUsed: actualCreditsUsed
      }
    } catch (error) {
      console.error('Discovery search failed:', error)
      
      // Check for specific error patterns
      if (error instanceof Error) {
        if (error.message.includes('Cannot POST')) {
          throw new Error('Modash API endpoint not found. Please ensure you are using the correct API endpoint format. The platform-specific endpoint (e.g., /instagram/search) may require activation through the Modash developer portal.')
        } else if (error.message.includes('Forbidden')) {
          throw new Error('Modash API access forbidden. Please verify your API key is active and has the correct permissions for Discovery API access.')
        } else if (error.message.includes('401')) {
          throw new Error('Modash API authentication failed. Please check your API key.')
        }
      }
      
      throw new Error(`Discovery search failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Map our UI filters to Modash API format
   */
  private mapFiltersToModash(filters: ModashDiscoveryFilters): any {
    const modashFilters: any = {}

    // Followers range
    if (filters.followers) {
      modashFilters.followers = {}
      if (filters.followers.min) modashFilters.followers.min = filters.followers.min
      if (filters.followers.max) modashFilters.followers.max = filters.followers.max
    }

    // Engagement rate
    if (filters.engagementRate) {
      modashFilters.engagementRate = filters.engagementRate / 100 // Convert percentage to decimal
    }

    // Bio keywords
    if (filters.bio && filters.bio.trim()) {
      modashFilters.bio = filters.bio.trim()
    }

    // Hashtags
    if (filters.hashtags && filters.hashtags.length > 0) {
      modashFilters.textTags = filters.hashtags.map(tag => ({
        type: 'hashtag',
        value: tag.replace('#', '')
      }))
    }

    // Mentions
    if (filters.mentions && filters.mentions.length > 0) {
      modashFilters.textTags = [
        ...(modashFilters.textTags || []),
        ...filters.mentions.map(mention => ({
          type: 'mention',
          value: mention.replace('@', '')
        }))
      ]
    }

    // Topics/Relevance (platform-specific)
    if (filters.topics && filters.topics.length > 0) {
      modashFilters.relevance = filters.topics
    }

    // Handle search queries differently - for username searches, use specific username field
    if (filters.relevance && filters.relevance.length > 0) {
      const searchTerms = filters.relevance
      
      // Check if search term looks like a username (no spaces, alphanumeric)
      const isUsernameSearch = searchTerms.length === 1 && 
        searchTerms[0] && /^[a-zA-Z0-9._@]+$/.test(searchTerms[0].trim())
      
      if (isUsernameSearch) {
        // For username searches, use both username and relevance
        const cleanUsername = searchTerms[0]!.replace('@', '').trim()
        modashFilters.username = cleanUsername
        modashFilters.relevance = [`@${cleanUsername}`, cleanUsername]
        console.log('🎯 Username search detected:', cleanUsername)
      } else {
        // For general content searches, use relevance only
        modashFilters.relevance = searchTerms
        console.log('🔍 Content search detected:', searchTerms)
      }
    }

    // Location
    if (filters.location && filters.location.length > 0) {
      modashFilters.location = filters.location
    }

    // Verified accounts only
    if (filters.verified) {
      modashFilters.verified = true
    }

    return modashFilters
  }

  /**
   * Transform Modash discovery result to our format
   */
  private transformDiscoveryResult = (data: any): ModashDiscoveryResult => {
    // Log the raw data to understand the structure
    console.log('🔍 Transforming result:', {
      hasUserId: !!data.userId,
      hasUserInfo: !!data.userInfo,
      hasProfile: !!data.profile,
      dataKeys: Object.keys(data).slice(0, 10)
    })

    // Handle different response structures from Modash
    const profile = data.profile || data.userInfo || data
    
    // For Instagram, we can construct the profile picture URL if not provided
    let profilePicture = profile.profilePicture || profile.profilePic || profile.avatar || data.profilePicture
    
    // If no profile picture and it's Instagram, use Instagram's CDN
    if (!profilePicture && data.platform === 'instagram' && data.username) {
      // Instagram doesn't provide direct profile picture URLs anymore
      // We'll use a placeholder for now
      profilePicture = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.username)}&background=random&size=150`
    }
    
    return {
      userId: data.userId || data.id || profile.userId,
      username: profile.username || profile.handle || data.username,
      display_name: profile.fullName || profile.displayName || profile.username || data.username,
      platform: data.platform || profile.platform || 'instagram',
      followers: profile.followers || data.followers || 0,
      engagement_rate: (profile.engagementRate || data.engagementRate || 0) * 100, // Convert to percentage
      avg_views: profile.avgViews || profile.avgReelsPlays || data.avgViews,
      profile_picture: profilePicture || 'https://via.placeholder.com/150',
      bio: profile.bio || profile.description || data.bio,
      location: profile.country || profile.location?.country || data.location,
      verified: profile.isVerified || profile.verified || data.verified || false,
      score: data.score ? Math.round(data.score * 100) : 0, // Convert to 0-100 scale
      already_imported: false // Will be updated by checkImportStatus
    }
  }

  /**
   * Check which influencers are already in our database
   */
  private async checkImportStatus(results: ModashDiscoveryResult[]): Promise<ModashDiscoveryResult[]> {
    // This would query our database to check if influencers already exist
    // For now, simulating some as already imported
    return results.map(result => ({
      ...result,
      already_imported: result.username === 'fashionforwardsam' // Example
    }))
  }

  /**
   * Search for influencer by handle
   */
  async searchInfluencer(handle: string, platform: string): Promise<ModashProfile | null> {
    const cleanHandle = handle.replace('@', '')
    
    // Validate platform
    if (!platform || !['instagram', 'tiktok', 'youtube'].includes(platform)) {
      throw new Error('Valid platform (instagram, tiktok, youtube) is required')
    }
    
    try {
      // Use platform-specific endpoint with v1 prefix
      const response = await this.makeRequest(`/v1/${platform}/search`, {
        method: 'POST',
        body: JSON.stringify({
          filter: {
            influencer: {
              relevance: [`@${cleanHandle}`]
            }
          },
          limit: 1,
          page: 0
        })
      })

      // Modash returns results in 'directs' for exact matches
      if (response.directs?.length > 0) {
        return this.transformProfileData(response.directs[0])
      }
      
      // Fall back to lookalikes if no direct match
      if (response.lookalikes?.length > 0) {
        return this.transformProfileData(response.lookalikes[0])
      }

      return null
    } catch (error) {
      console.error(`Failed to search for influencer @${cleanHandle} on ${platform}:`, error)
      return null
    }
  }

  /**
   * Get comprehensive report for influencer
   */
  async getInfluencerReport(userId: string): Promise<ModashReport | null> {
    try {
      const response = await this.makeRequest(`/v1/discovery/profile/${userId}/report`)
      return this.transformReportData(response)
    } catch (error) {
      console.error(`Failed to get report for user ${userId}:`, error)
      return null
    }
  }

  /**
   * Check if influencer needs update based on tier
   */
  needsUpdate(tier: InfluencerTier, lastUpdated: Date | null): boolean {
    if (!lastUpdated) return true
    
    const interval = UPDATE_INTERVALS[tier]
    const timeSinceUpdate = Date.now() - lastUpdated.getTime()
    
    return timeSinceUpdate >= interval
  }

  /**
   * Get influencers that need updates (prioritized by tier and priority score)
   */
  async getInfluencersForUpdate(limit: number = 50): Promise<string[]> {
    // This would query the database for influencers that need updates
    // Ordered by tier priority (GOLD first) and priority score
    const query = `
      SELECT id, tier, modash_last_updated, modash_update_priority
      FROM influencers 
      WHERE auto_update_enabled = true
        AND (
          modash_last_updated IS NULL 
          OR (tier = 'GOLD' AND modash_last_updated < NOW() - INTERVAL '28 days')
          OR (tier IN ('SILVER', 'PARTNERED') AND modash_last_updated < NOW() - INTERVAL '42 days')
          OR (tier = 'BRONZE' AND modash_last_updated < NOW() - INTERVAL '56 days')
        )
      ORDER BY 
        CASE tier 
          WHEN 'GOLD' THEN 1
          WHEN 'SILVER' THEN 2  
          WHEN 'PARTNERED' THEN 3
          WHEN 'BRONZE' THEN 4
        END,
        modash_update_priority DESC,
        modash_last_updated ASC NULLS FIRST
      LIMIT $1
    `
    
    // Implementation would use your database connection
    // For now, returning empty array as placeholder
    return []
  }

  /**
   * Batch update influencers with rate limiting
   */
  async batchUpdateInfluencers(influencerIds: string[]): Promise<{
    updated: number
    failed: number
    creditsUsed: number
  }> {
    let updated = 0
    let failed = 0
    let creditsUsed = 0

    for (const influencerId of influencerIds) {
      try {
        // Add delay to respect rate limits (2 requests/second)
        await new Promise(resolve => setTimeout(resolve, this.requestDelay))
        
        // Get influencer platform data from database
        // const influencer = await getInfluencerById(influencerId)
        
        // Update via Modash API
        // const report = await this.getInfluencerReport(modashUserId)
        
        // Update database with fresh data
        // await updateInfluencerFromModash(influencerId, report)
        
        updated++
        creditsUsed++ // Each report costs 1 credit
        
      } catch (error) {
        console.error(`Failed to update influencer ${influencerId}:`, error)
        failed++
      }
    }

    return { updated, failed, creditsUsed }
  }

  /**
   * Get current credit usage
   */
  async getCreditUsage(): Promise<{
    used: number
    limit: number
    remaining: number
    resetDate: Date
  }> {
    try {
      const response = await this.makeRequest('/v1/account')
      return {
        used: response.credits_used || 0,
        limit: response.credits_limit || 3000,
        remaining: response.credits_remaining || 3000,
        resetDate: new Date(response.reset_date || Date.now())
      }
    } catch (error) {
      console.error('Failed to get credit usage:', error)
      return {
        used: 0,
        limit: 3000,
        remaining: 3000,
        resetDate: new Date()
      }
    }
  }

  /**
   * Make authenticated request to Modash API
   */
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`
    
    console.log('🔗 Modash API Request:', {
      fullUrl: url,
      baseUrl: this.baseUrl,
      endpoint: endpoint,
      method: options.method || 'GET',
      hasApiKey: !!this.apiKey,
      apiKeyPrefix: this.apiKey ? this.apiKey.substring(0, 10) : 'NO_KEY',
      headers: {
        'Authorization': `Bearer ${this.apiKey ? this.apiKey.substring(0, 10) + '...' : 'NO_KEY'}`,
        'Content-Type': 'application/json'
      }
    })

    // Log request body if present
    if (options.body) {
      console.log('📤 Request Body:', options.body)
    }
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      })

      const responseText = await response.text()
      console.log('📡 Modash Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        bodyPreview: responseText.substring(0, 500),
        bodyLength: responseText.length
      })

      if (!response.ok) {
        console.error('❌ Modash API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: responseText,
          endpoint: endpoint,
          method: options.method || 'GET'
        })
        throw new Error(`Modash API error: ${response.status} ${response.statusText} - ${responseText}`)
      }

      try {
        const jsonData = JSON.parse(responseText)
        console.log('✅ Modash API Success:', {
          endpoint: endpoint,
          resultCount: jsonData.results?.length || 'N/A',
          hasData: !!jsonData
        })
        return jsonData
      } catch (e) {
        console.error('Failed to parse response:', {
          error: e,
          responseText: responseText,
          endpoint: endpoint
        })
        throw new Error('Invalid JSON response from Modash API')
      }
    } catch (error) {
      console.error('🔥 Modash API Request Failed:', {
        error: error instanceof Error ? error.message : error,
        endpoint: endpoint,
        url: url,
        method: options.method || 'GET'
      })
      throw error
    }
  }

  /**
   * Transform Modash profile data to internal format
   */
  private transformProfileData(data: any): ModashProfile {
    return {
      userId: data.userId,
      username: data.username,
      platform: data.platform,
      followers: data.followers,
      engagement_rate: data.engagement_rate,
      avg_views: data.avg_views,
      profile_picture: data.profile_picture,
      bio: data.bio,
      location: data.location,
      verified: data.verified || false
    }
  }

  /**
   * Transform Modash report data to internal format
   */
  private transformReportData(data: any): ModashReport {
    return {
      userId: data.userId,
      demographics: {
        age_ranges: data.audience?.age || {},
        gender: data.audience?.gender || {},
        locations: data.audience?.geolocations?.map((loc: any) => ({
          country: loc.name,
          percentage: loc.weight * 100
        })) || [],
        languages: data.audience?.languages?.map((lang: any) => ({
          language: lang.name,  
          percentage: lang.weight * 100
        })) || []
      },
      engagement: {
        avg_likes: data.performance?.avg_likes || 0,
        avg_comments: data.performance?.avg_comments || 0,
        avg_shares: data.performance?.avg_shares,
        engagement_rate: data.performance?.engagement_rate || 0
      },
      recent_posts: data.recent_posts?.map((post: any) => ({
        url: post.url,
        thumbnail: post.thumbnail,
        caption: post.caption,
        likes: post.likes,
        comments: post.comments,
        posted_at: post.posted_at
      })) || []
    }
  }
}

export const modashService = new ModashService()

/**
 * Utility functions for tier management
 */
export const tierUtils = {
  /**
   * Automatically assign tier based on performance metrics
   */
  calculateTier(followers: number, engagementRate: number, campaignCount: number = 0): InfluencerTier {
    // Gold: High performers, active in campaigns
    if (followers >= 100000 && engagementRate >= 3.5 && campaignCount >= 2) {
      return 'GOLD'
    }
    
    // Silver: Good metrics, some campaign activity  
    if (followers >= 50000 && engagementRate >= 2.5) {
      return 'SILVER'
    }
    
    // Bronze: Lower performance or inactive
    if (followers < 10000 || engagementRate < 1.5) {
      return 'BRONZE'
    }
    
    // Default to Silver
    return 'SILVER'
  },

  /**
   * Get next update date based on tier
   */
  getNextUpdateDate(tier: InfluencerTier, lastUpdated: Date = new Date()): Date {
    const interval = UPDATE_INTERVALS[tier]
    return new Date(lastUpdated.getTime() + interval)
  },

  /**
   * Get update priority score based on multiple factors
   */
  calculatePriority(
    tier: InfluencerTier,
    daysSinceLastUpdate: number,
    activeCampaigns: number,
    followerGrowthRate: number
  ): number {
    let priority = 50 // Base priority

    // Tier bonus
    const tierBonus = { GOLD: 30, SILVER: 10, PARTNERED: 5, BRONZE: 0 }
    priority += tierBonus[tier]

    // Urgency based on time since last update
    priority += Math.min(daysSinceLastUpdate * 0.5, 20)

    // Active campaigns bonus
    priority += activeCampaigns * 5

    // Growth rate bonus
    if (followerGrowthRate > 5) priority += 10
    else if (followerGrowthRate > 2) priority += 5

    return Math.min(Math.max(priority, 1), 100) // Clamp between 1-100
  }
} 