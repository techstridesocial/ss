import { query } from '../connection'

export interface CampaignTemplate {
  id: string
  name: string
  description: string
  brand: string
  goals: string[]
  timeline: {
    startDate: string
    endDate: string
    applicationDeadline: string
    contentDeadline: string
  }
  budget: {
    total: number
    perInfluencer: number
  }
  requirements: {
    minFollowers: number
    maxFollowers: number
    minEngagement: number
    platforms: string[]
    demographics: Record<string, unknown>
    contentGuidelines: string
  }
  deliverables: string[]
  isActive: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Get all campaign templates
 */
export async function getCampaignTemplates(includeInactive: boolean = false): Promise<CampaignTemplate[]> {
  try {
    const whereClause = includeInactive ? '' : 'WHERE is_active = true'
    
    const _result = await query(`
      SELECT * FROM campaign_templates 
      ${whereClause}
      ORDER BY created_at DESC
    `)

    return result.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      brand: row.brand,
      goals: row.goals ? JSON.parse(row.goals) : [],
      timeline: {
        startDate: row.start_date,
        endDate: row.end_date,
        applicationDeadline: row.application_deadline,
        contentDeadline: row.content_deadline
      },
      budget: {
        total: parseFloat(row.total_budget || '0'),
        perInfluencer: parseFloat(row.per_influencer_budget || '0')
      },
      requirements: {
        minFollowers: parseInt(row.min_followers || '0'),
        maxFollowers: parseInt(row.max_followers || '1000000'),
        minEngagement: parseFloat(row.min_engagement || '0'),
        platforms: row.platforms ? JSON.parse(row.platforms) : [],
        demographics: row.demographics ? JSON.parse(row.demographics) : {},
        contentGuidelines: row.content_guidelines || ''
      },
      deliverables: row.deliverables ? JSON.parse(row.deliverables) : [],
      isActive: row.is_active,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }))
  } catch (error) {
    console.error('Error getting campaign templates:', error)
    throw error
  }
}

/**
 * Get campaign template by ID
 */
export async function getCampaignTemplateById(id: string): Promise<CampaignTemplate | null> {
  try {
    const _result = await query(`
      SELECT * FROM campaign_templates 
      WHERE id = $1
    `, [id])

    if (result.length === 0) {
      return null
    }

    const row = result[0]
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      brand: row.brand,
      goals: row.goals ? JSON.parse(row.goals) : [],
      timeline: {
        startDate: row.start_date,
        endDate: row.end_date,
        applicationDeadline: row.application_deadline,
        contentDeadline: row.content_deadline
      },
      budget: {
        total: parseFloat(row.total_budget || '0'),
        perInfluencer: parseFloat(row.per_influencer_budget || '0')
      },
      requirements: {
        minFollowers: parseInt(row.min_followers || '0'),
        maxFollowers: parseInt(row.max_followers || '1000000'),
        minEngagement: parseFloat(row.min_engagement || '0'),
        platforms: row.platforms ? JSON.parse(row.platforms) : [],
        demographics: row.demographics ? JSON.parse(row.demographics) : {},
        contentGuidelines: row.content_guidelines || ''
      },
      deliverables: row.deliverables ? JSON.parse(row.deliverables) : [],
      isActive: row.is_active,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }
  } catch (error) {
    console.error('Error getting campaign template by ID:', error)
    throw error
  }
}

/**
 * Create campaign template
 */
export async function createCampaignTemplate(template: Omit<CampaignTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<CampaignTemplate> {
  try {
    const _result = await query(`
      INSERT INTO campaign_templates (
        name, description, brand, goals, start_date, end_date, 
        application_deadline, content_deadline, total_budget, per_influencer_budget,
        min_followers, max_followers, min_engagement, platforms, demographics,
        content_guidelines, deliverables, is_active, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `, [
      template.name,
      template.description,
      template.brand,
      JSON.stringify(template.goals),
      template.timeline.startDate,
      template.timeline.endDate,
      template.timeline.applicationDeadline,
      template.timeline.contentDeadline,
      template.budget.total,
      template.budget.perInfluencer,
      template.requirements.minFollowers,
      template.requirements.maxFollowers,
      template.requirements.minEngagement,
      JSON.stringify(template.requirements.platforms),
      JSON.stringify(template.requirements.demographics),
      template.requirements.contentGuidelines,
      JSON.stringify(template.deliverables),
      template.isActive,
      template.createdBy
    ])

    const row = result[0]
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      brand: row.brand,
      goals: row.goals ? JSON.parse(row.goals) : [],
      timeline: {
        startDate: row.start_date,
        endDate: row.end_date,
        applicationDeadline: row.application_deadline,
        contentDeadline: row.content_deadline
      },
      budget: {
        total: parseFloat(row.total_budget || '0'),
        perInfluencer: parseFloat(row.per_influencer_budget || '0')
      },
      requirements: {
        minFollowers: parseInt(row.min_followers || '0'),
        maxFollowers: parseInt(row.max_followers || '1000000'),
        minEngagement: parseFloat(row.min_engagement || '0'),
        platforms: row.platforms ? JSON.parse(row.platforms) : [],
        demographics: row.demographics ? JSON.parse(row.demographics) : {},
        contentGuidelines: row.content_guidelines || ''
      },
      deliverables: row.deliverables ? JSON.parse(row.deliverables) : [],
      isActive: row.is_active,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }
  } catch (error) {
    console.error('Error creating campaign template:', error)
    throw error
  }
}

/**
 * Update campaign template
 */
