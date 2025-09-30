// Analytics Updater Service
// Updates influencer analytics from Modash RAW API data

import { query } from '../db/connection'
import { getProfileReport } from './modash'

interface ModashProfileData {
  profile?: {
    followers?: number
    engagement_rate?: number
    avg_views?: number
    total_posts?: number
    total_likes?: number
    total_comments?: number
    total_shares?: number
    reach?: number
  }
  posts?: {
    total?: number
    avg_likes?: number
    avg_comments?: number
    avg_views?: number
  }
  reels?: {
    total?: number
    avg_likes?: number
    avg_comments?: number
    avg_views?: number
  }
}

/**
 * Update influencer analytics from Modash data stored in notes
 */
export async function updateInfluencerAnalyticsFromModash(influencerId: string): Promise<boolean> {
  try {
    // Get influencer with notes
    const result = await query(`
      SELECT id, display_name, notes 
      FROM influencers 
      WHERE id = $1
    `, [influencerId])

    if (result.length === 0) {
      console.log(`❌ Influencer ${influencerId} not found`)
      return false
    }

    const influencer = result[0]
    const notes = influencer.notes ? JSON.parse(influencer.notes) : {}
    const modashData = notes.modash_data

    if (!modashData) {
      console.log(`❌ No Modash data found for influencer ${influencer.display_name}`)
      return false
    }

    // Extract analytics from Modash data
    const analytics = extractAnalyticsFromModashData(modashData)
    
    if (!analytics) {
      console.log(`❌ Could not extract analytics from Modash data for ${influencer.display_name}`)
      return false
    }

    // Update database with analytics
    await query(`
      UPDATE influencers 
      SET 
        total_engagements = $1,
        avg_engagement_rate = $2,
        estimated_reach = $3,
        total_likes = $4,
        total_comments = $5,
        total_views = $6,
        analytics_updated_at = NOW(),
        updated_at = NOW()
      WHERE id = $7
    `, [
      analytics.total_engagements,
      analytics.avg_engagement_rate,
      analytics.estimated_reach,
      analytics.total_likes,
      analytics.total_comments,
      analytics.total_views,
      influencerId
    ])

    console.log(`✅ Updated analytics for ${influencer.display_name}:`, analytics)
    return true

  } catch (error) {
    console.error(`❌ Error updating analytics for influencer ${influencerId}:`, error)
    return false
  }
}

/**
 * Update influencer analytics from content links using Modash RAW API
 */
export async function updateInfluencerAnalyticsFromContentLinks(
  influencerId: string, 
  contentLinks: string[]
): Promise<boolean> {
  try {
    console.log(`🔄 Updating analytics from content links for influencer ${influencerId}:`, contentLinks)

    if (!contentLinks || contentLinks.length === 0) {
      console.log(`❌ No content links provided for influencer ${influencerId}`)
      return false
    }

    // Import Modash service
    const { getMediaInfo } = await import('@/lib/services/modash')
    
    let totalEngagements = 0
    let totalLikes = 0
    let totalComments = 0
    let totalViews = 0
    let validLinks = 0

    // Process each content link
    for (const link of contentLinks) {
      try {
        console.log(`🔍 Processing content link: ${link}`)
        
        // Get media info from Modash RAW API
        const mediaInfo = await getMediaInfo(link)
        console.log(`📊 Raw Modash response for ${link}:`, JSON.stringify(mediaInfo, null, 2))
        
        if (mediaInfo && !mediaInfo.error) {
          // Extract analytics based on platform
          const analytics = extractAnalyticsFromMediaInfo(mediaInfo, link)
          console.log(`📈 Extracted analytics for ${link}:`, analytics)
          
          if (analytics) {
            totalEngagements += (analytics.like_count || 0) + (analytics.comment_count || 0)
            totalLikes += analytics.like_count || 0
            totalComments += analytics.comment_count || 0
            totalViews += analytics.play_count || analytics.view_count || 0
            validLinks++
            
            console.log(`✅ Extracted analytics from ${link}:`, analytics)
          } else {
            console.log(`⚠️ No analytics extracted from ${link}`)
          }
        } else {
          console.log(`⚠️ Failed to get analytics for ${link}:`, mediaInfo?.error)
        }
      } catch (linkError) {
        console.error(`❌ Error processing content link ${link}:`, linkError)
      }
    }

    console.log(`📊 Analytics summary:`, {
      totalEngagements,
      totalLikes,
      totalComments,
      totalViews,
      validLinks
    })

    if (validLinks === 0) {
      console.log(`❌ No valid content links processed for influencer ${influencerId}`)
      return false
    }

    // Calculate average engagement rate
    const avgEngagementRate = totalViews > 0 ? totalEngagements / totalViews : 0
    const estimatedReach = Math.floor(totalViews * 0.1) // Rough estimate: 10% of views as reach

    console.log(`💾 Updating database for influencer ${influencerId} with:`, {
      totalEngagements,
      avgEngagementRate,
      estimatedReach,
      totalLikes,
      totalComments,
      totalViews
    })

    // Update database with analytics
    await query(`
      UPDATE influencers 
      SET 
        total_engagements = $1,
        avg_engagement_rate = $2,
        estimated_reach = $3,
        total_likes = $4,
        total_comments = $5,
        total_views = $6,
        analytics_updated_at = NOW(),
        updated_at = NOW()
      WHERE id = $7
    `, [
      totalEngagements,
      avgEngagementRate,
      estimatedReach,
      totalLikes,
      totalComments,
      totalViews,
      influencerId
    ])

    console.log(`✅ Updated analytics from content links for influencer ${influencerId}:`, {
      totalEngagements,
      avgEngagementRate,
      estimatedReach,
      totalLikes,
      totalComments,
      totalViews,
      validLinks
    })
    
    return true

  } catch (error) {
    console.error(`❌ Error updating analytics from content links for influencer ${influencerId}:`, error)
    return false
  }
}

