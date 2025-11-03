// Social Accounts Cache Service
// Handles caching and syncing of influencer social media data

import { query, queryOne } from '@/lib/db/connection'
import { modashService } from './modash'

interface SocialAccount {
  id: string
  influencer_id: string
  platform: string
  username: string
  profile_url?: string
  followers: number
  engagement_rate: number
  avg_views: number
  is_connected: boolean
  last_synced?: Date
  created_at: Date
  updated_at: Date
}

interface CacheStats {
  totalAccounts: number
  connectedAccounts: number
  accountsNeedingUpdate: number
  lastSyncTime?: Date
}

export class SocialAccountsCache {
  private readonly CACHE_DURATION_HOURS = 24 * 30 // 30 days (monthly)
  private readonly MAX_DAILY_UPDATES = 50

  /**
   * Get all social accounts for an influencer (from cache)
   */
  async getInfluencerAccounts(influencerId: string): Promise<SocialAccount[]> {
    try {
      const accounts = await query(`
        SELECT * FROM influencer_platforms
        WHERE influencer_id = $1
        ORDER BY platform
      `, [influencerId])

      return accounts
    } catch (error) {
      console.error('Error fetching influencer accounts:', error)
      throw error
    }
  }

  /**
   * Get accounts that need updating (haven't been synced in 30 days)
   */
  async getAccountsNeedingUpdate(limit: number = 50): Promise<SocialAccount[]> {
    try {
      const accounts = await query(`
        SELECT * FROM influencer_platforms
        WHERE is_connected = true
          AND (last_synced IS NULL OR last_synced < NOW() - INTERVAL '${this.CACHE_DURATION_HOURS} hours')
        ORDER BY last_synced ASC NULLS FIRST
        LIMIT $1
      `, [limit])

      return accounts
    } catch (error) {
      console.error('Error fetching accounts needing update:', error)
      throw error
    }
  }

  /**
   * Update a single social account with fresh data from Modash
   */
  async updateAccount(accountId: string): Promise<SocialAccount | null> {
    try {
      // Get the account details
      const account = await queryOne(`
        SELECT * FROM influencer_platforms WHERE id = $1
      `, [accountId])

      if (!account) {
        throw new Error('Account not found')
      }

      // Fetch fresh data from Modash API
      const freshData = await this.fetchFreshData(account.username, account.platform)
      
      if (!freshData) {
        console.warn(`No fresh data available for ${account.username} on ${account.platform}`)
        return account
      }

      // Update the account with fresh data
      const updatedAccount = await queryOne(`
        UPDATE influencer_platforms
        SET 
          followers = $2,
          engagement_rate = $3,
          avg_views = $4,
          profile_url = $5,
          last_synced = NOW()
        WHERE id = $1
        RETURNING *
      `, [
        accountId,
        freshData.followers,
        freshData.engagementRate,
        freshData.avgViews,
        freshData.profileUrl
      ])

      console.log(`✅ Updated ${account.username} on ${account.platform}`)
      return updatedAccount

    } catch (error) {
      console.error(`Error updating account ${accountId}:`, error)
      throw error
    }
  }

