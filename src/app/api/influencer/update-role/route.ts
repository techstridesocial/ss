import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { query } from '@/lib/db/connection'

/**
 * Update influencer role in Clerk metadata and database
 * Called after user selects if they're signed or partnered
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { role } = await request.json()

    // Validate role
    if (!role || (role !== 'INFLUENCER_SIGNED' && role !== 'INFLUENCER_PARTNERED')) {
      return NextResponse.json(
        { error: 'Invalid role. Must be INFLUENCER_SIGNED or INFLUENCER_PARTNERED' },
        { status: 400 }
      )
    }

    // Update Clerk metadata
    const client = await clerkClient()
    const clerkUser = await client.users.getUser(userId)
    
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...clerkUser.publicMetadata,
        role: role
      }
    })

    // Update database if user exists
    const userResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId]
    )

    if (userResult.length > 0 && userResult[0]) {
      await query(
        'UPDATE users SET role = $1, updated_at = NOW() WHERE clerk_id = $2',
        [role, userId]
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Role updated successfully',
      role
    })
  } catch (error) {
    console.error('Error updating role:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update role' },
      { status: 500 }
    )
  }
}

