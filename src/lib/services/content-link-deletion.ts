// content-link-deletion.ts - Comprehensive Content Link Deletion Service

import { query } from '../db/connection'

interface ContentLinkDeletionResult {
  success: boolean
  deletedFrom: string[]
  errors: string[]
  analyticsReset: boolean
}

/**
 * Comprehensive content link deletion service
 * Removes content links from ALL database tables when deleted from frontend
 */
export class ContentLinkDeletionService {
  
  /**
   * Delete a specific content link from all tables
   */
  static async deleteContentLink(
    contentLink: string,
    influencerId: string,
    campaignId?: string
  ): Promise<ContentLinkDeletionResult> {
    console.log(`🗑️ Deleting content link: ${contentLink}`)
    console.log(`👤 Influencer ID: ${influencerId}`)
    console.log(`📋 Campaign ID: ${campaignId || 'N/A'}`)
    
    const result: ContentLinkDeletionResult = {
      success: true,
      deletedFrom: [],
      errors: [],
      analyticsReset: false
    }

    try {
      // 1. Remove from campaign_influencers.content_links (JSONB array)
      await this.removeFromCampaignInfluencers(contentLink, influencerId, campaignId, result)
      
      // 2. Remove from campaign_content_submissions.content_url
      await this.removeFromCampaignContentSubmissions(contentLink, influencerId, campaignId, result)
      
      // 3. Remove from influencer_content.post_url
      await this.removeFromInfluencerContent(contentLink, influencerId, result)
      
      // 4. Reset analytics if this was the last content link for the influencer
      await this.resetAnalyticsIfNeeded(influencerId, result)
      
      console.log(`✅ Content link deletion completed:`, result)
      return result
      
    } catch (_error) {
      console.error(`❌ Error deleting content link:`, error)
      result.success = false
      result.errors.push(error instanceof Error ? error.message : 'Unknown error')
      return result
    }
  }

