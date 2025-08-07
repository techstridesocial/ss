import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { query, transaction } from '@/lib/db/connection'

// POST - Submit content for a campaign
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaignId = params.id
    const data = await request.json()

    // Validate required fields
    const requiredFields = ['content_url', 'content_type', 'platform']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Get user_id from users table
    const userResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId]
    )

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user_id = userResult[0]?.id

    // Get influencer_id
    const influencerResult = await query<{ id: string }>(
      'SELECT id FROM influencers WHERE user_id = $1',
      [user_id]
    )

    if (influencerResult.length === 0) {
      return NextResponse.json(
        { error: 'Influencer not found' },
        { status: 404 }
      )
    }

    const influencer_id = influencerResult[0]?.id

    // Verify campaign assignment exists
    const assignmentQuery = `
      SELECT ci.id as campaign_influencer_id, ci.status
      FROM campaign_influencers ci
      WHERE ci.campaign_id = $1 AND ci.influencer_id = $2
    `

    const assignmentResult = await query(assignmentQuery, [campaignId, influencer_id])

    if (assignmentResult.length === 0) {
      return NextResponse.json(
        { error: 'Campaign assignment not found' },
        { status: 404 }
      )
    }

    const assignment = assignmentResult[0]
    
    if (assignment.status !== 'ACCEPTED') {
      return NextResponse.json(
        { error: 'Campaign assignment not accepted' },
        { status: 400 }
      )
    }

    // Insert content submission
    const insertQuery = `
      INSERT INTO campaign_content_submissions (
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
        saves,
        status,
        submitted_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
      RETURNING id
    `

    const result = await query(insertQuery, [
      assignment.campaign_influencer_id,
      data.content_url,
      data.content_type,
      data.platform,
      data.title || null,
      data.description || null,
      data.caption || null,
      data.hashtags || [],
      data.views || null,
      data.likes || null,
      data.comments || null,
      data.shares || null,
      data.saves || null,
      'PENDING'
    ])

    return NextResponse.json({
      success: true,
      message: 'Content submitted successfully',
      submission_id: result[0]?.id
    }, { status: 201 })

  } catch (error) {
    console.error('Error submitting content:', error)
    return NextResponse.json(
      { error: 'Failed to submit content' },
      { status: 500 }
    )
  }
} 