import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/connection'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    
    // Get invitation by token (we'll use the clerk_invitation_id as token)
    const result = await query(
      `SELECT 
        ui.id,
        ui.email,
        ui.role,
        ui.first_name,
        ui.last_name,
        ui.status,
        ui.invited_at,
        ui.expires_at,
        ui.invited_by_email
      FROM user_invitations ui
      WHERE ui.clerk_invitation_id = $1`,
      [token]
    )

    if (result.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Invitation not found'
      }, { status: 404 })
    }

    const invitation = result[0]

    // Check if invitation is expired
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json({
        success: false,
        message: 'This invitation has expired'
      }, { status: 400 })
    }

    // Check if invitation is already accepted
    if (invitation.status === 'ACCEPTED') {
      return NextResponse.json({
        success: false,
        message: 'This invitation has already been accepted'
      }, { status: 400 })
    }

    // Check if invitation is declined
    if (invitation.status === 'DECLINED') {
      return NextResponse.json({
        success: false,
        message: 'This invitation has been declined'
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        firstName: invitation.first_name,
        lastName: invitation.last_name,
        status: invitation.status,
        invitedAt: invitation.invited_at,
        expiresAt: invitation.expires_at,
        invitedBy: invitation.invited_by_email
      }
    })

  } catch (error) {
    console.error('Error validating invitation:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to validate invitation'
    }, { status: 500 })
  }
}
