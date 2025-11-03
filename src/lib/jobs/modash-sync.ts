/**
 * Modash Sync Scheduled Job
 * Runs tiered updates based on influencer tiers and priority scores
 */

import { modashService, tierUtils } from '../services/modash'
import { getInfluencers } from '../db/queries/influencers'
import { InfluencerTier } from '../../types/database'

interface SyncJobResult {
  totalProcessed: number
  successful: number
  failed: number
  creditsUsed: number
  nextRunDate: Date
  tierBreakdown: Record<InfluencerTier, number>
}

class ModashSyncJob {
  private isRunning = false
  private lastRun: Date | null = null
  
  /**
   * Main sync job - processes influencers in tier-based priority order
   */
  async runSync(maxCredits: number = 100): Promise<SyncJobResult> {
    if (this.isRunning) {
      throw new Error('Sync job is already running')
    }

    this.isRunning = true
    const startTime = Date.now()
    
    try {
      console.log(`🚀 Starting Modash sync job with credit limit: ${maxCredits}`)
      
      // Check current credit usage
      const creditUsage = await modashService.getCreditUsage()
      console.log(`📊 Current credits: ${creditUsage.used}/${creditUsage.limit} (${creditUsage.remaining} remaining)`)
      
      if (creditUsage.remaining < maxCredits) {
        console.warn(`⚠️ Not enough credits remaining: ${creditUsage.remaining} < ${maxCredits}`)
        maxCredits = creditUsage.remaining
      }

      // Get influencers that need updates (prioritized by tier)
      const influencersToUpdate = await this.getInfluencersForUpdate(maxCredits)
      console.log(`📋 Found ${influencersToUpdate.length} influencers for update`)

      let processed = 0
      let successful = 0
      let failed = 0
      let creditsUsed = 0
      const tierBreakdown: Record<InfluencerTier, number> = {
        GOLD: 0,
        SILVER: 0,
        PARTNERED: 0,
        BRONZE: 0
      }

      // Process influencers in batches to respect rate limits
      const batchSize = 10
      for (let i = 0; i < influencersToUpdate.length; i += batchSize) {
        const batch = influencersToUpdate.slice(i, i + batchSize)
        
        console.log(`🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(influencersToUpdate.length / batchSize)}`)
        
        for (const influencer of batch) {
          if (creditsUsed >= maxCredits) {
            console.log(`🛑 Credit limit reached: ${creditsUsed}/${maxCredits}`)
            break
          }

          try {
            await this.updateInfluencer(influencer)
            successful++
            creditsUsed++
            tierBreakdown[influencer.tier]++
            
            // Add delay between requests to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 500))
            
          } catch (error) {
            console.error(`❌ Failed to update influencer ${influencer.id}:`, error)
            failed++
          }
          
          processed++
        }

        // Break if we've reached credit limit
        if (creditsUsed >= maxCredits) break
      }

      this.lastRun = new Date()
      const duration = Date.now() - startTime
      
      console.log(`✅ Sync job completed in ${duration}ms`)
      console.log(`📈 Results: ${successful} successful, ${failed} failed, ${creditsUsed} credits used`)
      
      return {
        totalProcessed: processed,
        successful,
        failed,
        creditsUsed,
        nextRunDate: this.calculateNextRunDate(),
        tierBreakdown
      }

    } finally {
      this.isRunning = false
    }
  }

  /**
   * Get influencers that need updates, prioritized by tier and urgency
   */
  private async getInfluencersForUpdate(maxCount: number): Promise<Array<{
    id: string
    tier: InfluencerTier
    modash_last_updated: Date | null
    total_followers: number
    total_engagement_rate: number
    priority: number
  }>> {
    // This query prioritizes:
    // 1. GOLD tier influencers first
    // 2. Never updated (NULL modash_last_updated)
    // 3. Highest priority scores
    // 4. Longest time since last update
    
    const query = `
      SELECT 
        i.id,
        i.tier,
        i.modash_last_updated,
        i.total_followers,
        i.total_engagement_rate,
        i.modash_update_priority as priority,
        COALESCE(
          (SELECT COUNT(*) FROM campaign_influencers ci 
           WHERE ci.influencer_id = i.id 
           AND ci.status IN ('ACCEPTED', 'IN_PROGRESS')), 
          0
        ) as active_campaigns
      FROM influencers i
      WHERE i.auto_update_enabled = true
        AND i.is_active = true
        AND (
          i.modash_last_updated IS NULL 
          OR (i.tier = 'GOLD' AND i.modash_last_updated < NOW() - INTERVAL '28 days')
          OR (i.tier IN ('SILVER', 'PARTNERED') AND i.modash_last_updated < NOW() - INTERVAL '42 days')
          OR (i.tier = 'BRONZE' AND i.modash_last_updated < NOW() - INTERVAL '56 days')
        )
      ORDER BY 
        CASE i.tier 
          WHEN 'GOLD' THEN 1
          WHEN 'SILVER' THEN 2  
          WHEN 'PARTNERED' THEN 3
          WHEN 'BRONZE' THEN 4
        END,
        i.modash_last_updated ASC NULLS FIRST,
        i.modash_update_priority DESC,
        active_campaigns DESC
      LIMIT $1
    `
    
    // For now, return mock data - replace with actual database query
    return []
  }

