import { getDatabase } from '../connection';

export interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  industry: string;
  goals: string[];
  requirements: {
    minFollowers: number;
    maxFollowers: number;
    minEngagement: number;
    platforms: string[];
    demographics: Record<string, unknown>;
    contentGuidelines: string;
  };
  deliverables: string[];
  budgetRange: {
    min: number;
    max: number;
  };
  timelineTemplate: {
    preparationDays: number;
    executionDays: number;
    totalDays: number;
  };
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Campaign Template CRUD operations
export async function getAllCampaignTemplates(): Promise<CampaignTemplate[]> {
  const db = getDatabase();
  const result = await db.query(`
    SELECT * FROM campaign_templates 
    WHERE is_active = true
    ORDER BY created_at DESC
  `);
  
  return result.rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    industry: row.industry,
    goals: row.goals ? JSON.parse(row.goals) : [],
    requirements: {
      minFollowers: row.min_followers,
      maxFollowers: row.max_followers,
      minEngagement: row.min_engagement,
      platforms: row.platforms ? JSON.parse(row.platforms) : [],
      demographics: row.demographics ? JSON.parse(row.demographics) : {},
      contentGuidelines: row.content_guidelines
    },
    deliverables: row.deliverables ? JSON.parse(row.deliverables) : [],
    budgetRange: {
      min: row.budget_min,
      max: row.budget_max
    },
    timelineTemplate: {
      preparationDays: row.preparation_days,
      executionDays: row.execution_days,
      totalDays: row.total_days
    },
    isActive: row.is_active,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export async function getCampaignTemplateById(id: string): Promise<CampaignTemplate | null> {
  const db = getDatabase();
  const result = await db.query(`
    SELECT * FROM campaign_templates WHERE id = $1
  `, [id]);
  
  if (result.rows.length === 0) return null;
  
  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    industry: row.industry,
    goals: row.goals ? JSON.parse(row.goals) : [],
    requirements: {
      minFollowers: row.min_followers,
      maxFollowers: row.max_followers,
      minEngagement: row.min_engagement,
      platforms: row.platforms ? JSON.parse(row.platforms) : [],
      demographics: row.demographics ? JSON.parse(row.demographics) : {},
      contentGuidelines: row.content_guidelines
    },
    deliverables: row.deliverables ? JSON.parse(row.deliverables) : [],
    budgetRange: {
      min: row.budget_min,
      max: row.budget_max
    },
    timelineTemplate: {
      preparationDays: row.preparation_days,
      executionDays: row.execution_days,
      totalDays: row.total_days
    },
    isActive: row.is_active,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function createCampaignTemplate(template: Omit<CampaignTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<CampaignTemplate> {
  const db = getDatabase();
  const result = await db.query(`
    INSERT INTO campaign_templates (
      name, description, industry, goals, min_followers, max_followers,
      min_engagement, platforms, demographics, content_guidelines,
      deliverables, budget_min, budget_max, preparation_days,
      execution_days, total_days, is_active, created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    RETURNING *
  `, [
    template.name,
    template.description,
    template.industry,
    JSON.stringify(template.goals),
    template.requirements.minFollowers,
    template.requirements.maxFollowers,
    template.requirements.minEngagement,
    JSON.stringify(template.requirements.platforms),
    JSON.stringify(template.requirements.demographics),
    template.requirements.contentGuidelines,
    JSON.stringify(template.deliverables),
    template.budgetRange.min,
    template.budgetRange.max,
    template.timelineTemplate.preparationDays,
    template.timelineTemplate.executionDays,
    template.timelineTemplate.totalDays,
    template.isActive,
    template.createdBy
  ]);

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    industry: row.industry,
    goals: row.goals ? JSON.parse(row.goals) : [],
    requirements: {
      minFollowers: row.min_followers,
      maxFollowers: row.max_followers,
      minEngagement: row.min_engagement,
      platforms: row.platforms ? JSON.parse(row.platforms) : [],
      demographics: row.demographics ? JSON.parse(row.demographics) : {},
      contentGuidelines: row.content_guidelines
    },
    deliverables: row.deliverables ? JSON.parse(row.deliverables) : [],
    budgetRange: {
      min: row.budget_min,
      max: row.budget_max
    },
    timelineTemplate: {
      preparationDays: row.preparation_days,
      executionDays: row.execution_days,
      totalDays: row.total_days
    },
    isActive: row.is_active,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function updateCampaignTemplate(id: string, updates: Partial<CampaignTemplate>): Promise<CampaignTemplate | null> {
  const db = getDatabase();
  const setClauses: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (updates.name !== undefined) {
    setClauses.push(`name = $${paramCount++}`);
    values.push(updates.name);
  }
  if (updates.description !== undefined) {
    setClauses.push(`description = $${paramCount++}`);
    values.push(updates.description);
  }
  if (updates.industry !== undefined) {
    setClauses.push(`industry = $${paramCount++}`);
    values.push(updates.industry);
  }
  if (updates.goals !== undefined) {
    setClauses.push(`goals = $${paramCount++}`);
    values.push(JSON.stringify(updates.goals));
  }
  if (updates.requirements?.minFollowers !== undefined) {
    setClauses.push(`min_followers = $${paramCount++}`);
    values.push(updates.requirements.minFollowers);
  }
  if (updates.requirements?.maxFollowers !== undefined) {
    setClauses.push(`max_followers = $${paramCount++}`);
    values.push(updates.requirements.maxFollowers);
  }
  if (updates.requirements?.minEngagement !== undefined) {
    setClauses.push(`min_engagement = $${paramCount++}`);
    values.push(updates.requirements.minEngagement);
  }
  if (updates.requirements?.platforms !== undefined) {
    setClauses.push(`platforms = $${paramCount++}`);
    values.push(JSON.stringify(updates.requirements.platforms));
  }
  if (updates.requirements?.demographics !== undefined) {
    setClauses.push(`demographics = $${paramCount++}`);
    values.push(JSON.stringify(updates.requirements.demographics));
  }
  if (updates.requirements?.contentGuidelines !== undefined) {
    setClauses.push(`content_guidelines = $${paramCount++}`);
    values.push(updates.requirements.contentGuidelines);
  }
  if (updates.deliverables !== undefined) {
    setClauses.push(`deliverables = $${paramCount++}`);
    values.push(JSON.stringify(updates.deliverables));
  }
  if (updates.budgetRange?.min !== undefined) {
    setClauses.push(`budget_min = $${paramCount++}`);
    values.push(updates.budgetRange.min);
  }
  if (updates.budgetRange?.max !== undefined) {
    setClauses.push(`budget_max = $${paramCount++}`);
    values.push(updates.budgetRange.max);
  }
  if (updates.timelineTemplate?.preparationDays !== undefined) {
    setClauses.push(`preparation_days = $${paramCount++}`);
    values.push(updates.timelineTemplate.preparationDays);
  }
  if (updates.timelineTemplate?.executionDays !== undefined) {
    setClauses.push(`execution_days = $${paramCount++}`);
    values.push(updates.timelineTemplate.executionDays);
  }
  if (updates.timelineTemplate?.totalDays !== undefined) {
    setClauses.push(`total_days = $${paramCount++}`);
    values.push(updates.timelineTemplate.totalDays);
  }
  if (updates.isActive !== undefined) {
    setClauses.push(`is_active = $${paramCount++}`);
    values.push(updates.isActive);
  }

  if (setClauses.length === 0) {
    return getCampaignTemplateById(id);
  }

  setClauses.push(`updated_at = NOW()`);
  values.push(id);

  const result = await db.query(`
    UPDATE campaign_templates 
    SET ${setClauses.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `, values);

  if (result.rows.length === 0) return null;

  return getCampaignTemplateById(id);
}

export async function deleteCampaignTemplate(id: string): Promise<boolean> {
  const db = getDatabase();
  const result = await db.query('DELETE FROM campaign_templates WHERE id = $1', [id]);
  return result.rowCount !== null && result.rowCount > 0;
}

export async function deactivateCampaignTemplate(id: string): Promise<CampaignTemplate | null> {
  return updateCampaignTemplate(id, { isActive: false });
}

export async function getCampaignTemplatesByIndustry(industry: string): Promise<CampaignTemplate[]> {
  const db = getDatabase();
  const result = await db.query(`
    SELECT * FROM campaign_templates 
    WHERE industry = $1 AND is_active = true
    ORDER BY created_at DESC
  `, [industry]);
  
  return result.rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    industry: row.industry,
    goals: row.goals ? JSON.parse(row.goals) : [],
    requirements: {
      minFollowers: row.min_followers,
      maxFollowers: row.max_followers,
      minEngagement: row.min_engagement,
      platforms: row.platforms ? JSON.parse(row.platforms) : [],
      demographics: row.demographics ? JSON.parse(row.demographics) : {},
      contentGuidelines: row.content_guidelines
    },
    deliverables: row.deliverables ? JSON.parse(row.deliverables) : [],
    budgetRange: {
      min: row.budget_min,
      max: row.budget_max
    },
    timelineTemplate: {
      preparationDays: row.preparation_days,
      executionDays: row.execution_days,
      totalDays: row.total_days
    },
    isActive: row.is_active,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
} 