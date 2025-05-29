import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

type PriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW'
type QuotationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

interface Quotation {
  id: string
  brand_name: string
  brand_id: string
  campaign_name: string
  description: string
  budget_min: number
  budget_max: number
  target_niches: string[]
  target_platforms: string[]
  target_audience: {
    age_range?: { min: number; max: number }
    location?: string[]
    gender?: string[]
  }
  influencer_requirements: {
    follower_range?: { min: number; max: number }
    engagement_rate_min?: number
    content_types?: string[]
  }
  timeline: {
    start_date?: string
    end_date?: string
    content_deadline?: string
  }
  deliverables: string[]
  special_requirements: string[]
  status: QuotationStatus
  priority: PriorityLevel
  submitted_at: string
  reviewed_at: string | null
  approved_at: string | null
  campaign_created: boolean
  campaign_id: string | null
  estimated_influencers: number
  quoted_price: number
  final_price: number | null
  notes: string
}

// Mock quotations database
let quotations: Quotation[] = [
  {
    id: 'quote_1',
    brand_name: 'Luxe Beauty Co',
    brand_id: 'brand_1',
    campaign_name: 'Summer Beauty Collection',
    description: 'Launch campaign for new summer makeup line targeting Gen Z audience',
    budget_min: 20000,
    budget_max: 30000,
    target_niches: ['Beauty', 'Skincare', 'Lifestyle'],
    target_platforms: ['INSTAGRAM', 'TIKTOK'],
    target_audience: {
      age_range: { min: 18, max: 35 },
      location: ['UK', 'US'],
      gender: ['Female']
    },
    influencer_requirements: {
      follower_range: { min: 10000, max: 100000 },
      engagement_rate_min: 3.0,
      content_types: ['Post', 'Stories', 'Reels']
    },
    timeline: {
      start_date: '2024-02-01',
      end_date: '2024-03-01',
      content_deadline: '2024-02-20'
    },
    deliverables: [
      '1 Instagram feed post',
      '3-5 Instagram Stories',
      '1 TikTok video',
      'Product usage demonstration'
    ],
    special_requirements: [
      'Must show product in natural lighting',
      'Include brand hashtag #LuxeBeauty',
      'Tag @luxebeautyco in all posts'
    ],
    status: 'APPROVED',
    priority: 'HIGH',
    submitted_at: '2024-01-15T10:30:00Z',
    reviewed_at: '2024-01-16T14:20:00Z',
    approved_at: '2024-01-16T14:25:00Z',
    campaign_created: true,
    campaign_id: 'campaign_1',
    estimated_influencers: 8,
    quoted_price: 25000,
    final_price: 25000,
    notes: 'High-value client, prioritize quality over quantity'
  },
  {
    id: 'quote_2',
    brand_name: 'TechStart Pro',
    brand_id: 'brand_3',
    campaign_name: 'App Launch Campaign',
    description: 'Mobile app launch targeting productivity and business audience',
    budget_min: 8000,
    budget_max: 15000,
    target_niches: ['Technology', 'Business', 'Productivity'],
    target_platforms: ['YOUTUBE', 'LINKEDIN', 'INSTAGRAM'],
    target_audience: {
      age_range: { min: 25, max: 45 },
      location: ['UK', 'US', 'CA'],
      gender: ['Male', 'Female']
    },
    influencer_requirements: {
      follower_range: { min: 50000, max: 300000 },
      engagement_rate_min: 4.0,
      content_types: ['Review', 'Tutorial', 'Demo']
    },
    timeline: {
      start_date: '2024-02-15',
      end_date: '2024-03-30',
      content_deadline: '2024-03-15'
    },
    deliverables: [
      '1 YouTube review video (5-10 mins)',
      '1 Instagram Reel tutorial',
      '2 LinkedIn posts about productivity',
      'App walkthrough demonstration'
    ],
    special_requirements: [
      'Must actually use the app for at least 1 week',
      'Include honest feedback',
      'Show practical use cases'
    ],
    status: 'PENDING',
    priority: 'MEDIUM',
    submitted_at: '2024-01-18T09:15:00Z',
    reviewed_at: null,
    approved_at: null,
    campaign_created: false,
    campaign_id: null,
    estimated_influencers: 5,
    quoted_price: 12000,
    final_price: null,
    notes: 'New client, ensure clear communication about deliverables'
  },
  {
    id: 'quote_3',
    brand_name: 'FitGear Pro',
    brand_id: 'brand_2',
    campaign_name: 'Home Gym Equipment Launch',
    description: 'Product seeding campaign for new home fitness equipment line',
    budget_min: 12000,
    budget_max: 20000,
    target_niches: ['Fitness', 'Health', 'Wellness'],
    target_platforms: ['YOUTUBE', 'INSTAGRAM'],
    target_audience: {
      age_range: { min: 22, max: 50 },
      location: ['UK'],
      gender: ['Male', 'Female']
    },
    influencer_requirements: {
      follower_range: { min: 30000, max: 200000 },
      engagement_rate_min: 4.5,
      content_types: ['Review', 'Workout', 'Demo']
    },
    timeline: {
      start_date: '2024-02-10',
      end_date: '2024-04-10',
      content_deadline: '2024-03-25'
    },
    deliverables: [
      '1 YouTube equipment review (10-15 mins)',
      '2 Instagram Reels workouts',
      '1 Instagram feed post',
      'Before/after workout demonstration'
    ],
    special_requirements: [
      'Must use equipment for minimum 2 weeks',
      'Show realistic workout scenarios',
      'Include safety considerations'
    ],
    status: 'APPROVED',
    priority: 'HIGH',
    submitted_at: '2024-01-12T11:00:00Z',
    reviewed_at: '2024-01-13T15:30:00Z',
    approved_at: '2024-01-13T15:45:00Z',
    campaign_created: true,
    campaign_id: 'campaign_2',
    estimated_influencers: 6,
    quoted_price: 15000,
    final_price: 15000,
    notes: 'Equipment to be shipped 1 week before content creation starts'
  }
]

