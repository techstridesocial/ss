import { query } from '../connection'
import { CampaignInfluencer, ParticipationStatus } from '@/types'

export interface CampaignInfluencerWithDetails {
  id: string
  campaignId: string
  influencerId: string
  status: ParticipationStatus
  appliedAt?: Date
  acceptedAt?: Date
  declinedAt?: Date
  contentSubmittedAt?: Date
  paidAt?: Date
  notes?: string
  rate?: number
  deadline?: Date
  productShipped?: boolean
  contentPosted?: boolean
  paymentReleased?: boolean
  createdAt: Date
  updatedAt: Date
  influencer: {
    id: string
    display_name: string
    niche_primary: string
    total_followers: number
    total_engagement_rate: number
    profile_image_url?: string
  }
  campaign: {
    id: string
    name: string
    brand: string
    status: string
  }
}

export interface CampaignInvitationData {
  campaignId: string
  influencerId: string
  email: string
  rate?: number
  deadline?: Date
  notes?: string
}

/**
 * Get all influencers for a specific campaign with detailed information
 */
export async function getCampaignInfluencersWithDetails(campaignId: string): Promise<CampaignInfluencerWithDetails[]> {
  try {
    const _result = await query(`
      SELECT 
        ci.*,
        ci.content_links,
        ci.discount_code,
        i.display_name,
        i.niche_primary,
        i.total_followers,
        i.total_engagement_rate,
        i.total_engagements,
        i.avg_engagement_rate,
        i.estimated_reach,
        i.total_likes,
        i.total_comments,
        i.total_views,
        i.analytics_updated_at,
        i.notes as influencer_notes,
        up.avatar_url as profile_image_url,
        c.name as campaign_name,
        c.brand as campaign_brand,
        c.status as campaign_status
      FROM campaign_influencers ci
      JOIN influencers i ON ci.influencer_id = i.id
      LEFT JOIN user_profiles up ON i.user_id = up.user_id
      JOIN campaigns c ON ci.campaign_id = c.id
      WHERE ci.campaign_id = $1
      ORDER BY ci.created_at DESC
    `, [campaignId])

    return result.map(row => {
      // Debug: Log the raw database row for analytics and content links
      console.log(`🔍 [DB DEBUG] Raw data for influencer ${row.influencer_id}:`, {
        content_links: row.content_links,
        discount_code: row.discount_code,
        total_engagements: row.total_engagements,
        avg_engagement_rate: row.avg_engagement_rate,
        estimated_reach: row.estimated_reach,
        total_likes: row.total_likes,
        total_comments: row.total_comments,
        total_views: row.total_views,
        analytics_updated_at: row.analytics_updated_at
      })
      
      return {
        id: row.id,
        campaignId: row.campaign_id,
        influencerId: row.influencer_id,
        status: row.status as ParticipationStatus,
        appliedAt: row.applied_at ? new Date(row.applied_at) : undefined,
        acceptedAt: row.accepted_at ? new Date(row.accepted_at) : undefined,
        declinedAt: row.declined_at ? new Date(row.declined_at) : undefined,
        contentSubmittedAt: row.content_submitted_at ? new Date(row.content_submitted_at) : undefined,
        contentLinks: (() => {
          console.log(`🔍 [CONTENT LINKS DEBUG] Processing content_links for campaign influencer ${row.id}:`, {
            rawValue: row.content_links,
            type: typeof row.content_links,
            isArray: Array.isArray(row.content_links),
            isString: typeof row.content_links === 'string',
            isEmpty: !row.content_links || row.content_links === ''
          })
          
          let links: string[] = [];
          
          // Handle both JSONB (already parsed) and TEXT (needs parsing) column types
          if (Array.isArray(row.content_links)) {
            links = row.content_links;
          } else if (typeof row.content_links === 'string' && row.content_links !== '') {
            try {
              const parsed = JSON.parse(row.content_links);
              links = Array.isArray(parsed) ? parsed : [];
            } catch (error) {
              console.warn('❌ [CONTENT LINKS DEBUG] Failed to parse content_links string for campaign influencer:', row.id, 'Content:', row.content_links, 'Error:', error);
              return [];
            }
          }
          
          // Filter out debug strings and invalid URLs
          const cleanLinks = links.filter(link => {
            if (typeof link !== 'string') return false;
            const trimmed = link.trim();
            // Filter out debug strings and ensure it's a valid URL
            return trimmed && 
                   !trimmed.includes('🔍') && 
                   !trimmed.includes('DEBUG') && 
                   !trimmed.includes('✅') && 
                   !trimmed.includes('analytics') &&
                   (trimmed.startsWith('http://') || trimmed.startsWith('https://'));
          });
          
          console.log(`✅ [CONTENT LINKS DEBUG] Cleaned links:`, cleanLinks)
          return cleanLinks;
        })(),
        discountCode: row.discount_code,
        paidAt: row.paid_at ? new Date(row.paid_at) : undefined,
        notes: row.notes,
        rate: row.compensation_amount,
        deadline: row.deadline ? new Date(row.deadline) : undefined,
        productShipped: row.product_shipped,
        contentPosted: row.content_posted,
        paymentReleased: row.payment_released,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        // Analytics fields at top level for frontend access (convert strings to numbers)
        totalEngagements: (() => {
          const value = parseInt(row.total_engagements) || 0;
          console.log(`🔢 [ANALYTICS DEBUG] totalEngagements: '${row.total_engagements}' → ${value}`);
          return value;
        })(),
        avgEngagementRate: (() => {
          const value = parseFloat(row.avg_engagement_rate) || 0;
          console.log(`🔢 [ANALYTICS DEBUG] avgEngagementRate: '${row.avg_engagement_rate}' → ${value}`);
          return value;
        })(),
        estimatedReach: (() => {
          const value = parseInt(row.estimated_reach) || 0;
          console.log(`🔢 [ANALYTICS DEBUG] estimatedReach: '${row.estimated_reach}' → ${value}`);
          return value;
        })(),
        totalLikes: (() => {
          const value = parseInt(row.total_likes) || 0;
          console.log(`🔢 [ANALYTICS DEBUG] totalLikes: '${row.total_likes}' → ${value}`);
          return value;
        })(),
        totalComments: (() => {
          const value = parseInt(row.total_comments) || 0;
          console.log(`🔢 [ANALYTICS DEBUG] totalComments: '${row.total_comments}' → ${value}`);
          return value;
        })(),
        totalViews: (() => {
          const value = parseInt(row.total_views) || 0;
          console.log(`🔢 [ANALYTICS DEBUG] totalViews: '${row.total_views}' → ${value}`);
          return value;
        })(),
        analyticsUpdatedAt: row.analytics_updated_at,
        influencer: {
          id: row.influencer_id,
          display_name: row.display_name,
          niche_primary: row.niche_primary,
          total_followers: row.total_followers,
          total_engagement_rate: row.total_engagement_rate,
          profile_image_url: row.profile_image_url
        },
        campaign: {
          id: row.campaign_id,
          name: row.campaign_name,
          brand: row.campaign_brand,
          status: row.campaign_status
        }
      }
    })
  } catch (error) {
    console.error('Error getting campaign influencers with details:', error)
    throw error
  }
}

