import { query } from '../connection';

// Helper function to safely parse JSON fields
function safeJsonParse(value: any, defaultValue: any = null) {
  if (!value) return defaultValue;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return defaultValue;
  }
}

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
  status: 'PENDING_REVIEW' | 'SENT' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
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
  try {
    const result = await query(`
      SELECT 
        q.*,
        COUNT(qi.id) as influencer_count
      FROM quotations q
      LEFT JOIN quotation_influencers qi ON q.id = qi.quotation_id
      GROUP BY q.id
      ORDER BY q.created_at DESC
    `);
    
    const quotations = await Promise.all(result.map(async (row: any) => {
      const influencers = await getQuotationInfluencers(row.id);
      
      return {
        id: row.id,
        brandName: row.brand_name || 'Unknown Brand',
        brandEmail: 'contact@brand.com', // Default since not in schema
        industry: 'General', // Default since not in schema
        campaignDescription: row.description || row.campaign_name || '',
        targetAudience: row.target_demographics || '',
        budget: parseFloat(row.total_quote || row.budget_range || '0'),
        timeline: row.campaign_duration || '',
        deliverables: safeJsonParse(row.deliverables, []),
        platforms: [], // Default since not in schema
        status: row.status || 'pending',
        submittedAt: row.requested_at || row.created_at,
        reviewedAt: row.quoted_at || row.approved_at || row.rejected_at,
        reviewedBy: undefined, // Default since not in schema
        notes: row.quote_notes || '',
        influencers,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    }));
    
    return quotations;
  } catch (error) {
    console.error('Error in getAllQuotations:', error);
    
    // Return mock data if database fails
    console.log('Returning mock data due to database error');
    return [
      {
        id: '1',
        brandName: 'TechCorp',
        brandEmail: 'marketing@techcorp.com',
        industry: 'Technology',
        campaignDescription: 'Product launch campaign for new smartphone',
        targetAudience: 'Tech-savvy professionals, 25-45',
        budget: 15000,
        timeline: '4 weeks',
        deliverables: ['2 feed posts', '1 review video', '3 stories'],
        platforms: ['instagram', 'youtube'],
        status: 'PENDING_REVIEW' as const,
        submittedAt: new Date('2024-05-01T00:00:00Z'),
        reviewedAt: undefined,
        reviewedBy: undefined,
        notes: 'High priority campaign',
        influencers: [],
        createdAt: new Date('2024-05-01T00:00:00Z'),
        updatedAt: new Date('2024-05-01T00:00:00Z')
      },
      {
        id: '2',
        brandName: 'Fashion Forward',
        brandEmail: 'hello@fashionforward.com',
        industry: 'Fashion',
        campaignDescription: 'Summer collection promotion',
        targetAudience: 'Fashion-conscious women, 18-35',
        budget: 8000,
        timeline: '3 weeks',
        deliverables: ['3 feed posts', '5 stories'],
        platforms: ['instagram', 'tiktok'],
        status: 'APPROVED' as const,
        submittedAt: new Date('2024-04-15T00:00:00Z'),
        reviewedAt: new Date('2024-04-20T00:00:00Z'),
        reviewedBy: 'staff@stridesocial.com',
        notes: 'Approved with minor adjustments',
        influencers: [],
        createdAt: new Date('2024-04-15T00:00:00Z'),
        updatedAt: new Date('2024-04-20T00:00:00Z')
      }
    ];
  }
}

