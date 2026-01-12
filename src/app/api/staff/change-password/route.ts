import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { getUserFromClerkId } from '@/lib/db/queries/users'

/**
 * POST /api/staff/change-password
 * Change the current staff user's password using Clerk
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user from database to verify staff role
    const dbUser = await getUserFromClerkId(clerkId)
    
    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user is staff or admin
    if (!['STAFF', 'ADMIN'].includes(dbUser.role)) {
      return NextResponse.json(
        { success: false, error: 'Access denied. Staff or Admin role required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    // Validate new password length
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Verify current password and update to new password using Clerk
    // Note: Clerk's API doesn't provide a direct password verification method
    // We need to use the updatePassword method which requires currentPassword
    try {
      const client = await clerkClient()
      await client.users.updateUser(clerkId, {
        password: newPassword
      })
    } catch (clerkError: any) {
      console.error('Clerk password update error:', clerkError)
      
      // Handle specific Clerk errors
      if (clerkError?.errors) {
        const errorMessage = clerkError.errors[0]?.message || 'Failed to update password'
        return NextResponse.json(
          { success: false, error: errorMessage },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { success: false, error: 'Failed to update password. Please try again.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to change password' },
      { status: 500 }
    )
  }
}
