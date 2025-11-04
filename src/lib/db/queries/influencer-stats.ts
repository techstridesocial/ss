import { query } from '../connection'
import { getCachedProfile } from '../../services/modash-cache'

export interface DatabaseResponse<T> {
  success: boolean
  data?: T
  error?: string
  message: string
}

export interface InfluencerStats {
  overall: {
    total_followers: number
    total_views: number
    avg_engagement_rate: number
    estimated_promotion_views: number
  }
  platforms: PlatformStats[]
  recent_content: {
    total_posts: number
    total_views: number
    total_likes: number
    total_comments: number
    total_shares: number
    avg_engagement: number
  }
  performance_metrics: {
    followers_growth: number
    engagement_trend: number
    content_performance: string
  }
}

export interface PlatformStats {
  platform: string
  username: string
  followers: number
  engagement_rate: number
  avg_views: number
  avg_likes?: number
  is_connected: boolean
  last_synced?: Date
  status: string
  data_source?: 'cached' | 'live' | 'mock'
  cached_at?: Date
}

// Mock data generation removed - using only real data from database

/**
 * Get influencer statistics with mock social data
 */
export async function getInfluencerStats(userId: string): Promise<DatabaseResponse<InfluencerStats>> {
  try {
    // Get influencer ID from users table
    const userResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId]
    )

    if (userResult.length === 0) {
      return {
        success: false,
        error: 'User not found',
        message: 'User not found in database'
      }
    }

    const user_id = userResult[0]?.id

    // Get influencer data
    const influencerQuery = `
      SELECT 
        i.id as influencer_id,
        i.total_followers,
        i.total_engagement_rate,
        i.total_avg_views,
        i.estimated_promotion_views
      FROM influencers i
      WHERE i.user_id = $1
    `

    const influencerResult = await query(influencerQuery, [user_id])

    if (influencerResult.length === 0) {
      return {
        success: false,
        error: 'Influencer not found',
        message: 'Influencer profile not found'
      }
    }

    const influencer = influencerResult[0]

    // Get platform-specific metrics from database
    const platformsQuery = `
      SELECT 
        platform,
        username,
        followers,
        engagement_rate,
        avg_views,
        is_connected,
        last_synced
      FROM influencer_platforms
      WHERE influencer_id = $1
      ORDER BY platform
    `

    const dbPlatforms = await query(platformsQuery, [influencer.influencer_id])
    console.log('🔍 Database platforms found:', dbPlatforms)

    // Create platform stats with cached data for connected platforms
    const allPlatforms = ['instagram', 'tiktok', 'youtube']
    const platformStats: PlatformStats[] = await Promise.all(
      allPlatforms.map(async platform => {
        console.log(`🔍 Looking for platform: ${platform}`)
        const dbPlatform = dbPlatforms.find(p => {
          console.log(`🔍 Comparing: ${p.platform.toLowerCase()} === ${platform}`)
          return p.platform.toLowerCase() === platform
        })
        console.log(`🔍 Found dbPlatform for ${platform}:`, dbPlatform)
        
        if (dbPlatform && dbPlatform.is_connected) {
          // Check for cached Modash data first
          const cachedData = await getCachedProfile(dbPlatform.id, platform)
          
          if (cachedData) {
            // Use rich cached data from Modash
            return {
              id: dbPlatform.id, // Add the influencer platform ID
              platform: platform,
              username: cachedData.username || dbPlatform.username || `@${platform}_user`,
              followers: cachedData.followers || dbPlatform.followers || 0,
              engagement_rate: cachedData.engagement_rate || dbPlatform.engagement_rate || 0,
              avg_views: cachedData.avg_views || dbPlatform.avg_views || 0,
              avg_likes: cachedData.avg_likes || 0,
              is_connected: true,
              last_synced: cachedData.last_updated,
              status: 'connected',
              data_source: 'cached',
              cached_at: cachedData.cached_at
            }
          } else {
            // Use basic platform data from database
            return {
              id: dbPlatform.id, // Add the influencer platform ID
              platform: dbPlatform.platform.toLowerCase(),
              username: dbPlatform.username || `@${platform}_user`,
              followers: dbPlatform.followers || 0,
              engagement_rate: dbPlatform.engagement_rate || 0,
              avg_views: dbPlatform.avg_views || 0,
              is_connected: true,
              last_synced: dbPlatform.last_synced,
              status: 'connected',
              data_source: 'live'
            }
          }
        } else {
          // Platform not connected - return empty data instead of mock
          return {
            platform: platform,
            username: `@${platform}_user`,
            followers: 0,
            engagement_rate: 0,
            avg_views: 0,
            is_connected: false,
            status: 'not_connected',
            data_source: undefined
          }
        }
      })
    )

    // Calculate overall metrics from connected platforms only
    const connectedPlatforms = platformStats.filter(p => p.is_connected)
    const totalFollowers = connectedPlatforms.reduce((sum, p) => sum + p.followers, 0)
    const totalViews = connectedPlatforms.reduce((sum, p) => sum + p.avg_views, 0)
    const avgEngagement = connectedPlatforms.length > 0 
      ? connectedPlatforms.reduce((sum, p) => sum + p.engagement_rate, 0) / connectedPlatforms.length 
      : 0

    // Get content performance from database
    const contentQuery = `
      SELECT 
        cs.content_type,
        cs.platform,
        cs.views,
        cs.likes,
        cs.comments,
        cs.shares,
        cs.saves,
        cs.submitted_at
      FROM campaign_content_submissions cs
      JOIN campaign_influencers ci ON cs.campaign_influencer_id = ci.id
      WHERE ci.influencer_id = $1
      ORDER BY cs.submitted_at DESC
      LIMIT 10
    `

    const recentContent = await query(contentQuery, [influencer.influencer_id])

    // Calculate content performance metrics
    const totalContentViews = recentContent.reduce((sum, c) => sum + (c.views || 0), 0)
    const totalContentLikes = recentContent.reduce((sum, c) => sum + (c.likes || 0), 0)
    const totalContentComments = recentContent.reduce((sum, c) => sum + (c.comments || 0), 0)
    const totalContentShares = recentContent.reduce((sum, c) => sum + (c.shares || 0), 0)

    // Use real performance trends (no mock data)
    const followersGrowth = 0 // Will be calculated from real data over time
    const engagementTrend = 0 // Will be calculated from real data over time
    const contentPerformance = recentContent.length > 0 ? 'good' : 'no_data'

    const stats: InfluencerStats = {
      overall: {
        total_followers: totalFollowers,
        total_views: totalViews,
        avg_engagement_rate: avgEngagement,
        estimated_promotion_views: influencer.estimated_promotion_views || Math.floor(totalViews * 0.15)
      },
      platforms: platformStats,
      recent_content: {
        total_posts: recentContent.length,
        total_views: totalContentViews,
        total_likes: totalContentLikes,
        total_comments: totalContentComments,
        total_shares: totalContentShares,
        avg_engagement: recentContent.length > 0 
          ? (totalContentLikes + totalContentComments + totalContentShares) / recentContent.length 
          : 0
      },
      performance_metrics: {
        followers_growth: followersGrowth,
        engagement_trend: engagementTrend,
        content_performance: contentPerformance
      }
    }

    return { success: true,
      data: stats,
      message: 'Influencer stats retrieved successfully'
    }

  } catch (error) {
    console.error('Error getting influencer stats:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to retrieve influencer stats'
    }
  }
}