  /**
   * Remove content link from campaign_influencers.content_links JSONB array
   */
  private static async removeFromCampaignInfluencers(
    contentLink: string,
    influencerId: string,
    campaignId: string | undefined,
    result: ContentLinkDeletionResult
  ): Promise<void> {
    try {
      let whereClause = 'ci.influencer_id = $1'
      const params: any[] = [influencerId]
      
      if (campaignId) {
        whereClause += ' AND ci.campaign_id = $2'
        params.push(campaignId)
      }

      // Find campaign influencers with this content link
      const campaignInfluencers = await query(`
        SELECT ci.id, ci.content_links
        FROM campaign_influencers ci
        WHERE ${whereClause}
      `, params)

      for (const ci of campaignInfluencers) {
        if (ci.content_links && Array.isArray(ci.content_links)) {
          const updatedLinks = ci.content_links.filter((link: string) => link !== contentLink)
          
          await query(`
            UPDATE campaign_influencers 
            SET 
              content_links = $1::jsonb,
              updated_at = NOW()
            WHERE id = $2
          `, [JSON.stringify(updatedLinks), ci.id])
          
          console.log(`✅ Removed from campaign_influencers: ${ci.id}`)
          result.deletedFrom.push('campaign_influencers')
        }
      }
    } catch (_error) {
      console.error(`❌ Error removing from campaign_influencers:`, error)
      result.errors.push(`campaign_influencers: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Remove content link from campaign_content_submissions.content_url
   */
  private static async removeFromCampaignContentSubmissions(
    contentLink: string,
    influencerId: string,
    campaignId: string | undefined,
    result: ContentLinkDeletionResult
  ): Promise<void> {
    try {
      let whereClause = 'ci.influencer_id = $1 AND ccs.content_url = $2'
      const params: any[] = [influencerId, contentLink]
      
      if (campaignId) {
        whereClause += ' AND ci.campaign_id = $3'
        params.push(campaignId)
      }

      const deletedCount = await query(`
        UPDATE campaign_content_submissions 
        SET 
          content_url = '',
          updated_at = NOW()
        FROM campaign_influencers ci
        WHERE ccs.campaign_influencer_id = ci.id 
          AND ${whereClause}
      `, params)

      if (deletedCount.length > 0) {
        console.log(`✅ Removed from campaign_content_submissions`)
        result.deletedFrom.push('campaign_content_submissions')
      }
    } catch (_error) {
      console.error(`❌ Error removing from campaign_content_submissions:`, error)
      result.errors.push(`campaign_content_submissions: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Remove content link from influencer_content.post_url
   */
  private static async removeFromInfluencerContent(
    contentLink: string,
    influencerId: string,
    result: ContentLinkDeletionResult
  ): Promise<void> {
    try {
      const deletedCount = await query(`
        UPDATE influencer_content 
        SET 
          post_url = '',
          updated_at = NOW()
        FROM influencer_platforms ip
        WHERE ic.influencer_platform_id = ip.id 
          AND ip.influencer_id = $1 
          AND ic.post_url = $2
      `, [influencerId, contentLink])

      if (deletedCount.length > 0) {
        console.log(`✅ Removed from influencer_content`)
        result.deletedFrom.push('influencer_content')
      }
    } catch (_error) {
      console.error(`❌ Error removing from influencer_content:`, error)
      result.errors.push(`influencer_content: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Reset analytics if this was the last content link for the influencer
   */
  private static async resetAnalyticsIfNeeded(
    influencerId: string,
    result: ContentLinkDeletionResult
  ): Promise<void> {
    try {
      // Check if influencer has any remaining content links
      const remainingLinks = await query(`
        SELECT COUNT(*) as count
        FROM (
          SELECT 1 FROM campaign_influencers ci 
          WHERE ci.influencer_id = $1 
            AND ci.content_links IS NOT NULL 
            AND ci.content_links != '[]'::jsonb 
            AND jsonb_array_length(ci.content_links) > 0
          
          UNION ALL
          
          SELECT 1 FROM campaign_content_submissions ccs
          JOIN campaign_influencers ci ON ccs.campaign_influencer_id = ci.id
          WHERE ci.influencer_id = $1 AND ccs.content_url != ''
          
          UNION ALL
          
          SELECT 1 FROM influencer_content ic
          JOIN influencer_platforms ip ON ic.influencer_platform_id = ip.id
          WHERE ip.influencer_id = $1 AND ic.post_url != ''
        ) remaining
      `, [influencerId])

      const totalRemaining = parseInt(remainingLinks[0]?.count || '0')
      
      if (totalRemaining === 0) {
        console.log(`🔄 No remaining content links - resetting analytics for influencer ${influencerId}`)
        
        await query(`
          UPDATE influencers 
          SET 
            total_engagements = 0,
            total_engagement_rate = 0,
            avg_engagement_rate = 0,
            estimated_reach = 0,
            total_likes = 0,
            total_comments = 0,
            total_views = 0,
            analytics_updated_at = NOW()
          WHERE id = $1
        `, [influencerId])
        
        result.analyticsReset = true
        console.log(`✅ Analytics reset for influencer ${influencerId}`)
      } else {
        console.log(`ℹ️ Influencer ${influencerId} still has ${totalRemaining} content links - analytics not reset`)
      }
    } catch (_error) {
      console.error(`❌ Error checking/resetting analytics:`, error)
      result.errors.push(`analytics: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Delete all content links for a specific influencer
   */
  static async deleteAllContentLinksForInfluencer(
    influencerId: string,
    campaignId?: string
  ): Promise<ContentLinkDeletionResult> {
    console.log(`🗑️ Deleting ALL content links for influencer: ${influencerId}`)
    
    const result: ContentLinkDeletionResult = {
      success: true,
      deletedFrom: [],
      errors: [],
      analyticsReset: false
    }

    try {
      // Clear all content links from campaign_influencers
      await this.clearCampaignInfluencersContentLinks(influencerId, campaignId, result)
      
      // Clear all content URLs from campaign_content_submissions
      await this.clearCampaignContentSubmissions(influencerId, campaignId, result)
      
      // Clear all post URLs from influencer_content
      await this.clearInfluencerContent(influencerId, result)
      
      // Always reset analytics when clearing all content links
      await this.resetInfluencerAnalytics(influencerId, result)
      
      console.log(`✅ All content links deletion completed:`, result)
      return result
      
    } catch (_error) {
      console.error(`❌ Error deleting all content links:`, error)
      result.success = false
      result.errors.push(error instanceof Error ? error.message : 'Unknown error')
      return result
    }
  }

  /**
   * Clear all content links from campaign_influencers
   */
  private static async clearCampaignInfluencersContentLinks(
    influencerId: string,
    campaignId: string | undefined,
    result: ContentLinkDeletionResult
  ): Promise<void> {
    try {
      let whereClause = 'influencer_id = $1'
      const params: any[] = [influencerId]
      
      if (campaignId) {
        whereClause += ' AND campaign_id = $2'
        params.push(campaignId)
      }

      await query(`
        UPDATE campaign_influencers 
        SET 
          content_links = '[]'::jsonb,
          discount_code = NULL,
          updated_at = NOW()
        WHERE ${whereClause}
      `, params)
      
      console.log(`✅ Cleared campaign_influencers content links`)
      result.deletedFrom.push('campaign_influencers')
    } catch (_error) {
      console.error(`❌ Error clearing campaign_influencers:`, error)
      result.errors.push(`campaign_influencers: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Clear all content URLs from campaign_content_submissions
   */
  private static async clearCampaignContentSubmissions(
    influencerId: string,
    campaignId: string | undefined,
    result: ContentLinkDeletionResult
  ): Promise<void> {
    try {
      let whereClause = 'ci.influencer_id = $1'
      const params: any[] = [influencerId]
      
      if (campaignId) {
        whereClause += ' AND ci.campaign_id = $2'
        params.push(campaignId)
      }

      await query(`
        UPDATE campaign_content_submissions 
        SET 
          content_url = '',
          updated_at = NOW()
        FROM campaign_influencers ci
        WHERE ccs.campaign_influencer_id = ci.id 
          AND ${whereClause}
      `, params)
      
      console.log(`✅ Cleared campaign_content_submissions content URLs`)
      result.deletedFrom.push('campaign_content_submissions')
    } catch (_error) {
      console.error(`❌ Error clearing campaign_content_submissions:`, error)
      result.errors.push(`campaign_content_submissions: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Clear all post URLs from influencer_content
   */
  private static async clearInfluencerContent(
    influencerId: string,
    result: ContentLinkDeletionResult
  ): Promise<void> {
    try {
      await query(`
        UPDATE influencer_content 
        SET 
          post_url = '',
          updated_at = NOW()
        FROM influencer_platforms ip
        WHERE ic.influencer_platform_id = ip.id 
          AND ip.influencer_id = $1
      `, [influencerId])
      
      console.log(`✅ Cleared influencer_content post URLs`)
      result.deletedFrom.push('influencer_content')
    } catch (_error) {
      console.error(`❌ Error clearing influencer_content:`, error)
      result.errors.push(`influencer_content: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Reset influencer analytics
   */
  private static async resetInfluencerAnalytics(
    influencerId: string,
    result: ContentLinkDeletionResult
  ): Promise<void> {
    try {
      await query(`
        UPDATE influencers 
        SET 
          total_engagements = 0,
          total_engagement_rate = 0,
          avg_engagement_rate = 0,
          estimated_reach = 0,
          total_likes = 0,
          total_comments = 0,
          total_views = 0,
          analytics_updated_at = NOW()
        WHERE id = $1
      `, [influencerId])
      
      result.analyticsReset = true
      console.log(`✅ Reset analytics for influencer ${influencerId}`)
    } catch (_error) {
      console.error(`❌ Error resetting analytics:`, error)
      result.errors.push(`analytics: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get content link statistics for an influencer
   */
  static async getContentLinkStats(influencerId: string): Promise<{
    campaignInfluencers: number
    campaignContentSubmissions: number
    influencerContent: number
    total: number
  }> {
    try {
      const [ciCount, ccsCount, icCount] = await Promise.all([
        query(`
          SELECT COUNT(*) as count
          FROM campaign_influencers 
          WHERE influencer_id = $1 
            AND content_links IS NOT NULL 
            AND content_links != '[]'::jsonb 
            AND jsonb_array_length(content_links) > 0
        `, [influencerId]),
        
        query(`
          SELECT COUNT(*) as count
          FROM campaign_content_submissions ccs
          JOIN campaign_influencers ci ON ccs.campaign_influencer_id = ci.id
          WHERE ci.influencer_id = $1 AND ccs.content_url != ''
        `, [influencerId]),
        
        query(`
          SELECT COUNT(*) as count
          FROM influencer_content ic
          JOIN influencer_platforms ip ON ic.influencer_platform_id = ip.id
          WHERE ip.influencer_id = $1 AND ic.post_url != ''
        `, [influencerId])
      ])

      const campaignInfluencers = parseInt(ciCount[0]?.count || '0')
      const campaignContentSubmissions = parseInt(ccsCount[0]?.count || '0')
      const influencerContent = parseInt(icCount[0]?.count || '0')
      const total = campaignInfluencers + campaignContentSubmissions + influencerContent

      return {
        campaignInfluencers,
        campaignContentSubmissions,
        influencerContent,
        total
      }
    } catch (_error) {
      console.error(`❌ Error getting content link stats:`, error)
      return {
        campaignInfluencers: 0,
        campaignContentSubmissions: 0,
        influencerContent: 0,
        total: 0
      }
    }
  }
}

// Export convenience functions
export const deleteContentLink = ContentLinkDeletionService.deleteContentLink
export const deleteAllContentLinksForInfluencer = ContentLinkDeletionService.deleteAllContentLinksForInfluencer
export const getContentLinkStats = ContentLinkDeletionService.getContentLinkStats
