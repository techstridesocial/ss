import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { query } from '@/lib/db/connection'
import {
  getOnboardingProgress,
  completeOnboardingStep
} from '@/lib/db/queries/talent-onboarding'

// GET - Fetch onboarding progress
export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a signed influencer
    const userRole = await getCurrentUserRole()
    if (!userRole || userRole !== 'INFLUENCER_SIGNED') {
      return NextResponse.json({ error: 'Forbidden - Signed influencer access required' }, { status: 403 })
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
    const progress = await getOnboardingProgress(user_id)

    return NextResponse.json({
      success: true,
      data: progress
    })
  } catch (error) {
    console.error('Error fetching onboarding progress:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch onboarding progress' },
      { status: 500 }
    )
  }
}

// POST - Save step completion
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a signed influencer
    const userRole = await getCurrentUserRole()
    if (!userRole || userRole !== 'INFLUENCER_SIGNED') {
      return NextResponse.json({ error: 'Forbidden - Signed influencer access required' }, { status: 403 })
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
    if (!data.step_key) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: step_key' },
        { status: 400 }
      )
    }

    // Complete the step
    console.log('Saving onboarding step:', {
      user_id,
      step_key: data.step_key,
      data: data.data || {}
    })
    
    const step = await completeOnboardingStep(
      user_id,
      data.step_key,
      data.data || {}
    )

    console.log('Step saved successfully:', {
      stepKey: step.stepKey,
      completed: step.completed,
      completedAt: step.completedAt
    })

    return NextResponse.json({
      success: true,
      data: step
    })
  } catch (error) {
    console.error('Error completing onboarding step:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to complete onboarding step' },
      { status: 500 }
    )
  }
}

// PATCH - Update step data
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a signed influencer
    const userRole = await getCurrentUserRole()
    if (!userRole || userRole !== 'INFLUENCER_SIGNED') {
      return NextResponse.json({ error: 'Forbidden - Signed influencer access required' }, { status: 403 })
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
    if (!data.step_key) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: step_key' },
        { status: 400 }
      )
    }

    // Update step data (without marking as complete)
    const result = await query(`
      UPDATE talent_onboarding_steps
      SET data = $1, updated_at = NOW()
      WHERE user_id = $2 AND step_key = $3
      RETURNING *
    `, [JSON.stringify(data.data || {}), user_id, data.step_key])

    if (result.length === 0) {
      // Create if doesn't exist
      const insertResult = await query(`
        INSERT INTO talent_onboarding_steps (user_id, step_key, completed, data)
        VALUES ($1, $2, false, $3)
        RETURNING *
      `, [user_id, data.step_key, JSON.stringify(data.data || {})])

      return NextResponse.json({
        success: true,
        data: insertResult[0]
      })
    }

    return NextResponse.json({
      success: true,
      data: result[0]
    })
  } catch (error) {
    console.error('Error updating onboarding step:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update onboarding step' },
      { status: 500 }
    )
  }
}

