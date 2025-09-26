import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { query } from '@/lib/db/connection'
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

// Mock data for development
const MOCK_CAMPAIGN_INFLUENCERS: any[] = []
const MOCK_AVAILABLE_INFLUENCERS = [
  {
    id: 'inf_1',
    display_name: 'Sarah Creator',
    first_name: 'Sarah',
    last_name: 'Creator',
    total_followers: 125000,
    niches: ['Lifestyle', 'Fashion'],
    platform: 'Instagram'
  },
  {
    id: 'inf_2',
    display_name: 'Mike Tech',
    first_name: 'Mike',
    last_name: 'Tech',
    total_followers: 89000,
    niches: ['Tech', 'Gaming'],
    platform: 'YouTube'
  },
  {
    id: 'inf_3',
    display_name: 'FitnessFiona',
    first_name: 'Fiona',
    last_name: 'Fit',
    total_followers: 156000,
    niches: ['Fitness', 'Health'],
    platform: 'Instagram'
  },
  {
    id: 'inf_4',
    display_name: 'BeautyByBella',
    first_name: 'Bella',
    last_name: 'Beauty',
    total_followers: 234000,
    niches: ['Beauty', 'Lifestyle'],
    platform: 'TikTok'
  },
  {
    id: 'inf_5',
    display_name: 'TravelTom',
    first_name: 'Tom',
    last_name: 'Travel',
    total_followers: 78000,
    niches: ['Travel', 'Adventure'],
    platform: 'Instagram'
  }
]

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

    // TEMPORARY: Use mock data instead of database
    console.log('📋 Using mock data for campaign influencers (campaignId:', campaignId, ')')
    
    const mockInfluencers = MOCK_CAMPAIGN_INFLUENCERS.map(ci => ({
      ...ci,
      influencer: MOCK_AVAILABLE_INFLUENCERS.find(inf => inf.id === ci.influencer_id) || ci.influencer
    }))

    // Mock stats if requested
    let stats = null
    if (includeStats) {
      stats = {
        totalInfluencers: MOCK_CAMPAIGN_INFLUENCERS.length,
        invitedCount: MOCK_CAMPAIGN_INFLUENCERS.filter(ci => ci.status === 'INVITED').length,
        acceptedCount: MOCK_CAMPAIGN_INFLUENCERS.filter(ci => ci.status === 'ACCEPTED').length,
        declinedCount: MOCK_CAMPAIGN_INFLUENCERS.filter(ci => ci.status === 'DECLINED').length,
        inProgressCount: MOCK_CAMPAIGN_INFLUENCERS.filter(ci => ci.status === 'IN_PROGRESS').length,
        contentSubmittedCount: MOCK_CAMPAIGN_INFLUENCERS.filter(ci => ci.status === 'CONTENT_SUBMITTED').length,
        completedCount: MOCK_CAMPAIGN_INFLUENCERS.filter(ci => ci.status === 'COMPLETED').length,
        paidCount: MOCK_CAMPAIGN_INFLUENCERS.filter(ci => ci.status === 'PAID').length,
        productShippedCount: MOCK_CAMPAIGN_INFLUENCERS.filter(ci => ci.productShipped).length,
        contentPostedCount: MOCK_CAMPAIGN_INFLUENCERS.filter(ci => ci.contentPosted).length,
        paymentReleasedCount: MOCK_CAMPAIGN_INFLUENCERS.filter(ci => ci.paymentReleased).length
      }
    }

    // Mock timeline if requested
    let timeline = null
    if (includeTimeline) {
      timeline = {
        campaign: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          applicationDeadline: new Date('2024-01-15'),
          contentDeadline: new Date('2024-01-25')
        },
        influencers: MOCK_CAMPAIGN_INFLUENCERS.map(ci => ({
          influencerId: ci.influencer_id,
          displayName: MOCK_AVAILABLE_INFLUENCERS.find(inf => inf.id === ci.influencer_id)?.display_name || 'Unknown',
          deadline: ci.deadline || null,
          status: ci.status || 'INVITED',
          productShipped: ci.productShipped || false,
          contentPosted: ci.contentPosted || false,
          paymentReleased: ci.paymentReleased || false
        }))
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        influencers: mockInfluencers,
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

    // TEMPORARY: Use mock data instead of database
    console.log('📋 Adding influencer to campaign using mock data:', { campaignId, influencerId, status })
    
    // Find the influencer in our mock data
    const influencer = MOCK_AVAILABLE_INFLUENCERS.find(inf => inf.id === influencerId)
    if (!influencer) {
      return NextResponse.json(
        { error: 'Influencer not found' },
        { status: 404 }
      )
    }

    // Check if influencer is already in the campaign
    const existingAssignment = MOCK_CAMPAIGN_INFLUENCERS.find(ci => 
      ci.campaign_id === campaignId && ci.influencer_id === influencerId
    )

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Influencer is already assigned to this campaign' },
        { status: 409 }
      )
    }

    // Create mock campaign influencer
    const mockCampaignInfluencer = {
      id: `ci_${Date.now()}`,
      campaignId,
      influencerId,
      status: status.toUpperCase(),
      rate: rate || null,
      notes: notes || null,
      deadline: data.deadline ? new Date(data.deadline) : null,
      appliedAt: null,
      acceptedAt: status === 'accepted' ? new Date() : null,
      declinedAt: status === 'declined' ? new Date() : null,
      contentSubmittedAt: null,
      contentLinks: [], // Initialize empty content links
      discountCode: null, // Initialize discount code
      paidAt: null,
      productShipped: false,
      contentPosted: false,
      paymentReleased: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      influencer: influencer
    }

    // Add to mock data
    MOCK_CAMPAIGN_INFLUENCERS.push(mockCampaignInfluencer)

    console.log('✅ Successfully added influencer to campaign (mock):', mockCampaignInfluencer)

    return NextResponse.json({
      success: true,
      message: `Influencer ${status} for campaign successfully`,
      campaignInfluencer: mockCampaignInfluencer
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

    const { influencerId, status, notes, contentLinks, discountCode } = data

    if (!influencerId) {
      return NextResponse.json(
        { error: 'Influencer ID is required' },
        { status: 400 }
      )
    }

    // TEMPORARY: Use mock data instead of database
    console.log('📋 Updating campaign influencer using mock data:', { campaignId, influencerId, contentLinks, discountCode })
    
    // Find the campaign influencer in mock data
    const campaignInfluencerIndex = MOCK_CAMPAIGN_INFLUENCERS.findIndex(ci => 
      ci.campaignId === campaignId && ci.influencerId === influencerId
    )

    if (campaignInfluencerIndex === -1) {
      return NextResponse.json(
        { error: 'Campaign influencer assignment not found' },
        { status: 404 }
      )
    }

    // Update the mock data
    const updatedCampaignInfluencer = {
      ...MOCK_CAMPAIGN_INFLUENCERS[campaignInfluencerIndex],
      contentLinks: contentLinks !== undefined ? contentLinks : MOCK_CAMPAIGN_INFLUENCERS[campaignInfluencerIndex].contentLinks,
      discountCode: discountCode !== undefined ? discountCode : MOCK_CAMPAIGN_INFLUENCERS[campaignInfluencerIndex].discountCode,
      status: status || MOCK_CAMPAIGN_INFLUENCERS[campaignInfluencerIndex].status,
      notes: notes !== undefined ? notes : MOCK_CAMPAIGN_INFLUENCERS[campaignInfluencerIndex].notes,
      updatedAt: new Date()
    }

    // Update the mock array
    MOCK_CAMPAIGN_INFLUENCERS[campaignInfluencerIndex] = updatedCampaignInfluencer

    console.log('✅ Successfully updated campaign influencer (mock):', updatedCampaignInfluencer)

    return NextResponse.json({
      success: true,
      message: `Campaign influencer updated successfully`,
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