import { query } from '../connection'

export interface Invoice {
  id: string
  influencerId: string
  campaignId: string
  invoiceNumber: string
  invoiceDate: Date
  dueDate: Date
  creatorName: string
  creatorAddress: string | null
  creatorEmail: string | null
  creatorPhone: string | null
  campaignReference: string
  brandName: string
  contentDescription: string
  contentLink: string
  agreedPrice: number
  currency: string
  vatRequired: boolean
  vatRate: number
  vatAmount: number
  totalAmount: number
  status: InvoiceStatus
  staffNotes: string | null
  paymentTerms: string
  pdfPath: string | null
  pdfGeneratedAt: Date | null
  createdBy: string | null
  verifiedBy: string | null
  verifiedAt: Date | null
  createdAt: Date
  updatedAt: Date
  // Joined fields
  influencer?: {
    id: string
    username: string
    profileImage: string | null
    email: string | null
  }
  campaign?: {
    id: string
    name: string
    brand: string | null
  }
}

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'VERIFIED' | 'DELAYED' | 'PAID' | 'VOIDED'

export interface InvoiceFilters {
  status?: InvoiceStatus | InvoiceStatus[]
  influencerId?: string
  campaignId?: string
  search?: string
  dateFrom?: string
  dateTo?: string
}

/**
 * Get all invoices with optional filters
 */
export async function getAllInvoices(filters: InvoiceFilters = {}): Promise<Invoice[]> {
  const conditions: string[] = []
  const values: unknown[] = []
  let paramCount = 1

  if (filters.status) {
    if (Array.isArray(filters.status)) {
      conditions.push(`ii.status = ANY($${paramCount++})`)
      values.push(filters.status)
    } else {
      conditions.push(`ii.status = $${paramCount++}`)
      values.push(filters.status)
    }
  }

  if (filters.influencerId) {
    conditions.push(`ii.influencer_id = $${paramCount++}`)
    values.push(filters.influencerId)
  }

  if (filters.campaignId) {
    conditions.push(`ii.campaign_id = $${paramCount++}`)
    values.push(filters.campaignId)
  }

  if (filters.search) {
    conditions.push(`(
      ii.invoice_number ILIKE $${paramCount} OR
      ii.creator_name ILIKE $${paramCount} OR
      ii.brand_name ILIKE $${paramCount} OR
      ii.campaign_reference ILIKE $${paramCount}
    )`)
    values.push(`%${filters.search}%`)
    paramCount++
  }

  if (filters.dateFrom) {
    conditions.push(`ii.invoice_date >= $${paramCount++}`)
    values.push(filters.dateFrom)
  }

  if (filters.dateTo) {
    conditions.push(`ii.invoice_date <= $${paramCount++}`)
    values.push(filters.dateTo)
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const result = await query(`
    SELECT 
      ii.*,
      i.username as influencer_username,
      u.email as influencer_email,
      up.profile_image_url as influencer_profile_image,
      c.name as campaign_name,
      b.company_name as campaign_brand
    FROM influencer_invoices ii
    LEFT JOIN influencers i ON ii.influencer_id = i.id
    LEFT JOIN users u ON i.user_id = u.id
    LEFT JOIN user_profiles up ON u.id = up.user_id
    LEFT JOIN campaigns c ON ii.campaign_id = c.id
    LEFT JOIN brands b ON c.brand_id = b.id
    ${whereClause}
    ORDER BY ii.created_at DESC
  `, values)

  return result.map(mapRowToInvoice)
}

/**
 * Get a single invoice by ID
 */
export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const result = await query(`
    SELECT 
      ii.*,
      i.username as influencer_username,
      u.email as influencer_email,
      up.profile_image_url as influencer_profile_image,
      c.name as campaign_name,
      b.company_name as campaign_brand
    FROM influencer_invoices ii
    LEFT JOIN influencers i ON ii.influencer_id = i.id
    LEFT JOIN users u ON i.user_id = u.id
    LEFT JOIN user_profiles up ON u.id = up.user_id
    LEFT JOIN campaigns c ON ii.campaign_id = c.id
    LEFT JOIN brands b ON c.brand_id = b.id
    WHERE ii.id = $1
  `, [id])

  if (result.length === 0) return null
  return mapRowToInvoice(result[0])
}

/**
 * Update invoice status
 */
