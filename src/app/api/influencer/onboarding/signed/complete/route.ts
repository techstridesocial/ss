import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { query } from '@/lib/db/connection'
import { completeSignedOnboarding } from '@/lib/services/onboarding-completion'

// POST - Mark onboarding as complete
export async function POST(_request: NextRequest) {
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

    // Get or create user_id from users table
    let userResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId]
    )

    let user_id: string

    if (userResult.length === 0 || !userResult[0]) {
      // User doesn't exist, create one automatically
      const clientClerk = await clerkClient()
      const clerkUser = await clientClerk.users.getUser(userId)
      const userEmail = clerkUser.emailAddresses[0]?.emailAddress || `user_${userId}@example.com`
      const userRoleFromMeta = (clerkUser.publicMetadata?.role as string) || 'INFLUENCER_SIGNED'
      
      const newUserResult = await query<{ id: string }>(
        `INSERT INTO users (clerk_id, email, status, role) 
         VALUES ($1, $2, 'ACTIVE', $3) 
         RETURNING id`,
        [userId, userEmail, userRoleFromMeta]
      )
      
      if (newUserResult.length === 0 || !newUserResult[0]) {
        throw new Error('Failed to create user record')
      }
      
      user_id = newUserResult[0].id
    } else {
      user_id = userResult[0].id
    }

    // Complete onboarding in a single atomic transaction
    await completeSignedOnboarding(userId, user_id)

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully'
    })
  } catch (error: any) {
    console.error('Error completing onboarding:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error?.message || 'Failed to complete onboarding'
      },
      { status: 500 }
    )
  }
}
