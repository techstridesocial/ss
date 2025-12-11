import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { query } from '@/lib/db/connection'
import {
  getSubmissionListById,
  updateSubmissionList,
  deleteSubmissionList
} from '@/lib/db/queries/submissions'

// GET - Get submission list details
export async function GET(
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
    const list = await getSubmissionListById(id)

    if (!list) {
      return NextResponse.json({ error: 'Submission list not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: list
    })
  } catch (error) {
    console.error('Error fetching submission list:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submission list' },
      { status: 500 }
    )
  }
}

// PATCH - Update submission list
export async function PATCH(
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
    const data = await request.json()

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
      return NextResponse.json({ error: 'Forbidden - You can only edit your own lists' }, { status: 403 })
    }

    // Update list
    const updated = await updateSubmissionList(id, {
      name: data.name,
      notes: data.notes,
      status: data.status
    })

    return NextResponse.json({
      success: true,
      data: updated
    })
  } catch (error) {
    console.error('Error updating submission list:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update submission list' },
      { status: 500 }
    )
  }
}

// DELETE - Delete submission list
export async function DELETE(
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
      return NextResponse.json({ error: 'Forbidden - You can only delete your own lists' }, { status: 403 })
    }

    // Only allow deletion of DRAFT lists
    if (list.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Can only delete lists with DRAFT status' },
        { status: 400 }
      )
    }

    await deleteSubmissionList(id)

    return NextResponse.json({
      success: true,
      message: 'Submission list deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting submission list:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete submission list' },
      { status: 500 }
    )
  }
}

