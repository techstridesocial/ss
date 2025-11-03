import { query, transaction } from '../connection'

export interface AuditEvent {
  user_id: string
  action: string
  table_name: string
  record_id?: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  ip_address?: string
  metadata?: Record<string, any>
}

export interface AuditLog {
  id: string
  user_id: string
  action: string
  table_name: string
  record_id?: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  ip_address?: string
  metadata?: Record<string, any>
  created_at: Date
}

export interface DatabaseResponse<T> {
  success: boolean
  data?: T
  error?: string
  message: string
}

/**
 * Log an audit event to the database
 */
export async function logAuditEvent(event: AuditEvent): Promise<DatabaseResponse<AuditLog>> {
  try {
    const _result = await query(`
      INSERT INTO audit_logs (
        user_id, action, table_name, record_id, 
        old_values, new_values, ip_address, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      event.user_id,
      event.action,
      event.table_name,
      event.record_id || null,
      event.old_values ? JSON.stringify(event.old_values) : null,
      event.new_values ? JSON.stringify(event.new_values) : null,
      event.ip_address || null,
      event.metadata ? JSON.stringify(event.metadata) : null
    ])

    return {
      success: true,
      data: result[0] as AuditLog,
      message: 'Audit event logged successfully'
    }
  } catch (error) {
    console.error('Error logging audit event:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to log audit event'
    }
  }
}

/**
 * Get audit trail for a specific user
 */
export async function getAuditTrailForUser(
  userId: string, 
  limit: number = 50, 
  offset: number = 0
): Promise<DatabaseResponse<AuditLog[]>> {
  try {
    const _result = await query(`
      SELECT * FROM audit_logs 
      WHERE user_id = $1 
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset])

    return {
      success: true,
      data: result as AuditLog[],
      message: 'Audit trail retrieved successfully'
    }
  } catch (error) {
    console.error('Error retrieving audit trail:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to retrieve audit trail'
    }
  }
}

/**
 * Get audit trail for a specific table/record
 */
export async function getAuditTrailForRecord(
  tableName: string,
  recordId: string,
  limit: number = 50,
  offset: number = 0
): Promise<DatabaseResponse<AuditLog[]>> {
  try {
    const _result = await query(`
      SELECT * FROM audit_logs 
      WHERE table_name = $1 AND record_id = $2
      ORDER BY created_at DESC
      LIMIT $3 OFFSET $4
    `, [tableName, recordId, limit, offset])

    return {
      success: true,
      data: result as AuditLog[],
      message: 'Record audit trail retrieved successfully'
    }
  } catch (error) {
    console.error('Error retrieving record audit trail:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to retrieve record audit trail'
    }
  }
}

/**
 * Get audit trail for a specific action type
 */
export async function getAuditTrailForAction(
  action: string,
  limit: number = 50,
  offset: number = 0
): Promise<DatabaseResponse<AuditLog[]>> {
  try {
    const _result = await query(`
      SELECT * FROM audit_logs 
      WHERE action = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [action, limit, offset])

    return {
      success: true,
      data: result as AuditLog[],
      message: 'Action audit trail retrieved successfully'
    }
  } catch (error) {
    console.error('Error retrieving action audit trail:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to retrieve action audit trail'
    }
  }
}

/**
 * Get recent audit logs (for admin dashboard)
 */
export async function getRecentAuditLogs(
  limit: number = 100,
  offset: number = 0
): Promise<DatabaseResponse<AuditLog[]>> {
  try {
    const _result = await query(`
      SELECT al.*, u.email as user_email, up.first_name, up.last_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      ORDER BY al.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset])

    return {
      success: true,
      data: result as AuditLog[],
      message: 'Recent audit logs retrieved successfully'
    }
  } catch (error) {
    console.error('Error retrieving recent audit logs:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to retrieve recent audit logs'
    }
  }
}

/**
 * Clean up old audit logs (for GDPR compliance)
 */
export async function cleanupOldAuditLogs(
  daysToKeep: number = 365
): Promise<DatabaseResponse<{ deletedCount: number }>> {
  try {
    const _result = await query(`
      DELETE FROM audit_logs 
      WHERE created_at < NOW() - INTERVAL '${daysToKeep} days'
    `)

    return {
      success: true,
      data: { deletedCount: result.length || 0 },
      message: `Cleaned up ${result.length || 0} old audit logs`
    }
  } catch (error) {
    console.error('Error cleaning up old audit logs:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to clean up old audit logs'
    }
  }
}

/**
 * Export audit data for GDPR compliance
 */
export async function exportAuditDataForUser(
  userId: string
): Promise<DatabaseResponse<AuditLog[]>> {
  try {
    const _result = await query(`
      SELECT * FROM audit_logs 
      WHERE user_id = $1 
      ORDER BY created_at ASC
    `, [userId])

    return {
      success: true,
      data: result as AuditLog[],
      message: 'Audit data exported successfully'
    }
  } catch (error) {
    console.error('Error exporting audit data:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to export audit data'
    }
  }
} 