import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { query } from '@/lib/db/connection'
import { UserRole } from '@/lib/auth/types'

/**
 * Update user role in both database and Clerk metadata
 * Staff/Admin only
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: currentUserId } = await auth()
    
    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify current user is staff or admin
    const currentUserRole = await getCurrentUserRole()
    if (!currentUserRole || (currentUserRole !== 'STAFF' && currentUserRole !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden - Staff access required' }, { status: 403 })
    }

    const { id: userId } = await params
    const { role } = await request.json()

    // Validate role
    const validRoles: UserRole[] = [UserRole.BRAND, UserRole.INFLUENCER_SIGNED, UserRole.INFLUENCER_PARTNERED, UserRole.STAFF, UserRole.ADMIN]
    if (!role || !validRoles.includes(role as UserRole)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      )
    }

    // Get user's Clerk ID from database
    const userResult = await query<{ clerk_id: string }>(
      'SELECT clerk_id FROM users WHERE id = $1',
      [userId]
    )

    if (userResult.length === 0 || !userResult[0]?.clerk_id) {
      return NextResponse.json({ error: 'User not found or no Clerk ID' }, { status: 404 })
    }

    const clerkId = userResult[0].clerk_id

    // Update database
    await query(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2',
      [role, userId]
    )

    // Update Clerk metadata
    const client = await clerkClient()
    const clerkUser = await client.users.getUser(clerkId)
    
    await client.users.updateUserMetadata(clerkId, {
      publicMetadata: {
        ...clerkUser.publicMetadata,
        role: role
      }
    })

    return NextResponse.json({
      success: true,
      message: 'User role updated successfully in both database and Clerk',
      data: { userId, role }
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user role' },
      { status: 500 }
    )
  }
}

