/**
 * Modash Cache Update Job
 * 
 * This job runs every 4 weeks to update expired cached profile data.
 * It can be triggered by:
 * 1. External cron job hitting /api/modash/update-cache
 * 2. Vercel Cron Jobs (if configured)
 * 3. Manual trigger by admin users
 */

import { updateExpiredProfiles, getCacheStats } from '../services/modash-cache'

export interface UpdateJobResult {
  success: boolean
  stats: {
    updated: number
    errors: number
    creditsUsed: number
    totalCached: number
    needingUpdate: number
  }
  startTime: Date
  endTime: Date
  duration: number
}

/**
 * Main cache update job function
 */
export async function runCacheUpdateJob(): Promise<UpdateJobResult> {
  const startTime = new Date()
  console.log(`🚀 Starting Modash cache update job at ${startTime.toISOString()}`)
  
  try {
    // Get current cache stats
    const preStats = await getCacheStats()
    console.log('📊 Pre-update stats:', preStats)
    
    // Update expired profiles
    const updateResult = await updateExpiredProfiles()
    console.log('✅ Update result:', updateResult)
    
    // Get updated stats
    const postStats = await getCacheStats()
    console.log('📊 Post-update stats:', postStats)
    
    const endTime = new Date()
    const duration = endTime.getTime() - startTime.getTime()
    
    const result: UpdateJobResult = {
      success: true,
      stats: {
        updated: updateResult.updated,
        errors: updateResult.errors,
        creditsUsed: updateResult.creditsUsed,
        totalCached: postStats.total_cached_profiles,
        needingUpdate: postStats.profiles_needing_update
      },
      startTime,
      endTime,
      duration
    }
    
    console.log(`🎉 Cache update job completed successfully in ${duration}ms`)
    console.log(`📈 Results: ${result.stats.updated} updated, ${result.stats.errors} errors, ${result.stats.creditsUsed} credits used`)
    
    return result
    
  } catch (error) {
    const endTime = new Date()
    const duration = endTime.getTime() - startTime.getTime()
    
    console.error('❌ Cache update job failed:', error)
    
    return {
      success: false,
      stats: {
        updated: 0,
        errors: 1,
        creditsUsed: 0,
        totalCached: 0,
        needingUpdate: 0
      },
      startTime,
      endTime,
      duration
    }
  }
}

/**
 * Cron job configuration for different platforms
 */
export const CRON_CONFIG = {
  // Every 4 weeks (28 days) at 2 AM UTC
  schedule: '0 2 * * 0', // Every Sunday at 2 AM (approximately every 4 weeks)
  
  // Alternative: More precise 4-week schedule
  // Could be configured as: '0 2 1,29 * *' (1st and 29th of each month)
  
  description: 'Update expired Modash profile cache data every 4 weeks',
  
  // Vercel Cron configuration
  vercel: {
    path: '/api/modash/update-cache',
    schedule: '0 2 * * 0' // Every Sunday at 2 AM UTC
  },
  
  // GitHub Actions configuration
  githubActions: {
    schedule: '0 2 * * 0', // Every Sunday at 2 AM UTC
    workflow: `
name: Update Modash Cache
on:
  schedule:
    - cron: '0 2 * * 0'  # Every Sunday at 2 AM UTC
  workflow_dispatch:  # Allow manual triggers

jobs:
  update-cache:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Cache Update
        run: |
          curl -X POST "https://yourdomain.com/api/modash/update-cache" \\
            -H "Authorization: Bearer \${{ secrets.MODASH_UPDATE_TOKEN }}" \\
            -H "Content-Type: application/json"
`
  }
}

/**
 * Manual trigger for testing or emergency updates
 */
export async function triggerManualUpdate(reason: string = 'manual'): Promise<UpdateJobResult> {
  console.log(`🔧 Manual cache update triggered: ${reason}`)
  return await runCacheUpdateJob()
}

/**
 * Get next scheduled update time
 */
export function getNextUpdateTime(): Date {
  const now = new Date()
  const nextSunday = new Date(now)
  
  // Get next Sunday at 2 AM UTC
  const daysUntilSunday = (7 - now.getUTCDay()) % 7
  nextSunday.setUTCDate(now.getUTCDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday))
  nextSunday.setUTCHours(2, 0, 0, 0)
  
  return nextSunday
}

/**
 * Check if profiles need urgent updating (beyond 5 weeks)
 */
export async function checkUrgentUpdates(): Promise<boolean> {
  const stats = await getCacheStats()
  return stats.profiles_needing_update > 0
} 