/**
 * Assign influencer to campaign with enhanced tracking
 */
export async function assignInfluencerToCampaign(
  campaignId: string,
  influencerId: string,
  rate?: number,
  deadline?: Date,
  notes?: string
): Promise<CampaignInfluencer> {
  try {
    const _result = await query(`
      INSERT INTO campaign_influencers (
        campaign_id, influencer_id, status, compensation_amount, 
        deadline, notes, created_at, updated_at
      ) VALUES ($1, $2, 'INVITED', $3, $4, $5, NOW(), NOW())
      ON CONFLICT (campaign_id, influencer_id) 
      DO UPDATE SET 
        status = 'INVITED',
        compensation_amount = $3,
        deadline = $4,
        notes = $5,
        updated_at = NOW()
      RETURNING *
    `, [campaignId, influencerId, rate, deadline, notes])

    const row = result[0]
    return {
      id: row.id,
      campaignId: row.campaign_id,
      influencerId: row.influencer_id,
      status: row.status as ParticipationStatus,
      appliedAt: row.applied_at ? new Date(row.applied_at) : undefined,
      acceptedAt: row.accepted_at ? new Date(row.accepted_at) : undefined,
      declinedAt: row.declined_at ? new Date(row.declined_at) : undefined,
      contentSubmittedAt: row.content_submitted_at ? new Date(row.content_submitted_at) : undefined,
      paidAt: row.paid_at ? new Date(row.paid_at) : undefined,
      notes: row.notes,
      rate: row.compensation_amount,
      deadline: row.deadline ? new Date(row.deadline) : undefined,
      productShipped: row.product_shipped,
      contentPosted: row.content_posted,
      paymentReleased: row.payment_released,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }
  } catch (error) {
    console.error('Error assigning influencer to campaign:', error)
    throw error
  }
}

/**
 * Update influencer status in campaign with enhanced tracking
 */
