import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// Mock database - In real app, this would use your database
let campaigns = [
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
  },
  {
    id: 'campaign_2',
    name: 'Fitness Equipment Launch',
    brand_name: 'FitGear Pro',
    brand_id: 'brand_2',
    description: 'Product seeding campaign for new home gym equipment',
    status: 'ACTIVE',
    budget: 15000,
    spent: 8750,
    start_date: '2024-01-15',
    end_date: '2024-03-15',
    target_niches: ['Fitness', 'Health'],
    target_platforms: ['YOUTUBE', 'INSTAGRAM'],
    assigned_influencers: 6,
    completed_deliverables: 3,
    pending_payments: 2,
    estimated_reach: 320000,
    actual_reach: 198000,
    engagement_rate: 5.1,
    created_at: '2024-01-13T09:00:00Z',
    updated_at: '2024-01-20T11:15:00Z',
    total_invited: 12,
    invitations_accepted: 6,
    invitations_pending: 4,
    invitations_declined: 2,
    created_from_quotation: true,
    quotation_id: 'quote_3'
  }
]

// GET - Fetch all campaigns with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const brand = searchParams.get('brand')
    const search = searchParams.get('search')

    let filteredCampaigns = [...campaigns]

    // Apply filters
    if (status) {
      filteredCampaigns = filteredCampaigns.filter(c => c.status === status)
    }
    if (brand) {
      filteredCampaigns = filteredCampaigns.filter(c => c.brand_id === brand)
    }
    if (search) {
      const searchLower = search.toLowerCase()
      filteredCampaigns = filteredCampaigns.filter(c => 
        c.name.toLowerCase().includes(searchLower) ||
        c.brand_name.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower)
      )
    }

    // Pagination
    const offset = (page - 1) * limit
    const paginatedCampaigns = filteredCampaigns.slice(offset, offset + limit)

    return NextResponse.json({
      campaigns: paginatedCampaigns,
      pagination: {
        page,
        limit,
        total: filteredCampaigns.length,
        totalPages: Math.ceil(filteredCampaigns.length / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new campaign
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      budget,
      start_date,
      end_date,
      brand_id,
      brand_name,
      target_niches,
      target_platforms,
      quotation_id
    } = body

    // Validation
    if (!name || !description || !budget || !start_date || !end_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newCampaign = {
      id: `campaign_${Date.now()}`,
      name,
      description,
      budget: Number(budget),
      start_date,
      end_date,
      brand_id,
      brand_name,
      target_niches: target_niches || [],
      target_platforms: target_platforms || [],
      status: 'ACTIVE',
      spent: 0,
      assigned_influencers: 0,
      completed_deliverables: 0,
      pending_payments: 0,
      estimated_reach: 0,
      actual_reach: 0,
      engagement_rate: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      total_invited: 0,
      invitations_accepted: 0,
      invitations_pending: 0,
      invitations_declined: 0,
      created_from_quotation: !!quotation_id,
      quotation_id: quotation_id || null
    }

    campaigns.push(newCampaign)

    return NextResponse.json({ 
      message: 'Campaign created successfully',
      campaign: newCampaign 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Bulk update campaigns
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { campaignIds, updates } = body

    if (!campaignIds || !Array.isArray(campaignIds) || !updates) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    const updatedCampaigns = []
    
    for (const campaignId of campaignIds) {
      const campaignIndex = campaigns.findIndex(c => c.id === campaignId)
      if (campaignIndex !== -1) {
        campaigns[campaignIndex] = {
          ...campaigns[campaignIndex],
          ...updates,
          updated_at: new Date().toISOString()
        }
        updatedCampaigns.push(campaigns[campaignIndex])
      }
    }

    return NextResponse.json({
      message: `${updatedCampaigns.length} campaigns updated successfully`,
      campaigns: updatedCampaigns
    })
  } catch (error) {
    console.error('Error bulk updating campaigns:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Bulk delete campaigns
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const campaignIds = searchParams.get('ids')?.split(',') || []

    if (campaignIds.length === 0) {
      return NextResponse.json({ error: 'No campaign IDs provided' }, { status: 400 })
    }

    const deletedCount = campaigns.length
    campaigns = campaigns.filter(c => !campaignIds.includes(c.id))
    const actualDeletedCount = deletedCount - campaigns.length

    return NextResponse.json({
      message: `${actualDeletedCount} campaigns deleted successfully`,
      deletedCount: actualDeletedCount
    })
  } catch (error) {
    console.error('Error bulk deleting campaigns:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 