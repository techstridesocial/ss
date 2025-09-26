import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { clerkClient } from '@clerk/nextjs/server'
import { UserRole } from '@/types/database'
import { createInvitation, getInvitations } from '@/lib/db/queries/invitations'
import { query } from '@/lib/db/connection'

export async function POST(request: NextRequest) {
  try {
    // Authenticate and check permissions
    await auth.protect()
    const userRole = await getCurrentUserRole()

    // Only staff and admin can send invitations
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to send invitations' },
        { status: 403 }
      )
    }

    const { email, role, firstName, lastName } = await request.json()

    // Validate required fields
    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles: UserRole[] = ['BRAND', 'INFLUENCER_SIGNED', 'INFLUENCER_PARTNERED', 'STAFF', 'ADMIN']
    if (!validRoles.includes(role as UserRole)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      )
    }

    // Check if user already exists
    try {
      const existingUsers = await clerkClient().users.getUserList({
        emailAddress: [email]
      })

      if (existingUsers.data.length > 0) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        )
      }
    } catch (error) {
      // If error is not "user not found", re-throw it
      if (!error.message?.includes('not found')) {
        throw error
      }
    }

    // Get current user info for tracking
    const currentUser = await auth()
    const currentUserEmail = currentUser.userId ? 
      (await clerkClient().users.getUser(currentUser.userId)).emailAddresses[0]?.emailAddress : 
      'system@stridesocial.com'

    // Create invitation with role metadata
    const invitation = await clerkClient().invitations.createInvitation({
      emailAddress: email,
      publicMetadata: {
        role: role,
        invitedBy: userRole,
        invitedAt: new Date().toISOString()
      },
      ...(firstName && lastName && {
        publicMetadata: {
          role: role,
          invitedBy: userRole,
          invitedAt: new Date().toISOString(),
          firstName: firstName,
          lastName: lastName
        }
      })
    })

    // Store invitation in our database for tracking
    const dbResult = await createInvitation(
      invitation.id,
      email,
      role,
      currentUser.userId || 'system',
      currentUserEmail,
      firstName,
      lastName,
      invitation.expiresAt ? new Date(invitation.expiresAt) : undefined
    )

    if (!dbResult.success) {
      console.error('Failed to store invitation in database:', dbResult.error)
      // Don't fail the request, but log the error
    }

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.emailAddress,
        role: role,
        status: invitation.status,
        createdAt: invitation.createdAt,
        expiresAt: invitation.expiresAt
      },
      message: `Invitation sent to ${email} with ${role} role`
    })

  } catch (error) {
    console.error('Error creating invitation:', error)
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate and check permissions
    await auth.protect()
    const userRole = await getCurrentUserRole()

    // Only staff and admin can view invitations
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to view invitations' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const role = searchParams.get('role')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get invitations from database
    const invitations = await getInvitations({
      status: status || undefined,
      role: role || undefined,
      limit,
      offset
    })

    // Transform the data to match expected format
    const transformedInvitations = invitations.map(invitation => ({
      id: invitation.clerk_invitation_id,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status.toLowerCase(),
      createdAt: invitation.invited_at.toISOString(),
      expiresAt: invitation.expires_at?.toISOString(),
      acceptedAt: invitation.accepted_at?.toISOString(),
      invitedBy: invitation.invited_by_email,
      invitedAt: invitation.invited_at.toISOString(),
      firstName: invitation.first_name,
      lastName: invitation.last_name
    }))

    return NextResponse.json({
      success: true,
      invitations: transformedInvitations,
      total: invitations.length
    })

  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    )
  }
}
