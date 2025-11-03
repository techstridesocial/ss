import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '../../../lib/auth/roles'
import { getUsers } from '../../../lib/db/queries/users'
import { UserRole } from '../../../types/database'

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check role-based access
    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({
        error: 'Access denied. Only staff and admin users can view users'
      }, { status: 403 })
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || undefined
    const role = searchParams.get('role') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Apply filters
    const filters = {
      search,
      roles: role ? [role as UserRole] : undefined
    }

    // Get users from database
    const _result = await getUsers(filters, page, limit)

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    })

  } catch (error) {
    console.error('Error in GET /api/users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
} 