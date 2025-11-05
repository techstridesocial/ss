/**
 * Influencer Stats Aggregator
 * 
 * Aggregates platform stats and updates the influencers table.
 * This ensures total_followers, total_engagement_rate, and total_avg_views 
 * are always up-to-date when platform stats change.
 */

import { query } from '@/lib/db/connection'

/**
 * Aggregate platform stats and update influencers table
 * This ensures total_followers, total_engagement_rate, and total_avg_views are always up-to-date
 * 
 * @param influencerId - The influencer ID to aggregate stats for
 */
export async function updateInfluencerAggregatedStats(influencerId: string): Promise<void> {
  try {
    console.log(`📊 Aggregating stats for influencer ${influencerId}...`)
    
    // Get all platform stats for this influencer
    const platformStats = await query(`
      SELECT 
        followers,
        engagement_rate,
        avg_views
      FROM influencer_platforms
      WHERE influencer_id = $1
        AND followers IS NOT NULL
        AND followers > 0
    `, [influencerId])
    
    if (platformStats.length === 0) {
      console.log(`⚠️ No platform stats found for influencer ${influencerId}, setting totals to 0`)
      // If no platforms have stats, set totals to 0
      await query(`
        UPDATE influencers
        SET 
          total_followers = 0,
          total_engagement_rate = 0,
          total_avg_views = 0,
          updated_at = NOW()
        WHERE id = $1
      `, [influencerId])
      return
    }
    
    // Calculate aggregated stats
    // Total followers: SUM of all platforms
    const totalFollowers = platformStats.reduce((sum, platform) => {
      return sum + (Number(platform.followers) || 0)
    }, 0)
    
    // Average engagement rate: Weighted average across all platforms (weighted by followers)
    let totalWeightedEngagement = 0
    let totalWeight = 0
    platformStats.forEach(platform => {
      const followers = Number(platform.followers) || 0
      const engagementRate = Number(platform.engagement_rate) || 0
      if (followers > 0 && engagementRate > 0) {
        totalWeightedEngagement += engagementRate * followers
        totalWeight += followers
      }
    })
    const totalEngagementRate = totalWeight > 0 ? totalWeightedEngagement / totalWeight : 0
    
    // Average views: Simple average across all platforms
    const avgViewsArray = platformStats
      .map(platform => Number(platform.avg_views) || 0)
      .filter(views => views > 0)
    const totalAvgViews = avgViewsArray.length > 0
      ? avgViewsArray.reduce((sum, views) => sum + views, 0) / avgViewsArray.length
      : 0
    
    console.log(`✅ Calculated aggregated stats:`, {
      totalFollowers,
      totalEngagementRate: (totalEngagementRate * 100).toFixed(2) + '%',
      totalAvgViews: Math.round(totalAvgViews)
    })
    
    // Update influencers table with aggregated stats
    await query(`
      UPDATE influencers
      SET 
        total_followers = $1,
        total_engagement_rate = $2,
        total_avg_views = $3,
        updated_at = NOW()
      WHERE id = $4
    `, [totalFollowers, totalEngagementRate, totalAvgViews, influencerId])
    
    console.log(`✅ Updated aggregated stats for influencer ${influencerId}`)
  } catch (error) {
    console.error(`❌ Error updating aggregated stats for influencer ${influencerId}:`, error)
    // Don't throw - this is a background update, shouldn't fail the main operation
  }
}

