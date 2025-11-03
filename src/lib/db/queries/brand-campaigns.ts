import { query } from '../connection'
import { Campaign } from '../../../types/index'

// Get brand ID from authenticated Clerk user ID
export async function getBrandIdFromUserId(clerkUserId: string): Promise<string> {
  // First get the user ID from Clerk user ID
  const userResult = await query(`
    SELECT id FROM users WHERE clerk_id = $1
  `, [clerkUserId])
  
  if (userResult.length === 0) {
    throw new Error('User not found')
  }
  
  const userId = userResult[0].id
  
  // Then get the brand ID from user ID
  const brandResult = await query(`
    SELECT id FROM brands WHERE user_id = $1
  `, [userId])
  
  if (brandResult.length === 0) {
    throw new Error('Brand not found - Please complete onboarding first')
  }
  
  return brandResult[0].id
}

// Get all campaigns for a specific brand
export async function getBrandCampaigns(brandId: string): Promise<Campaign[]> {
  const result = await query(`
    SELECT 
      c.id,
      c.name,
      c.status,
      c.description,
      c.budget,
      c.start_date,
      c.end_date,
      c.deliverables,
      c.created_at,
      c.updated_at,
      b.company_name as brand_name,
      -- Count influencer participation
      COUNT(ci.id) as total_influencers,
      COUNT(CASE WHEN ci.status = 'ACCEPTED' THEN 1 END) as accepted_count,
      COUNT(CASE WHEN ci.status = 'INVITED' THEN 1 END) as pending_count,
      COUNT(CASE WHEN ci.status = 'COMPLETED' THEN 1 END) as completed_count,
      COUNT(CASE WHEN ci.payment_released = true THEN 1 END) as paid_count
    FROM campaigns c
    LEFT JOIN brands b ON c.brand_id = b.id
    LEFT JOIN campaign_influencers ci ON c.id = ci.campaign_id
    WHERE c.brand_id = $1
    GROUP BY c.id, c.name, c.status, c.description, c.budget, 
             c.start_date, c.end_date, c.deliverables, c.created_at, c.updated_at, b.company_name
    ORDER BY c.created_at DESC
  `, [brandId])

  return result.map(row => ({
    id: row.id,
    name: row.name || 'Untitled Campaign',
    brand: row.brand_name || 'Unknown Brand',
    status: row.status || 'DRAFT',
    description: row.description || '',
    goals: [], // Default empty array since column doesn't exist
    timeline: {
      startDate: row.start_date || new Date().toISOString(),
      endDate: row.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      applicationDeadline: row.start_date || new Date().toISOString(), // Fallback to start_date
      contentDeadline: row.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Fallback to end_date
    },
    budget: {
      total: parseFloat(row.budget || '0'),
      perInfluencer: 0 // Default since column doesn't exist
    },
    requirements: {
      minFollowers: 0, // Default since column doesn't exist
      maxFollowers: 1000000, // Default
      minEngagement: 0, // Default
      platforms: [], // Default empty array
      demographics: {}, // Default empty object
      contentGuidelines: '' // Default empty string
    },
    deliverables: safeJsonParse(row.deliverables, []),
    totalInfluencers: parseInt(row.total_influencers || '0'),
    acceptedCount: parseInt(row.accepted_count || '0'),
    pendingCount: parseInt(row.pending_count || '0'),
    paidCount: parseInt(row.paid_count || '0'),
    paymentPendingCount: parseInt(row.completed_count || '0'), // Use completed as proxy
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  }))
}

