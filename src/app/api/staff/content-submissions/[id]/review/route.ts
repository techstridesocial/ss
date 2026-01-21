import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { updateContentSubmissionStatus } from '@/lib/db/queries/content-submissions'
import { query } from '@/lib/db/connection'
import { sanitizeString } from '@/lib/security/sanitize'
import { createNotification } from '@/lib/services/notifications'

// POST - Review a content submission (approve/reject/request revision)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { action, notes } = body

    // Validate action
    const validActions = ['approve', 'reject', 'revision']
    if (!action || !validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be one of: approve, reject, revision' },
        { status: 400 }
      )
    }

    // Require notes for rejection and revision request
    if ((action === 'reject' || action === 'revision') && !notes?.trim()) {
      return NextResponse.json(
        { error: `Notes are required when ${action === 'reject' ? 'rejecting' : 'requesting revision'}` },
        { status: 400 }
      )
    }

    // Get staff user ID
    const staffResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId]
    )
    const staffId = staffResult[0]?.id

    if (!staffId) {
      return NextResponse.json({ error: 'Staff user not found' }, { status: 404 })
    }

    // Map action to status
    const statusMap: Record<string, 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED'> = {
      approve: 'APPROVED',
      reject: 'REJECTED',
      revision: 'REVISION_REQUESTED'
    }

    const status = statusMap[action]
    const sanitizedNotes = notes ? sanitizeString(notes) : undefined

    if (!status) {
      return NextResponse.json(
        { error: 'Invalid action. Must be approve, reject, or revision' },
        { status: 400 }
      )
    }

    // Update the submission
    const updatedSubmission = await updateContentSubmissionStatus(
      id,
      status,
      staffId,
      sanitizedNotes
    )

    // Get influencer user ID for notification
    const influencerResult = await query<{ user_id: string; campaign_name: string }>(
      `SELECT u.id as user_id, c.name as campaign_name
       FROM campaign_content_submissions ccs
       JOIN campaign_influencers ci ON ccs.campaign_influencer_id = ci.id
       JOIN influencers i ON ci.influencer_id = i.id
       JOIN users u ON i.user_id = u.id
       JOIN campaigns c ON ci.campaign_id = c.id
       WHERE ccs.id = $1`,
      [id]
    )

    if (influencerResult[0]) {
      const { user_id, campaign_name } = influencerResult[0]
      
      // Send notification to influencer
      const notificationTitle = action === 'approve' 
        ? 'Content Approved!' 
        : action === 'reject' 
        ? 'Content Rejected'
        : 'Revision Requested'
      
      const notificationMessage = action === 'approve'
        ? `Your content for "${campaign_name}" has been approved.`
        : action === 'reject'
        ? `Your content for "${campaign_name}" has been rejected. ${sanitizedNotes || ''}`
        : `A revision has been requested for your content in "${campaign_name}". ${sanitizedNotes || ''}`

      try {
        await createNotification({
          recipientId: user_id,
          type: action === 'approve' ? 'CONTENT_APPROVED' : action === 'reject' ? 'CONTENT_REJECTED' : 'REVISION_REQUESTED',
          title: notificationTitle,
          message: notificationMessage,
          relatedId: id,
          relatedType: 'content_submission'
        })
      } catch (notifError) {
        console.error('Failed to send notification:', notifError)
        // Don't fail the request if notification fails
      }
    }

    return NextResponse.json({
      success: true,
      submission: updatedSubmission,
      message: `Content ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'revision requested'} successfully`
    })
  } catch (error) {
    console.error('Error reviewing content submission:', error)
    return NextResponse.json(
      { error: 'Failed to review content submission' },
      { status: 500 }
    )
  }
}
