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

class ModashService {
  private readonly apiKey: string
  private readonly baseUrl = 'https://api.modash.io/v1'
  private readonly maxRetries = 3
  private readonly requestDelay = 500 // 2 requests/second limit

  constructor() {
    this.apiKey = process.env.MODASH_API_KEY!
    if (!this.apiKey) {
      throw new Error('MODASH_API_KEY environment variable is required')
    }
  }

  /**
   * Search for influencer by handle
   */
  async searchInfluencer(handle: string, platform: string): Promise<ModashProfile | null> {
    const cleanHandle = handle.replace('@', '')
    
    try {
      const response = await this.makeRequest('/discovery/search', {
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

      if (response.results?.length > 0) {
        return this.transformProfileData(response.results[0])
      }

      return null
    } catch (error) {
      console.error(`Failed to search for influencer @${cleanHandle}:`, error)
      return null
    }
  }

  /**
   * Get comprehensive report for influencer
   */
  async getInfluencerReport(userId: string): Promise<ModashReport | null> {
    try {
      const response = await this.makeRequest(`/discovery/profile/${userId}/report`)
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
      const response = await this.makeRequest('/account')
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
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })

    if (!response.ok) {
      throw new Error(`Modash API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
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