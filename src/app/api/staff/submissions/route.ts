import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { query } from '@/lib/db/connection'
import {
  getStaffSubmissionLists,
  createSubmissionList
} from '@/lib/db/queries/submissions'

// GET - List all submission lists (staff view)
export async function GET(_request: NextRequest) {
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

    // Get user_id from users table
    const userResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId]
    )

    if (userResult.length === 0 || !userResult[0]) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user_id = userResult[0].id
    const lists = await getStaffSubmissionLists(user_id)

    return NextResponse.json({
      success: true,
      data: lists
    })
  } catch (error) {
    console.error('Error fetching staff submission lists:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submission lists' },
      { status: 500 }
    )
  }
}

// POST - Create new submission list
export async function POST(request: NextRequest) {
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

    // Get user_id from users table
    const userResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId]
    )

    if (userResult.length === 0 || !userResult[0]) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user_id = userResult[0].id
    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.brand_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, brand_id' },
        { status: 400 }
      )
    }

    // Create submission list
    const list = await createSubmissionList({
      name: data.name,
      brandId: data.brand_id,
      createdBy: user_id,
      notes: data.notes || null,
      influencerIds: data.influencer_ids || [],
      initialPricing: data.initial_pricing || {}
    })

    return NextResponse.json({
      success: true,
      data: list
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating submission list:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create submission list' },
      { status: 500 }
    )
  }
}