export async function updateCampaignTemplate(id: string, updates: Partial<CampaignTemplate>): Promise<CampaignTemplate | null> {
  try {
    const setClauses: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (updates.name !== undefined) {
      setClauses.push(`name = $${paramCount++}`)
      values.push(updates.name)
    }
    if (updates.description !== undefined) {
      setClauses.push(`description = $${paramCount++}`)
      values.push(updates.description)
    }
    if (updates.brand !== undefined) {
      setClauses.push(`brand = $${paramCount++}`)
      values.push(updates.brand)
    }
    if (updates.goals !== undefined) {
      setClauses.push(`goals = $${paramCount++}`)
      values.push(JSON.stringify(updates.goals))
    }
    if (updates.timeline?.startDate !== undefined) {
      setClauses.push(`start_date = $${paramCount++}`)
      values.push(updates.timeline.startDate)
    }
    if (updates.timeline?.endDate !== undefined) {
      setClauses.push(`end_date = $${paramCount++}`)
      values.push(updates.timeline.endDate)
    }
    if (updates.timeline?.applicationDeadline !== undefined) {
      setClauses.push(`application_deadline = $${paramCount++}`)
      values.push(updates.timeline.applicationDeadline)
    }
    if (updates.timeline?.contentDeadline !== undefined) {
      setClauses.push(`content_deadline = $${paramCount++}`)
      values.push(updates.timeline.contentDeadline)
    }
    if (updates.budget?.total !== undefined) {
      setClauses.push(`total_budget = $${paramCount++}`)
      values.push(updates.budget.total)
    }
    if (updates.budget?.perInfluencer !== undefined) {
      setClauses.push(`per_influencer_budget = $${paramCount++}`)
      values.push(updates.budget.perInfluencer)
    }
    if (updates.requirements?.minFollowers !== undefined) {
      setClauses.push(`min_followers = $${paramCount++}`)
      values.push(updates.requirements.minFollowers)
    }
    if (updates.requirements?.maxFollowers !== undefined) {
      setClauses.push(`max_followers = $${paramCount++}`)
      values.push(updates.requirements.maxFollowers)
    }
    if (updates.requirements?.minEngagement !== undefined) {
      setClauses.push(`min_engagement = $${paramCount++}`)
      values.push(updates.requirements.minEngagement)
    }
    if (updates.requirements?.platforms !== undefined) {
      setClauses.push(`platforms = $${paramCount++}`)
      values.push(JSON.stringify(updates.requirements.platforms))
    }
    if (updates.requirements?.demographics !== undefined) {
      setClauses.push(`demographics = $${paramCount++}`)
      values.push(JSON.stringify(updates.requirements.demographics))
    }
    if (updates.requirements?.contentGuidelines !== undefined) {
      setClauses.push(`content_guidelines = $${paramCount++}`)
      values.push(updates.requirements.contentGuidelines)
    }
    if (updates.deliverables !== undefined) {
      setClauses.push(`deliverables = $${paramCount++}`)
      values.push(JSON.stringify(updates.deliverables))
    }
    if (updates.isActive !== undefined) {
      setClauses.push(`is_active = $${paramCount++}`)
      values.push(updates.isActive)
    }

    if (setClauses.length === 0) {
      return getCampaignTemplateById(id)
    }

    setClauses.push(`updated_at = NOW()`)
    values.push(id)

    const _result = await query(`
      UPDATE campaign_templates 
      SET ${setClauses.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values)

    if (result.length === 0) {
      return null
    }

    const row = result[0]
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      brand: row.brand,
      goals: row.goals ? JSON.parse(row.goals) : [],
      timeline: {
        startDate: row.start_date,
        endDate: row.end_date,
        applicationDeadline: row.application_deadline,
        contentDeadline: row.content_deadline
      },
      budget: {
        total: parseFloat(row.total_budget || '0'),
        perInfluencer: parseFloat(row.per_influencer_budget || '0')
      },
      requirements: {
        minFollowers: parseInt(row.min_followers || '0'),
        maxFollowers: parseInt(row.max_followers || '1000000'),
        minEngagement: parseFloat(row.min_engagement || '0'),
        platforms: row.platforms ? JSON.parse(row.platforms) : [],
        demographics: row.demographics ? JSON.parse(row.demographics) : {},
        contentGuidelines: row.content_guidelines || ''
      },
      deliverables: row.deliverables ? JSON.parse(row.deliverables) : [],
      isActive: row.is_active,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }
  } catch (error) {
    console.error('Error updating campaign template:', error)
    throw error
  }
}

/**
 * Delete campaign template
 */
export async function deleteCampaignTemplate(id: string): Promise<boolean> {
  try {
    const _result = await query(`
      DELETE FROM campaign_templates 
      WHERE id = $1
      RETURNING id
    `, [id])

    return result.length > 0
  } catch (error) {
    console.error('Error deleting campaign template:', error)
    throw error
  }
}

/**
 * Create campaign from template
 */
export async function createCampaignFromTemplate(
  templateId: string, 
  campaignData: {
    name: string
    brand: string
    description?: string
    createdBy: string
  }
): Promise<any> {
  try {
    const template = await getCampaignTemplateById(templateId)
    if (!template) {
      throw new Error('Template not found')
    }

    // Create campaign using template data
    const campaign = {
      name: campaignData.name,
      brand: campaignData.brand,
      description: campaignData.description || template.description,
      status: 'draft' as const,
      goals: template.goals,
      timeline: template.timeline,
      budget: template.budget,
      requirements: template.requirements,
      deliverables: template.deliverables,
      createdBy: campaignData.createdBy
    }

    // Use the existing campaign creation function
    const { createCampaign } = await import('./campaigns')
    return await createCampaign(campaign)
  } catch (error) {
    console.error('Error creating campaign from template:', error)
    throw error
  }
} 