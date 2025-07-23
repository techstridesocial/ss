import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { query } from '@/lib/db/connection'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // First check if user exists and is a brand
    const userResult = await query<{ id: string, role: string }>(
      'SELECT id, role FROM users WHERE clerk_id = $1',
      [userId]
    )

    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = userResult[0]
    if (!user || user.role !== 'BRAND') {
      // Non-brand users are considered "onboarded" for this check
      return NextResponse.json({ is_onboarded: true })
    }

    // Get user profile from database
    const result = await query<{ is_onboarded: boolean }>(
      `SELECT up.is_onboarded 
       FROM user_profiles up 
       WHERE up.user_id = $1`,
      [user.id]
    )

    if (result.length === 0) {
      // No profile found = not onboarded
      return NextResponse.json({ is_onboarded: false })
    }

    return NextResponse.json({ 
      is_onboarded: result[0]?.is_onboarded || false 
    })

  } catch (error) {
    console.error('Error checking onboarding status:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 