  /**
   * Batch update multiple accounts
   */
  async batchUpdateAccounts(accountIds: string[]): Promise<{
    updated: number
    failed: number
    errors: string[]
  }> {
    const results = {
      updated: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (const accountId of accountIds) {
      try {
        await this.updateAccount(accountId)
        results.updated++
        
        // Add delay between requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        results.failed++
        results.errors.push(`Account ${accountId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        console.error(`Failed to update account ${accountId}:`, error)
      }
    }

    return results
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<CacheStats> {
    try {
      const stats = await queryOne(`
        SELECT 
          COUNT(*) as total_accounts,
          COUNT(CASE WHEN is_connected THEN 1 END) as connected_accounts,
          COUNT(CASE WHEN is_connected AND (last_synced IS NULL OR last_synced < NOW() - INTERVAL '${this.CACHE_DURATION_HOURS} hours') THEN 1 END) as accounts_needing_update,
          MAX(last_synced) as last_sync_time
        FROM influencer_platforms
      `)

      return {
        totalAccounts: parseInt(stats.total_accounts) || 0,
        connectedAccounts: parseInt(stats.connected_accounts) || 0,
        accountsNeedingUpdate: parseInt(stats.accounts_needing_update) || 0,
        lastSyncTime: stats.last_sync_time ? new Date(stats.last_sync_time) : undefined
      }
    } catch (error) {
      console.error('Error fetching cache stats:', error)
      throw error
    }
  }

  /**
   * Run monthly sync job
   */
  async runMonthlySync(): Promise<{
    processed: number
    updated: number
    failed: number
    creditsUsed: number
  }> {
    console.log('🚀 Starting monthly social accounts sync')
    
    try {
      // Get accounts that need updating
      const accountsToUpdate = await this.getAccountsNeedingUpdate(this.MAX_DAILY_UPDATES)
      console.log(`📋 Found ${accountsToUpdate.length} accounts needing updates`)

      if (accountsToUpdate.length === 0) {
        console.log('✅ No accounts need updating')
        return { processed: 0, updated: 0, failed: 0, creditsUsed: 0 }
      }

      const accountIds = accountsToUpdate.map(account => account.id)
      const results = await this.batchUpdateAccounts(accountIds)

      console.log(`✅ Monthly sync completed: ${results.updated} updated, ${results.failed} failed`)
      
      return {
        processed: accountsToUpdate.length,
        updated: results.updated,
        failed: results.failed,
        creditsUsed: results.updated // Each update uses 1 credit
      }

    } catch (error) {
      console.error('Error in monthly sync:', error)
      throw error
    }
  }

  /**
   * Fetch fresh data from Modash API
   */
  private async fetchFreshData(handle: string, platform: string): Promise<any | null> {
    try {
      // Use the appropriate Modash API based on platform
      const profileData = await modashService.getProfile(handle, platform)
      
      if (!profileData) {
        return null
      }

      // Extract and format the data
      return {
        followers: profileData.followers || 0,
        engagementRate: profileData.engagementRate || 0,
        avgViews: profileData.avgViews || 0,
        profileUrl: profileData.url || null
      }

    } catch (error) {
      console.error(`Error fetching fresh data for ${handle} on ${platform}:`, error)
      return null
    }
  }

  /**
   * Check if account data is fresh (less than 30 days old)
   */
  isDataFresh(lastSync: Date | null): boolean {
    if (!lastSync) return false
    
    const now = new Date()
    const hoursSinceSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60)
    
    return hoursSinceSync < this.CACHE_DURATION_HOURS
  }

  /**
   * Get accounts by platform
   */
  async getAccountsByPlatform(_platform: string): Promise<SocialAccount[]> {
    try {
      const accounts = await query(`
        SELECT * FROM influencer_platforms
        WHERE platform = $1 AND is_connected = true
        ORDER BY last_synced ASC NULLS FIRST
      `, [platform])

      return accounts
    } catch (error) {
      console.error(`Error fetching ${platform} accounts:`, error)
      throw error
    }
  }

  /**
   * Disconnect an account
   */
  async disconnectAccount(accountId: string): Promise<boolean> {
    try {
      const result = await queryOne(`
        UPDATE influencer_platforms
        SET is_connected = false, updated_at = NOW()
        WHERE id = $1
        RETURNING id
      `, [accountId])

      return !!result
    } catch (error) {
      console.error(`Error disconnecting account ${accountId}:`, error)
      throw error
    }
  }

  /**
   * Reconnect an account
   */
  async reconnectAccount(accountId: string): Promise<boolean> {
    try {
      const result = await queryOne(`
        UPDATE influencer_platforms
        SET is_connected = true, updated_at = NOW()
        WHERE id = $1
        RETURNING id
      `, [accountId])

      return !!result
    } catch (error) {
      console.error(`Error reconnecting account ${accountId}:`, error)
      throw error
    }
  }
}

// Export singleton instance
export const socialAccountsCache = new SocialAccountsCache()
