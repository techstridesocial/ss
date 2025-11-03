import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // First check if user exists in users table
    const userResult = await query<{ id: string, role: string }>(
      `SELECT id, role FROM users WHERE clerk_id = $1`,
      [userId]
    )

    if (userResult.length === 0) {
      // User doesn't exist in database yet - needs onboarding
      return NextResponse.json({ is_onboarded: false })
    }

    const user = userResult[0]
    const userRole = user.role

    // For BRAND users, check if they have completed brand onboarding
    if (userRole === 'BRAND') {
      const brandResult = await query<{ id: string }>(
        `SELECT id FROM brands WHERE user_id = $1`,
        [user.id]
      )
      
      // If no brand record exists, they haven't completed onboarding
      if (brandResult.length === 0) {
        return NextResponse.json({ is_onboarded: false })
      }
      
      return NextResponse.json({ is_onboarded: true })
    }

    // For INFLUENCER users, check user_profiles table
    if (userRole === 'INFLUENCER_SIGNED' || userRole === 'INFLUENCER_PARTNERED') {
      const profileResult = await query<{ is_onboarded: boolean }>(
        `SELECT is_onboarded FROM user_profiles WHERE user_id = $1`,
        [user.id]
      )

      if (profileResult.length === 0) {
        return NextResponse.json({ is_onboarded: false })
      }

      return NextResponse.json({ 
        is_onboarded: profileResult[0]?.is_onboarded || false 
      })
    }

    // For STAFF/ADMIN, always considered onboarded
    return NextResponse.json({ is_onboarded: true })

  } catch (error) {
    console.error('Error checking onboarding status:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

