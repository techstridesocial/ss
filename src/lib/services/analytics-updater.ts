// analytics-updater.ts - Content Link Analytics Processing

import { getMediaInfo, detectPlatformFromUrl } from './modash'
import { query } from '../db/connection'

interface ContentAnalytics {
  platform: string
  views: number
  likes: number
  comments: number
  shares?: number
  saves?: number
  engagement_rate?: number
  url: string
}

interface AggregatedAnalytics {
  total_views: number
  total_likes: number
  total_comments: number
  total_shares: number
  total_saves: number
  avg_engagement_rate: number
  content_count: number
}

/**
 * Main function to update influencer analytics from content links
 * Called when content links are added/updated in campaigns
 */
export async function updateInfluencerAnalyticsFromContentLinks(
  influencerId: string, 
  contentLinks: string[]
): Promise<boolean> {
  console.log(`🔄 Starting analytics update for influencer ${influencerId}`)
  console.log(`📋 Processing ${contentLinks.length} content links`)
  
  try {
    // Handle empty content links - reset analytics to 0
    if (!contentLinks || contentLinks.length === 0) {
      console.log(`🔄 No content links provided - resetting analytics to 0 for influencer ${influencerId}`)
      await resetInfluencerAnalytics(influencerId)
      return true
    }

    // Validate and filter content links
    const validLinks = contentLinks.filter(link => {
      const trimmed = link.trim()
      return trimmed && (trimmed.startsWith('http://') || trimmed.startsWith('https://'))
    })

    if (validLinks.length === 0) {
      console.log(`⚠️ No valid content links found - resetting analytics to 0 for influencer ${influencerId}`)
      await resetInfluencerAnalytics(influencerId)
      return true
    }

    console.log(`✅ Found ${validLinks.length} valid content links`)

    // Process each content link with Modash API
    const analyticsResults: ContentAnalytics[] = []
    
    for (const link of validLinks) {
      try {
        console.log(`🔍 Processing content link: ${link}`)
        const analytics = await processContentLink(link)
        if (analytics) {
          analyticsResults.push(analytics)
          console.log(`✅ Successfully processed: ${analytics.platform} - ${analytics.views} views, ${analytics.likes} likes`)
        } else {
          console.log(`⚠️ No analytics data returned for: ${link}`)
        }
      } catch (error) {
        console.error(`❌ Error processing content link ${link}:`, error)
        // Continue processing other links even if one fails
      }
    }

    if (analyticsResults.length === 0) {
      console.log(`⚠️ No analytics data collected - resetting analytics to 0 for influencer ${influencerId}`)
      await resetInfluencerAnalytics(influencerId)
      return true
    }

    // Aggregate analytics from all content pieces
    const aggregatedAnalytics = aggregateAnalytics(analyticsResults)
    console.log(`📊 Aggregated analytics:`, aggregatedAnalytics)

    // Update influencer analytics in database
    await updateInfluencerAnalytics(influencerId, aggregatedAnalytics)
    
    console.log(`✅ Successfully updated analytics for influencer ${influencerId}`)
    return true

  } catch (error) {
    console.error(`❌ Error updating analytics for influencer ${influencerId}:`, error)
    return false
  }
}

/**
 * Process a single content link using Modash Raw API
 */
async function processContentLink(url: string): Promise<ContentAnalytics | null> {
  try {
    const platform = detectPlatformFromUrl(url)
    
    if (platform === 'unknown') {
      console.log(`⚠️ Unsupported platform for URL: ${url}`)
      return null
    }

    console.log(`🔍 Getting media info for ${platform} content: ${url}`)
    
    // Call Modash Raw API
    const mediaInfo = await getMediaInfo(url)
    
    if (!mediaInfo || mediaInfo.error) {
      console.error(`❌ Modash API error for ${url}:`, mediaInfo?.error)
      return null
    }

    // Extract analytics based on platform
    const analytics = extractAnalyticsFromMediaInfo(mediaInfo, platform, url)
    
    if (!analytics) {
      console.log(`⚠️ Could not extract analytics from ${platform} response for: ${url}`)
      return null
    }

    return analytics

  } catch (error) {
    console.error(`❌ Error processing content link ${url}:`, error)
    return null
  }
}

/**
 * Extract analytics from Modash API response based on platform
 */
