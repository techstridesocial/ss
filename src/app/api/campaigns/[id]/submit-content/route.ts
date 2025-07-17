import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { query, queryOne } from '@/lib/db/connection'

interface ContentSubmission {
  content_url: string
  content_type: string
  platform: string
  title?: string
  description?: string
  caption?: string
  hashtags?: string[]
  views?: number
  likes?: number
  comments?: number
  shares?: number
  saves?: number
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = await getCurrentUserRole()
    if (!userRole || !['INFLUENCER_SIGNED', 'INFLUENCER_PARTNERED'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Only influencers can submit campaign content' },
        { status: 403 }
      )
    }

    const campaignId = params.id
    const submissionData: ContentSubmission = await request.json()

    // Validate required fields
    if (!submissionData.content_url || !submissionData.content_type || !submissionData.platform) {
      return NextResponse.json(
        { error: 'Content URL, content type, and platform are required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(submissionData.content_url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid content URL format' },
        { status: 400 }
      )
    }

    // Get the influencer ID from the user
    const influencerResult = await query<{ id: string }>(
      'SELECT id FROM influencers WHERE user_id = (SELECT id FROM users WHERE clerk_id = $1)',
      [userId]
    )

    if (influencerResult.length === 0) {
      return NextResponse.json(
        { error: 'Influencer profile not found' },
        { status: 404 }
      )
    }

    const influencerId = influencerResult[0]?.id
    if (!influencerId) {
      return NextResponse.json(
        { error: 'Influencer ID not found' },
        { status: 404 }
      )
    }

    // Check if influencer is assigned to this campaign
    const campaignInfluencerResult = await query<{ id: string, status: string }>(
      'SELECT id, status FROM campaign_influencers WHERE campaign_id = $1 AND influencer_id = $2',
      [campaignId, influencerId]
    )

    if (campaignInfluencerResult.length === 0 || !campaignInfluencerResult[0]) {
      return NextResponse.json(
        { error: 'You are not assigned to this campaign' },
        { status: 404 }
      )
    }

    const campaignInfluencer = campaignInfluencerResult[0]
    if (campaignInfluencer.status !== 'accepted') {
      return NextResponse.json(
        { error: 'Campaign participation must be accepted before submitting content' },
        { status: 400 }
      )
    }

    // Insert content submission
    const submissionResult = await query<{ id: string }>(
      `INSERT INTO campaign_content_submissions (
        campaign_influencer_id,
        content_url,
        content_type,
        platform,
        title,
        description,
        caption,
        hashtags,
        views,
        likes,
        comments,
        shares,
        saves
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id`,
      [
        campaignInfluencer.id,
        submissionData.content_url,
        submissionData.content_type,
        submissionData.platform,
        submissionData.title || null,
        submissionData.description || null,
        submissionData.caption || null,
        submissionData.hashtags || null,
        submissionData.views || null,
        submissionData.likes || null,
        submissionData.comments || null,
        submissionData.shares || null,
        submissionData.saves || null
      ]
    )

    // Update campaign_influencer content_posted status
    await query(
      'UPDATE campaign_influencers SET content_posted = true WHERE id = $1',
      [campaignInfluencer.id]
    )

    return NextResponse.json({
      success: true,
      message: 'Content submitted successfully',
      submission_id: submissionResult[0]?.id
    })

  } catch (error) {
    console.error('Error submitting campaign content:', error)
    return NextResponse.json(
      { error: 'Failed to submit content' },
      { status: 500 }
    )
  }
}

// GET - Get content submissions for a campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = await getCurrentUserRole()
    const campaignId = params.id

    // Staff/Admin can see all submissions for the campaign
    if (userRole && ['STAFF', 'ADMIN'].includes(userRole)) {
      const submissions = await query(
        `SELECT 
          ccs.*,
          ci.influencer_id,
          i.display_name as influencer_name,
          up.first_name,
          up.last_name
        FROM campaign_content_submissions ccs
        JOIN campaign_influencers ci ON ccs.campaign_influencer_id = ci.id
        JOIN influencers i ON ci.influencer_id = i.id
        JOIN users u ON i.user_id = u.id
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE ci.campaign_id = $1
        ORDER BY ccs.submitted_at DESC`,
        [campaignId]
      )

      return NextResponse.json({
        success: true,
        submissions: submissions
      })
    }

    // Influencers can only see their own submissions
    if (userRole && ['INFLUENCER_SIGNED', 'INFLUENCER_PARTNERED'].includes(userRole)) {
      const influencerResult = await query<{ id: string }>(
        'SELECT id FROM influencers WHERE user_id = (SELECT id FROM users WHERE clerk_id = $1)',
        [userId]
      )

      if (influencerResult.length === 0) {
        return NextResponse.json(
          { error: 'Influencer profile not found' },
          { status: 404 }
        )
      }

      const submissions = await query(
        `SELECT ccs.*
        FROM campaign_content_submissions ccs
        JOIN campaign_influencers ci ON ccs.campaign_influencer_id = ci.id
        WHERE ci.campaign_id = $1 AND ci.influencer_id = $2
        ORDER BY ccs.submitted_at DESC`,
        [campaignId, influencerResult[0]?.id]
      )

      return NextResponse.json({
        success: true,
        submissions: submissions
      })
    }

    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )

  } catch (error) {
    console.error('Error fetching campaign content submissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
} 