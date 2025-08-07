import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { addInfluencerToCampaign, updateCampaignInfluencerStatus } from '@/lib/db/queries/campaigns'
import { 
  getCampaignInfluencersWithDetails, 
  assignInfluencerToCampaign as assignInfluencer,
  updateCampaignInfluencerStatus as updateStatus,
  updateProductShipmentStatus,
  updateContentPostingStatus,
  updatePaymentReleaseStatus,
  getCampaignStatistics,
  getCampaignTimeline
} from '@/lib/db/queries/campaign-influencers'

interface RouteParams {
  params: {
    id: string
  }
}

// GET - Get campaign influencers with enhanced details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get('stats') === 'true'
    const includeTimeline = searchParams.get('timeline') === 'true'

    const campaignId = params.id

    // Get influencers with details
    const influencers = await getCampaignInfluencersWithDetails(campaignId)

    // Get additional data if requested
    let stats = null
    let timeline = null

    if (includeStats) {
      stats = await getCampaignStatistics(campaignId)
    }

    if (includeTimeline) {
      timeline = await getCampaignTimeline(campaignId)
    }

    return NextResponse.json({
      success: true,
      data: {
        influencers,
        stats,
        timeline
      }
    })

  } catch (error) {
    console.error('Error fetching campaign influencers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaign influencers' },
      { status: 500 }
    )
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

    // Add influencer to campaign with enhanced tracking
    const campaignInfluencer = await assignInfluencer(
      campaignId,
      influencerId,
      rate,
      data.deadline ? new Date(data.deadline) : undefined,
      notes
    )

    // Update the status if it's not pending (default)
    if (status !== 'pending') {
      await updateStatus(
        campaignId,
        influencerId,
        status as any,
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

// PATCH - Update product shipment status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: campaignId } = params
    const data = await request.json()
    const { action, influencerId, ...actionData } = data

    if (!influencerId) {
      return NextResponse.json(
        { error: 'Influencer ID is required' },
        { status: 400 }
      )
    }

    let success = false
    let message = ''

    switch (action) {
      case 'ship_product':
        success = await updateProductShipmentStatus(
          campaignId,
          influencerId,
          actionData.shipped,
          actionData.trackingNumber
        )
        message = `Product shipment status updated`
        break

      case 'post_content':
        success = await updateContentPostingStatus(
          campaignId,
          influencerId,
          actionData.posted,
          actionData.postUrl
        )
        message = `Content posting status updated`
        break

      case 'release_payment':
        success = await updatePaymentReleaseStatus(
          campaignId,
          influencerId,
          actionData.released
        )
        message = `Payment release status updated`
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update status' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message
    })

  } catch (error) {
    console.error('Error updating campaign influencer tracking:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update tracking status' },
      { status: 500 }
    )
  }
} 