/**
 * Extract analytics from media info response
 */
function extractAnalyticsFromMediaInfo(data: any, url: string): any {
  // Detect platform from URL
  if (url.includes('instagram.com')) {
    return extractInstagramAnalytics(data)
  } else if (url.includes('tiktok.com')) {
    return extractTikTokAnalytics(data)
  } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return extractYouTubeAnalytics(data)
  }
  return null
}

/**
 * Extract analytics from Instagram response
 */
function extractInstagramAnalytics(data: any) {
  if (!data?.items || data.items.length === 0) {
    return null
  }

  const item = data.items[0]
  
  return {
    like_count: item.like_count || 0,
    comment_count: item.comment_count || 0,
    play_count: item.play_count || 0,
    view_count: item.view_count || 0
  }
}

/**
 * Extract analytics from TikTok response
 */
function extractTikTokAnalytics(data: any) {
  if (!data?.itemStruct) {
    return null
  }

  const item = data.itemStruct
  const stats = item.stats || {}
  
  return {
    like_count: stats.diggCount || 0,
    comment_count: stats.commentCount || 0,
    play_count: stats.playCount || 0,
    view_count: 0
  }
}

/**
 * Extract analytics from YouTube response
 */
function extractYouTubeAnalytics(data: any) {
  if (!data?.video_info) {
    return null
  }

  const video = data.video_info
  
  return {
    like_count: video.likes || 0,
    comment_count: video.comments || 0,
    play_count: 0,
    view_count: video.views || 0
  }
}

/**
 * Extract analytics from Modash data structure
 */
