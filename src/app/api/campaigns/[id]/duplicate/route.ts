import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// Mock campaigns data
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

// POST - Duplicate campaign
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      name, 
      copyInfluencers = false, 
      copySettings = true,
      resetMetrics = true,
      newStartDate,
      newEndDate 
    } = body

    const originalCampaign = campaigns.find(c => c.id === params.id)
    
    if (!originalCampaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Create duplicate campaign
    const duplicatedCampaign = {
      ...originalCampaign,
      id: `campaign_${Date.now()}`,
      name: name || `${originalCampaign.name} (Copy)`,
      status: 'DRAFT',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Reset date fields
      start_date: newStartDate || originalCampaign.start_date,
      end_date: newEndDate || originalCampaign.end_date,
      // Reset metrics if requested
      ...(resetMetrics && {
        spent: 0,
        assigned_influencers: 0,
        completed_deliverables: 0,
        pending_payments: 0,
        actual_reach: 0,
        engagement_rate: 0,
        total_invited: 0,
        invitations_accepted: 0,
        invitations_pending: 0,
        invitations_declined: 0
      }),
      // Remove quotation link for duplicates
      created_from_quotation: false,
      quotation_id: null
    }

    // If not copying influencer assignments, reset those fields
    if (!copyInfluencers) {
      duplicatedCampaign.assigned_influencers = 0
      duplicatedCampaign.total_invited = 0
      duplicatedCampaign.invitations_accepted = 0
      duplicatedCampaign.invitations_pending = 0
      duplicatedCampaign.invitations_declined = 0
    }

    campaigns.push(duplicatedCampaign)

    return NextResponse.json({
      message: 'Campaign duplicated successfully',
      campaign: duplicatedCampaign,
      options: {
        copiedInfluencers: copyInfluencers,
        copiedSettings: copySettings,
        resetMetrics: resetMetrics
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error duplicating campaign:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 