export async function updateCampaignInfluencerStatus(
  campaignId: string,
  influencerId: string,
  status: ParticipationStatus,
  notes?: string,
  additionalData?: {
    productShipped?: boolean
    contentPosted?: boolean
    paymentReleased?: boolean
  }
): Promise<CampaignInfluencer | null> {
  try {
    const updateFields: string[] = ['status = $3', 'updated_at = NOW()']
    const values: any[] = [campaignId, influencerId, status]
    let paramCount = 4

    // Add status-specific timestamp updates
    if (status === 'ACCEPTED') {
      updateFields.push('accepted_at = NOW()')
    } else if (status === 'DECLINED') {
      updateFields.push('declined_at = NOW()')
    } else if (status === 'CONTENT_SUBMITTED') {
      updateFields.push('content_submitted_at = NOW()')
    } else if (status === 'COMPLETED') {
      updateFields.push('paid_at = NOW()')
    }

    // Add notes if provided
    if (notes) {
      updateFields.push(`notes = $${paramCount++}`)
      values.push(notes)
    }

    // Add additional tracking data
    if (additionalData?.productShipped !== undefined) {
      updateFields.push(`product_shipped = $${paramCount++}`)
      values.push(additionalData.productShipped)
    }
    if (additionalData?.contentPosted !== undefined) {
      updateFields.push(`content_posted = $${paramCount++}`)
      values.push(additionalData.contentPosted)
    }
    if (additionalData?.paymentReleased !== undefined) {
      updateFields.push(`payment_released = $${paramCount++}`)
      values.push(additionalData.paymentReleased)
    }

    const _result = await query(`
      UPDATE campaign_influencers 
      SET ${updateFields.join(', ')}
      WHERE campaign_id = $1 AND influencer_id = $2
      RETURNING *
    `, values)

    if (result.length === 0) {
      return null
    }

    const row = result[0]
    return {
      id: row.id,
      campaignId: row.campaign_id,
      influencerId: row.influencer_id,
      status: row.status as ParticipationStatus,
      appliedAt: row.applied_at ? new Date(row.applied_at) : undefined,
      acceptedAt: row.accepted_at ? new Date(row.accepted_at) : undefined,
      declinedAt: row.declined_at ? new Date(row.declined_at) : undefined,
      contentSubmittedAt: row.content_submitted_at ? new Date(row.content_submitted_at) : undefined,
      paidAt: row.paid_at ? new Date(row.paid_at) : undefined,
      notes: row.notes,
      rate: row.compensation_amount,
      deadline: row.deadline ? new Date(row.deadline) : undefined,
      productShipped: row.product_shipped,
      contentPosted: row.content_posted,
      paymentReleased: row.payment_released,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }
  } catch (error) {
    console.error('Error updating campaign influencer status:', error)
    throw error
  }
}

/**
 * Track product shipment for influencer
 */
export async function updateProductShipmentStatus(
  campaignId: string,
  influencerId: string,
  shipped: boolean,
  trackingNumber?: string,
  shippedAt?: Date
): Promise<boolean> {
  try {
    const _result = await query(`
      UPDATE campaign_influencers 
      SET 
        product_shipped = $3,
        notes = CASE 
          WHEN $4 IS NOT NULL THEN COALESCE(notes, '') || ' Tracking: ' || $4
          ELSE notes
        END,
        updated_at = NOW()
      WHERE campaign_id = $1 AND influencer_id = $2
      RETURNING id
    `, [campaignId, influencerId, shipped, trackingNumber])

    return result.length > 0
  } catch (error) {
    console.error('Error updating product shipment status:', error)
    throw error
  }
}

/**
 * Track content posting for influencer
 */
export async function updateContentPostingStatus(
  campaignId: string,
  influencerId: string,
  posted: boolean,
  postUrl?: string,
  postedAt?: Date
): Promise<boolean> {
  try {
    const _result = await query(`
      UPDATE campaign_influencers 
      SET 
        content_posted = $3,
        notes = CASE 
          WHEN $4 IS NOT NULL THEN COALESCE(notes, '') || ' Post URL: ' || $4
          ELSE notes
        END,
        updated_at = NOW()
      WHERE campaign_id = $1 AND influencer_id = $2
      RETURNING id
    `, [campaignId, influencerId, posted, postUrl])

    return result.length > 0
  } catch (error) {
    console.error('Error updating content posting status:', error)
    throw error
  }
}

/**
 * Track payment release for influencer
 */
