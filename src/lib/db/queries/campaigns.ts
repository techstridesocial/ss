import { query } from '../connection';
import { Campaign, CampaignInfluencer, CampaignStatus, CampaignInvitation } from '@/types';

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

// Campaign CRUD operations
export async function getAllCampaigns(): Promise<Campaign[]> {
  try {
    // First check what columns actually exist in the campaigns table
    const schemaCheck = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'campaigns'
      ORDER BY ordinal_position
    `);
    
    const availableColumns = schemaCheck.map(row => row.column_name);
    console.log('Available campaign columns:', availableColumns);
    
    // Use a more flexible query that works with the actual schema
    const result = await query(`
      SELECT 
        c.*,
        b.company_name as brand_name,
        u.email as created_by_email,
        u.email as created_by_name,
        COUNT(ci.id) as total_influencers,
        COUNT(CASE WHEN ci.status = 'ACCEPTED' THEN 1 END) as accepted_count,
        COUNT(CASE WHEN ci.status = 'INVITED' THEN 1 END) as pending_count,
        COUNT(CASE WHEN ci.payment_status = 'PAID' THEN 1 END) as paid_count,
        COUNT(CASE WHEN ci.payment_status = 'PENDING' THEN 1 END) as payment_pending_count
      FROM campaigns c
      LEFT JOIN brands b ON c.brand_id = b.id
      LEFT JOIN users u ON c.created_by = u.id
      LEFT JOIN campaign_influencers ci ON c.id = ci.campaign_id
      GROUP BY c.id, b.company_name, u.email
      ORDER BY c.created_at DESC
    `);
    
    return result.map((row: any) => ({
      id: row.id,
      name: row.name || 'Untitled Campaign',
      brand: row.brand_name || row.brand || 'Unknown Brand',
      status: (row.status || 'DRAFT') as CampaignStatus,
      description: row.description || '',
      goals: safeJsonParse(row.goals, []),
      timeline: {
        startDate: row.start_date || new Date().toISOString(),
        endDate: row.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        applicationDeadline: row.application_deadline || new Date().toISOString(),
        contentDeadline: row.content_deadline || new Date().toISOString()
      },
      budget: {
        total: parseFloat(row.budget || row.total_budget || '0'),
        perInfluencer: parseFloat(row.per_influencer_budget || '0')
      },
      requirements: {
        minFollowers: parseInt(row.min_followers || '0'),
        maxFollowers: parseInt(row.max_followers || '1000000'),
        minEngagement: parseFloat(row.min_engagement || '0'),
        platforms: safeJsonParse(row.platforms, []),
        demographics: safeJsonParse(row.demographics, {}),
        contentGuidelines: row.content_guidelines || ''
      },
      deliverables: safeJsonParse(row.deliverables, []),
      totalInfluencers: parseInt(row.total_influencers) || 0,
      acceptedCount: parseInt(row.accepted_count) || 0,
      pendingCount: parseInt(row.pending_count) || 0,
      paidCount: parseInt(row.paid_count) || 0,
      paymentPendingCount: parseInt(row.payment_pending_count) || 0,
      createdBy: {
        id: row.created_by || 'unknown',
        email: row.created_by_email || 'Unknown',
        name: row.created_by_name || 'Unknown Staff'
      },
      createdAt: row.created_at ? new Date(row.created_at) : new Date(),
      updatedAt: row.updated_at ? new Date(row.updated_at) : new Date()
    }));
    
  } catch (error) {
    console.error('Error in getAllCampaigns:', error);
    
    // Re-throw the error instead of returning mock data
    throw error;
  }
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  const result = await query(`
    SELECT 
      c.*,
      COUNT(ci.id) as total_influencers,
      COUNT(CASE WHEN ci.status = 'ACCEPTED' THEN 1 END) as accepted_count,
      COUNT(CASE WHEN ci.status = 'INVITED' THEN 1 END) as pending_count
    FROM campaigns c
    LEFT JOIN campaign_influencers ci ON c.id = ci.campaign_id
    WHERE c.id = $1
    GROUP BY c.id
  `, [id]);
  
  if (result.length === 0) return null;
  
  const row = result[0];
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    status: row.status as CampaignStatus,
    description: row.description,
    goals: safeJsonParse(row.goals, []),
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
      platforms: safeJsonParse(row.platforms, []),
      demographics: safeJsonParse(row.demographics, {}),
      contentGuidelines: row.content_guidelines
    },
    deliverables: safeJsonParse(row.deliverables, []),
    totalInfluencers: parseInt(row.total_influencers) || 0,
    acceptedCount: parseInt(row.accepted_count) || 0,
    pendingCount: parseInt(row.pending_count) || 0,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date()
  };
}

export async function createCampaign(campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'totalInfluencers' | 'acceptedCount' | 'pendingCount'>): Promise<Campaign> {
  const result = await query(`
    INSERT INTO campaigns (
      name, brand, status, description, goals, start_date, end_date, 
      application_deadline, content_deadline, total_budget, per_influencer_budget,
      min_followers, max_followers, min_engagement, platforms, demographics,
      content_guidelines, deliverables, created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
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
    JSON.stringify(campaign.deliverables),
    campaign.createdBy?.id || null
  ]);

  const row = result[0];
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    status: row.status as CampaignStatus,
    description: row.description,
    goals: safeJsonParse(row.goals, []),
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
      platforms: safeJsonParse(row.platforms, []),
      demographics: safeJsonParse(row.demographics, {}),
      contentGuidelines: row.content_guidelines
    },
    deliverables: safeJsonParse(row.deliverables, []),
    totalInfluencers: 0,
    acceptedCount: 0,
    pendingCount: 0,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date()
  };
}

