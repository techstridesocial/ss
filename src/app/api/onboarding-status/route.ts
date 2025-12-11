import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { query } from '@/lib/db/connection'

// OPTIMIZED: Single query with conditional JOINs based on role
export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Single optimized query that checks user, role, and onboarding status
    const result = await query<{ 
      id: string, 
      role: string, 
      brand_id: string | null,
      is_onboarded: boolean | null 
    }>(`
      SELECT 
        u.id,
        u.role,
        b.id as brand_id,
        up.is_onboarded
      FROM users u
      LEFT JOIN brands b ON b.user_id = u.id AND u.role = 'BRAND'
      LEFT JOIN user_profiles up ON up.user_id = u.id 
        AND (u.role = 'INFLUENCER_SIGNED' OR u.role = 'INFLUENCER_PARTNERED')
      WHERE u.clerk_id = $1
      LIMIT 1
    `, [userId])

    if (result.length === 0) {
      // User doesn't exist in database yet - needs onboarding
      return NextResponse.json({ is_onboarded: false })
    }

    const user = result[0]
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Determine onboarding status based on role
    if (user.role === 'BRAND') {
      return NextResponse.json({ 
        is_onboarded: user.brand_id !== null 
      })
    }

    if (user.role === 'INFLUENCER_SIGNED' || user.role === 'INFLUENCER_PARTNERED') {
      return NextResponse.json({ 
        is_onboarded: user.is_onboarded === true 
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