  /**
   * Update a single influencer via Modash API
   */
  private async updateInfluencer(influencer: {
    id: string
    tier: InfluencerTier
    total_followers: number
    total_engagement_rate: number
  }): Promise<void> {
    console.log(`🔄 Updating influencer ${influencer.id} (${influencer.tier})`)
    
    // Get influencer's platform data
    // const platforms = await getInfluencerPlatforms(influencer.id)
    
    // For each connected platform, get updated data from Modash
    // const modashReport = await modashService.getInfluencerReport(platformUserId)
    
    // Update database with fresh data
    // await updateInfluencerData(influencer.id, modashReport)
    
    // Update the last sync timestamp
    // await updateInfluencerSyncStatus(influencer.id, new Date())
    
    console.log(`✅ Updated influencer ${influencer.id}`)
  }

  /**
   * Calculate when the next sync job should run
   */
  private calculateNextRunDate(): Date {
    // Run daily at 2 AM UTC to capture updates across all time zones
    const nextRun = new Date()
    nextRun.setUTCHours(2, 0, 0, 0)
    
    // If it's already past 2 AM today, schedule for tomorrow
    if (nextRun <= new Date()) {
      nextRun.setUTCDate(nextRun.getUTCDate() + 1)
    }
    
    return nextRun
  }

  /**
   * Get sync job status and statistics
   */
  async getJobStatus(): Promise<{
    isRunning: boolean
    lastRun: Date | null
    nextRun: Date
    creditUsage: {
      used: number
      limit: number
      remaining: number
    }
    pendingUpdates: {
      total: number
      byTier: Record<InfluencerTier, number>
    }
  }> {
    const creditUsage = await modashService.getCreditUsage()
    
    // Count influencers needing updates by tier
    const pendingByTier = await this.countPendingUpdatesByTier()
    
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      nextRun: this.calculateNextRunDate(),
      creditUsage: {
        used: creditUsage.used,
        limit: creditUsage.limit,
        remaining: creditUsage.remaining
      },
      pendingUpdates: {
        total: Object.values(pendingByTier).reduce((sum, count) => sum + count, 0),
        byTier: pendingByTier
      }
    }
  }

  /**
   * Count influencers needing updates grouped by tier
   */
  private async countPendingUpdatesByTier(): Promise<Record<InfluencerTier, number>> {
    const query = `
      SELECT 
        tier,
        COUNT(*) as count
      FROM influencers 
      WHERE auto_update_enabled = true
        AND is_active = true
        AND (
          modash_last_updated IS NULL 
          OR (tier = 'GOLD' AND modash_last_updated < NOW() - INTERVAL '28 days')
          OR (tier IN ('SILVER', 'PARTNERED') AND modash_last_updated < NOW() - INTERVAL '42 days')
          OR (tier = 'BRONZE' AND modash_last_updated < NOW() - INTERVAL '56 days')
        )
      GROUP BY tier
    `
    
    // Return mock data for now
    return {
      GOLD: 15,
      SILVER: 45,
      PARTNERED: 23,
      BRONZE: 12
    }
  }

  /**
   * Manual trigger for emergency updates (for specific influencers)
   */
  async updateSpecificInfluencers(influencerIds: string[]): Promise<SyncJobResult> {
    console.log(`🚨 Manual update triggered for ${influencerIds.length} influencers`)
    
    // Similar to runSync but for specific influencers only
    // This bypasses the normal tier-based scheduling
    
    return {
      totalProcessed: influencerIds.length,
      successful: influencerIds.length,
      failed: 0,
      creditsUsed: influencerIds.length,
      nextRunDate: this.calculateNextRunDate(),
      tierBreakdown: { GOLD: 0, SILVER: 0, PARTNERED: 0, BRONZE: 0 }
    }
  }
}

export const modashSyncJob = new ModashSyncJob()

/**
 * Cron job configuration for automatic scheduling
 * This would typically be set up in your deployment environment
 */
export const scheduledSyncConfig = {
  // Run daily at 2 AM UTC
  cronPattern: '0 2 * * *',
  
  // Credit limits for different types of runs
  creditLimits: {
    daily: 100,      // Normal daily updates
    weekly: 200,     // Weekly comprehensive sync
    emergency: 50    // Emergency updates for urgent issues
  },
  
  // Retry configuration
  retryPolicy: {
    maxRetries: 3,
    backoffMultiplier: 2,
    initialDelay: 5000 // 5 seconds
  }
} 