// GET - Fetch all quotations with filtering
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as QuotationStatus | null
    const priority = searchParams.get('priority') as PriorityLevel | null
    const brand = searchParams.get('brand')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let filteredQuotations = [...quotations]

    // Apply filters
    if (status) {
      filteredQuotations = filteredQuotations.filter(q => q.status === status)
    }
    if (priority) {
      filteredQuotations = filteredQuotations.filter(q => q.priority === priority)
    }
    if (brand) {
      filteredQuotations = filteredQuotations.filter(q => q.brand_id === brand)
    }

    // Sort by priority and submission date
    filteredQuotations.sort((a, b) => {
      const priorityOrder: Record<PriorityLevel, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    })

    // Pagination
    const offset = (page - 1) * limit
    const paginatedQuotations = filteredQuotations.slice(offset, offset + limit)

    return NextResponse.json({
      quotations: paginatedQuotations,
      pagination: {
        page,
        limit,
        total: filteredQuotations.length,
        totalPages: Math.ceil(filteredQuotations.length / limit)
      },
      summary: {
        total: quotations.length,
        pending: quotations.filter(q => q.status === 'PENDING').length,
        approved: quotations.filter(q => q.status === 'APPROVED').length,
        rejected: quotations.filter(q => q.status === 'REJECTED').length,
        campaigns_created: quotations.filter(q => q.campaign_created).length
      }
    })
  } catch (error) {
    console.error('Error fetching quotations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new quotation
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      brand_name,
      brand_id,
      campaign_name,
      description,
      budget_min,
      budget_max,
      target_niches,
      target_platforms,
      target_audience,
      influencer_requirements,
      timeline,
      deliverables,
      special_requirements,
      priority = 'MEDIUM'
    } = body

    // Validation
    if (!brand_name || !campaign_name || !description || !budget_min || !budget_max) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newQuotation: Quotation = {
      id: `quote_${Date.now()}`,
      brand_name,
      brand_id,
      campaign_name,
      description,
      budget_min: Number(budget_min),
      budget_max: Number(budget_max),
      target_niches: target_niches || [],
      target_platforms: target_platforms || [],
      target_audience: target_audience || {},
      influencer_requirements: influencer_requirements || {},
      timeline: timeline || {},
      deliverables: deliverables || [],
      special_requirements: special_requirements || [],
      status: 'PENDING',
      priority: priority as PriorityLevel,
      submitted_at: new Date().toISOString(),
      reviewed_at: null,
      approved_at: null,
      campaign_created: false,
      campaign_id: null,
      estimated_influencers: 0,
      quoted_price: Math.round((Number(budget_min) + Number(budget_max)) / 2),
      final_price: null,
      notes: ''
    }

    quotations.push(newQuotation)

    return NextResponse.json({
      message: 'Quotation created successfully',
      quotation: newQuotation
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating quotation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update quotation status and create campaign
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { quotationId, status, notes, final_price, create_campaign = false } = body

    const quotationIndex = quotations.findIndex(q => q.id === quotationId)
    if (quotationIndex === -1) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 })
    }

    const quotation = quotations[quotationIndex]
    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 })
    }
    
    // Update quotation
    quotations[quotationIndex] = {
      ...quotation,
      status: status as QuotationStatus,
      notes: notes || quotation.notes,
      final_price: final_price || quotation.final_price,
      reviewed_at: new Date().toISOString(),
      ...(status === 'APPROVED' && { approved_at: new Date().toISOString() })
    }

    let createdCampaign = null

    // Create campaign if approved and requested
    if (status === 'APPROVED' && create_campaign) {
      // Create campaign from quotation
      createdCampaign = {
        id: `campaign_${Date.now()}`,
        name: quotation.campaign_name,
        brand_name: quotation.brand_name,
        brand_id: quotation.brand_id,
        description: quotation.description,
        status: 'ACTIVE',
        budget: quotation.final_price || quotation.quoted_price,
        spent: 0,
        start_date: quotation.timeline.start_date,
        end_date: quotation.timeline.end_date,
        target_niches: quotation.target_niches,
        target_platforms: quotation.target_platforms,
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
        created_from_quotation: true,
        quotation_id: quotation.id
      }

      // Update quotation with campaign info
      quotations[quotationIndex].campaign_created = true
      quotations[quotationIndex].campaign_id = createdCampaign.id
    }

    return NextResponse.json({
      message: `Quotation ${status.toLowerCase()} successfully`,
      quotation: quotations[quotationIndex],
      ...(createdCampaign && { campaign: createdCampaign })
    })
  } catch (error) {
    console.error('Error updating quotation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 