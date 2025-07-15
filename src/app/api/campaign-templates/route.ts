import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getAllCampaignTemplates, createCampaignTemplate } from '@/lib/db/queries/campaign-templates'

// GET - Fetch all templates
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const templates = await getAllCampaignTemplates()
    
    return NextResponse.json({
      success: true,
      templates,
      total: templates.length
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

// POST - Create new template
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'industry']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Create the template with default values for missing fields
    const templateData = {
      name: data.name,
      description: data.description,
      industry: data.industry,
      goals: data.goals || [],
      requirements: {
        minFollowers: data.requirements?.minFollowers || 1000,
        maxFollowers: data.requirements?.maxFollowers || 1000000,
        minEngagement: data.requirements?.minEngagement || 2.0,
        platforms: data.requirements?.platforms || [],
        demographics: data.requirements?.demographics || {},
        contentGuidelines: data.requirements?.contentGuidelines || ''
      },
      deliverables: data.deliverables || [],
      budgetRange: {
        min: data.budgetRange?.min || 0,
        max: data.budgetRange?.max || 0
      },
      timelineTemplate: {
        preparationDays: data.timelineTemplate?.preparationDays || 7,
        executionDays: data.timelineTemplate?.executionDays || 30,
        totalDays: data.timelineTemplate?.totalDays || 37
      },
      isActive: true,
      createdBy: userId
    }

    const template = await createCampaignTemplate(templateData)
    
    return NextResponse.json({
      success: true,
      message: 'Template created successfully',
      template
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create template' },
      { status: 500 }
    )
  }
} 