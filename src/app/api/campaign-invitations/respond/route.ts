import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    await auth.protect()
    const userRole = await getCurrentUserRole()

    // Verify user is an influencer
    if (!userRole || !['INFLUENCER_SIGNED', 'INFLUENCER_PARTNERED'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Only influencers can respond to campaign invitations' },
        { status: 403 }
      )
    }

    const { invitationId, response, declineReason } = await request.json()

    if (!invitationId || !response || !['accept', 'decline'].includes(response)) {
      return NextResponse.json(
        { error: 'Invalid invitation response' },
        { status: 400 }
      )
    }

    if (response === 'decline' && !declineReason) {
      return NextResponse.json(
        { error: 'Decline reason is required when declining' },
        { status: 400 }
      )
    }

    // In a real implementation, this would:
    // 1. Verify the invitation belongs to the current user
    // 2. Update campaign_invitations table
    // 3. If accepted, create campaign_influencers record
    // 4. Send notification to staff
    // 5. Update campaign statistics

    // Mock response
    const mockResponse = {
      invitation_id: invitationId,
      status: response === 'accept' ? 'ACCEPTED' : 'DECLINED',
      responded_at: new Date().toISOString(),
      decline_reason: response === 'decline' ? declineReason : null
    }

    return NextResponse.json({
      success: true,
      invitation: mockResponse,
      message: `Campaign invitation ${response}ed successfully`
    })

  } catch (error) {
    console.error('Error responding to campaign invitation:', error)
    return NextResponse.json(
      { error: 'Failed to respond to invitation' },
      { status: 500 }
    )
  }
} 