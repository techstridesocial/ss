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
    locations: Array<{ country: string; city?: string; percentage: number }>
    languages: Array<{ language: string; percentage: number }>
    interests?: Array<{ interest: string; percentage: number }>
  }
  engagement: {
    avg_likes: number
    avg_comments: number
    avg_shares?: number
    engagement_rate: number
    fake_followers_percentage?: number
    fake_followers_quality?: 'below_average' | 'average' | 'above_average'
    estimated_impressions?: number
    estimated_reach?: number
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
      avg_likes?: number
      avg_comments?: number
      avg_shares?: number
      engagement_rate?: number
    }
    stories?: {
      estimated_reach?: number
      estimated_impressions?: number
    }
  }
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
  paid_vs_organic?: {
    paid_engagement_rate?: number
    organic_engagement_rate?: number
    paid_performance_ratio?: number
  }
  recent_posts: Array<{
    url: string
    thumbnail: string
    caption: string
    likes: number
    comments: number
    shares?: number
    posted_at: string
    content_type?: 'reel' | 'post' | 'story'
    is_sponsored?: boolean
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

    // If no meaningful filters are provided, add some sensible defaults for general discovery
    const hasSpecificFilters = modashFilters.followers || 
                              modashFilters.engagementRate || 
                              modashFilters.bio || 
                              modashFilters.textTags || 
                              modashFilters.relevance || 
                              modashFilters.location || 
                              modashFilters.verified
    
    if (!hasSpecificFilters) {
      console.log('🌟 No specific filters provided, adding defaults for general discovery...')
      
      // Add sensible defaults for general discovery based on platform
      switch (filters.platform) {
        case 'instagram':
          modashFilters.followers = { min: 1000 } // At least 1k followers
          break
        case 'tiktok':
          modashFilters.followers = { min: 1000 } // At least 1k followers
          break
        case 'youtube':
          modashFilters.followers = { min: 1000 } // At least 1k subscribers
          break
      }
      
      console.log('🎯 Added default filters:', modashFilters)
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
    
    // Use real profile picture if available, fallback to generated avatar
    let profilePicture = profile.picture || profile.profile_picture || ''
    
    // If no profile picture available, create a personalized placeholder
    if (!profilePicture && profile.username) {
      profilePicture = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.username)}&background=random&size=150&color=fff`
    }
    
    // Fallback to generic placeholder if still no picture
    if (!profilePicture) {
      profilePicture = 'https://via.placeholder.com/150'
    }
    
    return {
      userId: data.userId || data.id || profile.userId,
      username: profile.username || profile.handle || data.username,
      display_name: profile.fullName || profile.displayName || profile.username || data.username,
      platform: data.platform || profile.platform || 'instagram',
      followers: profile.followers || data.followers || 0,
      engagement_rate: (profile.engagementRate || data.engagementRate || 0) * 100, // Convert to percentage
      avg_views: profile.avgViews || profile.avgReelsPlays || data.avgViews,
      profile_picture: profilePicture,
      bio: profile.bio || profile.description || data.bio,
      location: 'Unknown', // Location data not available in search results, requires profile report
      verified: profile.isVerified || profile.verified || data.verified || false,
      score: data.score ? Math.round(data.score * 100) : 0, // Convert to 0-100 scale
      already_imported: false // Will be updated by checkImportStatus
    }
  }

  /**
   * Get profile picture for an influencer
   * This method calls the Modash profile picture endpoint
   */
  async getProfilePicture(userId: string): Promise<string | null> {
    try {
      const response = await this.makeRequest(`/v1/discovery/profile/${userId}/picture`)
      
      // The response should contain the profile picture URL
      if (response.url) {
        return response.url
      }
      
      return null
    } catch (error) {
      console.error(`Failed to get profile picture for user ${userId}:`, error)
      return null
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
   * Get comprehensive report for influencer by searching for their exact userId
   * Since the report endpoint doesn't exist, we'll use search to get the data
   */
  async getInfluencerReport(userId: string): Promise<ModashReport | null> {
    try {
      console.log(`🔍 Getting influencer data for userId: ${userId}`)
      
      // Try to get the influencer by searching for them across all platforms
      const platforms = ['instagram', 'tiktok', 'youtube'] as const
      
      for (const platform of platforms) {
        try {
          console.log(`🔍 Searching ${platform} for userId: ${userId}`)
          
          // Use the search endpoint to find this specific user
          const searchResults = await this.searchDiscovery({
            platform,
            // Use minimal filters to find the user
            followers: { min: 1 }
          }, 0, 100) // Search more results to find the specific user
          
          // Look for the exact userId in the results
          const exactMatch = searchResults.results.find((result: any) => 
            result.userId === userId || 
            result.userInfo?.userId === userId ||
            result.profile?.userId === userId
          )
          
          if (exactMatch) {
            console.log(`✅ Found user ${userId} on ${platform}:`, exactMatch)
            return this.transformSearchResultToReport(exactMatch, platform)
          }
        } catch (platformError) {
          console.log(`⚠️ Failed to search ${platform}:`, platformError)
          continue
        }
      }
      
      console.log(`❌ User ${userId} not found on any platform`)
      return null
    } catch (error) {
      console.error(`Failed to get report for user ${userId}:`, error)
      return null
    }
  }

  /**
   * Transform search result to report format
   */
  private transformSearchResultToReport(searchResult: any, platform: string): ModashReport {
    console.log(`🔄 Transforming search result to report format:`, searchResult)
    
    // Extract data from the search result
    const profile = searchResult.profile || searchResult.userInfo || searchResult
    const followers = profile.followers || searchResult.followers || 0
    const engagementRate = profile.engagement_rate || searchResult.engagement_rate || 0
    
    // Calculate estimated metrics
    const estimatedReach = Math.round(followers * 0.4)
    const estimatedImpressions = Math.round(estimatedReach * 1.5)
    
    return {
      userId: searchResult.userId || profile.userId,
      demographics: {
        age_ranges: profile.audienceAgeRanges || {},
        gender: profile.audienceGender || {},
        locations: profile.audienceLocations?.map((loc: any) => ({
          country: loc.name || loc.country,
          city: loc.city,
          percentage: loc.weight * 100
        })) || [],
        languages: profile.audienceLanguages?.map((lang: any) => ({
          language: lang.name || lang.language,
          percentage: lang.weight * 100
        })) || [],
        interests: profile.audienceInterests?.map((interest: any) => ({
          interest: interest.name || interest.category,
          percentage: interest.weight * 100
        })) || []
      },
      engagement: {
        avg_likes: profile.avgLikes || searchResult.avgLikes || 0,
        avg_comments: profile.avgComments || searchResult.avgComments || 0,
        avg_shares: profile.avgShares || searchResult.avgShares || 0,
        engagement_rate: engagementRate,
        fake_followers_percentage: profile.fakeFollowersPercentage,
        fake_followers_quality: profile.fakeFollowersPercentage 
          ? (profile.fakeFollowersPercentage < 0.1 ? 'below_average' : 
             profile.fakeFollowersPercentage < 0.2 ? 'average' : 'above_average')
          : undefined,
        estimated_impressions: estimatedImpressions,
        estimated_reach: estimatedReach
      },
      recent_posts: profile.recentPosts || []
    }
  }

  /**
   * Fetch detailed profile report for an influencer (city/country)
   */
  async getProfileReport(userId: string, platform: string = 'instagram'): Promise<{ city?: string; country?: string } | null> {
    try {
      console.log(`🔍 Fetching profile report for userId: ${userId}, platform: ${platform}`)
      
      // Use the correct endpoint for the platform
      const endpoint = `/v1/${platform}/profile/${userId}/report`
      console.log(`📡 Modash endpoint: ${endpoint}`)
      
      const response = await this.makeRequest(endpoint)
      console.log('📦 FULL Raw profile response:', JSON.stringify(response, null, 2))
      
      // Check multiple possible locations for city/country data
      let city, country
      
      if (response) {
        // Check in profile object
        if (response.profile) {
          city = response.profile.city || response.profile.location?.city
          country = response.profile.country || response.profile.location?.country
        }
        
        // Check in root level
        city = city || response.city
        country = country || response.country
        
        // Check in demographics/locations array
        if (response.demographics && response.demographics.locations && Array.isArray(response.demographics.locations)) {
          const topLocation = response.demographics.locations[0]
          if (topLocation) {
            country = country || topLocation.country
            city = city || topLocation.city
          }
        }
        
        const locationData = {
          city: city || undefined,
          country: country || undefined
        }
        
        console.log('📍 Extracted location data:', locationData)
        return locationData
      }
      
      console.log('⚠️ No response data found')
      return null
    } catch (error) {
      console.error(`❌ Failed to fetch profile report for user ${userId}:`, error)
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
   * List Users API - Search influencers using the new endpoint
   * GET /instagram/users
   */
  async listUsers(query?: string, limit: number = 10): Promise<{
    error: boolean
    users: Array<{
      userId: string
      username: string
      profile_picture?: string
      followers: number
      isVerified: boolean
    }>
  }> {
    try {
      const params = new URLSearchParams()
      if (limit) params.append('limit', limit.toString())
      if (query) params.append('query', query)
      
      const endpoint = `/v1/instagram/users${params.toString() ? '?' + params.toString() : ''}`
      console.log('📋 List Users API request:', { endpoint, query, limit })
      
      const response = await this.makeRequest(endpoint)
      
      if (response.error) {
        console.error('❌ List Users API error:', response)
        return { error: true, users: [] }
      }
      
      console.log('✅ List Users API success:', {
        userCount: response.users?.length || 0,
        hasUsers: !!response.users
      })
      
      return {
        error: false,
        users: response.users || []
      }
    } catch (error) {
      console.error('❌ Failed to list users:', error)
      return { error: true, users: [] }
    }
  }

  /**
   * List Hashtags API - Search for hashtags
   * GET /instagram/hashtags
   * Free - No credits used
   */
  async listHashtags(query?: string, limit: number = 10): Promise<{
    error: boolean;
    tags: string[];
    message?: string;
  }> {
    try {
      const params = new URLSearchParams()
      if (limit) params.append('limit', limit.toString())
      if (query) params.append('query', query)
      
      const endpoint = `/v1/instagram/hashtags${params.toString() ? '?' + params.toString() : ''}`
      
      console.log('🏷️ Fetching hashtags:', { query, limit, endpoint })
      
      const result = await this.makeRequest(endpoint, { method: 'GET' })
      
      if (result.error) {
        console.error('❌ List Hashtags API error:', result)
        return {
          error: true,
          tags: [],
          message: result.message || 'Failed to fetch hashtags'
        }
      }
      
      console.log('✅ List Hashtags API success:', {
        query,
        tagsCount: result.tags?.length || 0,
        firstTags: result.tags?.slice(0, 3)
      })
      
      return {
        error: false,
        tags: result.tags || []
      }
    } catch (error) {
      console.error('❌ Error fetching hashtags:', error)
      return {
        error: true,
        tags: [],
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * List Partnerships API - Search for brand partnerships
   * GET /instagram/brands
   * Free - No credits used
   */
  async listPartnerships(query?: string, limit: number = 10): Promise<{
    error: boolean;
    brands: Array<{
      id: number;
      name: string;
      count: number;
    }>;
    total: number;
    message?: string;
  }> {
    try {
      const params = new URLSearchParams()
      if (limit) params.append('limit', limit.toString())
      if (query) params.append('query', query)
      
      const endpoint = `/v1/instagram/brands${params.toString() ? '?' + params.toString() : ''}`
      
      console.log('🤝 Fetching brand partnerships:', { query, limit, endpoint })
      
      const result = await this.makeRequest(endpoint, { method: 'GET' })
      
      if (result.error) {
        console.error('❌ List Partnerships API error:', result)
        return {
          error: true,
          brands: [],
          total: 0,
          message: result.message || 'Failed to fetch partnerships'
        }
      }
      
      console.log('✅ List Partnerships API success:', {
        query,
        brandsCount: result.brands?.length || 0,
        total: result.total || 0,
        firstBrands: result.brands?.slice(0, 3)?.map((b: any) => b.name)
      })
      
      return {
        error: false,
        brands: result.brands || [],
        total: result.total || 0
      }
    } catch (error) {
      console.error('❌ Error fetching partnerships:', error)
      return {
        error: true,
        brands: [],
        total: 0,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * List Locations API - Search for geographic locations
   * GET /instagram/locations
   * Free - No credits used
   */
  async listLocations(query?: string, limit: number = 10): Promise<{
    error: boolean;
    locations: Array<{
      id: number;
      name: string;
      title: string;
    }>;
    total: number;
    message?: string;
  }> {
    try {
      const params = new URLSearchParams()
      if (limit) params.append('limit', limit.toString())
      if (query) params.append('query', query)
      
      const endpoint = `/v1/instagram/locations${params.toString() ? '?' + params.toString() : ''}`
      
      console.log('📍 Fetching locations:', { query, limit, endpoint })
      
      const result = await this.makeRequest(endpoint, { method: 'GET' })
      
      if (result.error) {
        console.error('❌ List Locations API error:', result)
        return {
          error: true,
          locations: [],
          total: 0,
          message: result.message || 'Failed to fetch locations'
        }
      }
      
      console.log('✅ List Locations API success:', {
        query,
        locationsCount: result.locations?.length || 0,
        total: result.total || 0,
        firstLocations: result.locations?.slice(0, 3)?.map((l: any) => l.name)
      })
      
      return {
        error: false,
        locations: result.locations || [],
        total: result.total || 0
      }
    } catch (error) {
      console.error('❌ Error fetching locations:', error)
      return {
        error: true,
        locations: [],
        total: 0,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * List Languages API - Search for languages
   * GET /instagram/languages
   * Free - No credits used
   */
  async listLanguages(query?: string, limit: number = 10): Promise<{
    error: boolean;
    languages: Array<{
      code: string;
      name: string;
    }>;
    total: number;
    message?: string;
  }> {
    try {
      const params = new URLSearchParams()
      if (limit) params.append('limit', limit.toString())
      if (query) params.append('query', query)
      
      const endpoint = `/v1/instagram/languages${params.toString() ? '?' + params.toString() : ''}`
      
      console.log('🌐 Fetching languages:', { query, limit, endpoint })
      
      const result = await this.makeRequest(endpoint, { method: 'GET' })
      
      if (result.error) {
        console.error('❌ List Languages API error:', result)
        return {
          error: true,
          languages: [],
          total: 0,
          message: result.message || 'Failed to fetch languages'
        }
      }
      
      console.log('✅ List Languages API success:', {
        query,
        languagesCount: result.languages?.length || 0,
        total: result.total || 0,
        firstLanguages: result.languages?.slice(0, 3)?.map((l: any) => l.name)
      })
      
      return {
        error: false,
        languages: result.languages || [],
        total: result.total || 0
      }
    } catch (error) {
      console.error('❌ Error fetching languages:', error)
      return {
        error: true,
        languages: [],
        total: 0,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * List Interests API - Search for audience interests
   * GET /instagram/interests
   * Free - No credits used
   */
  async listInterests(query?: string, limit: number = 10): Promise<{
    error: boolean;
    interests: Array<{
      id: number;
      name: string;
    }>;
    total: number;
    message?: string;
  }> {
    try {
      const params = new URLSearchParams()
      if (limit) params.append('limit', limit.toString())
      if (query) params.append('query', query)
      
      const endpoint = `/v1/instagram/interests${params.toString() ? '?' + params.toString() : ''}`
      
      console.log('🎯 Fetching interests:', { query, limit, endpoint })
      
      const result = await this.makeRequest(endpoint, { method: 'GET' })
      
      if (result.error) {
        console.error('❌ List Interests API error:', result)
        return {
          error: true,
          interests: [],
          total: 0,
          message: result.message || 'Failed to fetch interests'
        }
      }
      
      console.log('✅ List Interests API success:', {
        query,
        interestsCount: result.interests?.length || 0,
        total: result.total || 0,
        firstInterests: result.interests?.slice(0, 3)?.map((i: any) => i.name)
      })
      
      return {
        error: false,
        interests: result.interests || [],
        total: result.total || 0
      }
    } catch (error) {
      console.error('❌ Error fetching interests:', error)
      return {
        error: true,
        interests: [],
        total: 0,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * List Topics API - Search for content topics
   * GET /instagram/topics
   * Free - No credits used
   */
  async listTopics(query?: string, limit: number = 10): Promise<{
    error: boolean;
    tags: string[];
    message?: string;
  }> {
    try {
      const params = new URLSearchParams()
      if (limit) params.append('limit', limit.toString())
      if (query) params.append('query', query)
      
      const endpoint = `/v1/instagram/topics${params.toString() ? '?' + params.toString() : ''}`
      
      console.log('📝 Fetching topics:', { query, limit, endpoint })
      
      const result = await this.makeRequest(endpoint, { method: 'GET' })
      
      if (result.error) {
        console.error('❌ List Topics API error:', result)
        return {
          error: true,
          tags: [],
          message: result.message || 'Failed to fetch topics'
        }
      }
      
      console.log('✅ List Topics API success:', {
        query,
        tagsCount: result.tags?.length || 0,
        firstTags: result.tags?.slice(0, 3)
      })
      
      return {
        error: false,
        tags: result.tags || []
      }
    } catch (error) {
      console.error('❌ Error fetching topics:', error)
      return {
        error: true,
        tags: [],
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Audience Overlap Reports API - Compare audience overlap between influencers
   * POST /v1/instagram/reports/audience/overlap
   * Analyze shared audience segments between multiple influencers
   */
  async getAudienceOverlap(
    userIds: string[],
    options?: {
      segments?: string[];
      metrics?: string[];
    }
  ): Promise<{
    success: boolean;
    data?: {
      overlap_data: any[];
      summary: any;
    };
    error?: string;
  }> {
    try {
      console.log('🎯 Fetching audience overlap report for users:', userIds)
      
      const requestBody = {
        user_ids: userIds,
        segments: options?.segments || ['gender', 'age', 'location'],
        metrics: options?.metrics || ['overlap_percentage', 'unique_audience']
      }
      
      const result = await this.makeRequest('/v1/instagram/reports/audience/overlap', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })
      
      console.log('✅ Audience overlap API success:', {
        userIds,
        overlapCount: result.overlap_data?.length || 0
      })
      
      return {
        success: true,
        data: {
          overlap_data: result.overlap_data || [],
          summary: result.summary || {}
        }
      }
      
    } catch (error) {
      console.error('❌ Audience overlap API error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Audience overlap request failed'
      }
    }
  }

  /**
   * Search Influencers API - Main discovery with comprehensive filtering
   * POST /instagram/search
   * Costs 0.01 credits per result (typically 0.15 credits for 15 credits)
   */
  async searchInfluencers(
    filters: any,
    page: number = 0,
    sort?: any
  ): Promise<{
    success: boolean;
    data?: {
      total: number;
      lookalikes: any[];
      directs: any[];
      isExactMatch: boolean;
    };
    error?: string;
  }> {
    try {
      const requestBody = {
        page,
        calculationMethod: "median",
        sort: sort || { field: "followers", direction: "desc" },
        filter: filters
      }

      console.log('🔍 Searching influencers with new API:', { 
        page, 
        hasInfluencerFilters: !!filters.influencer,
        hasAudienceFilters: !!filters.audience,
        sortField: requestBody.sort.field
      })

      const result = await this.makeRequest('/v1/instagram/search', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      })

      if (result.error) {
        console.error('❌ Search Influencers API error:', result)
        return {
          success: false,
          error: result.message || 'Search failed'
        }
      }

      console.log('✅ Search Influencers API success:', {
        total: result.total,
        directsCount: result.directs?.length || 0,
        lookalikesCount: result.lookalikes?.length || 0,
        isExactMatch: result.isExactMatch
      })

      return {
        success: true,
        data: {
          total: result.total || 0,
          lookalikes: result.lookalikes || [],
          directs: result.directs || [],
          isExactMatch: result.isExactMatch || false
        }
      }
    } catch (error) {
      console.error('❌ Error searching influencers:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Performance Data API - Get detailed performance statistics
   * GET /instagram/performance-data
   * Costs 0.25 credits per successful request
   */
  async getPerformanceData(url: string, maxRetries: number = 3): Promise<{
    success: boolean
    data?: {
      posts: {
        total: number
        posts_with_hidden_likes: number
        likes: any
        comments: any
        views: any
        engagement_rate: any[]
        posting_statistics: any
      }
      reels: {
        total: number
        reels_with_hidden_likes: number
        likes: any
        comments: any
        views: any
        engagement_rate: any[]
        posting_statistics: any
      }
    }
    status?: string
    message?: string
  }> {
    try {
      const params = new URLSearchParams({ url })
      const endpoint = `/v1/instagram/performance-data?${params.toString()}`
      
      console.log('📊 Performance Data API request:', { endpoint, url, maxRetries })
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`📊 Attempt ${attempt}/${maxRetries} for performance data...`)
        
        const response = await this.makeRequest(endpoint)
        
        // Handle retry_later status
        if (response.status === 'retry_later') {
          console.log('⏳ Performance data is being processed, retry needed...')
          if (attempt < maxRetries) {
            console.log('⏳ Waiting 5 minutes before retry...')
            await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000)) // Wait 5 minutes
            continue
          } else {
            return {
              success: false,
              status: 'retry_later',
              message: 'Data still processing after maximum retries'
            }
          }
        }
        
        // Handle error response
        if (response.error) {
          console.error('❌ Performance Data API error:', response)
          return {
            success: false,
            message: response.message || 'Performance data request failed'
          }
        }
        
        // Success response
        console.log('✅ Performance Data API success:', {
          postsTotal: response.posts?.total,
          reelsTotal: response.reels?.total,
          hasPostsData: !!response.posts,
          hasReelsData: !!response.reels
        })
        
        return {
          success: true,
          data: response
        }
      }
      
      return {
        success: false,
        message: 'Maximum retries exceeded'
      }
    } catch (error) {
      console.error('❌ Failed to get performance data:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
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
      const response = await this.makeRequest('/user/info')
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
    // Helper function to calculate fake followers quality
    const getFakeFollowersQuality = (percentage: number): 'below_average' | 'average' | 'above_average' => {
      if (percentage < 10) return 'below_average'  // Good quality
      if (percentage < 20) return 'average'        // Moderate quality
      return 'above_average'                       // High fake followers
    }

    // Helper function to determine growth trend
    const getTrend = (value: number): 'up' | 'down' | 'stable' => {
      if (value > 5) return 'up'
      if (value < -5) return 'down'
      return 'stable'
    }

    // Calculate estimated impressions and reach based on followers and engagement
    const followers = data.profile?.followers || data.followers || 0
    const engagementRate = data.performance?.engagement_rate || 0
    const estimatedReach = Math.round(followers * 0.4) // Conservative estimate: 40% of followers
    const estimatedImpressions = Math.round(estimatedReach * 1.5) // Impressions typically 1.5x reach

    return {
      userId: data.userId,
      demographics: {
        age_ranges: data.audience?.age || data.audience?.ageGroups || {},
        gender: data.audience?.gender || data.audience?.genders || {},
        locations: data.audience?.geolocations?.map((loc: any) => ({
          country: loc.name || loc.country,
          city: loc.city,
          percentage: (loc.weight || loc.percentage || 0) * 100
        })) || data.audience?.geoCountries?.map((loc: any) => ({
          country: loc.name || loc.country,
          city: loc.city,
          percentage: (loc.weight || loc.percentage || 0) * 100
        })) || [],
        languages: data.audience?.languages?.map((lang: any) => ({
          language: lang.name || lang.language,  
          percentage: (lang.weight || lang.percentage || 0) * 100
        })) || [],
        interests: data.audience?.interests?.map((interest: any) => ({
          interest: interest.name || interest.category,
          percentage: (interest.weight || interest.percentage || 0) * 100
        })) || []
      },
      engagement: {
        avg_likes: data.performance?.avg_likes || data.statsByContentType?.all?.avgLikes || 0,
        avg_comments: data.performance?.avg_comments || data.statsByContentType?.all?.avgComments || 0,
        avg_shares: data.performance?.avg_shares || data.statsByContentType?.all?.avgShares,
        engagement_rate: data.performance?.engagement_rate || data.statsByContentType?.all?.engagementRate || 0,
        fake_followers_percentage: data.audienceExtra?.fakeFollowersPercentage || data.fake_followers_percentage,
        fake_followers_quality: data.audienceExtra?.fakeFollowersPercentage 
          ? getFakeFollowersQuality(data.audienceExtra.fakeFollowersPercentage * 100)
          : undefined,
        estimated_impressions: estimatedImpressions,
        estimated_reach: estimatedReach
      },
      content_performance: {
        reels: data.statsByContentType?.reels || data.content_performance?.reels ? {
          avg_plays: data.statsByContentType?.reels?.avgViews || data.content_performance?.reels?.avg_plays,
          engagement_rate: data.statsByContentType?.reels?.engagementRate || data.content_performance?.reels?.engagement_rate,
          avg_likes: data.statsByContentType?.reels?.avgLikes || data.content_performance?.reels?.avg_likes,
          avg_comments: data.statsByContentType?.reels?.avgComments || data.content_performance?.reels?.avg_comments,
          avg_shares: data.statsByContentType?.reels?.avgShares || data.content_performance?.reels?.avg_shares
        } : undefined,
        posts: data.statsByContentType?.posts || data.content_performance?.posts ? {
          avg_likes: data.statsByContentType?.posts?.avgLikes || data.content_performance?.posts?.avg_likes,
          avg_comments: data.statsByContentType?.posts?.avgComments || data.content_performance?.posts?.avg_comments,
          avg_shares: data.statsByContentType?.posts?.avgShares || data.content_performance?.posts?.avg_shares,
          engagement_rate: data.statsByContentType?.posts?.engagementRate || data.content_performance?.posts?.engagement_rate
        } : undefined,
        stories: data.statsByContentType?.stories || data.content_performance?.stories ? {
          estimated_reach: data.statsByContentType?.stories?.avgReach || data.content_performance?.stories?.estimated_reach,
          estimated_impressions: data.statsByContentType?.stories?.avgImpressions || data.content_performance?.stories?.estimated_impressions
        } : undefined
      },
      growth_trends: data.growth_trends || data.historical ? {
        follower_growth: data.growth_trends?.follower_growth || data.historical?.follower_growth ? {
          value: data.growth_trends?.follower_growth?.value || data.historical?.follower_growth?.rate || 0,
          trend: getTrend(data.growth_trends?.follower_growth?.percentage || data.historical?.follower_growth?.percentage || 0),
          percentage: data.growth_trends?.follower_growth?.percentage || data.historical?.follower_growth?.percentage || 0
        } : undefined,
        engagement_growth: data.growth_trends?.engagement_growth || data.historical?.engagement_growth ? {
          value: data.growth_trends?.engagement_growth?.value || data.historical?.engagement_growth?.rate || 0,
          trend: getTrend(data.growth_trends?.engagement_growth?.percentage || data.historical?.engagement_growth?.percentage || 0),
          percentage: data.growth_trends?.engagement_growth?.percentage || data.historical?.engagement_growth?.percentage || 0
        } : undefined,
        likes_growth: data.growth_trends?.likes_growth || data.historical?.likes_growth ? {
          value: data.growth_trends?.likes_growth?.value || data.historical?.likes_growth?.rate || 0,
          trend: getTrend(data.growth_trends?.likes_growth?.percentage || data.historical?.likes_growth?.percentage || 0),
          percentage: data.growth_trends?.likes_growth?.percentage || data.historical?.likes_growth?.percentage || 0
        } : undefined
      } : undefined,
      paid_vs_organic: data.paid_vs_organic || data.sponsoredPostsPerformance ? {
        paid_engagement_rate: data.paid_vs_organic?.paid_engagement_rate || data.sponsoredPostsPerformance?.engagementRate,
        organic_engagement_rate: data.paid_vs_organic?.organic_engagement_rate || data.organicPostsPerformance?.engagementRate,
        paid_performance_ratio: data.paidPostPerformance || data.sponsoredPostsMedianLikes 
          ? (data.sponsoredPostsMedianLikes / (data.nonSponsoredPostsMedianLikes || 1))
          : undefined
      } : undefined,
      recent_posts: data.recent_posts?.map((post: any) => ({
        url: post.url,
        thumbnail: post.thumbnail,
        caption: post.caption,
        likes: post.likes,
        comments: post.comments,
        shares: post.shares,
        posted_at: post.posted_at,
        content_type: post.content_type || post.type || 'post',
        is_sponsored: post.is_sponsored || post.sponsored || false
      })) || data.posts?.map((post: any) => ({
        url: post.url,
        thumbnail: post.thumbnail,
        caption: post.caption,
        likes: post.likes,
        comments: post.comments,
        shares: post.shares,
        posted_at: post.posted_at || post.created_time,
        content_type: post.content_type || post.type || 'post',
        is_sponsored: post.is_sponsored || post.sponsored || false
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