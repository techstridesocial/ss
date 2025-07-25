import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { query } from '@/lib/db/connection'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile from database
    const result = await query<{ is_onboarded: boolean }>(
      `SELECT up.is_onboarded 
       FROM user_profiles up 
       JOIN users u ON up.user_id = u.id 
       WHERE u.clerk_id = $1`,
      [userId]
    )

    if (result.length === 0) {
      // No profile found = not onboarded
      return NextResponse.json({ is_onboarded: false })
    }

    return NextResponse.json({ 
      is_onboarded: result[0]?.is_onboarded || false 
    })

  } catch (error) {
    console.error('Error checking influencer onboarding status:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 