function extractAnalyticsFromModashData(modashData: any): {
  total_engagements: number
  avg_engagement_rate: number
  estimated_reach: number
  total_likes: number
  total_comments: number
  total_views: number
} | null {
  try {
    // Handle different Modash data structures
    let profile = modashData.profile || modashData
    let posts = modashData.posts || {}
    let reels = modashData.reels || {}
    
    // If it's the old structure with different field names
    if (modashData.followers !== undefined) {
      profile = {
        followers: modashData.followers,
        engagement_rate: modashData.engagementRate,
        total_posts: modashData.postsCount,
        total_likes: modashData.avgLikes * (modashData.postsCount || 0),
        total_comments: modashData.avgComments * (modashData.postsCount || 0),
        avg_views: modashData.avgViews
      }
    }
    
    // Handle TikTok data structure
    if (modashData.itemStruct) {
      const item = modashData.itemStruct
      const stats = item.stats || {}
      const author = item.author || {}
      const authorStats = author.stats || {}
      
      profile = {
        followers: authorStats.followerCount || 0,
        engagement_rate: calculateEngagementRate(stats),
        total_posts: authorStats.videoCount || 0,
        total_likes: stats.diggCount || 0,
        total_comments: stats.commentCount || 0,
        avg_views: stats.playCount || 0
      }
    }
    
    // Handle YouTube data structure
    if (modashData.video_info) {
      const video = modashData.video_info
      
      profile = {
        followers: 0, // YouTube doesn't provide follower count in video info
        engagement_rate: calculateYouTubeEngagementRate(video),
        total_posts: 0, // Would need channel info for this
        total_likes: video.likes || 0,
        total_comments: video.comments || 0,
        avg_views: video.views || 0
      }
    }

    // Calculate total engagements (likes + comments + shares)
    const totalLikes = (profile.total_likes || 0) + (posts.avg_likes || 0) * (posts.total || 0) + (reels.avg_likes || 0) * (reels.total || 0)
    const totalComments = (profile.total_comments || 0) + (posts.avg_comments || 0) * (posts.total || 0) + (reels.avg_comments || 0) * (reels.total || 0)
    const totalShares = profile.total_shares || 0
    const totalEngagements = totalLikes + totalComments + totalShares

    // Calculate average engagement rate
    const avgEngagementRate = profile.engagement_rate || 0

    // Calculate estimated reach (followers * engagement rate)
    const followers = profile.followers || 0
    const estimatedReach = Math.floor(followers * avgEngagementRate)

    // Calculate total views
    const totalViews = (profile.avg_views || 0) * (profile.total_posts || 0) + 
                      (posts.avg_views || 0) * (posts.total || 0) + 
                      (reels.avg_views || 0) * (reels.total || 0)

    console.log('📊 Extracted analytics:', {
      total_engagements: Math.floor(totalEngagements),
      avg_engagement_rate: avgEngagementRate,
      estimated_reach: estimatedReach,
      total_likes: Math.floor(totalLikes),
      total_comments: Math.floor(totalComments),
      total_views: Math.floor(totalViews)
    })

    return {
      total_engagements: Math.floor(totalEngagements),
      avg_engagement_rate: avgEngagementRate,
      estimated_reach: estimatedReach,
      total_likes: Math.floor(totalLikes),
      total_comments: Math.floor(totalComments),
      total_views: Math.floor(totalViews)
    }

  } catch (error) {
    console.error('❌ Error extracting analytics from Modash data:', error)
    return null
  }
}

/**
 * Update analytics for all influencers that have Modash data
 */
export async function updateAllInfluencerAnalytics(): Promise<{ success: number, failed: number }> {
  try {
    // Get all influencers with Modash data
    const result = await query(`
      SELECT id, display_name, notes 
      FROM influencers 
      WHERE notes IS NOT NULL 
      AND notes::text LIKE '%modash_data%'
    `)

    let success = 0
    let failed = 0

    for (const influencer of result) {
      const updated = await updateInfluencerAnalyticsFromModash(influencer.id)
      if (updated) {
        success++
      } else {
        failed++
      }
    }

    console.log(`🎯 Analytics update completed: ${success} success, ${failed} failed`)
    return { success, failed }

  } catch (error) {
    console.error('❌ Error updating all influencer analytics:', error)
    return { success: 0, failed: 0 }
  }
}

/**
 * Calculate engagement rate from TikTok stats
 */
function calculateEngagementRate(stats: any): number {
  const playCount = stats.playCount || 0
  const likeCount = stats.diggCount || 0
  const commentCount = stats.commentCount || 0
  const shareCount = stats.shareCount || 0
  
  if (playCount === 0) return 0
  
  const totalEngagements = likeCount + commentCount + shareCount
  return totalEngagements / playCount
}

/**
 * Calculate engagement rate from YouTube video data
 */
function calculateYouTubeEngagementRate(video: any): number {
  const views = video.views || 0
  const likes = video.likes || 0
  const comments = video.comments || 0
  
  if (views === 0) return 0
  
  const totalEngagements = likes + comments
  return totalEngagements / views
}
