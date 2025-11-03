import { query } from '../connection'

export interface ContentSubmission {
  id: string
  campaignInfluencerId: string
  contentUrl: string
  contentType: string
  platform: string
  views?: number
  likes?: number
  comments?: number
  shares?: number
  saves?: number
  title?: string
  description?: string
  caption?: string
  hashtags?: string[]
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED'
  submittedAt: Date
  reviewedAt?: Date
  reviewedBy?: string
  reviewNotes?: string
  screenshotUrl?: string
  shortLinkId?: string
  createdAt: Date
  updatedAt: Date
}

export interface ContentSubmissionWithDetails extends ContentSubmission {
  influencer: {
    id: string
    displayName: string
    profileImageUrl?: string
  }
  campaign: {
    id: string
    name: string
    brand: string
  }
  reviewer?: {
    id: string
    name: string
  }
  qualityScore?: number
  performanceMetrics?: {
    engagementRate: number
    reachEstimate: number
    viralityScore: number
  }
}

export interface ContentQualityMetrics {
  contentScore: number
  engagementScore: number
  brandAlignmentScore: number
  technicalQualityScore: number
  overallScore: number
  recommendations: string[]
}

/**
 * Get all content submissions for a campaign with detailed information
 */
export async function getCampaignContentSubmissions(campaignId: string): Promise<ContentSubmissionWithDetails[]> {
  try {
    const result = await query(`
      SELECT 
        ccs.*,
        i.id as influencer_id,
        i.display_name as influencer_display_name,
        up.avatar_url as influencer_profile_image,
        c.id as campaign_id,
        c.name as campaign_name,
        c.brand as campaign_brand,
        u.id as reviewer_user_id,
        CONCAT(up_reviewer.first_name, ' ', up_reviewer.last_name) as reviewer_name
      FROM campaign_content_submissions ccs
      JOIN campaign_influencers ci ON ccs.campaign_influencer_id = ci.id
      JOIN influencers i ON ci.influencer_id = i.id
      LEFT JOIN user_profiles up ON i.user_id = up.user_id
      JOIN campaigns c ON ci.campaign_id = c.id
      LEFT JOIN users u ON ccs.reviewed_by = u.id
      LEFT JOIN user_profiles up_reviewer ON u.id = up_reviewer.user_id
      WHERE ci.campaign_id = $1
      ORDER BY ccs.submitted_at DESC
    `, [campaignId])

    return result.map(row => ({
      id: row.id,
      campaignInfluencerId: row.campaign_influencer_id,
      contentUrl: row.content_url,
      contentType: row.content_type,
      platform: row.platform,
      views: row.views,
      likes: row.likes,
      comments: row.comments,
      shares: row.shares,
      saves: row.saves,
      title: row.title,
      description: row.description,
      caption: row.caption,
      hashtags: row.hashtags,
      status: row.status,
      submittedAt: new Date(row.submitted_at),
      reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : undefined,
      reviewedBy: row.reviewed_by,
      reviewNotes: row.review_notes,
      screenshotUrl: row.screenshot_url,
      shortLinkId: row.short_link_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      influencer: {
        id: row.influencer_id,
        displayName: row.influencer_display_name,
        profileImageUrl: row.influencer_profile_image
      },
      campaign: {
        id: row.campaign_id,
        name: row.campaign_name,
        brand: row.campaign_brand
      },
      reviewer: row.reviewer_user_id ? {
        id: row.reviewer_user_id,
        name: row.reviewer_name
      } : undefined
    }))
  } catch (error) {
    console.error('Error getting campaign content submissions:', error)
    throw error
  }
}

/**
 * Get content submissions by influencer for a campaign
 */
export async function getInfluencerContentSubmissions(
  campaignId: string, 
  influencerId: string
): Promise<ContentSubmission[]> {
  try {
    const result = await query(`
      SELECT ccs.*
      FROM campaign_content_submissions ccs
      JOIN campaign_influencers ci ON ccs.campaign_influencer_id = ci.id
      WHERE ci.campaign_id = $1 AND ci.influencer_id = $2
      ORDER BY ccs.submitted_at DESC
    `, [campaignId, influencerId])

    return result.map(row => ({
      id: row.id,
      campaignInfluencerId: row.campaign_influencer_id,
      contentUrl: row.content_url,
      contentType: row.content_type,
      platform: row.platform,
      views: row.views,
      likes: row.likes,
      comments: row.comments,
      shares: row.shares,
      saves: row.saves,
      title: row.title,
      description: row.description,
      caption: row.caption,
      hashtags: row.hashtags,
      status: row.status,
      submittedAt: new Date(row.submitted_at),
      reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : undefined,
      reviewedBy: row.reviewed_by,
      reviewNotes: row.review_notes,
      screenshotUrl: row.screenshot_url,
      shortLinkId: row.short_link_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }))
  } catch (error) {
    console.error('Error getting influencer content submissions:', error)
    throw error
  }
}

/**
 * Update content submission status (approve/reject/request revision)
 */
