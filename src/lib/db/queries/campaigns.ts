import { getDatabase } from '../connection';
import { Campaign, CampaignInfluencer, CampaignStatus, CampaignInvitation } from '@/types';

// Campaign CRUD operations
export async function getAllCampaigns(): Promise<Campaign[]> {
  const db = getDatabase();
  const result = await db.query(`
    SELECT 
      c.*,
      COUNT(ci.id) as total_influencers,
      COUNT(CASE WHEN ci.status = 'accepted' THEN 1 END) as accepted_count,
      COUNT(CASE WHEN ci.status = 'pending' THEN 1 END) as pending_count
    FROM campaigns c
    LEFT JOIN campaign_influencers ci ON c.id = ci.campaign_id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `);
  
  return result.rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    brand: row.brand,
    status: row.status as CampaignStatus,
    description: row.description,
    goals: row.goals ? JSON.parse(row.goals) : [],
    timeline: {
      startDate: row.start_date,
      endDate: row.end_date,
      applicationDeadline: row.application_deadline,
      contentDeadline: row.content_deadline
    },
    budget: {
      total: row.total_budget,
      perInfluencer: row.per_influencer_budget
    },
    requirements: {
      minFollowers: row.min_followers,
      maxFollowers: row.max_followers,
      minEngagement: row.min_engagement,
      platforms: row.platforms ? JSON.parse(row.platforms) : [],
      demographics: row.demographics ? JSON.parse(row.demographics) : {},
      contentGuidelines: row.content_guidelines
    },
    deliverables: row.deliverables ? JSON.parse(row.deliverables) : [],
    totalInfluencers: parseInt(row.total_influencers) || 0,
    acceptedCount: parseInt(row.accepted_count) || 0,
    pendingCount: parseInt(row.pending_count) || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  const db = getDatabase();
  const result = await db.query(`
    SELECT 
      c.*,
      COUNT(ci.id) as total_influencers,
      COUNT(CASE WHEN ci.status = 'accepted' THEN 1 END) as accepted_count,
      COUNT(CASE WHEN ci.status = 'pending' THEN 1 END) as pending_count
    FROM campaigns c
    LEFT JOIN campaign_influencers ci ON c.id = ci.campaign_id
    WHERE c.id = $1
    GROUP BY c.id
  `, [id]);
  
  if (result.rows.length === 0) return null;
  
  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    status: row.status as CampaignStatus,
    description: row.description,
    goals: row.goals ? JSON.parse(row.goals) : [],
    timeline: {
      startDate: row.start_date,
      endDate: row.end_date,
      applicationDeadline: row.application_deadline,
      contentDeadline: row.content_deadline
    },
    budget: {
      total: row.total_budget,
      perInfluencer: row.per_influencer_budget
    },
    requirements: {
      minFollowers: row.min_followers,
      maxFollowers: row.max_followers,
      minEngagement: row.min_engagement,
      platforms: row.platforms ? JSON.parse(row.platforms) : [],
      demographics: row.demographics ? JSON.parse(row.demographics) : {},
      contentGuidelines: row.content_guidelines
    },
    deliverables: row.deliverables ? JSON.parse(row.deliverables) : [],
    totalInfluencers: parseInt(row.total_influencers) || 0,
    acceptedCount: parseInt(row.accepted_count) || 0,
    pendingCount: parseInt(row.pending_count) || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function createCampaign(campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'totalInfluencers' | 'acceptedCount' | 'pendingCount'>): Promise<Campaign> {
  const db = getDatabase();
  const result = await db.query(`
    INSERT INTO campaigns (
      name, brand, status, description, goals, start_date, end_date, 
      application_deadline, content_deadline, total_budget, per_influencer_budget,
      min_followers, max_followers, min_engagement, platforms, demographics,
      content_guidelines, deliverables
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    RETURNING *
  `, [
    campaign.name,
    campaign.brand,
    campaign.status,
    campaign.description,
    JSON.stringify(campaign.goals),
    campaign.timeline.startDate,
    campaign.timeline.endDate,
    campaign.timeline.applicationDeadline,
    campaign.timeline.contentDeadline,
    campaign.budget.total,
    campaign.budget.perInfluencer,
    campaign.requirements.minFollowers,
    campaign.requirements.maxFollowers,
    campaign.requirements.minEngagement,
    JSON.stringify(campaign.requirements.platforms),
    JSON.stringify(campaign.requirements.demographics),
    campaign.requirements.contentGuidelines,
    JSON.stringify(campaign.deliverables)
  ]);

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    status: row.status as CampaignStatus,
    description: row.description,
    goals: row.goals ? JSON.parse(row.goals) : [],
    timeline: {
      startDate: row.start_date,
      endDate: row.end_date,
      applicationDeadline: row.application_deadline,
      contentDeadline: row.content_deadline
    },
    budget: {
      total: row.total_budget,
      perInfluencer: row.per_influencer_budget
    },
    requirements: {
      minFollowers: row.min_followers,
      maxFollowers: row.max_followers,
      minEngagement: row.min_engagement,
      platforms: row.platforms ? JSON.parse(row.platforms) : [],
      demographics: row.demographics ? JSON.parse(row.demographics) : {},
      contentGuidelines: row.content_guidelines
    },
    deliverables: row.deliverables ? JSON.parse(row.deliverables) : [],
    totalInfluencers: 0,
    acceptedCount: 0,
    pendingCount: 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | null> {
  const db = getDatabase();
  const setClauses: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (updates.name !== undefined) {
    setClauses.push(`name = $${paramCount++}`);
    values.push(updates.name);
  }
  if (updates.brand !== undefined) {
    setClauses.push(`brand = $${paramCount++}`);
    values.push(updates.brand);
  }
  if (updates.status !== undefined) {
    setClauses.push(`status = $${paramCount++}`);
    values.push(updates.status);
  }
  if (updates.description !== undefined) {
    setClauses.push(`description = $${paramCount++}`);
    values.push(updates.description);
  }
  if (updates.goals !== undefined) {
    setClauses.push(`goals = $${paramCount++}`);
    values.push(JSON.stringify(updates.goals));
  }
  if (updates.timeline?.startDate !== undefined) {
    setClauses.push(`start_date = $${paramCount++}`);
    values.push(updates.timeline.startDate);
  }
  if (updates.timeline?.endDate !== undefined) {
    setClauses.push(`end_date = $${paramCount++}`);
    values.push(updates.timeline.endDate);
  }
  if (updates.timeline?.applicationDeadline !== undefined) {
    setClauses.push(`application_deadline = $${paramCount++}`);
    values.push(updates.timeline.applicationDeadline);
  }
  if (updates.timeline?.contentDeadline !== undefined) {
    setClauses.push(`content_deadline = $${paramCount++}`);
    values.push(updates.timeline.contentDeadline);
  }
  if (updates.budget?.total !== undefined) {
    setClauses.push(`total_budget = $${paramCount++}`);
    values.push(updates.budget.total);
  }
  if (updates.budget?.perInfluencer !== undefined) {
    setClauses.push(`per_influencer_budget = $${paramCount++}`);
    values.push(updates.budget.perInfluencer);
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

  if (setClauses.length === 0) {
    return getCampaignById(id);
  }

  setClauses.push(`updated_at = NOW()`);
  values.push(id);

  const result = await db.query(`
    UPDATE campaigns 
    SET ${setClauses.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `, values);

  if (result.rows.length === 0) return null;

  return getCampaignById(id);
}

export async function deleteCampaign(id: string): Promise<boolean> {
  const db = getDatabase();
  // First delete related campaign_influencers
  await db.query('DELETE FROM campaign_influencers WHERE campaign_id = $1', [id]);
  
  // Then delete the campaign
  const result = await db.query('DELETE FROM campaigns WHERE id = $1', [id]);
  return result.rowCount !== null && result.rowCount > 0;
}

export async function duplicateCampaign(id: string, newName: string): Promise<Campaign | null> {
  const originalCampaign = await getCampaignById(id);
  if (!originalCampaign) return null;

  const duplicateData = {
    ...originalCampaign,
    name: newName,
    status: 'draft' as CampaignStatus
  };

  // Remove fields that shouldn't be duplicated
  delete (duplicateData as any).id;
  delete (duplicateData as any).createdAt;
  delete (duplicateData as any).updatedAt;
  delete (duplicateData as any).totalInfluencers;
  delete (duplicateData as any).acceptedCount;
  delete (duplicateData as any).pendingCount;

  return createCampaign(duplicateData);
}

// Campaign Influencer operations
export async function getCampaignInfluencers(campaignId: string): Promise<CampaignInfluencer[]> {
  const db = getDatabase();
  const result = await db.query(`
    SELECT 
      ci.*,
      u.first_name,
      u.last_name,
      up.profile_image_url,
      i.username,
      i.niche,
      i.tier
    FROM campaign_influencers ci
    JOIN influencers i ON ci.influencer_id = i.id
    JOIN users u ON i.user_id = u.id
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE ci.campaign_id = $1
    ORDER BY ci.created_at DESC
  `, [campaignId]);

  return result.rows.map((row: any) => ({
    id: row.id,
    campaignId: row.campaign_id,
    influencerId: row.influencer_id,
    status: row.status,
    appliedAt: row.applied_at,
    acceptedAt: row.accepted_at,
    declinedAt: row.declined_at,
    contentSubmittedAt: row.content_submitted_at,
    paidAt: row.paid_at,
    notes: row.notes,
    rate: row.rate,
    // Influencer info
    influencer: {
      id: row.influencer_id,
      firstName: row.first_name,
      lastName: row.last_name,
      username: row.username,
      profileImageUrl: row.profile_image_url,
      niche: row.niche,
      tier: row.tier
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export async function addInfluencerToCampaign(campaignId: string, influencerId: string, rate?: number): Promise<CampaignInfluencer> {
  const db = getDatabase();
  const result = await db.query(`
    INSERT INTO campaign_influencers (campaign_id, influencer_id, status, rate)
    VALUES ($1, $2, 'pending', $3)
    RETURNING *
  `, [campaignId, influencerId, rate]);

  const row = result.rows[0];
  return {
    id: row.id,
    campaignId: row.campaign_id,
    influencerId: row.influencer_id,
    status: row.status,
    appliedAt: row.applied_at,
    acceptedAt: row.accepted_at,
    declinedAt: row.declined_at,
    contentSubmittedAt: row.content_submitted_at,
    paidAt: row.paid_at,
    notes: row.notes,
    rate: row.rate,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function updateCampaignInfluencerStatus(
  campaignId: string, 
  influencerId: string, 
  status: string,
  notes?: string
): Promise<CampaignInfluencer | null> {
  const db = getDatabase();
  const updateFields: string[] = ['status = $3', 'updated_at = NOW()'];
  const values: any[] = [campaignId, influencerId, status];
  let paramCount = 4;

  // Set timestamp fields based on status
  if (status === 'accepted') {
    updateFields.push(`accepted_at = NOW()`);
  } else if (status === 'declined') {
    updateFields.push(`declined_at = NOW()`);
  } else if (status === 'content_submitted') {
    updateFields.push(`content_submitted_at = NOW()`);
  } else if (status === 'paid') {
    updateFields.push(`paid_at = NOW()`);
  }

  if (notes !== undefined) {
    updateFields.push(`notes = $${paramCount++}`);
    values.push(notes);
  }

  const result = await db.query(`
    UPDATE campaign_influencers 
    SET ${updateFields.join(', ')}
    WHERE campaign_id = $1 AND influencer_id = $2
    RETURNING *
  `, values);

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    campaignId: row.campaign_id,
    influencerId: row.influencer_id,
    status: row.status,
    appliedAt: row.applied_at,
    acceptedAt: row.accepted_at,
    declinedAt: row.declined_at,
    contentSubmittedAt: row.content_submitted_at,
    paidAt: row.paid_at,
    notes: row.notes,
    rate: row.rate,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function removeInfluencerFromCampaign(campaignId: string, influencerId: string): Promise<boolean> {
  const db = getDatabase();
  const result = await db.query(`
    DELETE FROM campaign_influencers 
    WHERE campaign_id = $1 AND influencer_id = $2
  `, [campaignId, influencerId]);

  return result.rowCount !== null && result.rowCount > 0;
}

// Campaign Invitations
export async function getCampaignInvitations(campaignId?: string): Promise<CampaignInvitation[]> {
  const db = getDatabase();
  let query = `
    SELECT 
      ci.*,
      c.name as campaign_name,
      u.first_name,
      u.last_name,
      u.email,
      up.profile_image_url,
      i.username,
      i.niche
    FROM campaign_invitations ci
    JOIN campaigns c ON ci.campaign_id = c.id
    JOIN influencers i ON ci.influencer_id = i.id
    JOIN users u ON i.user_id = u.id
    LEFT JOIN user_profiles up ON u.id = up.user_id
  `;
  
  const values: any[] = [];
  if (campaignId) {
    query += ' WHERE ci.campaign_id = $1';
    values.push(campaignId);
  }
  
  query += ' ORDER BY ci.created_at DESC';

  const result = await db.query(query, values);

  return result.rows.map((row: any) => ({
    id: row.id,
    campaignId: row.campaign_id,
    influencerId: row.influencer_id,
    email: row.email,
    status: row.status,
    sentAt: row.sent_at,
    respondedAt: row.responded_at,
    response: row.response,
    // Campaign info
    campaignName: row.campaign_name,
    // Influencer info
    influencer: {
      id: row.influencer_id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      username: row.username,
      profileImageUrl: row.profile_image_url,
      niche: row.niche
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export async function createCampaignInvitation(
  campaignId: string, 
  influencerId: string, 
  email: string
): Promise<CampaignInvitation> {
  const db = getDatabase();
  const result = await db.query(`
    INSERT INTO campaign_invitations (campaign_id, influencer_id, email, status, sent_at)
    VALUES ($1, $2, $3, 'sent', NOW())
    RETURNING *
  `, [campaignId, influencerId, email]);

  const row = result.rows[0];
  return {
    id: row.id,
    campaignId: row.campaign_id,
    influencerId: row.influencer_id,
    email: row.email,
    status: row.status,
    sentAt: row.sent_at,
    respondedAt: row.responded_at,
    response: row.response,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function updateCampaignInvitationResponse(
  invitationId: string, 
  response: 'accepted' | 'declined',
  message?: string
): Promise<CampaignInvitation | null> {
  const db = getDatabase();
  const result = await db.query(`
    UPDATE campaign_invitations 
    SET status = $2, response = $3, responded_at = NOW(), updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `, [invitationId, response, message]);

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    campaignId: row.campaign_id,
    influencerId: row.influencer_id,
    email: row.email,
    status: row.status,
    sentAt: row.sent_at,
    respondedAt: row.responded_at,
    response: row.response,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
} 