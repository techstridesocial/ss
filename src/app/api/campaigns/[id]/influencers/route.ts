import { NextRequest as _NextRequest, NextResponse } from 'next/server'
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

// No mock data - using real database queries

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

    // Fix: await params in Next.js 15
    const { id: campaignId } = await params

    // Fetch real campaign influencers from database
    console.log('📋 Fetching real campaign influencers from database (campaignId:', campaignId, ')')
    
    const campaignInfluencers = await getCampaignInfluencersWithDetails(campaignId)
    console.log('✅ Loaded', campaignInfluencers.length, 'campaign influencers from database')

    // Calculate real stats if requested
    let stats = null
    if (includeStats) {
      stats = await getCampaignStatistics(campaignId)
      console.log('✅ Loaded campaign statistics from database')
    }

    // Get real timeline if requested
    let timeline = null
    if (includeTimeline) {
      timeline = await getCampaignTimeline(campaignId)
      console.log('✅ Loaded campaign timeline from database')
    }

    // Debug: Log what we're returning
    console.log('📊 [API DEBUG] Returning campaign influencers:', {
      count: campaignInfluencers.length,
      influencers: campaignInfluencers.map(inf => ({
        id: inf.influencerId,
        display_name: inf.influencer.display_name,
        analytics: {
          total_engagements: inf.influencer.total_engagements,
          avg_engagement_rate: inf.influencer.avg_engagement_rate,
          estimated_reach: inf.influencer.estimated_reach,
          total_likes: inf.influencer.total_likes,
          total_comments: inf.influencer.total_comments,
          total_views: inf.influencer.total_views
        }
      }))
    })

    return NextResponse.json({
      success: true,
      data: {
        influencers: campaignInfluencers,
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
    console.log('🔐 Starting authentication for campaign influencer assignment...')
    
    // Authenticate
    await auth.protect()
    console.log('✅ Auth.protect() passed')
    
    const userRole = await getCurrentUserRole()
    console.log('👤 User role:', userRole)

    // Verify user is staff or admin
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      console.log('❌ Access denied - user role:', userRole)
      return NextResponse.json(
        { error: 'Only staff members can assign influencers to campaigns' },
        { status: 403 }
      )
    }
    
    console.log('✅ User role verification passed')

    // Fix: await params in Next.js 15
    const { id: campaignId } = await params
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

    // Add influencer to campaign using real database
    console.log('📋 Adding influencer to campaign using database:', { campaignId, influencerId, status, rate })
    
    let campaignInfluencer
    try {
      campaignInfluencer = await addInfluencerToCampaign(
        campaignId,
        influencerId,
        rate
      )
      console.log('✅ Successfully added influencer to campaign:', campaignInfluencer)
    } catch (dbError) {
      console.error('❌ Database error in addInfluencerToCampaign:', dbError)
      throw dbError
    }

    return NextResponse.json({
      success: true,
      message: `Influencer ${status} for campaign successfully`,
      campaignInfluencer: campaignInfluencer
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Error adding influencer to campaign:', error)
    console.error('❌ Error type:', typeof error)
    console.error('❌ Error message:', error instanceof Error ? error.message : 'No message')
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack')
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to add influencer to campaign',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        type: typeof error
      },
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

    // Fix: await params in Next.js 15
    const { id: campaignId } = await params
    const data = await request.json()

    const { influencerId, status, notes, contentLinks, discountCode } = data

    if (!influencerId) {
      return NextResponse.json(
        { error: 'Influencer ID is required' },
        { status: 400 }
      )
    }

    // Update campaign influencer using real database
    console.log('📋 Updating campaign influencer using database:', { campaignId, influencerId, contentLinks, discountCode })
    
    const updatedCampaignInfluencer = await updateCampaignInfluencerStatus(
      campaignId,
      influencerId,
      status as any,
      notes,
      contentLinks,
      discountCode
    )

    if (!updatedCampaignInfluencer) {
      return NextResponse.json(
        { error: 'Campaign influencer assignment not found' },
        { status: 404 }
      )
    }

    // 🎯 AUTOMATIC ANALYTICS UPDATE: Always update analytics when content links change
    console.log('🔍 Checking for content links:', { contentLinks, hasContentLinks: contentLinks && contentLinks.length > 0 })
    
    // Always trigger analytics update - whether adding, updating, or removing content links
    console.log('🔄 Content links changed - triggering automatic analytics update...')
    console.log('📋 Content links to process:', contentLinks || [])
    console.log('👤 Influencer ID:', influencerId)
    
    try {
      // Import analytics updater
      const { updateInfluencerAnalyticsFromContentLinks } = await import('@/lib/services/analytics-updater')
      
      // Update analytics for this specific influencer using content links (empty array will reset to 0)
      console.log('🚀 Calling updateInfluencerAnalyticsFromContentLinks...')
      const analyticsUpdated = await updateInfluencerAnalyticsFromContentLinks(influencerId, contentLinks || [])
      
      if (analyticsUpdated) {
        if (contentLinks && contentLinks.length > 0) {
          console.log('✅ Analytics automatically updated from content links for influencer:', influencerId)
        } else {
          console.log('✅ Analytics automatically reset to 0 (no content links) for influencer:', influencerId)
        }
      } else {
        console.log('⚠️ Analytics update failed for influencer:', influencerId)
      }
    } catch (analyticsError) {
      console.error('❌ Error updating analytics automatically:', analyticsError)
      console.error('❌ Analytics error details:', {
        message: analyticsError instanceof Error ? analyticsError.message : 'Unknown error',
        stack: analyticsError instanceof Error ? analyticsError.stack : 'No stack'
      })
      // Don't fail the main operation, just log the error
    }

    console.log('✅ Successfully updated campaign influencer:', updatedCampaignInfluencer)

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