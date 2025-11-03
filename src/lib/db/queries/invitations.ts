import { query, transaction } from '@/lib/db/connection'
import { DatabaseResponse } from '@/types/database'

export interface UserInvitation {
  id: string
  clerk_invitation_id: string
  email: string
  role: string
  status: 'INVITED' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'
  first_name?: string
  last_name?: string
  invited_by?: string
  invited_by_email?: string
  invited_at: Date
  accepted_at?: Date
  revoked_at?: Date
  expires_at?: Date
  accepted_user_id?: string
  clerk_id?: string
  created_at: Date
  updated_at: Date
}

export interface InvitationFilters {
  status?: string
  role?: string
  invited_by?: string
  limit?: number
  offset?: number
}

/**
 * Create a new invitation record
 */
export async function createInvitation(
  clerkInvitationId: string,
  email: string,
  role: string,
  invitedBy: string,
  invitedByEmail: string,
  firstName?: string,
  lastName?: string,
  expiresAt?: Date
): Promise<DatabaseResponse<UserInvitation>> {
  try {
    const _result = await query<UserInvitation>(
      `INSERT INTO user_invitations (
        clerk_invitation_id, email, role, first_name, last_name,
        invited_by, invited_by_email, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [clerkInvitationId, email, role, firstName, lastName, invitedBy, invitedByEmail, expiresAt]
    )

    return {
      success: true,
      data: result[0],
      message: 'Invitation created successfully'
    }
  } catch (error) {
    console.error('Error creating invitation:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create invitation'
    }
  }
}

/**
 * Get all invitations with optional filters
 */
export async function getInvitations(filters: InvitationFilters = {}): Promise<UserInvitation[]> {
  try {
    let whereClause = 'WHERE 1=1'
    const queryParams: any[] = []
    let paramCount = 0

    if (filters.status) {
      paramCount++
      whereClause += ` AND status = $${paramCount}`
      queryParams.push(filters.status)
    }

    if (filters.role) {
      paramCount++
      whereClause += ` AND role = $${paramCount}`
      queryParams.push(filters.role)
    }

    if (filters.invited_by) {
      paramCount++
      whereClause += ` AND invited_by = $${paramCount}`
      queryParams.push(filters.invited_by)
    }

    const limit = filters.limit || 50
    const offset = filters.offset || 0

    paramCount++
    const limitParam = `$${paramCount}`
    paramCount++
    const offsetParam = `$${paramCount}`
    queryParams.push(limit, offset)

    const _result = await query<UserInvitation>(
      `SELECT * FROM user_invitations 
       ${whereClause}
       ORDER BY invited_at DESC
       LIMIT ${limitParam} OFFSET ${offsetParam}`,
      queryParams
    )

    return result
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return []
  }
}

/**
 * Get invitation by Clerk invitation ID
 */
export async function getInvitationByClerkId(clerkInvitationId: string): Promise<UserInvitation | null> {
  try {
    const _result = await query<UserInvitation>(
      'SELECT * FROM user_invitations WHERE clerk_invitation_id = $1',
      [clerkInvitationId]
    )

    return result[0] || null
  } catch (error) {
    console.error('Error fetching invitation by Clerk ID:', error)
    return null
  }
}

/**
 * Update invitation status
 */
export async function updateInvitationStatus(
  clerkInvitationId: string,
  status: 'INVITED' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED',
  acceptedUserId?: string,
  clerkUserId?: string
): Promise<DatabaseResponse<UserInvitation>> {
  try {
    const updateFields = ['status = $2', 'updated_at = NOW()']
    const queryParams: any[] = [clerkInvitationId, status]
    let paramCount = 2

    if (status === 'ACCEPTED') {
      paramCount++
      updateFields.push(`accepted_at = NOW()`)
      if (acceptedUserId) {
        paramCount++
        updateFields.push(`accepted_user_id = $${paramCount}`)
        queryParams.push(acceptedUserId)
      }
      if (clerkUserId) {
        paramCount++
        updateFields.push(`clerk_id = $${paramCount}`)
        queryParams.push(clerkUserId)
      }
    } else if (status === 'DECLINED') {
      paramCount++
      updateFields.push(`revoked_at = NOW()`)
    }

    const _result = await query<UserInvitation>(
      `UPDATE user_invitations 
       SET ${updateFields.join(', ')}
       WHERE clerk_invitation_id = $1
       RETURNING *`,
      queryParams
    )

    if (result.length === 0) {
      return {
        success: false,
        error: 'Invitation not found'
      }
    }

    return {
      success: true,
      data: result[0],
      message: 'Invitation status updated successfully'
    }
  } catch (error) {
    console.error('Error updating invitation status:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update invitation status'
    }
  }
}

/**
 * Get invitation statistics
 */
export async function getInvitationStats(): Promise<{
  total: number
  pending: number
  accepted: number
  revoked: number
  expired: number
}> {
  try {
    const _result = await query<{
      status: string
      count: number
    }>(
      `SELECT status, COUNT(*) as count 
       FROM user_invitations 
       GROUP BY status`
    )

    const stats = {
      total: 0,
      invited: 0,
      accepted: 0,
      declined: 0,
      expired: 0
    }

    result.forEach(row => {
      const count = parseInt(row.count.toString())
      stats.total += count
      const statusKey = row.status.toLowerCase() as keyof typeof stats
      if (statusKey in stats) {
        stats[statusKey] = count
      }
    })

    return stats
  } catch (error) {
    console.error('Error fetching invitation stats:', error)
    return {
      total: 0,
      invited: 0,
      accepted: 0,
      declined: 0,
      expired: 0
    }
  }
}

/**
 * Clean up expired invitations
 */
export async function cleanupExpiredInvitations(): Promise<number> {
  try {
    const _result = await query<{ count: number }>(
      `UPDATE user_invitations 
       SET status = 'EXPIRED', updated_at = NOW()
       WHERE status = 'INVITED' 
       AND expires_at < NOW()
       RETURNING COUNT(*) as count`
    )

    return parseInt(result[0]?.count?.toString() || '0')
  } catch (error) {
    console.error('Error cleaning up expired invitations:', error)
    return 0
  }
}