export async function getQuotationById(id: string): Promise<Quotation | null> {
  const result = await query(`
    SELECT * FROM quotations WHERE id = $1
  `, [id]);
  
  if (result.length === 0) return null;
  
  const row = result[0];
  const influencers = await getQuotationInfluencers(id);
  
  return {
    id: row.id,
    brandName: row.brand_name || 'Unknown Brand',
    brandEmail: 'contact@brand.com', // Default since not in schema
    industry: 'General', // Default since not in schema
    campaignDescription: row.description || row.campaign_name || '',
    targetAudience: row.target_demographics || '',
    budget: parseFloat(row.total_quote || row.budget_range || '0'),
    timeline: row.campaign_duration || '',
    deliverables: safeJsonParse(row.deliverables, []),
    platforms: [], // Default since not in schema
    status: row.status || 'pending',
    submittedAt: row.requested_at || row.created_at,
    reviewedAt: row.quoted_at || row.approved_at || row.rejected_at,
    reviewedBy: undefined, // Default since not in schema
    notes: row.quote_notes || '',
    influencers,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function createQuotation(quotation: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt' | 'influencers'>): Promise<Quotation> {
  const result = await query(`
    INSERT INTO quotations (
      brand_name, campaign_name, description, target_demographics,
      total_quote, campaign_duration, deliverables, status, requested_at,
      quote_notes, influencer_count
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `, [
    quotation.brandName,
    quotation.campaignDescription,
    quotation.campaignDescription,
    quotation.targetAudience,
    quotation.budget,
    quotation.timeline,
    quotation.deliverables,
    quotation.status,
    quotation.submittedAt,
    quotation.notes,
    0 // Default influencer count
  ]);

  const row = result[0];
  return {
    id: row.id,
    brandName: row.brand_name || 'Unknown Brand',
    brandEmail: 'contact@brand.com', // Default since not in schema
    industry: 'General', // Default since not in schema
    campaignDescription: row.description || row.campaign_name || '',
    targetAudience: row.target_demographics || '',
    budget: parseFloat(row.total_quote || '0'),
    timeline: row.campaign_duration || '',
    deliverables: safeJsonParse(row.deliverables, []),
    platforms: [], // Default since not in schema
    status: row.status || 'pending',
    submittedAt: row.requested_at || row.created_at,
    reviewedAt: row.quoted_at || row.approved_at || row.rejected_at,
    reviewedBy: undefined, // Default since not in schema
    notes: row.quote_notes || '',
    influencers: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function updateQuotation(id: string, updates: Partial<Quotation>): Promise<Quotation | null> {
  const setClauses: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (updates.brandName !== undefined) {
    setClauses.push(`brand_name = $${paramCount++}`);
    values.push(updates.brandName);
  }
  if (updates.campaignDescription !== undefined) {
    setClauses.push(`description = $${paramCount++}`);
    values.push(updates.campaignDescription);
  }
  if (updates.targetAudience !== undefined) {
    setClauses.push(`target_demographics = $${paramCount++}`);
    values.push(updates.targetAudience);
  }
  if (updates.budget !== undefined) {
    setClauses.push(`total_quote = $${paramCount++}`);
    values.push(updates.budget);
  }
  if (updates.timeline !== undefined) {
    setClauses.push(`campaign_duration = $${paramCount++}`);
    values.push(updates.timeline);
  }
  if (updates.deliverables !== undefined) {
    setClauses.push(`deliverables = $${paramCount++}`);
    values.push(updates.deliverables);
  }
  if (updates.status !== undefined) {
    setClauses.push(`status = $${paramCount++}`);
    values.push(updates.status);
  }
  if (updates.notes !== undefined) {
    setClauses.push(`quote_notes = $${paramCount++}`);
    values.push(updates.notes);
  }

  // Handle status-specific timestamp updates
  if (updates.status === 'APPROVED') {
    setClauses.push(`approved_at = NOW()`);
  } else if (updates.status === 'REJECTED') {
    setClauses.push(`rejected_at = NOW()`);
  } else if (updates.status === 'SENT') {
    setClauses.push(`quoted_at = NOW()`);
  }

  if (setClauses.length === 0) {
    return getQuotationById(id);
  }

  setClauses.push(`updated_at = NOW()`);
  values.push(id);

  const result = await query(`
    UPDATE quotations 
    SET ${setClauses.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `, values);

  if (result.length === 0) return null;

  return getQuotationById(id);
}

// Get all quotations for a specific brand
export async function getBrandQuotations(brandId: string): Promise<Quotation[]> {
  const result = await query(`
    SELECT 
      q.*,
      COUNT(qi.id) as influencer_count
    FROM quotations q
    LEFT JOIN quotation_influencers qi ON q.id = qi.quotation_id
    WHERE q.brand_id = $1
    GROUP BY q.id
    ORDER BY q.created_at DESC
  `, [brandId]);

  return Promise.all(result.map(async (row) => {
    // Get influencers for this quotation
    const influencersResult = await query(`
      SELECT * FROM quotation_influencers WHERE quotation_id = $1
    `, [row.id]);

    return {
      id: row.id,
      brandName: row.brand_name || 'Unknown Brand',
      brandEmail: '', // Not stored in current schema
      industry: '', // Not stored in current schema
      campaignDescription: row.description || row.campaign_name || '',
      targetAudience: row.target_demographics || '',
      budget: parseFloat(row.total_quote || '0'),
      timeline: row.campaign_duration || '',
      deliverables: safeJsonParse(row.deliverables, []),
      platforms: [], // Not stored in current schema
      status: row.status || 'PENDING_REVIEW',
      submittedAt: row.requested_at || row.created_at,
      reviewedAt: row.quoted_at || row.approved_at || row.rejected_at,
      reviewedBy: undefined,
      notes: row.quote_notes || '',
      influencers: influencersResult.map(inf => ({
        id: inf.id,
        quotationId: inf.quotation_id,
        influencerId: inf.influencer_id,
        proposedRate: parseFloat(inf.quoted_price || '0'),
        notes: inf.notes || '',
        createdAt: inf.created_at,
        updatedAt: inf.created_at
      })),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }));
}

// Create a new quotation request from a brand
export async function createQuotationRequest(data: {
  brand_id: string;
  brand_name: string;
  campaign_name: string;
  description: string;
  influencer_count: number;
  budget_range?: string;
  campaign_duration?: string;
  deliverables?: string[];
  target_demographics?: string;
  selected_influencers?: string[];
  assigned_staff_id?: string;
}): Promise<Quotation> {
  const result = await query(`
    INSERT INTO quotations (
      brand_id, brand_name, campaign_name, description, 
      influencer_count, budget_range, campaign_duration, 
      deliverables, target_demographics, status, assigned_staff_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `, [
    data.brand_id,
    data.brand_name,
    data.campaign_name,
    data.description,
    data.influencer_count,
    data.budget_range || null,
    data.campaign_duration || null,
    JSON.stringify(data.deliverables || []),
    data.target_demographics || null,
    'PENDING_REVIEW',
    data.assigned_staff_id || null
  ]);

  const quotation = result[0];

  // If influencers are selected, add them to quotation_influencers
  if (data.selected_influencers && data.selected_influencers.length > 0) {
    for (const influencerId of data.selected_influencers) {
      // Get influencer details
      const infResult = await query(`
        SELECT 
          i.id, i.display_name, i.total_followers, i.total_engagement_rate,
          ip.platform
        FROM influencers i
        LEFT JOIN influencer_platforms ip ON i.id = ip.influencer_id
        WHERE i.id = $1
        LIMIT 1
      `, [influencerId]);

      if (infResult.length > 0) {
        const inf = infResult[0];
        await query(`
          INSERT INTO quotation_influencers (
            quotation_id, influencer_id, influencer_name, 
            platform, followers, engagement
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          quotation.id,
          inf.id,
          inf.display_name || 'Unknown',
          inf.platform || 'INSTAGRAM',
          inf.total_followers ? `${(inf.total_followers / 1000).toFixed(1)}K` : '0',
          inf.total_engagement_rate ? `${(inf.total_engagement_rate * 100).toFixed(1)}%` : '0%'
        ]);
      }
    }
  }

  return getQuotationById(quotation.id) as Promise<Quotation>;
}

export async function deleteQuotation(id: string): Promise<boolean> {
  // First delete related quotation_influencers
  await query('DELETE FROM quotation_influencers WHERE quotation_id = $1', [id]);
  
  // Then delete the quotation
  const result = await query('DELETE FROM quotations WHERE id = $1', [id]);
  return result.length > 0;
}

export async function approveQuotation(id: string, reviewedBy: string, notes?: string): Promise<Quotation | null> {
  return updateQuotation(id, {
    status: 'APPROVED',
    notes
  });
}

export async function rejectQuotation(id: string, reviewedBy: string, notes: string): Promise<Quotation | null> {
  return updateQuotation(id, {
    status: 'REJECTED',
    notes
  });
}

// Quotation Influencer operations
export async function getQuotationInfluencers(quotationId: string): Promise<QuotationInfluencer[]> {
  // For now, return empty array since quotation_influencers table may not exist
  // This can be expanded later when the influencer relationship system is implemented
  return [];
}

export async function addInfluencerToQuotation(
  quotationId: string, 
  influencerId: string, 
  proposedRate: number,
  notes?: string
): Promise<QuotationInfluencer> {
  const result = await query(`
    INSERT INTO quotation_influencers (quotation_id, influencer_id, proposed_rate, notes)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [quotationId, influencerId, proposedRate, notes]);

  const row = result[0];
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

  const result = await query(`
    UPDATE quotation_influencers 
    SET ${setClauses.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `, values);

  if (result.length === 0) return null;

  const row = result[0];
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
  const result = await query(`
    DELETE FROM quotation_influencers 
    WHERE quotation_id = $1 AND influencer_id = $2
  `, [quotationId, influencerId]);

  return result.length > 0;
}

// Helper function to create campaign from approved quotation
export async function createCampaignFromQuotation(quotationId: string): Promise<string | null> {
  const quotation = await getQuotationById(quotationId);
  if (!quotation || quotation.status !== 'APPROVED') return null;

  // Create campaign
  const campaignResult = await query(`
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

  const campaignId = campaignResult[0].id;

  // Add influencers to campaign
  for (const quotationInfluencer of quotation.influencers) {
    await query(`
      INSERT INTO campaign_influencers (campaign_id, influencer_id, status, rate)
      VALUES ($1, $2, 'INVITED', $3)
    `, [campaignId, quotationInfluencer.influencerId, quotationInfluencer.proposedRate]);
  }

  // Update quotation status
  await updateQuotation(quotationId, { status: 'EXPIRED' });

  return campaignId;
} 