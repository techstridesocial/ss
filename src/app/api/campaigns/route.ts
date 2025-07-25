import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getAllCampaigns, createCampaign } from '@/lib/db/queries/campaigns'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaigns = await getAllCampaigns()
    
    return NextResponse.json({ 
      success: true, 
      campaigns 
    })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    // Validate required fields
    const requiredFields = ['name', 'brand', 'description']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Create the campaign with default values for missing fields
    const campaignData = {
      name: data.name,
      brand: data.brand,
      status: data.status || 'draft',
      description: data.description,
      goals: data.goals || [],
      timeline: {
        startDate: data.timeline?.startDate || new Date().toISOString(),
        endDate: data.timeline?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        applicationDeadline: data.timeline?.applicationDeadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        contentDeadline: data.timeline?.contentDeadline || new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString()
      },
      budget: {
        total: data.budget?.total || 0,
        perInfluencer: data.budget?.perInfluencer || 0
      },
      requirements: {
        minFollowers: data.requirements?.minFollowers || 1000,
        maxFollowers: data.requirements?.maxFollowers || 1000000,
        minEngagement: data.requirements?.minEngagement || 2.0,
        platforms: data.requirements?.platforms || [],
        demographics: data.requirements?.demographics || {},
        contentGuidelines: data.requirements?.contentGuidelines || ''
      },
      deliverables: data.deliverables || []
    }

    const campaign = await createCampaign(campaignData)
    
    return NextResponse.json({ 
      success: true, 
      campaign 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
} 