export async function updateInvoiceStatus(
  id: string,
  status: InvoiceStatus,
  staffId?: string,
  notes?: string
): Promise<Invoice | null> {
  const updateFields: string[] = ['status = $2', 'updated_at = NOW()']
  const values: unknown[] = [id, status]
  let paramCount = 3

  if (status === 'VERIFIED') {
    updateFields.push(`verified_by = $${paramCount++}`)
    values.push(staffId || null)
    updateFields.push(`verified_at = NOW()`)
  }

  if (notes !== undefined) {
    updateFields.push(`staff_notes = $${paramCount++}`)
    values.push(notes)
  }

  const result = await query(`
    UPDATE influencer_invoices
    SET ${updateFields.join(', ')}
    WHERE id = $1
    RETURNING *
  `, values)

  if (result.length === 0) return null
  return getInvoiceById(id)
}

/**
 * Approve an invoice (set to VERIFIED)
 */
export async function approveInvoice(
  id: string,
  staffId: string,
  notes?: string
): Promise<Invoice | null> {
  return updateInvoiceStatus(id, 'VERIFIED', staffId, notes)
}

/**
 * Reject an invoice (set to VOIDED)
 */
export async function rejectInvoice(
  id: string,
  staffId: string,
  notes: string
): Promise<Invoice | null> {
  return updateInvoiceStatus(id, 'VOIDED', staffId, notes)
}

/**
 * Mark an invoice as paid
 */
export async function markInvoiceAsPaid(
  id: string,
  staffId: string,
  notes?: string
): Promise<Invoice | null> {
  return updateInvoiceStatus(id, 'PAID', staffId, notes)
}

/**
 * Mark invoice as delayed
 */
export async function delayInvoice(
  id: string,
  staffId: string,
  notes: string
): Promise<Invoice | null> {
  return updateInvoiceStatus(id, 'DELAYED', staffId, notes)
}

/**
 * Get invoice statistics
 */
export async function getInvoiceStats(): Promise<{
  total: number
  pending: number
  verified: number
  paid: number
  voided: number
  totalValue: number
  paidValue: number
}> {
  const result = await query(`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'SENT' THEN 1 END) as pending,
      COUNT(CASE WHEN status = 'VERIFIED' THEN 1 END) as verified,
      COUNT(CASE WHEN status = 'PAID' THEN 1 END) as paid,
      COUNT(CASE WHEN status = 'VOIDED' THEN 1 END) as voided,
      COALESCE(SUM(total_amount), 0) as total_value,
      COALESCE(SUM(CASE WHEN status = 'PAID' THEN total_amount ELSE 0 END), 0) as paid_value
    FROM influencer_invoices
  `, [])

  const row = result[0]
  return {
    total: parseInt(row.total) || 0,
    pending: parseInt(row.pending) || 0,
    verified: parseInt(row.verified) || 0,
    paid: parseInt(row.paid) || 0,
    voided: parseInt(row.voided) || 0,
    totalValue: parseFloat(row.total_value) || 0,
    paidValue: parseFloat(row.paid_value) || 0
  }
}

/**
 * Map database row to Invoice type
 */
function mapRowToInvoice(row: Record<string, unknown>): Invoice {
  return {
    id: row.id as string,
    influencerId: row.influencer_id as string,
    campaignId: row.campaign_id as string,
    invoiceNumber: row.invoice_number as string,
    invoiceDate: new Date(row.invoice_date as string),
    dueDate: new Date(row.due_date as string),
    creatorName: row.creator_name as string,
    creatorAddress: row.creator_address as string | null,
    creatorEmail: row.creator_email as string | null,
    creatorPhone: row.creator_phone as string | null,
    campaignReference: row.campaign_reference as string,
    brandName: row.brand_name as string,
    contentDescription: row.content_description as string,
    contentLink: row.content_link as string,
    agreedPrice: parseFloat(row.agreed_price as string) || 0,
    currency: (row.currency as string) || 'GBP',
    vatRequired: row.vat_required as boolean,
    vatRate: parseFloat(row.vat_rate as string) || 20,
    vatAmount: parseFloat(row.vat_amount as string) || 0,
    totalAmount: parseFloat(row.total_amount as string) || 0,
    status: row.status as InvoiceStatus,
    staffNotes: row.staff_notes as string | null,
    paymentTerms: (row.payment_terms as string) || 'Net 30',
    pdfPath: row.pdf_path as string | null,
    pdfGeneratedAt: row.pdf_generated_at ? new Date(row.pdf_generated_at as string) : null,
    createdBy: row.created_by as string | null,
    verifiedBy: row.verified_by as string | null,
    verifiedAt: row.verified_at ? new Date(row.verified_at as string) : null,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
    influencer: row.influencer_username ? {
      id: row.influencer_id as string,
      username: row.influencer_username as string,
      profileImage: row.influencer_profile_image as string | null,
      email: row.influencer_email as string | null
    } : undefined,
    campaign: row.campaign_name ? {
      id: row.campaign_id as string,
      name: row.campaign_name as string,
      brand: row.campaign_brand as string | null
    } : undefined
  }
}
