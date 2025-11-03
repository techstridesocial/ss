import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { UserRole } from '@/types/database'
import { createInvitation, getInvitations } from '@/lib/db/queries/invitations'
import { query } from '@/lib/db/connection'
import { randomBytes as _randomBytes } from 'crypto'

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

    // Check if user already exists in our database
    const existingUser = await query(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    )

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Check if there's already a pending invitation for this email
    const existingInvitation = await query(
      `SELECT id FROM user_invitations 
       WHERE email = $1 AND status = 'INVITED'`,
      [email]
    )

    if (existingInvitation.length > 0) {
      return NextResponse.json(
        { error: 'A pending invitation already exists for this email' },
        { status: 409 }
      )
    }

    // Get current user info for tracking
    const currentUser = await auth()
    const currentUserEmail = currentUser.userId ? 
      (await query(`SELECT email FROM users WHERE clerk_id = $1`, [currentUser.userId]))[0]?.email : 
      'system@stridesocial.com'

    // Create Clerk invitation with custom redirect URL
    const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/invitation/accept`
    
    // Create invitation using Clerk REST API (2025 latest format)
    const response = await fetch('https://api.clerk.dev/v1/invitations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
        public_metadata: {
          role: role,
          invitedBy: userRole,
          invitedAt: new Date().toISOString(),
          ...(firstName && lastName && {
            firstName: firstName,
            lastName: lastName
          })
        },
        redirect_url: invitationUrl,
        // Add required fields for Clerk (2025 format)
        ...(firstName && { first_name: firstName }),
        ...(lastName && { last_name: lastName }),
        // Ensure email is sent by explicitly setting notify flag
        notify: true
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Clerk API error response:', errorText)
      
      // Handle duplicate invitation error gracefully
      if (response.status === 400) {
        try {
          const errorData = JSON.parse(errorText)
          if (errorData.errors?.[0]?.code === 'duplicate_record') {
            return NextResponse.json({
              success: false,
              error: 'A pending invitation already exists for this email address',
              message: 'Please wait for the current invitation to be accepted or expired before sending a new one'
            }, { status: 409 })
          }
        } catch (parseError) {
          // If we can't parse the error, fall through to the generic error
        }
      }
      
      throw new Error(`Clerk API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const clerkInvitation = await response.json()
    console.log('✅ Clerk invitation created successfully:', {
      id: clerkInvitation.id,
      email: clerkInvitation.emailAddress,
      status: clerkInvitation.status,
      expiresAt: clerkInvitation.expiresAt,
      emailSent: clerkInvitation.emailSent || 'unknown'
    })
    console.log('📧 Email should be sent to:', email)
    console.log('🔗 Invitation URL:', invitationUrl)
    console.log('📋 Full invitation response:', JSON.stringify(clerkInvitation, null, 2))

    // Store invitation in our database for tracking
    const dbResult = await createInvitation(
      clerkInvitation.id,
      email,
      role,
      currentUser.userId || null, // Use null instead of 'system' for UUID field
      currentUserEmail,
      firstName,
      lastName,
      clerkInvitation.expiresAt ? new Date(clerkInvitation.expiresAt) : undefined
    )

    if (!dbResult.success) {
      console.error('Failed to store invitation in database:', dbResult.error)
      // Don't fail the request, but log the error
      console.log('Clerk invitation created but database storage failed')
    } else {
      console.log('✅ Invitation stored in database successfully')
    }

    return NextResponse.json({
      success: true,
      invitation: {
        id: clerkInvitation.id,
        email: clerkInvitation.emailAddress,
        role: role,
        status: clerkInvitation.status,
        createdAt: clerkInvitation.createdAt,
        expiresAt: clerkInvitation.expiresAt,
        invitationUrl: invitationUrl
      },
      message: `Invitation sent to ${email} with ${role} role via Clerk email system`
    })

  } catch (_error) {
    console.error('Error creating invitation:', error)
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching invitations - checking authentication...')
    
    // Authenticate and check permissions
    await auth.protect()
    console.log('✅ Authentication passed')
    
    const userRole = await getCurrentUserRole()
    console.log('👤 User role:', userRole)

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

  } catch (_error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    )
  }
}
