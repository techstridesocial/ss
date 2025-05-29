import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { requireStaffAccess } from '@/lib/auth/roles'

export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize
    await auth.protect()
    await requireStaffAccess()

    const { quotationId } = await request.json()

    if (!quotationId) {
      return NextResponse.json(
        { error: 'Quotation ID is required' },
        { status: 400 }
      )
    }

    // In a real implementation, this would:
    // 1. Fetch the quotation from database
    // 2. Verify it's approved and not already converted
    // 3. Create a new campaign from quotation data
    // 4. Create campaign_invitations for each influencer
    // 5. Update quotation to mark as converted
    // 6. Send notifications to influencers

    // Mock response for now - replace with actual database operations
    const mockCampaign = {
      id: `campaign_${Date.now()}`,
      name: 'Summer Beauty Collection',
      brand_name: 'Luxe Beauty Co',
      status: 'ACTIVE',
      influencer_count: 8,
      invitations_sent: 8,
      created_from_quotation: true,
      quotation_id: quotationId
    }

    return NextResponse.json({
      success: true,
      campaign: mockCampaign,
      message: 'Campaign created successfully and invitations sent to influencers'
    })

  } catch (error) {
    console.error('Error creating campaign from quotation:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
} 