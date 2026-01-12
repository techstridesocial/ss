import { query } from '@/lib/db/connection'

// All supported notification types
export type NotificationType = 
  // Staff notifications
  | 'QUOTE_SUBMITTED' 
  | 'INVOICE_SUBMITTED' 
  | 'CAMPAIGN_ASSIGNED' 
  | 'BRAND_ASSIGNED'
  | 'CONTENT_SUBMITTED'
  // Influencer notifications
  | 'CAMPAIGN_INVITATION'
  | 'CAMPAIGN_ACCEPTED'
  | 'CAMPAIGN_DECLINED'
  | 'CONTENT_APPROVED'
  | 'CONTENT_REJECTED'
  | 'REVISION_REQUESTED'
  | 'INVOICE_APPROVED'
  | 'INVOICE_REJECTED'
  | 'PAYMENT_PROCESSED'
  // Brand notifications
  | 'QUOTATION_SENT'
  | 'QUOTATION_APPROVED'
  | 'QUOTATION_REJECTED'
  | 'CAMPAIGN_CREATED'
  | 'INFLUENCER_ACCEPTED'
  | 'INFLUENCER_DECLINED'
  | 'CONTENT_READY'

export type RelatedType = 
  | 'quotation' 
  | 'invoice' 
  | 'campaign' 
  | 'brand' 
  | 'content_submission'
  | 'campaign_invitation'

export interface CreateNotificationParams {
  recipientId: string // Database user ID (not Clerk ID)
  type: NotificationType
  title: string
  message?: string
  relatedId?: string
  relatedType?: RelatedType
}

/**
 * Create a new notification for a user
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
  } catch (error) {
    console.error('Error creating notification:', error)
    return false
  }
}

// ============== STAFF NOTIFICATIONS ==============

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
 * Create notification when influencer submits content
 */
export async function notifyContentSubmitted(
  staffId: string,
  influencerName: string,
  campaignName: string,
  submissionId: string
): Promise<boolean> {
  return createNotification({
    recipientId: staffId,
    type: 'CONTENT_SUBMITTED',
    title: `Content Submitted by ${influencerName}`,
    message: `${influencerName} has submitted content for "${campaignName}". Please review.`,
    relatedId: submissionId,
    relatedType: 'content_submission'
  })
}

// ============== INFLUENCER NOTIFICATIONS ==============

/**
 * Notify influencer about a campaign invitation
 */
export async function notifyCampaignInvitation(
  influencerUserId: string,
  brandName: string,
  campaignName: string,
  invitationId: string
): Promise<boolean> {
  return createNotification({
    recipientId: influencerUserId,
    type: 'CAMPAIGN_INVITATION',
    title: `Campaign Invitation from ${brandName}`,
    message: `You've been invited to join "${campaignName}" by ${brandName}. Check your invitations to respond.`,
    relatedId: invitationId,
    relatedType: 'campaign_invitation'
  })
}

/**
 * Notify about campaign acceptance (to staff)
 */
export async function notifyCampaignAccepted(
  staffId: string,
  influencerName: string,
  campaignName: string,
  campaignId: string
): Promise<boolean> {
  return createNotification({
    recipientId: staffId,
    type: 'CAMPAIGN_ACCEPTED',
    title: `${influencerName} Accepted Campaign`,
    message: `${influencerName} has accepted the invitation to join "${campaignName}".`,
    relatedId: campaignId,
    relatedType: 'campaign'
  })
}

/**
 * Notify about campaign decline (to staff)
 */
export async function notifyCampaignDeclined(
  staffId: string,
  influencerName: string,
  campaignName: string,
  campaignId: string
): Promise<boolean> {
  return createNotification({
    recipientId: staffId,
    type: 'CAMPAIGN_DECLINED',
    title: `${influencerName} Declined Campaign`,
    message: `${influencerName} has declined the invitation to join "${campaignName}".`,
    relatedId: campaignId,
    relatedType: 'campaign'
  })
}

/**
 * Notify influencer about content approval
 */
export async function notifyContentApproved(
  influencerUserId: string,
  campaignName: string,
  submissionId: string
): Promise<boolean> {
  return createNotification({
    recipientId: influencerUserId,
    type: 'CONTENT_APPROVED',
    title: 'Content Approved!',
    message: `Your content for "${campaignName}" has been approved. Great work!`,
    relatedId: submissionId,
    relatedType: 'content_submission'
  })
}

/**
 * Notify influencer about content rejection
 */
export async function notifyContentRejected(
  influencerUserId: string,
  campaignName: string,
  reason: string,
  submissionId: string
): Promise<boolean> {
  return createNotification({
    recipientId: influencerUserId,
    type: 'CONTENT_REJECTED',
    title: 'Content Rejected',
    message: `Your content for "${campaignName}" was not approved. Reason: ${reason}`,
    relatedId: submissionId,
    relatedType: 'content_submission'
  })
}

/**
 * Notify influencer about revision request
 */
export async function notifyRevisionRequested(
  influencerUserId: string,
  campaignName: string,
  feedback: string,
  submissionId: string
): Promise<boolean> {
  return createNotification({
    recipientId: influencerUserId,
    type: 'REVISION_REQUESTED',
    title: 'Revision Requested',
    message: `A revision has been requested for your content in "${campaignName}". ${feedback}`,
    relatedId: submissionId,
    relatedType: 'content_submission'
  })
}

/**
 * Notify influencer about invoice approval
 */
