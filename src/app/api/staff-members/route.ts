import { auth } from '@clerk/nextjs/server'
import { clerkClient as _clerkClient } from '@clerk/nextjs/server'
import { NextRequest as _NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated and has proper permissions
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user to check if they have staff/admin permissions
    const currentUser = await (await clerkClient()).users.getUser(userId)
    const userRole = currentUser.publicMetadata?.role as string
    
    // Only allow staff and admin users to fetch staff members
    if (!['staff', 'admin'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all users with staff or admin roles
    const staffUsers = await (await clerkClient()).users.getUserList({
      limit: 100,
      // Note: Clerk doesn't support filtering by metadata in the API call
      // so we'll need to filter after fetching
    })

    // Filter users by role and format for dropdown
    const staffMembers = [
      { value: '', label: 'Unassigned' }
    ]

    staffUsers.data.forEach((user: any) => {
      const role = user.publicMetadata?.role as string
      const department = user.publicMetadata?.department as string
      
      if (['staff', 'admin'].includes(role)) {
        const displayName = `${user.firstName} ${user.lastName}`.trim()
        const roleTitle = department || 'Staff Member'
        
        staffMembers.push({
          value: user.id,
          label: `${displayName} - ${roleTitle}`
        })
      }
    })

    return NextResponse.json(staffMembers)
    
  } catch (_error) {
    console.error('Error fetching staff members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff members' }, 
      { status: 500 }
    )
  }
} 