/**
 * Get platform-specific stats for an influencer
 */
export async function getPlatformStats(influencerId: string, platform: string): Promise<DatabaseResponse<PlatformStats>> {
  try {
    const queryText = `
      SELECT 
        platform,
        username,
        followers,
        engagement_rate,
        avg_views,
        is_connected,
        last_synced
      FROM influencer_platforms
      WHERE influencer_id = $1 AND platform = $2
    `

    const result = await query(queryText, [influencerId, platform])

    if (result.length === 0) {
      // Return empty data if no platform data exists
      return {
        success: true,
        data: {
          platform: platform,
          username: `@${platform}_user`,
          followers: 0,
          engagement_rate: 0,
          avg_views: 0,
          is_connected: false,
          status: 'not_connected'
        },
        message: 'No platform data found'
      }
    }

    const platformData = result[0]
    const stats: PlatformStats = {
      platform: platformData.platform.toLowerCase(),
      username: platformData.username || `@${platform}_user`,
      followers: platformData.followers || 0,
      engagement_rate: platformData.engagement_rate || 0,
      avg_views: platformData.avg_views || 0,
      is_connected: platformData.is_connected || false,
      last_synced: platformData.last_synced,
      status: platformData.is_connected ? 'connected' : 'not_connected'
    }

    return {
      success: true,
      data: stats,
      message: 'Platform stats retrieved successfully'
    }

  } catch (error) {
    console.error('Error getting platform stats:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to retrieve platform stats'
    }
  }
} 