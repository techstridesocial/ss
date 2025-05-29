import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// Mock campaign templates
let campaignTemplates = [
  {
    id: 'template_1',
    name: 'Beauty Product Launch',
    description: 'Standard template for beauty product launches with micro-influencers',
    category: 'Product Launch',
    target_niches: ['Beauty', 'Skincare', 'Makeup'],
    target_platforms: ['INSTAGRAM', 'TIKTOK'],
    suggested_budget_min: 5000,
    suggested_budget_max: 25000,
    duration_days: 30,
    deliverables: [
      'Instagram feed post',
      'Instagram stories (3-5)',
      'TikTok video'
    ],
    requirements: [
      'Must tag brand account',
      'Include brand hashtag',
      'Show product in use'
    ],
    influencer_criteria: {
      follower_range: { min: 10000, max: 100000 },
      engagement_rate_min: 3.0,
      location: ['UK', 'US'],
      age_range: { min: 18, max: 35 }
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    usage_count: 12,
    is_active: true
  },
  {
    id: 'template_2',
    name: 'Fitness Equipment Seeding',
    description: 'Template for fitness equipment campaigns with macro-influencers',
    category: 'Product Seeding',
    target_niches: ['Fitness', 'Health', 'Wellness'],
    target_platforms: ['YOUTUBE', 'INSTAGRAM'],
    suggested_budget_min: 10000,
    suggested_budget_max: 50000,
    duration_days: 45,
    deliverables: [
      'YouTube review video',
      'Instagram Reels workout',
      'Instagram feed post'
    ],
    requirements: [
      'Must create honest review',
      'Show equipment in action',
      'Include discount code'
    ],
    influencer_criteria: {
      follower_range: { min: 50000, max: 500000 },
      engagement_rate_min: 4.0,
      location: ['UK'],
      age_range: { min: 22, max: 45 }
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    usage_count: 8,
    is_active: true
  },
  {
    id: 'template_3',
    name: 'Fashion Brand Awareness',
    description: 'Awareness campaign template for fashion brands with diverse influencers',
    category: 'Brand Awareness',
    target_niches: ['Fashion', 'Style', 'Lifestyle'],
    target_platforms: ['INSTAGRAM', 'TIKTOK', 'YOUTUBE'],
    suggested_budget_min: 15000,
    suggested_budget_max: 75000,
    duration_days: 60,
    deliverables: [
      'Instagram feed post',
      'Instagram Reels styling video',
      'TikTok outfit video',
      'YouTube styling haul'
    ],
    requirements: [
      'Show multiple outfit combinations',
      'Tag brand in all posts',
      'Include styling tips'
    ],
    influencer_criteria: {
      follower_range: { min: 25000, max: 250000 },
      engagement_rate_min: 3.5,
      location: ['UK', 'US', 'AU'],
      age_range: { min: 18, max: 40 }
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    usage_count: 5,
    is_active: true
  }
]

// GET - Fetch all templates
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const platform = searchParams.get('platform')
    const active = searchParams.get('active')

    let filteredTemplates = [...campaignTemplates]

    // Apply filters
    if (category) {
      filteredTemplates = filteredTemplates.filter(t => 
        t.category.toLowerCase().includes(category.toLowerCase())
      )
    }
    if (platform) {
      filteredTemplates = filteredTemplates.filter(t => 
        t.target_platforms.includes(platform.toUpperCase())
      )
    }
    if (active !== null) {
      const isActive = active === 'true'
      filteredTemplates = filteredTemplates.filter(t => t.is_active === isActive)
    }

    // Sort by usage count (most used first)
    filteredTemplates.sort((a, b) => b.usage_count - a.usage_count)

    return NextResponse.json({
      templates: filteredTemplates,
      total: filteredTemplates.length
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new template
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
      category,
      target_niches,
      target_platforms,
      suggested_budget_min,
      suggested_budget_max,
      duration_days,
      deliverables,
      requirements,
      influencer_criteria
    } = body

    // Validation
    if (!name || !description || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newTemplate = {
      id: `template_${Date.now()}`,
      name,
      description,
      category,
      target_niches: target_niches || [],
      target_platforms: target_platforms || [],
      suggested_budget_min: Number(suggested_budget_min) || 0,
      suggested_budget_max: Number(suggested_budget_max) || 0,
      duration_days: Number(duration_days) || 30,
      deliverables: deliverables || [],
      requirements: requirements || [],
      influencer_criteria: influencer_criteria || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      usage_count: 0,
      is_active: true
    }

    campaignTemplates.push(newTemplate)

    return NextResponse.json({
      message: 'Template created successfully',
      template: newTemplate
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Bulk update templates
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { templateIds, updates } = body

    if (!templateIds || !Array.isArray(templateIds) || !updates) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    const updatedTemplates = []

    for (const templateId of templateIds) {
      const templateIndex = campaignTemplates.findIndex(t => t.id === templateId)
      if (templateIndex !== -1) {
        campaignTemplates[templateIndex] = {
          ...campaignTemplates[templateIndex],
          ...updates,
          updated_at: new Date().toISOString()
        }
        updatedTemplates.push(campaignTemplates[templateIndex])
      }
    }

    return NextResponse.json({
      message: `${updatedTemplates.length} templates updated successfully`,
      templates: updatedTemplates
    })
  } catch (error) {
    console.error('Error bulk updating templates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 