export async function updateContentSubmissionStatus(
  submissionId: string,
  status: 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED',
  reviewerId: string,
  reviewNotes?: string
): Promise<ContentSubmission> {
  try {
    const result = await query(`
      UPDATE campaign_content_submissions 
      SET 
        status = $2,
        reviewed_at = NOW(),
        reviewed_by = $3,
        review_notes = $4,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [submissionId, status, reviewerId, reviewNotes])

    if (result.length === 0) {
      throw new Error('Content submission not found')
    }

    const row = result[0]
    return {
      id: row.id,
      campaignInfluencerId: row.campaign_influencer_id,
      contentUrl: row.content_url,
      contentType: row.content_type,
      platform: row.platform,
      views: row.views,
      likes: row.likes,
      comments: row.comments,
      shares: row.shares,
      saves: row.saves,
      title: row.title,
      description: row.description,
      caption: row.caption,
      hashtags: row.hashtags,
      status: row.status,
      submittedAt: new Date(row.submitted_at),
      reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : undefined,
      reviewedBy: row.reviewed_by,
      reviewNotes: row.review_notes,
      screenshotUrl: row.screenshot_url,
      shortLinkId: row.short_link_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }
  } catch (error) {
    console.error('Error updating content submission status:', error)
    throw error
  }
}

/**
 * Calculate content quality score based on various metrics
 */
export function calculateContentQualityScore(submission: ContentSubmission): ContentQualityMetrics {
  let contentScore = 0
  let engagementScore = 0
  let brandAlignmentScore = 0
  let technicalQualityScore = 0
  const recommendations: string[] = []

  // Content Score (based on completeness)
  if (submission.title) contentScore += 20
  if (submission.description) contentScore += 20
  if (submission.caption) contentScore += 20
  if (submission.hashtags && submission.hashtags.length > 0) contentScore += 20
  if (submission.screenshotUrl) contentScore += 20

  // Engagement Score (based on performance metrics)
  if (submission.views && submission.views > 0) {
    const viewScore = Math.min(submission.views / 1000, 25) // Max 25 points for views
    engagementScore += viewScore
  }
  
  if (submission.likes && submission.likes > 0) {
    const likeScore = Math.min(submission.likes / 100, 25) // Max 25 points for likes
    engagementScore += likeScore
  }
  
  if (submission.comments && submission.comments > 0) {
    const commentScore = Math.min(submission.comments / 10, 25) // Max 25 points for comments
    engagementScore += commentScore
  }
  
  if (submission.shares && submission.shares > 0) {
    const shareScore = Math.min(submission.shares / 5, 25) // Max 25 points for shares
    engagementScore += shareScore
  }

  // Brand Alignment Score (based on content type and platform)
  if (submission.contentType === 'post' || submission.contentType === 'reel') {
    brandAlignmentScore += 25
  }
  if (submission.platform === 'instagram' || submission.platform === 'tiktok') {
    brandAlignmentScore += 25
  }
  if (submission.caption && submission.caption.length > 50) {
    brandAlignmentScore += 25
  }
  if (submission.hashtags && submission.hashtags.length >= 3) {
    brandAlignmentScore += 25
  }

  // Technical Quality Score
  if (submission.contentUrl) technicalQualityScore += 25
  if (submission.contentType) technicalQualityScore += 25
  if (submission.platform) technicalQualityScore += 25
  if (submission.screenshotUrl) technicalQualityScore += 25

  // Generate recommendations
  if (!submission.title) recommendations.push('Add a descriptive title')
  if (!submission.description) recommendations.push('Include a detailed description')
  if (!submission.caption) recommendations.push('Add an engaging caption')
  if (!submission.hashtags || submission.hashtags.length < 3) {
    recommendations.push('Include at least 3 relevant hashtags')
  }
  if (!submission.screenshotUrl) recommendations.push('Upload a screenshot for verification')
  if (submission.views && submission.views < 100) {
    recommendations.push('Content has low visibility - consider timing and hashtags')
  }

  const overallScore = Math.round((contentScore + engagementScore + brandAlignmentScore + technicalQualityScore) / 4)

  return {
    contentScore: Math.round(contentScore),
    engagementScore: Math.round(engagementScore),
    brandAlignmentScore: Math.round(brandAlignmentScore),
    technicalQualityScore: Math.round(technicalQualityScore),
    overallScore,
    recommendations
  }
}

/**
 * Get content submission statistics for a campaign
 */
export async function getContentSubmissionStats(campaignId: string): Promise<{
  totalSubmissions: number
  pendingCount: number
  approvedCount: number
  rejectedCount: number
  revisionRequestedCount: number
  averageQualityScore: number
  topPerformingContent: ContentSubmissionWithDetails[]
}> {
  try {
    // Get basic counts
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_submissions,
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved_count,
        COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected_count,
        COUNT(CASE WHEN status = 'REVISION_REQUESTED' THEN 1 END) as revision_requested_count
      FROM campaign_content_submissions ccs
      JOIN campaign_influencers ci ON ccs.campaign_influencer_id = ci.id
      WHERE ci.campaign_id = $1
    `, [campaignId])

    const stats = statsResult[0]

    // Get top performing content (by engagement)
    const topContentResult = await query(`
      SELECT 
        ccs.*,
        i.id as influencer_id,
        i.display_name as influencer_display_name,
        up.avatar_url as influencer_profile_image,
        c.id as campaign_id,
        c.name as campaign_name,
        c.brand as campaign_brand
      FROM campaign_content_submissions ccs
      JOIN campaign_influencers ci ON ccs.campaign_influencer_id = ci.id
      JOIN influencers i ON ci.influencer_id = i.id
      LEFT JOIN user_profiles up ON i.user_id = up.user_id
      JOIN campaigns c ON ci.campaign_id = c.id
      WHERE ci.campaign_id = $1 AND ccs.status = 'APPROVED'
      ORDER BY (COALESCE(ccs.views, 0) + COALESCE(ccs.likes, 0) * 2 + COALESCE(ccs.comments, 0) * 3 + COALESCE(ccs.shares, 0) * 4) DESC
      LIMIT 5
    `, [campaignId])

    const topPerformingContent = topContentResult.map(row => ({
      id: row.id,
      campaignInfluencerId: row.campaign_influencer_id,
      contentUrl: row.content_url,
      contentType: row.content_type,
      platform: row.platform,
      views: row.views,
      likes: row.likes,
      comments: row.comments,
      shares: row.shares,
      saves: row.saves,
      title: row.title,
      description: row.description,
      caption: row.caption,
      hashtags: row.hashtags,
      status: row.status,
      submittedAt: new Date(row.submitted_at),
      reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : undefined,
      reviewedBy: row.reviewed_by,
      reviewNotes: row.review_notes,
      screenshotUrl: row.screenshot_url,
      shortLinkId: row.short_link_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      influencer: {
        id: row.influencer_id,
        displayName: row.influencer_display_name,
        profileImageUrl: row.influencer_profile_image
      },
      campaign: {
        id: row.campaign_id,
        name: row.campaign_name,
        brand: row.campaign_brand
      }
    }))

    // Calculate average quality score
    let averageQualityScore = 0
    if (stats.total_submissions > 0) {
      const qualityScores = topPerformingContent.map(content => 
        calculateContentQualityScore(content).overallScore
      )
      averageQualityScore = Math.round(
        qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
      )
    }

    return {
      totalSubmissions: parseInt(stats.total_submissions),
      pendingCount: parseInt(stats.pending_count),
      approvedCount: parseInt(stats.approved_count),
      rejectedCount: parseInt(stats.rejected_count),
      revisionRequestedCount: parseInt(stats.revision_requested_count),
      averageQualityScore,
      topPerformingContent
    }
  } catch (error) {
    console.error('Error getting content submission stats:', error)
    throw error
  }
}