export async function updatePaymentReleaseStatus(
  campaignId: string,
  influencerId: string,
  released: boolean,
  releasedAt?: Date
): Promise<boolean> {
  try {
    const _result = await query(`
      UPDATE campaign_influencers 
      SET 
        payment_released = $3,
        updated_at = NOW()
      WHERE campaign_id = $1 AND influencer_id = $2
      RETURNING id
    `, [campaignId, influencerId, released])

    return result.length > 0
  } catch (error) {
    console.error('Error updating payment release status:', error)
    throw error
  }
}

/**
 * Get campaign timeline and deadlines
 */
export async function getCampaignTimeline(campaignId: string): Promise<{
  campaign: {
    startDate: Date
    endDate: Date
    applicationDeadline: Date
    contentDeadline: Date
  }
  influencers: Array<{
    influencerId: string
    displayName: string
    deadline: Date | null
    status: ParticipationStatus
    productShipped: boolean
    contentPosted: boolean
    paymentReleased: boolean
  }>
}> {
  try {
    // Get campaign timeline
    const campaignResult = await query(`
      SELECT start_date, end_date, application_deadline, content_deadline
      FROM campaigns
      WHERE id = $1
    `, [campaignId])

    if (campaignResult.length === 0) {
      throw new Error('Campaign not found')
    }

    const campaign = campaignResult[0]

    // Get influencer deadlines and status
    const influencersResult = await query(`
      SELECT 
        ci.influencer_id,
        ci.deadline,
        ci.status,
        ci.product_shipped,
        ci.content_posted,
        ci.payment_released,
        i.display_name
      FROM campaign_influencers ci
      JOIN influencers i ON ci.influencer_id = i.id
      WHERE ci.campaign_id = $1
      ORDER BY ci.deadline ASC
    `, [campaignId])

    return {
      campaign: {
        startDate: new Date(campaign.start_date),
        endDate: new Date(campaign.end_date),
        applicationDeadline: new Date(campaign.application_deadline),
        contentDeadline: new Date(campaign.content_deadline)
      },
      influencers: influencersResult.map(row => ({
        influencerId: row.influencer_id,
        displayName: row.display_name,
        deadline: row.deadline ? new Date(row.deadline) : null,
        status: row.status as ParticipationStatus,
        productShipped: row.product_shipped,
        contentPosted: row.content_posted,
        paymentReleased: row.payment_released
      }))
    }
  } catch (error) {
    console.error('Error getting campaign timeline:', error)
    throw error
  }
}

/**
 * Get campaign statistics
 */
export async function getCampaignStatistics(campaignId: string): Promise<{
  totalInfluencers: number
  invitedCount: number
  acceptedCount: number
  declinedCount: number
  inProgressCount: number
  contentSubmittedCount: number
  completedCount: number
  paidCount: number
  productShippedCount: number
  contentPostedCount: number
  paymentReleasedCount: number
}> {
  try {
    const _result = await query(`
      SELECT 
        COUNT(*) as total_influencers,
        COUNT(CASE WHEN status = 'INVITED' THEN 1 END) as invited_count,
        COUNT(CASE WHEN status = 'ACCEPTED' THEN 1 END) as accepted_count,
        COUNT(CASE WHEN status = 'DECLINED' THEN 1 END) as declined_count,
        COUNT(CASE WHEN status = 'IN_PROGRESS' THEN 1 END) as in_progress_count,
        COUNT(CASE WHEN status = 'CONTENT_SUBMITTED' THEN 1 END) as content_submitted_count,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_count,
        COUNT(CASE WHEN status = 'PAID' THEN 1 END) as paid_count,
        COUNT(CASE WHEN product_shipped = true THEN 1 END) as product_shipped_count,
        COUNT(CASE WHEN content_posted = true THEN 1 END) as content_posted_count,
        COUNT(CASE WHEN payment_released = true THEN 1 END) as payment_released_count
      FROM campaign_influencers
      WHERE campaign_id = $1
    `, [campaignId])

    const stats = result[0]
    return {
      totalInfluencers: parseInt(stats.total_influencers),
      invitedCount: parseInt(stats.invited_count),
      acceptedCount: parseInt(stats.accepted_count),
      declinedCount: parseInt(stats.declined_count),
      inProgressCount: parseInt(stats.in_progress_count),
      contentSubmittedCount: parseInt(stats.content_submitted_count),
      completedCount: parseInt(stats.completed_count),
      paidCount: parseInt(stats.paid_count),
      productShippedCount: parseInt(stats.product_shipped_count),
      contentPostedCount: parseInt(stats.content_posted_count),
      paymentReleasedCount: parseInt(stats.payment_released_count)
    }
  } catch (error) {
    console.error('Error getting campaign statistics:', error)
    throw error
  }
} 