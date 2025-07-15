import { getDatabase } from '../connection';

export interface ContactRecord {
  id: string;
  influencerId: string;
  contactType: 'email' | 'dm' | 'phone' | 'meeting' | 'other';
  subject: string;
  message: string;
  status: 'sent' | 'replied' | 'no_response' | 'follow_up_needed';
  sentAt: Date;
  respondedAt?: Date;
  nextFollowUp?: Date;
  campaignId?: string;
  quotationId?: string;
  sentBy: string;
  notes?: string;
  attachments?: string[];
  influencer?: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    profileImageUrl?: string;
    niche: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Contact Record CRUD operations
export async function getAllContactRecords(): Promise<ContactRecord[]> {
  const db = getDatabase();
  const result = await db.query(`
    SELECT 
      cr.*,
      u.first_name,
      u.last_name,
      u.email,
      up.profile_image_url,
      i.username,
      i.niche
    FROM contact_records cr
    JOIN influencers i ON cr.influencer_id = i.id
    JOIN users u ON i.user_id = u.id
    LEFT JOIN user_profiles up ON u.id = up.user_id
    ORDER BY cr.created_at DESC
  `);
  
  return result.rows.map((row: any) => ({
    id: row.id,
    influencerId: row.influencer_id,
    contactType: row.contact_type,
    subject: row.subject,
    message: row.message,
    status: row.status,
    sentAt: row.sent_at,
    respondedAt: row.responded_at,
    nextFollowUp: row.next_follow_up,
    campaignId: row.campaign_id,
    quotationId: row.quotation_id,
    sentBy: row.sent_by,
    notes: row.notes,
    attachments: row.attachments ? JSON.parse(row.attachments) : [],
    influencer: {
      id: row.influencer_id,
      firstName: row.first_name,
      lastName: row.last_name,
      username: row.username,
      email: row.email,
      profileImageUrl: row.profile_image_url,
      niche: row.niche
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export async function getContactRecordsByInfluencer(influencerId: string): Promise<ContactRecord[]> {
  const db = getDatabase();
  const result = await db.query(`
    SELECT 
      cr.*,
      u.first_name,
      u.last_name,
      u.email,
      up.profile_image_url,
      i.username,
      i.niche
    FROM contact_records cr
    JOIN influencers i ON cr.influencer_id = i.id
    JOIN users u ON i.user_id = u.id
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE cr.influencer_id = $1
    ORDER BY cr.created_at DESC
  `, [influencerId]);
  
  return result.rows.map((row: any) => ({
    id: row.id,
    influencerId: row.influencer_id,
    contactType: row.contact_type,
    subject: row.subject,
    message: row.message,
    status: row.status,
    sentAt: row.sent_at,
    respondedAt: row.responded_at,
    nextFollowUp: row.next_follow_up,
    campaignId: row.campaign_id,
    quotationId: row.quotation_id,
    sentBy: row.sent_by,
    notes: row.notes,
    attachments: row.attachments ? JSON.parse(row.attachments) : [],
    influencer: {
      id: row.influencer_id,
      firstName: row.first_name,
      lastName: row.last_name,
      username: row.username,
      email: row.email,
      profileImageUrl: row.profile_image_url,
      niche: row.niche
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export async function getContactRecordById(id: string): Promise<ContactRecord | null> {
  const db = getDatabase();
  const result = await db.query(`
    SELECT 
      cr.*,
      u.first_name,
      u.last_name,
      u.email,
      up.profile_image_url,
      i.username,
      i.niche
    FROM contact_records cr
    JOIN influencers i ON cr.influencer_id = i.id
    JOIN users u ON i.user_id = u.id
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE cr.id = $1
  `, [id]);
  
  if (result.rows.length === 0) return null;
  
  const row = result.rows[0];
  return {
    id: row.id,
    influencerId: row.influencer_id,
    contactType: row.contact_type,
    subject: row.subject,
    message: row.message,
    status: row.status,
    sentAt: row.sent_at,
    respondedAt: row.responded_at,
    nextFollowUp: row.next_follow_up,
    campaignId: row.campaign_id,
    quotationId: row.quotation_id,
    sentBy: row.sent_by,
    notes: row.notes,
    attachments: row.attachments ? JSON.parse(row.attachments) : [],
    influencer: {
      id: row.influencer_id,
      firstName: row.first_name,
      lastName: row.last_name,
      username: row.username,
      email: row.email,
      profileImageUrl: row.profile_image_url,
      niche: row.niche
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function createContactRecord(contact: Omit<ContactRecord, 'id' | 'createdAt' | 'updatedAt' | 'influencer'>): Promise<ContactRecord> {
  const db = getDatabase();
  const result = await db.query(`
    INSERT INTO contact_records (
      influencer_id, contact_type, subject, message, status, sent_at,
      responded_at, next_follow_up, campaign_id, quotation_id, sent_by,
      notes, attachments
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *
  `, [
    contact.influencerId,
    contact.contactType,
    contact.subject,
    contact.message,
    contact.status,
    contact.sentAt,
    contact.respondedAt,
    contact.nextFollowUp,
    contact.campaignId,
    contact.quotationId,
    contact.sentBy,
    contact.notes,
    contact.attachments ? JSON.stringify(contact.attachments) : null
  ]);

  const row = result.rows[0];
  
  // Get the contact record with influencer info
  return getContactRecordById(row.id) as Promise<ContactRecord>;
}

export async function updateContactRecord(id: string, updates: Partial<ContactRecord>): Promise<ContactRecord | null> {
  const db = getDatabase();
  const setClauses: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (updates.contactType !== undefined) {
    setClauses.push(`contact_type = $${paramCount++}`);
    values.push(updates.contactType);
  }
  if (updates.subject !== undefined) {
    setClauses.push(`subject = $${paramCount++}`);
    values.push(updates.subject);
  }
  if (updates.message !== undefined) {
    setClauses.push(`message = $${paramCount++}`);
    values.push(updates.message);
  }
  if (updates.status !== undefined) {
    setClauses.push(`status = $${paramCount++}`);
    values.push(updates.status);
  }
  if (updates.respondedAt !== undefined) {
    setClauses.push(`responded_at = $${paramCount++}`);
    values.push(updates.respondedAt);
  }
  if (updates.nextFollowUp !== undefined) {
    setClauses.push(`next_follow_up = $${paramCount++}`);
    values.push(updates.nextFollowUp);
  }
  if (updates.notes !== undefined) {
    setClauses.push(`notes = $${paramCount++}`);
    values.push(updates.notes);
  }
  if (updates.attachments !== undefined) {
    setClauses.push(`attachments = $${paramCount++}`);
    values.push(JSON.stringify(updates.attachments));
  }

  if (setClauses.length === 0) {
    return getContactRecordById(id);
  }

  setClauses.push(`updated_at = NOW()`);
  values.push(id);

  const result = await db.query(`
    UPDATE contact_records 
    SET ${setClauses.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `, values);

  if (result.rows.length === 0) return null;

  return getContactRecordById(id);
}

export async function deleteContactRecord(id: string): Promise<boolean> {
  const db = getDatabase();
  const result = await db.query('DELETE FROM contact_records WHERE id = $1', [id]);
  return result.rowCount !== null && result.rowCount > 0;
}

export async function markContactAsReplied(id: string, respondedAt?: Date): Promise<ContactRecord | null> {
  return updateContactRecord(id, {
    status: 'replied',
    respondedAt: respondedAt || new Date()
  });
}

export async function scheduleFollowUp(id: string, followUpDate: Date, notes?: string): Promise<ContactRecord | null> {
  return updateContactRecord(id, {
    status: 'follow_up_needed',
    nextFollowUp: followUpDate,
    notes
  });
}

// Analytics and reporting functions
export async function getContactRecordsByDateRange(startDate: Date, endDate: Date): Promise<ContactRecord[]> {
  const db = getDatabase();
  const result = await db.query(`
    SELECT 
      cr.*,
      u.first_name,
      u.last_name,
      u.email,
      up.profile_image_url,
      i.username,
      i.niche
    FROM contact_records cr
    JOIN influencers i ON cr.influencer_id = i.id
    JOIN users u ON i.user_id = u.id
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE cr.sent_at >= $1 AND cr.sent_at <= $2
    ORDER BY cr.created_at DESC
  `, [startDate, endDate]);
  
  return result.rows.map((row: any) => ({
    id: row.id,
    influencerId: row.influencer_id,
    contactType: row.contact_type,
    subject: row.subject,
    message: row.message,
    status: row.status,
    sentAt: row.sent_at,
    respondedAt: row.responded_at,
    nextFollowUp: row.next_follow_up,
    campaignId: row.campaign_id,
    quotationId: row.quotation_id,
    sentBy: row.sent_by,
    notes: row.notes,
    attachments: row.attachments ? JSON.parse(row.attachments) : [],
    influencer: {
      id: row.influencer_id,
      firstName: row.first_name,
      lastName: row.last_name,
      username: row.username,
      email: row.email,
      profileImageUrl: row.profile_image_url,
      niche: row.niche
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export async function getContactResponseRates(): Promise<{
  totalContacts: number;
  responseRate: number;
  avgResponseTime: number;
}> {
  const db = getDatabase();
  const result = await db.query(`
    SELECT 
      COUNT(*) as total_contacts,
      COUNT(CASE WHEN status = 'replied' THEN 1 END) as replied_count,
      AVG(EXTRACT(EPOCH FROM (responded_at - sent_at))/86400) as avg_response_days
    FROM contact_records
    WHERE sent_at >= NOW() - INTERVAL '30 days'
  `);
  
  const row = result.rows[0];
  const totalContacts = parseInt(row.total_contacts) || 0;
  const repliedCount = parseInt(row.replied_count) || 0;
  const responseRate = totalContacts > 0 ? (repliedCount / totalContacts) * 100 : 0;
  const avgResponseTime = parseFloat(row.avg_response_days) || 0;
  
  return {
    totalContacts,
    responseRate,
    avgResponseTime
  };
}

export async function getUpcomingFollowUps(): Promise<ContactRecord[]> {
  const db = getDatabase();
  const result = await db.query(`
    SELECT 
      cr.*,
      u.first_name,
      u.last_name,
      u.email,
      up.profile_image_url,
      i.username,
      i.niche
    FROM contact_records cr
    JOIN influencers i ON cr.influencer_id = i.id
    JOIN users u ON i.user_id = u.id
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE cr.next_follow_up IS NOT NULL 
      AND cr.next_follow_up <= NOW() + INTERVAL '7 days'
      AND cr.status = 'follow_up_needed'
    ORDER BY cr.next_follow_up ASC
  `);
  
  return result.rows.map((row: any) => ({
    id: row.id,
    influencerId: row.influencer_id,
    contactType: row.contact_type,
    subject: row.subject,
    message: row.message,
    status: row.status,
    sentAt: row.sent_at,
    respondedAt: row.responded_at,
    nextFollowUp: row.next_follow_up,
    campaignId: row.campaign_id,
    quotationId: row.quotation_id,
    sentBy: row.sent_by,
    notes: row.notes,
    attachments: row.attachments ? JSON.parse(row.attachments) : [],
    influencer: {
      id: row.influencer_id,
      firstName: row.first_name,
      lastName: row.last_name,
      username: row.username,
      email: row.email,
      profileImageUrl: row.profile_image_url,
      niche: row.niche
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
} 