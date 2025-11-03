import { query } from '@/lib/db/connection'

export interface CreateNotificationParams {
  recipientId: string // Database user ID (not Clerk ID)
  type: 'QUOTE_SUBMITTED' | 'INVOICE_SUBMITTED' | 'CAMPAIGN_ASSIGNED' | 'BRAND_ASSIGNED'
  title: string
  message?: string
  relatedId?: string
  relatedType?: 'quotation' | 'invoice' | 'campaign' | 'brand'
}

/**
 * Create a new notification for a staff member
 */
export async function createNotification(params: CreateNotificationParams): Promise<boolean> {
  try {
    await query(`
      INSERT INTO notifications (
        recipient_id, type, title, message, related_id, related_type
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      params.recipientId,
      params.type,
      params.title,
      params.message || null,
      params.relatedId || null,
      params.relatedType || null
    ])
    
    console.log(`📬 Notification created for user ${params.recipientId}: ${params.title}`)
    return true
  } catch (_error) {
    console.error('Error creating notification:', error)
    return false
  }
}

/**
 * Create notification when a brand submits a quote
 */
export async function notifyQuoteSubmitted(
  assignedStaffId: string,
  brandName: string,
  campaignName: string,
  quotationId: string
): Promise<boolean> {
  return createNotification({
    recipientId: assignedStaffId,
    type: 'QUOTE_SUBMITTED',
    title: `New Quote from ${brandName}`,
    message: `${brandName} has submitted a quote request for "${campaignName}". Review and respond promptly.`,
    relatedId: quotationId,
    relatedType: 'quotation'
  })
}

/**
 * Create notification when a creator submits an invoice
 */
export async function notifyInvoiceSubmitted(
  assignedStaffId: string,
  creatorName: string,
  campaignName: string,
  invoiceId: string
): Promise<boolean> {
  return createNotification({
    recipientId: assignedStaffId,
    type: 'INVOICE_SUBMITTED',
    title: `Invoice from ${creatorName}`,
    message: `${creatorName} has submitted an invoice for "${campaignName}". Please review and process payment.`,
    relatedId: invoiceId,
    relatedType: 'invoice'
  })
}

/**
 * Create notification when a campaign is assigned to staff
 */
export async function notifyCampaignAssigned(
  assignedStaffId: string,
  campaignName: string,
  campaignId: string
): Promise<boolean> {
  return createNotification({
    recipientId: assignedStaffId,
    type: 'CAMPAIGN_ASSIGNED',
    title: `Campaign Assigned: ${campaignName}`,
    message: `You have been assigned to manage the "${campaignName}" campaign.`,
    relatedId: campaignId,
    relatedType: 'campaign'
  })
}

/**
 * Create notification when a brand is assigned to staff
 */
export async function notifyBrandAssigned(
  assignedStaffId: string,
  brandName: string,
  brandId: string
): Promise<boolean> {
  return createNotification({
    recipientId: assignedStaffId,
    type: 'BRAND_ASSIGNED',
    title: `Brand Assigned: ${brandName}`,
    message: `You are now the account manager for ${brandName}.`,
    relatedId: brandId,
    relatedType: 'brand'
  })
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const _result = await query(`
      SELECT COUNT(*) as count FROM notifications 
      WHERE recipient_id = $1 AND is_read = FALSE
    `, [userId])
    
    return parseInt(result[0]?.count || '0')
  } catch (_error) {
    console.error('Error getting unread count:', error)
    return 0
  }
}
