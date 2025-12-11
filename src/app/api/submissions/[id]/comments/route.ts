import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { query } from '@/lib/db/connection'
import { getBrandIdFromUserId } from '@/lib/db/queries/brand-campaigns'
import {
  getSubmissionListById,
  getListComments,
  addComment
} from '@/lib/db/queries/submissions'

// GET - Get all comments for a list
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = await getCurrentUserRole()
    if (!userRole || (userRole !== 'STAFF' && userRole !== 'BRAND')) {
      return NextResponse.json({ error: 'Forbidden - Staff or Brand access required' }, { status: 403 })
    }

    const { id } = await params

    // Verify user has access to this list
    const list = await getSubmissionListById(id)
    if (!list) {
      return NextResponse.json({ error: 'Submission list not found' }, { status: 404 })
    }

    // For brands, verify it's their list
    if (userRole === 'BRAND') {
      let brandId: string
      try {
        brandId = await getBrandIdFromUserId(userId)
      } catch (error) {
        return NextResponse.json({ error: 'Brand profile not found' }, { status: 404 })
      }

      if (list.brandId !== brandId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // For staff, verify they created it
    if (userRole === 'STAFF') {
      const userResult = await query<{ id: string }>(
        'SELECT id FROM users WHERE clerk_id = $1',
        [userId]
      )

      if (userResult.length === 0 || !userResult[0] || userResult[0].id !== list.createdBy) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const comments = await getListComments(id)

    return NextResponse.json({
      success: true,
      data: comments
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST - Add new comment (both staff and brand can post)
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
    if (!userRole || (userRole !== 'STAFF' && userRole !== 'BRAND')) {
      return NextResponse.json({ error: 'Forbidden - Staff or Brand access required' }, { status: 403 })
    }

    const { id } = await params
    const data = await request.json()

    if (!data.comment || data.comment.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Comment text is required' },
        { status: 400 }
      )
    }

    // Verify user has access to this list
    const list = await getSubmissionListById(id)
    if (!list) {
      return NextResponse.json({ error: 'Submission list not found' }, { status: 404 })
    }

    // Get user_id from users table
    const userResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId]
    )

    if (userResult.length === 0 || !userResult[0]) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user_id = userResult[0].id

    // For brands, verify it's their list
    if (userRole === 'BRAND') {
      let brandId: string
      try {
        brandId = await getBrandIdFromUserId(userId)
      } catch (error) {
        return NextResponse.json({ error: 'Brand profile not found' }, { status: 404 })
      }

      if (list.brandId !== brandId) {
        return NextResponse.json({ error: 'Forbidden - This list does not belong to your brand' }, { status: 403 })
      }
    }

    // For staff, verify they created it
    if (userRole === 'STAFF') {
      if (list.createdBy !== user_id) {
        return NextResponse.json({ error: 'Forbidden - You can only comment on your own lists' }, { status: 403 })
      }
    }

    // Add comment
    const comment = await addComment(id, user_id, data.comment.trim())

    return NextResponse.json({
      success: true,
      data: comment
    }, { status: 201 })
  } catch (error) {
    console.error('Error adding comment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add comment' },
      { status: 500 }
    )
  }
}

