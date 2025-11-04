import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { updateCampaignInvitationResponse, addInfluencerToCampaign } from '@/lib/db/queries/campaigns'

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

    const { invitationId, response, message } = await request.json()

    if (!invitationId || !response || !['accepted', 'declined'].includes(response)) {
      return NextResponse.json(
        { error: 'Invalid invitation response' },
        { status: 400 }
      )
    }

    // Update the invitation response
    const updatedInvitation = await updateCampaignInvitationResponse(
      invitationId, 
      response as 'accepted' | 'declined',
      message
    )

    if (!updatedInvitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // If accepted, add influencer to campaign
    if (response === 'accepted') {
      await addInfluencerToCampaign(
        updatedInvitation.campaignId,
        updatedInvitation.influencerId
      )
    }

    return NextResponse.json({
      success: true,
      invitation: updatedInvitation,
      message: `Campaign invitation ${response} successfully`
    })

  } catch (error) {
    console.error('Error responding to campaign invitation:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to respond to invitation' },
      { status: 500 }
    )
  }
} 