import { getDatabase } from '../connection';

export interface Quotation {
  id: string;
  brandName: string;
  brandEmail: string;
  industry: string;
  campaignDescription: string;
  targetAudience: string;
  budget: number;
  timeline: string;
  deliverables: string[];
  platforms: string[];
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'completed';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  notes?: string;
  influencers: QuotationInfluencer[];
  createdAt: Date;
  updatedAt: Date;
}

export interface QuotationInfluencer {
  id: string;
  quotationId: string;
  influencerId: string;
  proposedRate: number;
  notes?: string;
  influencer?: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    profileImageUrl?: string;
    niche: string;
    tier: string;
    followersCount?: number;
    engagementRate?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Quotation CRUD operations
export async function getAllQuotations(): Promise<Quotation[]> {
  const db = getDatabase();
  const result = await db.query(`
    SELECT 
      q.*,
      COUNT(qi.id) as influencer_count
    FROM quotations q
    LEFT JOIN quotation_influencers qi ON q.id = qi.quotation_id
    GROUP BY q.id
    ORDER BY q.created_at DESC
  `);
  
  const quotations = await Promise.all(result.rows.map(async (row: any) => {
    const influencers = await getQuotationInfluencers(row.id);
    
    return {
      id: row.id,
      brandName: row.brand_name,
      brandEmail: row.brand_email,
      industry: row.industry,
      campaignDescription: row.campaign_description,
      targetAudience: row.target_audience,
      budget: row.budget,
      timeline: row.timeline,
      deliverables: row.deliverables ? JSON.parse(row.deliverables) : [],
      platforms: row.platforms ? JSON.parse(row.platforms) : [],
      status: row.status,
      submittedAt: row.submitted_at,
      reviewedAt: row.reviewed_at,
      reviewedBy: row.reviewed_by,
      notes: row.notes,
      influencers,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }));
  
  return quotations;
}

export async function getQuotationById(id: string): Promise<Quotation | null> {
  const db = getDatabase();
  const result = await db.query(`
    SELECT * FROM quotations WHERE id = $1
  `, [id]);
  
  if (result.rows.length === 0) return null;
  
  const row = result.rows[0];
  const influencers = await getQuotationInfluencers(id);
  
  return {
    id: row.id,
    brandName: row.brand_name,
    brandEmail: row.brand_email,
    industry: row.industry,
    campaignDescription: row.campaign_description,
    targetAudience: row.target_audience,
    budget: row.budget,
    timeline: row.timeline,
    deliverables: row.deliverables ? JSON.parse(row.deliverables) : [],
    platforms: row.platforms ? JSON.parse(row.platforms) : [],
    status: row.status,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    notes: row.notes,
    influencers,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function createQuotation(quotation: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt' | 'influencers'>): Promise<Quotation> {
  const db = getDatabase();
  const result = await db.query(`
    INSERT INTO quotations (
      brand_name, brand_email, industry, campaign_description, target_audience,
      budget, timeline, deliverables, platforms, status, submitted_at,
      reviewed_at, reviewed_by, notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *
  `, [
    quotation.brandName,
    quotation.brandEmail,
    quotation.industry,
    quotation.campaignDescription,
    quotation.targetAudience,
    quotation.budget,
    quotation.timeline,
    JSON.stringify(quotation.deliverables),
    JSON.stringify(quotation.platforms),
    quotation.status,
    quotation.submittedAt,
    quotation.reviewedAt,
    quotation.reviewedBy,
    quotation.notes
  ]);

  const row = result.rows[0];
  return {
    id: row.id,
    brandName: row.brand_name,
    brandEmail: row.brand_email,
    industry: row.industry,
    campaignDescription: row.campaign_description,
    targetAudience: row.target_audience,
    budget: row.budget,
    timeline: row.timeline,
    deliverables: row.deliverables ? JSON.parse(row.deliverables) : [],
    platforms: row.platforms ? JSON.parse(row.platforms) : [],
    status: row.status,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    notes: row.notes,
    influencers: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function updateQuotation(id: string, updates: Partial<Quotation>): Promise<Quotation | null> {
  const db = getDatabase();
  const setClauses: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (updates.brandName !== undefined) {
    setClauses.push(`brand_name = $${paramCount++}`);
    values.push(updates.brandName);
  }
  if (updates.brandEmail !== undefined) {
    setClauses.push(`brand_email = $${paramCount++}`);
    values.push(updates.brandEmail);
  }
  if (updates.industry !== undefined) {
    setClauses.push(`industry = $${paramCount++}`);
    values.push(updates.industry);
  }
  if (updates.campaignDescription !== undefined) {
    setClauses.push(`campaign_description = $${paramCount++}`);
    values.push(updates.campaignDescription);
  }
  if (updates.targetAudience !== undefined) {
    setClauses.push(`target_audience = $${paramCount++}`);
    values.push(updates.targetAudience);
  }
  if (updates.budget !== undefined) {
    setClauses.push(`budget = $${paramCount++}`);
    values.push(updates.budget);
  }
  if (updates.timeline !== undefined) {
    setClauses.push(`timeline = $${paramCount++}`);
    values.push(updates.timeline);
  }
  if (updates.deliverables !== undefined) {
    setClauses.push(`deliverables = $${paramCount++}`);
    values.push(JSON.stringify(updates.deliverables));
  }
  if (updates.platforms !== undefined) {
    setClauses.push(`platforms = $${paramCount++}`);
    values.push(JSON.stringify(updates.platforms));
  }
  if (updates.status !== undefined) {
    setClauses.push(`status = $${paramCount++}`);
    values.push(updates.status);
  }
  if (updates.reviewedAt !== undefined) {
    setClauses.push(`reviewed_at = $${paramCount++}`);
    values.push(updates.reviewedAt);
  }
  if (updates.reviewedBy !== undefined) {
    setClauses.push(`reviewed_by = $${paramCount++}`);
    values.push(updates.reviewedBy);
  }
  if (updates.notes !== undefined) {
    setClauses.push(`notes = $${paramCount++}`);
    values.push(updates.notes);
  }

  if (setClauses.length === 0) {
    return getQuotationById(id);
  }

  setClauses.push(`updated_at = NOW()`);
  values.push(id);

  const result = await db.query(`
    UPDATE quotations 
    SET ${setClauses.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `, values);

  if (result.rows.length === 0) return null;

  return getQuotationById(id);
}

export async function deleteQuotation(id: string): Promise<boolean> {
  const db = getDatabase();
  // First delete related quotation_influencers
  await db.query('DELETE FROM quotation_influencers WHERE quotation_id = $1', [id]);
  
  // Then delete the quotation
  const result = await db.query('DELETE FROM quotations WHERE id = $1', [id]);
  return result.rowCount !== null && result.rowCount > 0;
}

export async function approveQuotation(id: string, reviewedBy: string, notes?: string): Promise<Quotation | null> {
  return updateQuotation(id, {
    status: 'approved',
    reviewedAt: new Date(),
    reviewedBy,
    notes
  });
}

export async function rejectQuotation(id: string, reviewedBy: string, notes: string): Promise<Quotation | null> {
  return updateQuotation(id, {
    status: 'rejected',
    reviewedAt: new Date(),
    reviewedBy,
    notes
  });
}

// Quotation Influencer operations
export async function getQuotationInfluencers(quotationId: string): Promise<QuotationInfluencer[]> {
  const db = getDatabase();
  const result = await db.query(`
    SELECT 
      qi.*,
      u.first_name,
      u.last_name,
      up.profile_image_url,
      i.username,
      i.niche,
      i.tier,
      ip.followers_count,
      ip.engagement_rate
    FROM quotation_influencers qi
    JOIN influencers i ON qi.influencer_id = i.id
    JOIN users u ON i.user_id = u.id
    LEFT JOIN user_profiles up ON u.id = up.user_id
    LEFT JOIN influencer_platforms ip ON i.id = ip.influencer_id
    WHERE qi.quotation_id = $1
    ORDER BY qi.created_at DESC
  `, [quotationId]);

  return result.rows.map((row: any) => ({
    id: row.id,
    quotationId: row.quotation_id,
    influencerId: row.influencer_id,
    proposedRate: row.proposed_rate,
    notes: row.notes,
    influencer: {
      id: row.influencer_id,
      firstName: row.first_name,
      lastName: row.last_name,
      username: row.username,
      profileImageUrl: row.profile_image_url,
      niche: row.niche,
      tier: row.tier,
      followersCount: row.followers_count,
      engagementRate: row.engagement_rate
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export async function addInfluencerToQuotation(
  quotationId: string, 
  influencerId: string, 
  proposedRate: number,
  notes?: string
): Promise<QuotationInfluencer> {
  const db = getDatabase();
  const result = await db.query(`
    INSERT INTO quotation_influencers (quotation_id, influencer_id, proposed_rate, notes)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [quotationId, influencerId, proposedRate, notes]);

  const row = result.rows[0];
  return {
    id: row.id,
    quotationId: row.quotation_id,
    influencerId: row.influencer_id,
    proposedRate: row.proposed_rate,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function updateQuotationInfluencer(
  id: string,
  updates: { proposedRate?: number; notes?: string }
): Promise<QuotationInfluencer | null> {
  const db = getDatabase();
  const setClauses: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (updates.proposedRate !== undefined) {
    setClauses.push(`proposed_rate = $${paramCount++}`);
    values.push(updates.proposedRate);
  }
  if (updates.notes !== undefined) {
    setClauses.push(`notes = $${paramCount++}`);
    values.push(updates.notes);
  }

  if (setClauses.length === 0) return null;

  setClauses.push(`updated_at = NOW()`);
  values.push(id);

  const result = await db.query(`
    UPDATE quotation_influencers 
    SET ${setClauses.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `, values);

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    quotationId: row.quotation_id,
    influencerId: row.influencer_id,
    proposedRate: row.proposed_rate,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function removeInfluencerFromQuotation(quotationId: string, influencerId: string): Promise<boolean> {
  const db = getDatabase();
  const result = await db.query(`
    DELETE FROM quotation_influencers 
    WHERE quotation_id = $1 AND influencer_id = $2
  `, [quotationId, influencerId]);

  return result.rowCount !== null && result.rowCount > 0;
}

// Helper function to create campaign from approved quotation
export async function createCampaignFromQuotation(quotationId: string): Promise<string | null> {
  const quotation = await getQuotationById(quotationId);
  if (!quotation || quotation.status !== 'approved') return null;

  const db = getDatabase();
  
  // Create campaign
  const campaignResult = await db.query(`
    INSERT INTO campaigns (
      name, brand, status, description, total_budget, 
      platforms, deliverables, created_at
    ) VALUES ($1, $2, 'draft', $3, $4, $5, $6, NOW())
    RETURNING id
  `, [
    `${quotation.brandName} Campaign`,
    quotation.brandName,
    quotation.campaignDescription,
    quotation.budget,
    JSON.stringify(quotation.platforms),
    JSON.stringify(quotation.deliverables)
  ]);

  const campaignId = campaignResult.rows[0].id;

  // Add influencers to campaign
  for (const quotationInfluencer of quotation.influencers) {
    await db.query(`
      INSERT INTO campaign_influencers (campaign_id, influencer_id, status, rate)
      VALUES ($1, $2, 'pending', $3)
    `, [campaignId, quotationInfluencer.influencerId, quotationInfluencer.proposedRate]);
  }

  // Update quotation status
  await updateQuotation(quotationId, { status: 'completed' });

  return campaignId;
} 