function extractAnalyticsFromMediaInfo(mediaInfo: any, platform: string, url: string): ContentAnalytics | null {
  try {
    let analytics: ContentAnalytics | null = null

    switch (platform) {
      case 'instagram':
        analytics = extractInstagramAnalytics(mediaInfo, url)
        break
      case 'tiktok':
        analytics = extractTikTokAnalytics(mediaInfo, url)
        break
      case 'youtube':
        analytics = extractYouTubeAnalytics(mediaInfo, url)
        break
      default:
        console.log(`⚠️ Unsupported platform: ${platform}`)
        return null
    }

    // Calculate engagement rate if we have the data
    if (analytics && analytics.views > 0) {
      const totalEngagements = analytics.likes + analytics.comments + (analytics.shares || 0) + (analytics.saves || 0)
      analytics.engagement_rate = (totalEngagements / analytics.views) * 100
    }

    return analytics

  } catch (error) {
    console.error(`❌ Error extracting analytics from ${platform} response:`, error)
    return null
  }
}

/**
 * Extract Instagram analytics from Modash response
 */
function extractInstagramAnalytics(mediaInfo: any, url: string): ContentAnalytics | null {
  try {
    // Instagram response structure: items[0] contains the post data
    const postData = mediaInfo?.items?.[0]
    if (!postData) {
      console.log(`⚠️ No post data found in Instagram response for: ${url}`)
      return null
    }

    return {
      platform: 'instagram',
      views: postData.view_count || 0,
      likes: postData.like_count || 0,
      comments: postData.comment_count || 0,
      shares: postData.share_count || 0,
      saves: postData.save_count || 0,
      url: url
    }
  } catch (error) {
    console.error(`❌ Error extracting Instagram analytics:`, error)
    return null
  }
}

/**
 * Extract TikTok analytics from Modash response
 */
function extractTikTokAnalytics(mediaInfo: any, url: string): ContentAnalytics | null {
  try {
    // TikTok response structure: itemStruct contains the video data
    const videoData = mediaInfo?.itemStruct
    if (!videoData) {
      console.log(`⚠️ No video data found in TikTok response for: ${url}`)
      return null
    }

    return {
      platform: 'tiktok',
      views: videoData.stats?.playCount || 0,
      likes: videoData.stats?.diggCount || 0,
      comments: videoData.stats?.commentCount || 0,
      shares: videoData.stats?.shareCount || 0,
      url: url
    }
  } catch (error) {
    console.error(`❌ Error extracting TikTok analytics:`, error)
    return null
  }
}

/**
 * Extract YouTube analytics from Modash response
 */
function extractYouTubeAnalytics(mediaInfo: any, url: string): ContentAnalytics | null {
  try {
    // YouTube response structure varies - adjust based on actual API response
    const videoData = mediaInfo?.items?.[0] || mediaInfo?.videoData
    if (!videoData) {
      console.log(`⚠️ No video data found in YouTube response for: ${url}`)
      return null
    }

    return {
      platform: 'youtube',
      views: videoData.statistics?.viewCount || videoData.views || 0,
      likes: videoData.statistics?.likeCount || videoData.likes || 0,
      comments: videoData.statistics?.commentCount || videoData.comments || 0,
      url: url
    }
  } catch (error) {
    console.error(`❌ Error extracting YouTube analytics:`, error)
    return null
  }
}

/**
 * Aggregate analytics from multiple content pieces
 */
function aggregateAnalytics(analyticsList: ContentAnalytics[]): AggregatedAnalytics {
  if (analyticsList.length === 0) {
    return {
      total_views: 0,
      total_likes: 0,
      total_comments: 0,
      total_shares: 0,
      total_saves: 0,
      avg_engagement_rate: 0,
      content_count: 0
    }
  }

  const totals = analyticsList.reduce((acc, analytics) => {
    acc.total_views += analytics.views || 0
    acc.total_likes += analytics.likes || 0
    acc.total_comments += analytics.comments || 0
    acc.total_shares += analytics.shares || 0
    acc.total_saves += analytics.saves || 0
    return acc
  }, {
    total_views: 0,
    total_likes: 0,
    total_comments: 0,
    total_shares: 0,
    total_saves: 0
  })

  // Calculate average engagement rate
  const validEngagementRates = analyticsList
    .map(a => a.engagement_rate)
    .filter(rate => rate !== undefined && rate !== null)
  
  const avg_engagement_rate = validEngagementRates.length > 0
    ? validEngagementRates.reduce((sum, rate) => sum + (rate || 0), 0) / validEngagementRates.length
    : 0

  return {
    ...totals,
    avg_engagement_rate,
    content_count: analyticsList.length
  }
}

/**
 * Update influencer analytics in the database
 */
