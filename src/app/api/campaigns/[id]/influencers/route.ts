import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { addInfluencerToCampaign, updateCampaignInfluencerStatus } from '@/lib/db/queries/campaigns'

interface RouteParams {
  params: {
    id: string
  }
}

// POST - Add influencer to campaign (when staff marks them as accepted)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate
    await auth.protect()
    const userRole = await getCurrentUserRole()

    // Verify user is staff or admin
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Only staff members can assign influencers to campaigns' },
        { status: 403 }
      )
    }

    const { id: campaignId } = params
    const data = await request.json()

    const { influencerId, status, rate, notes } = data

    if (!influencerId) {
      return NextResponse.json(
        { error: 'Influencer ID is required' },
        { status: 400 }
      )
    }

    if (!status || !['accepted', 'declined', 'pending'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required (accepted, declined, pending)' },
        { status: 400 }
      )
    }

    // Add influencer to campaign with the specified status
    const campaignInfluencer = await addInfluencerToCampaign(
      campaignId,
      influencerId,
      rate
    )

    // Update the status if it's not pending (default)
    if (status !== 'pending') {
      await updateCampaignInfluencerStatus(
        campaignId,
        influencerId,
        status,
        notes
      )
    }

    return NextResponse.json({
      success: true,
      message: `Influencer ${status} for campaign successfully`,
      campaignInfluencer: {
        ...campaignInfluencer,
        status,
        notes,
        acceptedAt: status === 'accepted' ? new Date().toISOString() : null,
        declinedAt: status === 'declined' ? new Date().toISOString() : null
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error adding influencer to campaign:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add influencer to campaign' },
      { status: 500 }
    )
  }
}

// PUT - Update influencer status in campaign
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate
    await auth.protect()
    const userRole = await getCurrentUserRole()

    // Verify user is staff or admin
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Only staff members can update campaign assignments' },
        { status: 403 }
      )
    }

    const { id: campaignId } = params
    const data = await request.json()

    const { influencerId, status, notes } = data

    if (!influencerId || !status) {
      return NextResponse.json(
        { error: 'Influencer ID and status are required' },
        { status: 400 }
      )
    }

    // Update the influencer's status in the campaign
    const updatedCampaignInfluencer = await updateCampaignInfluencerStatus(
      campaignId,
      influencerId,
      status,
      notes
    )

    if (!updatedCampaignInfluencer) {
      return NextResponse.json(
        { error: 'Campaign influencer assignment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Influencer status updated to ${status}`,
      campaignInfluencer: updatedCampaignInfluencer
    })

  } catch (error) {
    console.error('Error updating campaign influencer status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update influencer status' },
      { status: 500 }
    )
  }
} 