/**
 * Add screenshot URL to content submission
 */
export async function addContentScreenshot(
  submissionId: string,
  screenshotUrl: string
): Promise<boolean> {
  try {
    const result = await query(`
      UPDATE campaign_content_submissions 
      SET screenshot_url = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING id
    `, [submissionId, screenshotUrl])

    return result.length > 0
  } catch (error) {
    console.error('Error adding content screenshot:', error)
    throw error
  }
}

/**
 * Get content submissions that need review
 */
export async function getPendingContentReviews(): Promise<ContentSubmissionWithDetails[]> {
  try {
    const result = await query(`
      SELECT 
        ccs.*,
        i.id as influencer_id,
        i.display_name as influencer_display_name,
        up.avatar_url as influencer_profile_image,
        c.id as campaign_id,
        c.name as campaign_name,
        c.brand as campaign_brand
      FROM campaign_content_submissions ccs
      JOIN campaign_influencers ci ON ccs.campaign_influencer_id = ci.id
      JOIN influencers i ON ci.influencer_id = i.id
      LEFT JOIN user_profiles up ON i.user_id = up.user_id
      JOIN campaigns c ON ci.campaign_id = c.id
      WHERE ccs.status IN ('SUBMITTED', 'REVISION_REQUESTED')
      ORDER BY ccs.submitted_at ASC
    `)

    return result.map(row => ({
      id: row.id,
      campaignInfluencerId: row.campaign_influencer_id,
      contentUrl: row.content_url,
      contentType: row.content_type,
      platform: row.platform,
      views: row.views,
      likes: row.likes,
      comments: row.comments,
      shares: row.shares,
      saves: row.saves,
      title: row.title,
      description: row.description,
      caption: row.caption,
      hashtags: row.hashtags,
      status: row.status,
      submittedAt: new Date(row.submitted_at),
      reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : undefined,
      reviewedBy: row.reviewed_by,
      reviewNotes: row.review_notes,
      screenshotUrl: row.screenshot_url,
      shortLinkId: row.short_link_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      influencer: {
        id: row.influencer_id,
        displayName: row.influencer_display_name,
        profileImageUrl: row.influencer_profile_image
      },
      campaign: {
        id: row.campaign_id,
        name: row.campaign_name,
        brand: row.campaign_brand
      }
    }))
  } catch (error) {
    console.error('Error getting pending content reviews:', error)
    throw error
  }
} 