async function updateInfluencerAnalytics(
  influencerId: string, 
  analytics: AggregatedAnalytics
): Promise<void> {
  try {
    console.log(`💾 Updating database analytics for influencer ${influencerId}`)
    
    // Update main influencer table with analytics columns
    await query(`
      UPDATE influencers 
      SET 
        total_followers = GREATEST(total_followers, $2),
        total_engagement_rate = $3,
        total_avg_views = $4,
        estimated_promotion_views = ROUND($4 * 0.15),
        total_engagements = $5,
        avg_engagement_rate = $6,
        estimated_reach = $7,
        total_likes = $8,
        total_comments = $9,
        total_views = $10,
        analytics_updated_at = NOW(),
        modash_last_updated = NOW()
      WHERE id = $1
    `, [
      influencerId,
      analytics.total_views, // Use total_views as a proxy for followers if higher
      analytics.avg_engagement_rate,
      Math.round(analytics.total_views / analytics.content_count), // Average views per content
      analytics.total_likes + analytics.total_comments + analytics.total_shares + analytics.total_saves, // Total engagements
      analytics.avg_engagement_rate,
      analytics.total_views, // Estimated reach
      analytics.total_likes,
      analytics.total_comments,
      analytics.total_views
    ])

    // Update platform-specific tables if they exist
    // This ensures platform-specific data is also updated
    await query(`
      UPDATE influencer_platforms 
      SET 
        avg_views = $2,
        engagement_rate = $3,
        last_synced = NOW()
      WHERE influencer_id = $1
    `, [
      influencerId,
      Math.round(analytics.total_views / analytics.content_count),
      analytics.avg_engagement_rate
    ])

    console.log(`✅ Database updated successfully for influencer ${influencerId}`)

  } catch (error) {
    console.error(`❌ Error updating database for influencer ${influencerId}:`, error)
    throw error
  }
}

/**
 * Reset influencer analytics to 0 (when no content links)
 */
async function resetInfluencerAnalytics(influencerId: string): Promise<void> {
  try {
    console.log(`🔄 Resetting analytics to 0 for influencer ${influencerId}`)
    
    await query(`
      UPDATE influencers 
      SET 
        total_engagements = 0,
        total_engagement_rate = 0,
        avg_engagement_rate = 0,
        estimated_reach = 0,
        total_avg_views = 0,
        estimated_promotion_views = 0,
        total_likes = 0,
        total_comments = 0,
        total_views = 0,
        analytics_updated_at = NOW()
      WHERE id = $1
    `, [influencerId])

    // Also reset platform-specific analytics
    await query(`
      UPDATE influencer_platforms 
      SET 
        avg_views = 0,
        engagement_rate = 0,
        last_synced = NOW()
      WHERE influencer_id = $1
    `, [influencerId])

    console.log(`✅ Analytics reset to 0 for influencer ${influencerId}`)

  } catch (error) {
    console.error(`❌ Error resetting analytics for influencer ${influencerId}:`, error)
    throw error
  }
}

/**
 * Batch process multiple influencers' content links
 * Useful for bulk updates or scheduled refreshes
 */
export async function batchUpdateInfluencerAnalytics(
  influencerUpdates: Array<{ influencerId: string, contentLinks: string[] }>
): Promise<{ success: number, failed: number, errors: string[] }> {
  console.log(`🔄 Starting batch analytics update for ${influencerUpdates.length} influencers`)
  
  let success = 0
  let failed = 0
  const errors: string[] = []

  for (const update of influencerUpdates) {
    try {
      const result = await updateInfluencerAnalyticsFromContentLinks(
        update.influencerId, 
        update.contentLinks
      )
      
      if (result) {
        success++
      } else {
        failed++
        errors.push(`Failed to update influencer ${update.influencerId}`)
      }
    } catch (error) {
      failed++
      const errorMsg = `Error updating influencer ${update.influencerId}: ${error instanceof Error ? error.message : 'Unknown error'}`
      errors.push(errorMsg)
      console.error(`❌ ${errorMsg}`)
    }
  }

  console.log(`✅ Batch update completed: ${success} success, ${failed} failed`)
  return { success, failed, errors }
}

/**
 * Get analytics summary for an influencer
 */
export async function getInfluencerAnalyticsSummary(influencerId: string): Promise<{
  total_views: number
  total_likes: number
  total_comments: number
  engagement_rate: number
  last_updated: Date | null
} | null> {
  try {
    const result = await query(`
      SELECT 
        total_avg_views,
        total_likes,
        total_comments,
        total_engagement_rate,
        total_views,
        analytics_updated_at
      FROM influencers 
      WHERE id = $1
    `, [influencerId])

    if (result.length === 0) {
      return null
    }

    const row = result[0]
    return {
      total_views: row.total_views || row.total_avg_views || 0,
      total_likes: row.total_likes || 0,
      total_comments: row.total_comments || 0,
      engagement_rate: row.total_engagement_rate || 0,
      last_updated: row.analytics_updated_at
    }

  } catch (error) {
    console.error(`❌ Error getting analytics summary for influencer ${influencerId}:`, error)
    return null
  }
}