export async function updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | null> {
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

  const result = await query(`
    UPDATE campaigns 
    SET ${setClauses.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `, values);

  if (result.length === 0) return null;

  return getCampaignById(id);
}

export async function deleteCampaign(id: string): Promise<boolean> {
  // First delete related campaign_influencers
  await query('DELETE FROM campaign_influencers WHERE campaign_id = $1', [id]);
  
  // Then delete the campaign
  const result = await query('DELETE FROM campaigns WHERE id = $1', [id]);
  return result.length > 0;
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
  const result = await query(`
    SELECT 
      ci.*,
      u.first_name,
      u.last_name,
      up.profile_image_url,
      i.username,
      i.niche,
      i.tier,
      ci.payment_status,
      ci.payment_date
    FROM campaign_influencers ci
    JOIN influencers i ON ci.influencer_id = i.id
    JOIN users u ON i.user_id = u.id
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE ci.campaign_id = $1
    ORDER BY ci.created_at DESC
  `, [campaignId]);

  return result.map((row: any) => ({
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
    paymentStatus: row.payment_status || 'PENDING',
    paymentDate: row.payment_date,
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
  try {
    const result = await query(`
      INSERT INTO campaign_influencers (campaign_id, influencer_id, status, compensation_amount)
      VALUES ($1, $2, 'ACCEPTED', $3)
      RETURNING *
    `, [campaignId, influencerId, rate]);

    const row = result[0];
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
      rate: row.compensation_amount,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  } catch (error) {
    console.error('❌ Database error in addInfluencerToCampaign:', error);
    
    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('duplicate key value violates unique constraint')) {
      throw new Error('This influencer is already added to this campaign');
    }
    
    // Check for foreign key constraint violation
    if (error instanceof Error && error.message.includes('violates foreign key constraint')) {
      throw new Error('Invalid campaign or influencer ID');
    }
    
    throw error;
  }
}

export async function updateCampaignInfluencerStatus(
  campaignId: string, 
  influencerId: string, 
  status: string,
  notes?: string,
  contentLinks?: string[],
  discountCode?: string
): Promise<CampaignInfluencer | null> {
  const updateFields: string[] = ['status = $3', 'updated_at = NOW()'];
  const values: any[] = [campaignId, influencerId, status];
  let paramCount = 4;

  // Set timestamp fields based on status
  if (status === 'ACCEPTED') {
    updateFields.push(`accepted_at = NOW()`);
  } else if (status === 'DECLINED') {
    updateFields.push(`declined_at = NOW()`);
  } else if (status === 'CONTENT_SUBMITTED') {
    updateFields.push(`content_submitted_at = NOW()`);
  } else if (status === 'PAID') {
    updateFields.push(`paid_at = NOW()`);
  }

  if (notes !== undefined) {
    updateFields.push(`notes = $${paramCount++}`);
    values.push(notes);
  }

  // Handle content links update - JSONB column requires proper casting
  if (contentLinks !== undefined) {
    updateFields.push(`content_links = $${paramCount++}`);
    values.push(JSON.stringify(contentLinks));
  }

  // Handle discount code update
  if (discountCode !== undefined) {
    updateFields.push(`discount_code = $${paramCount++}`);
    values.push(discountCode);
  }

  const result = await query(`
    UPDATE campaign_influencers 
    SET ${updateFields.join(', ')}
    WHERE campaign_id = $1 AND influencer_id = $2
    RETURNING *
  `, values);

  if (result.length === 0) return null;

  const row = result[0];
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
  const result = await query(`
    DELETE FROM campaign_influencers 
    WHERE campaign_id = $1 AND influencer_id = $2
  `, [campaignId, influencerId]);

  return result.length > 0;
}

// Campaign Invitations
export async function getCampaignInvitations(campaignId?: string): Promise<CampaignInvitation[]> {
  let queryString = `
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
    queryString += ' WHERE ci.campaign_id = $1';
    values.push(campaignId);
  }
  
  queryString += ' ORDER BY ci.created_at DESC';

  const result = await query(queryString, values);

  return result.map((row: any) => ({
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
  const result = await query(`
    INSERT INTO campaign_invitations (campaign_id, influencer_id, email, status, sent_at)
    VALUES ($1, $2, $3, 'sent', NOW())
    RETURNING *
  `, [campaignId, influencerId, email]);

  const row = result[0];
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
  const result = await query(`
    UPDATE campaign_invitations 
    SET status = $2, response = $3, responded_at = NOW(), updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `, [invitationId, response, message]);

  if (result.length === 0) return null;

  const row = result[0];
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

/**
 * Get campaigns assigned to a specific influencer
 */
export async function getInfluencerCampaigns(influencerId: string): Promise<any> {
  try {
    // Get campaign assignments for this influencer
    const campaignsQuery = `
      SELECT 
        c.id as campaign_id,
        c.name as campaign_name,
        c.description,
        c.brand,
        c.total_budget,
        c.per_influencer_budget,
        c.start_date,
        c.end_date,
        c.content_deadline,
        c.deliverables,
        c.content_guidelines,
        c.status as campaign_status,
        ci.status as assignment_status,
        ci.created_at as assigned_at,
        ci.id as campaign_influencer_id
      FROM campaign_influencers ci
      JOIN campaigns c ON ci.campaign_id = c.id
      WHERE ci.influencer_id = $1
      ORDER BY ci.created_at DESC
    `

    const campaigns = await query(campaignsQuery, [influencerId])

    // Get content submissions for each campaign
    const contentQuery = `
      SELECT 
        cs.id,
        cs.campaign_influencer_id,
        cs.content_url,
        cs.content_type,
        cs.platform,
        cs.title,
        cs.description,
        cs.caption,
        cs.hashtags,
        cs.views,
        cs.likes,
        cs.comments,
        cs.shares,
        cs.saves,
        cs.status,
        cs.submitted_at
      FROM campaign_content_submissions cs
      WHERE cs.campaign_influencer_id = ANY($1)
      ORDER BY cs.submitted_at DESC
    `

    const campaignInfluencerIds = campaigns.map((c: any) => c.campaign_influencer_id)
    const contentSubmissions = campaignInfluencerIds.length > 0 
      ? await query(contentQuery, [campaignInfluencerIds])
      : []

    // Group content submissions by campaign
    const contentByCampaign = contentSubmissions.reduce((acc: any, content: any) => {
      const campaignId = content.campaign_influencer_id
      if (!acc[campaignId]) {
        acc[campaignId] = []
      }
      acc[campaignId].push(content)
      return acc
    }, {})

    // Format the response
    const formattedCampaigns = campaigns.map((campaign: any) => {
      const content = contentByCampaign[campaign.campaign_influencer_id] || []
      
      return {
        id: campaign.campaign_id,
        campaign_name: campaign.campaign_name,
        brand_name: campaign.brand,
        description: campaign.description,
        amount: campaign.per_influencer_budget || campaign.total_budget,
        deadline: campaign.content_deadline || campaign.end_date,
        deliverables: campaign.deliverables ? campaign.deliverables.split(',') : [],
        status: mapCampaignStatus(campaign.campaign_status, campaign.assignment_status),
        assigned_at: campaign.assigned_at,
        content_guidelines: campaign.content_guidelines,
        content_submissions: content.map((c: any) => ({
          id: c.id,
          content_url: c.content_url,
          content_type: c.content_type,
          platform: c.platform,
          title: c.title,
          description: c.description,
          caption: c.caption,
          hashtags: c.hashtags || [],
          views: c.views || 0,
          likes: c.likes || 0,
          comments: c.comments || 0,
          shares: c.shares || 0,
          saves: c.saves || 0,
          status: c.status,
          submitted_at: c.submitted_at
        }))
      }
    })

    // Calculate summary statistics
    const activeCampaigns = formattedCampaigns.filter((c: any) => c.status === 'active')
    const completedCampaigns = formattedCampaigns.filter((c: any) => c.status === 'completed')
    const totalEarned = completedCampaigns.reduce((sum: number, c: any) => sum + (c.amount || 0), 0)
    const pendingPayment = activeCampaigns.reduce((sum: number, c: any) => sum + (c.amount || 0), 0)

    return { success: true,
      data: {
        campaigns: formattedCampaigns,
        summary: {
          total_campaigns: formattedCampaigns.length,
          active_campaigns: activeCampaigns.length,
          completed_campaigns: completedCampaigns.length,
          total_earned: totalEarned,
          pending_payment: pendingPayment
        }
      },
      message: 'Influencer campaigns retrieved successfully'
    }

  } catch (error) {
    console.error('Error getting influencer campaigns:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to retrieve influencer campaigns'
    }
  }
}

// Helper function to map campaign status
function mapCampaignStatus(campaignStatus: string, assignmentStatus: string): string {
  if (campaignStatus === 'COMPLETED') return 'completed'
  if (assignmentStatus === 'ACCEPTED' && campaignStatus === 'ACTIVE') return 'active'
  if (assignmentStatus === 'PENDING') return 'pending'
  if (assignmentStatus === 'DECLINED') return 'declined'
  return 'unknown'
} 