import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { query } from '@/lib/db/connection'

// GET - Get all content submissions with filters
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse filters from query params
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const campaignId = searchParams.get('campaignId')
    const platform = searchParams.get('platform')
    const search = searchParams.get('search')

    const conditions: string[] = []
    const values: unknown[] = []
    let paramCount = 1

    if (status && status !== 'all') {
      if (status === 'pending') {
        conditions.push(`ccs.status IN ('SUBMITTED', 'PENDING')`)
      } else {
        conditions.push(`ccs.status = $${paramCount++}`)
        values.push(status.toUpperCase())
      }
    }

    if (campaignId) {
      conditions.push(`c.id = $${paramCount++}`)
      values.push(campaignId)
    }

    if (platform && platform !== 'all') {
      conditions.push(`ccs.platform = $${paramCount++}`)
      values.push(platform)
    }

    if (search) {
      conditions.push(`(
        i.display_name ILIKE $${paramCount} OR
        i.username ILIKE $${paramCount} OR
        c.name ILIKE $${paramCount} OR
        ccs.title ILIKE $${paramCount}
      )`)
      values.push(`%${search}%`)
      paramCount++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Get submissions
    const submissions = await query(`
      SELECT 
        ccs.*,
        i.id as influencer_id,
        i.display_name as influencer_display_name,
        i.username as influencer_username,
        up.profile_image_url as influencer_profile_image,
        u.email as influencer_email,
        c.id as campaign_id,
        c.name as campaign_name,
        COALESCE(b.company_name, c.brand) as campaign_brand,
        reviewer.email as reviewer_email,
        up_reviewer.first_name as reviewer_first_name,
        up_reviewer.last_name as reviewer_last_name
      FROM campaign_content_submissions ccs
      JOIN campaign_influencers ci ON ccs.campaign_influencer_id = ci.id
      JOIN influencers i ON ci.influencer_id = i.id
      LEFT JOIN users u ON i.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      JOIN campaigns c ON ci.campaign_id = c.id
      LEFT JOIN brands b ON c.brand_id = b.id
      LEFT JOIN users reviewer ON ccs.reviewed_by = reviewer.id
      LEFT JOIN user_profiles up_reviewer ON reviewer.id = up_reviewer.user_id
      ${whereClause}
      ORDER BY 
        CASE WHEN ccs.status IN ('SUBMITTED', 'PENDING') THEN 0 ELSE 1 END,
        ccs.submitted_at DESC
    `, values)

    // Get stats
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status IN ('SUBMITTED', 'PENDING') THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected,
        COUNT(CASE WHEN status = 'REVISION_REQUESTED' THEN 1 END) as revision_requested
      FROM campaign_content_submissions
    `, [])

    const stats = statsResult[0]

    // Format response
    const formattedSubmissions = submissions.map(row => ({
      id: row.id,
      campaignInfluencerId: row.campaign_influencer_id,
      contentUrl: row.content_url,
      contentType: row.content_type,
      platform: row.platform,
      title: row.title,
      description: row.description,
      caption: row.caption,
      hashtags: row.hashtags,
      views: row.views,
      likes: row.likes,
      comments: row.comments,
      shares: row.shares,
      saves: row.saves,
      status: row.status,
      submittedAt: row.submitted_at,
      reviewedAt: row.reviewed_at,
      reviewNotes: row.review_notes,
      screenshotUrl: row.screenshot_url,
      influencer: {
        id: row.influencer_id,
        displayName: row.influencer_display_name || row.influencer_username,
        username: row.influencer_username,
        profileImage: row.influencer_profile_image,
        email: row.influencer_email
      },
      campaign: {
        id: row.campaign_id,
        name: row.campaign_name,
        brand: row.campaign_brand
      },
      reviewer: row.reviewer_email ? {
        email: row.reviewer_email,
        name: `${row.reviewer_first_name || ''} ${row.reviewer_last_name || ''}`.trim() || row.reviewer_email
      } : null
    }))

    return NextResponse.json({
      success: true,
      submissions: formattedSubmissions,
      stats: {
        total: parseInt(stats.total) || 0,
        pending: parseInt(stats.pending) || 0,
        approved: parseInt(stats.approved) || 0,
        rejected: parseInt(stats.rejected) || 0,
        revisionRequested: parseInt(stats.revision_requested) || 0
      },
      total: formattedSubmissions.length
    })
  } catch (error) {
    console.error('Error fetching content submissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content submissions' },
      { status: 500 }
    )
  }
}