export async function notifyInvoiceApproved(
  influencerUserId: string,
  invoiceNumber: string,
  invoiceId: string
): Promise<boolean> {
  return createNotification({
    recipientId: influencerUserId,
    type: 'INVOICE_APPROVED',
    title: 'Invoice Approved',
    message: `Your invoice ${invoiceNumber} has been approved. Payment will be processed soon.`,
    relatedId: invoiceId,
    relatedType: 'invoice'
  })
}

/**
 * Notify influencer about invoice rejection
 */
export async function notifyInvoiceRejected(
  influencerUserId: string,
  invoiceNumber: string,
  reason: string,
  invoiceId: string
): Promise<boolean> {
  return createNotification({
    recipientId: influencerUserId,
    type: 'INVOICE_REJECTED',
    title: 'Invoice Rejected',
    message: `Your invoice ${invoiceNumber} was rejected. Reason: ${reason}`,
    relatedId: invoiceId,
    relatedType: 'invoice'
  })
}

/**
 * Notify influencer about payment processed
 */
export async function notifyPaymentProcessed(
  influencerUserId: string,
  amount: string,
  campaignName: string,
  invoiceId: string
): Promise<boolean> {
  return createNotification({
    recipientId: influencerUserId,
    type: 'PAYMENT_PROCESSED',
    title: 'Payment Sent!',
    message: `${amount} has been sent for your work on "${campaignName}".`,
    relatedId: invoiceId,
    relatedType: 'invoice'
  })
}

// ============== BRAND NOTIFICATIONS ==============

/**
 * Notify brand about quotation being sent by staff
 */
export async function notifyQuotationSent(
  brandUserId: string,
  campaignName: string,
  quotationId: string
): Promise<boolean> {
  return createNotification({
    recipientId: brandUserId,
    type: 'QUOTATION_SENT',
    title: 'Quotation Ready',
    message: `Your quotation for "${campaignName}" is ready for review.`,
    relatedId: quotationId,
    relatedType: 'quotation'
  })
}

/**
 * Notify brand that an influencer accepted campaign
 */
export async function notifyInfluencerAccepted(
  brandUserId: string,
  influencerName: string,
  campaignName: string,
  campaignId: string
): Promise<boolean> {
  return createNotification({
    recipientId: brandUserId,
    type: 'INFLUENCER_ACCEPTED',
    title: `${influencerName} Joined Your Campaign`,
    message: `${influencerName} has accepted the invitation to join "${campaignName}".`,
    relatedId: campaignId,
    relatedType: 'campaign'
  })
}

/**
 * Notify brand that an influencer declined
 */
export async function notifyInfluencerDeclined(
  brandUserId: string,
  influencerName: string,
  campaignName: string,
  campaignId: string
): Promise<boolean> {
  return createNotification({
    recipientId: brandUserId,
    type: 'INFLUENCER_DECLINED',
    title: `${influencerName} Declined Invitation`,
    message: `${influencerName} has declined the invitation to join "${campaignName}".`,
    relatedId: campaignId,
    relatedType: 'campaign'
  })
}

/**
 * Notify brand that content is ready for viewing
 */
export async function notifyContentReady(
  brandUserId: string,
  influencerName: string,
  campaignName: string,
  campaignId: string
): Promise<boolean> {
  return createNotification({
    recipientId: brandUserId,
    type: 'CONTENT_READY',
    title: 'New Content Available',
    message: `${influencerName} has posted content for "${campaignName}". View it in your campaign dashboard.`,
    relatedId: campaignId,
    relatedType: 'campaign'
  })
}

// ============== UTILITY FUNCTIONS ==============

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const result = await query(`
      SELECT COUNT(*) as count FROM notifications 
      WHERE recipient_id = $1 AND is_read = FALSE
    `, [userId])
    
    return parseInt(result[0]?.count || '0')
  } catch (error) {
    console.error('Error getting unread count:', error)
    return 0
  }
}

/**
 * Get notifications for a user
 */
export async function getUserNotifications(
  userId: string, 
  limit = 20,
  offset = 0
): Promise<{
  id: string
  type: NotificationType
  title: string
  message: string | null
  isRead: boolean
  relatedId: string | null
  relatedType: RelatedType | null
  createdAt: Date
}[]> {
  try {
    const result = await query(`
      SELECT id, type, title, message, is_read, related_id, related_type, created_at
      FROM notifications
      WHERE recipient_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset])

    return result.map(row => ({
      id: row.id,
      type: row.type as NotificationType,
      title: row.title,
      message: row.message,
      isRead: row.is_read,
      relatedId: row.related_id,
      relatedType: row.related_type as RelatedType | null,
      createdAt: new Date(row.created_at)
    }))
  } catch (error) {
    console.error('Error getting user notifications:', error)
    return []
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    await query(`
      UPDATE notifications SET is_read = TRUE, read_at = NOW()
      WHERE id = $1
    `, [notificationId])
    return true
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return false
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  try {
    await query(`
      UPDATE notifications SET is_read = TRUE, read_at = NOW()
      WHERE recipient_id = $1 AND is_read = FALSE
    `, [userId])
    return true
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return false
  }
}

/**
 * Broadcast notification to all staff members
 */
export async function notifyAllStaff(
  title: string,
  message: string,
  type: NotificationType = 'CAMPAIGN_ASSIGNED',
  relatedId?: string,
  relatedType?: RelatedType
): Promise<number> {
  try {
    const staffUsers = await query(`
      SELECT id FROM users WHERE role IN ('STAFF', 'ADMIN')
    `, [])

    let count = 0
    for (const user of staffUsers) {
      const success = await createNotification({
        recipientId: user.id,
        type,
        title,
        message,
        relatedId,
        relatedType
      })
      if (success) count++
    }

    return count
  } catch (error) {
    console.error('Error broadcasting to staff:', error)
    return 0
  }
}
