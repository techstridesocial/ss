import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { 
  getCampaignContentSubmissions, 
  getContentSubmissionStats,
  updateContentSubmissionStatus,
  calculateContentQualityScore,
  getPendingContentReviews
} from '@/lib/db/queries/content-submissions'

// GET - Get all content submissions for a campaign with analytics
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
    const _campaignId = params.id
    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get('stats') === 'true'
    const includeQualityScores = searchParams.get('quality') === 'true'

    // Staff/Admin can see all submissions with analytics
    if (userRole && ['STAFF', 'ADMIN'].includes(userRole)) {
      const submissions = await getCampaignContentSubmissions(campaignId)
      
      // Add quality scores if requested
      if (includeQualityScores) {
        submissions.forEach(submission => {
          const qualityMetrics = calculateContentQualityScore(submission)
          submission.qualityScore = qualityMetrics.overallScore
        })
      }

      let stats = null
      if (includeStats) {
        stats = await getContentSubmissionStats(campaignId)
      }

      return NextResponse.json({
        success: true,
        data: {
          submissions,
          stats
        }
      })
    }

    // Influencers can only see their own submissions
    if (userRole && ['INFLUENCER_SIGNED', 'INFLUENCER_PARTNERED'].includes(userRole)) {
      // Get influencer ID
      const { query } = await import('@/lib/db/connection')
      const influencerResult = await query(
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
      const submissions = await getCampaignContentSubmissions(campaignId)
      const influencerSubmissions = submissions.filter(
        sub => sub.influencer.id === influencerId
      )

      return NextResponse.json({
        success: true,
        data: {
          submissions: influencerSubmissions
        }
      })
    }

    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )

  } catch (_error) {
    console.error('Error fetching campaign content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content submissions' },
      { status: 500 }
    )
  }
}

// PATCH - Update content submission status (approve/reject/request revision)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Only staff members can review content' },
        { status: 403 }
      )
    }

    const _campaignId = params.id
    const { submissionId, status, reviewNotes } = await request.json()

    if (!submissionId || !status) {
      return NextResponse.json(
        { error: 'Submission ID and status are required' },
        { status: 400 }
      )
    }

    if (!['APPROVED', 'REJECTED', 'REVISION_REQUESTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be APPROVED, REJECTED, or REVISION_REQUESTED' },
        { status: 400 }
      )
    }

    // Get reviewer user ID
    const { query } = await import('@/lib/db/connection')
    const userResult = await query(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId]
    )

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const reviewerId = userResult[0]?.id

    // Update the content submission status
    const updatedSubmission = await updateContentSubmissionStatus(
      submissionId,
      status as 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED',
      reviewerId,
      reviewNotes
    )

    // If approved, update campaign_influencer status to CONTENT_SUBMITTED
    if (status === 'APPROVED') {
      await query(
        `UPDATE campaign_influencers 
         SET status = 'CONTENT_SUBMITTED', updated_at = NOW()
         WHERE id = $1`,
        [updatedSubmission.campaignInfluencerId]
      )
    }

    return NextResponse.json({
      success: true,
      message: `Content ${status.toLowerCase()} successfully`,
      data: updatedSubmission
    })

  } catch (_error) {
    console.error('Error updating content submission status:', error)
    return NextResponse.json(
      { error: 'Failed to update content submission status' },
      { status: 500 }
    )
  }
} 