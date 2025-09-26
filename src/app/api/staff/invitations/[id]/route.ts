import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { clerkClient } from '@clerk/nextjs/server'
import { updateInvitationStatus, getInvitationByClerkId } from '@/lib/db/queries/invitations'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and check permissions
    await auth.protect()
    const userRole = await getCurrentUserRole()

    // Only staff and admin can cancel invitations
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to cancel invitations' },
        { status: 403 }
      )
    }

    const invitationId = params.id

    if (!invitationId) {
      return NextResponse.json(
        { error: 'Invitation ID is required' },
        { status: 400 }
      )
    }

    // Cancel the invitation
    await clerkClient().invitations.revokeInvitation(invitationId)

    // Update status in our database
    const dbResult = await updateInvitationStatus(invitationId, 'DECLINED')
    if (!dbResult.success) {
      console.error('Failed to update invitation status in database:', dbResult.error)
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation cancelled successfully'
    })

  } catch (error) {
    console.error('Error cancelling invitation:', error)
    return NextResponse.json(
      { error: 'Failed to cancel invitation' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and check permissions
    await auth.protect()
    const userRole = await getCurrentUserRole()

    // Only staff and admin can resend invitations
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to resend invitations' },
        { status: 403 }
      )
    }

    const invitationId = params.id

    if (!invitationId) {
      return NextResponse.json(
        { error: 'Invitation ID is required' },
        { status: 400 }
      )
    }

    // Get the original invitation details from our database
    const originalInvitation = await getInvitationByClerkId(invitationId)
    if (!originalInvitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Revoke the old invitation
    await clerkClient().invitations.revokeInvitation(invitationId)
    
    // Create a new invitation with the same details
    const newInvitation = await clerkClient().invitations.createInvitation({
      emailAddress: originalInvitation.email,
      publicMetadata: {
        role: originalInvitation.role,
        invitedBy: originalInvitation.invited_by,
        invitedAt: new Date().toISOString(),
        firstName: originalInvitation.first_name,
        lastName: originalInvitation.last_name
      }
    })

    // Update our database record with the new invitation ID
    const dbResult = await updateInvitationStatus(invitationId, 'DECLINED')
    if (!dbResult.success) {
      console.error('Failed to update old invitation status:', dbResult.error)
    }

    // Create new database record for the resent invitation
    const { createInvitation } = await import('@/lib/db/queries/invitations')
    const newDbResult = await createInvitation(
      newInvitation.id,
      originalInvitation.email,
      originalInvitation.role,
      originalInvitation.invited_by || 'system',
      originalInvitation.invited_by_email || 'system@stridesocial.com',
      originalInvitation.first_name,
      originalInvitation.last_name,
      newInvitation.expiresAt ? new Date(newInvitation.expiresAt) : undefined
    )

    if (!newDbResult.success) {
      console.error('Failed to create new invitation record:', newDbResult.error)
    }

    return NextResponse.json({
      success: true,
      invitation: {
        id: newInvitation.id,
        email: newInvitation.emailAddress,
        role: newInvitation.publicMetadata?.role,
        status: newInvitation.status,
        createdAt: newInvitation.createdAt,
        expiresAt: newInvitation.expiresAt
      },
      message: 'Invitation resent successfully'
    })

  } catch (error) {
    console.error('Error resending invitation:', error)
    return NextResponse.json(
      { error: 'Failed to resend invitation' },
      { status: 500 }
    )
  }
}
