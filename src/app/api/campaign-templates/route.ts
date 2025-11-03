import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { 
  getCampaignTemplates, 
  createCampaignTemplate,
  getCampaignTemplateById,
  updateCampaignTemplate,
  deleteCampaignTemplate,
  createCampaignFromTemplate
} from '@/lib/db/queries/campaign-templates'

// GET - Get all campaign templates
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const templateId = searchParams.get('id')

    if (templateId) {
      // Get specific template
      const template = await getCampaignTemplateById(templateId)
      if (!template) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, template })
    }

    // Get all templates
    const templates = await getCampaignTemplates(includeInactive)
    
    return NextResponse.json({ 
      success: true, 
      templates 
    })
  } catch (error) {
    console.error('Error fetching campaign templates:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaign templates' },
      { status: 500 }
    )
  }
}

// POST - Create new campaign template
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is staff or admin
    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Only staff members can create campaign templates' },
        { status: 403 }
      )
    }

    const data = await request.json()
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'brand']
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Create template with default values for missing fields
    const templateData = {
      name: data.name,
      description: data.description,
      brand: data.brand,
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
      deliverables: data.deliverables || [],
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdBy: userId
    }

    const template = await createCampaignTemplate(templateData)
    
    return NextResponse.json({ 
      success: true, 
      template 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating campaign template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create campaign template' },
      { status: 500 }
    )
  }
}

// PUT - Update campaign template
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is staff or admin
    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Only staff members can update campaign templates' },
        { status: 403 }
      )
    }

    const data = await request.json()
    const { id, ...updates } = data

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      )
    }

    const updatedTemplate = await updateCampaignTemplate(id, updates)
    
    if (!updatedTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      template: updatedTemplate 
    })
  } catch (error) {
    console.error('Error updating campaign template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update campaign template' },
      { status: 500 }
    )
  }
}

// DELETE - Delete campaign template
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is staff or admin
    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Only staff members can delete campaign templates' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('id')

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      )
    }

    const deleted = await deleteCampaignTemplate(templateId)
    
    if (!deleted) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Campaign template deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting campaign template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete campaign template' },
      { status: 500 }
    )
  }
} 