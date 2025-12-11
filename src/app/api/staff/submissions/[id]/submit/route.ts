import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { query } from '@/lib/db/connection'
import {
  getSubmissionListById,
  updateSubmissionList
} from '@/lib/db/queries/submissions'

// POST - Submit list to brand (change status to SUBMITTED)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is staff
    const userRole = await getCurrentUserRole()
    if (!userRole || userRole !== 'STAFF') {
      return NextResponse.json({ error: 'Forbidden - Staff access required' }, { status: 403 })
    }

    const { id } = await params

    // Verify user owns this list
    const list = await getSubmissionListById(id)
    if (!list) {
      return NextResponse.json({ error: 'Submission list not found' }, { status: 404 })
    }

    const userResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId]
    )

    if (userResult.length === 0 || !userResult[0] || userResult[0].id !== list.createdBy) {
      return NextResponse.json({ error: 'Forbidden - You can only submit your own lists' }, { status: 403 })
    }

    // Verify list has influencers
    if (!list.influencers || list.influencers.length === 0) {
      return NextResponse.json(
        { error: 'Cannot submit list without influencers' },
        { status: 400 }
      )
    }

    // Update status to SUBMITTED
    const updated = await updateSubmissionList(id, {
      status: 'SUBMITTED'
    })

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Submission list submitted to brand successfully'
    })
  } catch (error) {
    console.error('Error submitting list:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit list' },
      { status: 500 }
    )
  }
}