// Get detailed campaign with influencers and content for brand
export async function getBrandCampaignDetail(brandId: string, campaignId: string) {
  // First verify campaign belongs to brand
  const campaignResult = await query(`
    SELECT c.*, b.company_name as brand_name 
    FROM campaigns c
    LEFT JOIN brands b ON c.brand_id = b.id
    WHERE c.id = $1 AND c.brand_id = $2
  `, [campaignId, brandId])
  
  if (campaignResult.length === 0) {
    throw new Error('Campaign not found or access denied')
  }
  
  const campaign = campaignResult[0]
  
  // Get campaign influencers with details
  const influencersResult = await query(`
    SELECT 
      ci.*,
      i.display_name,
      i.total_followers,
      i.total_engagement_rate,
      i.niche_primary,
      i.avatar_url,
      -- Content submission status
      COUNT(ccs.id) as content_submissions,
      COUNT(CASE WHEN ccs.status = 'APPROVED' THEN 1 END) as approved_content,
      COUNT(CASE WHEN ccs.status = 'SUBMITTED' THEN 1 END) as pending_content
    FROM campaign_influencers ci
    LEFT JOIN influencers i ON ci.influencer_id = i.id
    LEFT JOIN campaign_content_submissions ccs ON ci.id = ccs.campaign_influencer_id
    WHERE ci.campaign_id = $1
    GROUP BY ci.id, i.display_name, i.total_followers, i.total_engagement_rate, 
             i.niche_primary, i.avatar_url
    ORDER BY ci.created_at DESC
  `, [campaignId])
  
  // Get content submissions for campaign
  const contentResult = await query(`
    SELECT 
      ccs.*,
      ci.influencer_id,
      i.display_name as influencer_name,
      i.avatar_url as influencer_avatar
    FROM campaign_content_submissions ccs
    JOIN campaign_influencers ci ON ccs.campaign_influencer_id = ci.id
    JOIN influencers i ON ci.influencer_id = i.id
    WHERE ci.campaign_id = $1
    ORDER BY ccs.submitted_at DESC
  `, [campaignId])
  
  return {
    campaign: {
      ...campaign,
      brand_name: campaign.brand_name,
      deliverables: safeJsonParse(campaign.deliverables, [])
    },
    influencers: influencersResult,
    content: contentResult
  }
}

// Helper function for safe JSON parsing
function safeJsonParse(value: any, defaultValue: any = null) {
  if (!value) return defaultValue
  if (typeof value === 'object') return value
  
  try {
    return JSON.parse(value)
  } catch {
    return defaultValue
  }
}

// Get campaign analytics for brand
export async function getBrandCampaignAnalytics(brandId: string, campaignId: string) {
  // Verify campaign belongs to brand
  const verifyResult = await query(`
    SELECT 1 FROM campaigns 
    WHERE id = $1 AND brand_id = $2
  `, [campaignId, brandId])
  
  if (verifyResult.length === 0) {
    throw new Error('Campaign not found or access denied')
  }
  
  // Get aggregated analytics
  const analyticsResult = await query(`
    SELECT 
      -- Campaign metrics
      COUNT(ci.id) as total_influencers,
      COUNT(CASE WHEN ci.status = 'ACCEPTED' THEN 1 END) as accepted_influencers,
      COUNT(CASE WHEN ci.content_posted = true THEN 1 END) as content_posted,
      SUM(ci.compensation_amount) as total_spend,
      
      -- Content performance
      COUNT(ccs.id) as total_content,
      SUM(ccs.views) as total_views,
      SUM(ccs.likes) as total_likes,
      SUM(ccs.comments) as total_comments,
      SUM(ccs.shares) as total_shares,
      
      -- Platform breakdown
      COUNT(CASE WHEN ccs.platform = 'instagram' THEN 1 END) as instagram_posts,
      COUNT(CASE WHEN ccs.platform = 'tiktok' THEN 1 END) as tiktok_posts,
      COUNT(CASE WHEN ccs.platform = 'youtube' THEN 1 END) as youtube_posts
      
    FROM campaign_influencers ci
    LEFT JOIN campaign_content_submissions ccs ON ci.id = ccs.campaign_influencer_id
    WHERE ci.campaign_id = $1
  `, [campaignId])
  
  return analyticsResult[0] || {}
}
