import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getRecentAuditLogs, getAuditTrailForUser, getAuditTrailForAction } from '@/lib/db/queries/audit'
import { getCurrentUserRole } from '@/lib/auth/roles'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check user role - only STAFF and ADMIN can view audit logs
    const userRole = await getCurrentUserRole()
    if (userRole !== 'STAFF' && userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions to view audit logs' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'recent', 'user', 'action'
    const targetUserId = searchParams.get('user_id')
    const action = searchParams.get('action')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let auditData

    switch (type) {
      case 'user':
        if (!targetUserId) {
          return NextResponse.json(
            { error: 'user_id parameter required for user audit trail' },
            { status: 400 }
          )
        }
        auditData = await getAuditTrailForUser(targetUserId, limit, offset)
        break

      case 'action':
        if (!action) {
          return NextResponse.json(
            { error: 'action parameter required for action audit trail' },
            { status: 400 }
          )
        }
        auditData = await getAuditTrailForAction(action, limit, offset)
        break

      case 'recent':
      default:
        auditData = await getRecentAuditLogs(limit, offset)
        break
    }

    if (!auditData.success) {
      return NextResponse.json(
        { error: auditData.error || 'Failed to retrieve audit data' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: auditData.data,
      message: auditData.message,
      pagination: {
        limit,
        offset,
        total: auditData.data?.length || 0
      }
    })

  } catch (_error) {
    console.error('Audit API error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve audit data' },
      { status: 500 }
    )
  }
} 