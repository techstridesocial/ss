import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// Mock database - This would be your actual database in production
const campaigns = [
  {
    id: 'campaign_1',
    name: 'Summer Beauty Collection',
    brand_name: 'Luxe Beauty Co',
    brand_id: 'brand_1',
    description: 'Launch campaign for new summer makeup line targeting Gen Z',
    status: 'ACTIVE',
    budget: 25000,
    spent: 12400,
    start_date: '2024-01-10',
    end_date: '2024-02-28',
    target_niches: ['Beauty', 'Lifestyle'],
    target_platforms: ['INSTAGRAM', 'TIKTOK'],
    assigned_influencers: 8,
    completed_deliverables: 5,
    pending_payments: 3,
    estimated_reach: 450000,
    actual_reach: 289000,
    engagement_rate: 4.2,
    created_at: '2024-01-08T10:00:00Z',
    updated_at: '2024-01-15T14:30:00Z',
    total_invited: 8,
    invitations_accepted: 6,
    invitations_pending: 1,
    invitations_declined: 1,
    created_from_quotation: true,
    quotation_id: 'quote_1'
  }
]

interface RouteParams {
  params: {
    id: string
  }
}

// GET - Get single campaign
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaign = campaigns.find(c => c.id === params.id)
    
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update single campaign
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const campaignIndex = campaigns.findIndex(c => c.id === params.id)
    
    if (campaignIndex === -1) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    campaigns[campaignIndex] = {
      ...campaigns[campaignIndex],
      ...body,
      updated_at: new Date().toISOString()
    }

    return NextResponse.json({
      message: 'Campaign updated successfully',
      campaign: campaigns[campaignIndex]
    })
  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete single campaign
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaignIndex = campaigns.findIndex(c => c.id === params.id)
    
    if (campaignIndex === -1) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const deletedCampaign = campaigns.splice(campaignIndex, 1)[0]

    return NextResponse.json({
      message: 'Campaign deleted successfully',
      campaign: deletedCampaign
    })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 