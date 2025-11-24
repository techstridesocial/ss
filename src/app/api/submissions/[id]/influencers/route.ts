import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { query } from '@/lib/db/connection'
import {
  getSubmissionListById,
  addInfluencerToList,
  removeInfluencerFromList,
  updateInfluencerInList
} from '@/lib/db/queries/submissions'

// POST - Add influencer to list
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
    const data = await request.json()

    if (!data.influencer_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: influencer_id' },
        { status: 400 }
      )
    }

    // Verify user owns this list
    const list = await getSubmissionListById(id)
    if (!list) {
      return NextResponse.json({ error: 'Submission list not found' }, { status: 404 })
    }

    const userResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId]
    )

    if (userResult.length === 0 || userResult[0].id !== list.createdBy) {
      return NextResponse.json({ error: 'Forbidden - You can only edit your own lists' }, { status: 403 })
    }

    // Only allow editing DRAFT lists
    if (list.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Can only edit lists with DRAFT status' },
        { status: 400 }
      )
    }

    const influencer = await addInfluencerToList(
      id,
      data.influencer_id,
      data.initial_price,
      data.notes
    )

    return NextResponse.json({
      success: true,
      data: influencer
    })
  } catch (error) {
    console.error('Error adding influencer to list:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add influencer to list' },
      { status: 500 }
    )
  }
}

// DELETE - Remove influencer from list
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
    const { searchParams } = new URL(request.url)
    const influencerId = searchParams.get('influencer_id')

    if (!influencerId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: influencer_id' },
        { status: 400 }
      )
    }

    // Verify user owns this list
    const list = await getSubmissionListById(id)
    if (!list) {
      return NextResponse.json({ error: 'Submission list not found' }, { status: 404 })
    }

    const userResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId]
    )

    if (userResult.length === 0 || userResult[0].id !== list.createdBy) {
      return NextResponse.json({ error: 'Forbidden - You can only edit your own lists' }, { status: 403 })
    }

    // Only allow editing DRAFT lists
    if (list.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Can only edit lists with DRAFT status' },
        { status: 400 }
      )
    }

    await removeInfluencerFromList(id, influencerId)

    return NextResponse.json({
      success: true,
      message: 'Influencer removed from list successfully'
    })
  } catch (error) {
    console.error('Error removing influencer from list:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove influencer from list' },
      { status: 500 }
    )
  }
}

// PATCH - Update influencer pricing/notes
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

    if (!data.influencer_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: influencer_id' },
        { status: 400 }
      )
    }

    // Verify user owns this list
    const list = await getSubmissionListById(id)
    if (!list) {
      return NextResponse.json({ error: 'Submission list not found' }, { status: 404 })
    }

    const userResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId]
    )

    if (userResult.length === 0 || userResult[0].id !== list.createdBy) {
      return NextResponse.json({ error: 'Forbidden - You can only edit your own lists' }, { status: 403 })
    }

    // Only allow editing DRAFT lists
    if (list.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Can only edit lists with DRAFT status' },
        { status: 400 }
      )
    }

    const influencer = await updateInfluencerInList(
      id,
      data.influencer_id,
      {
        initialPrice: data.initial_price,
        notes: data.notes
      }
    )

    return NextResponse.json({
      success: true,
      data: influencer
    })
  } catch (error) {
    console.error('Error updating influencer in list:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update influencer in list' },
      { status: 500 }
    )
  }
}

