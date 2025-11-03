import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { query } from '@/lib/db/connection'
import { getCurrentUserRole } from '@/lib/auth/roles'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has staff/admin role
    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const role = searchParams.get('role')
    const status = searchParams.get('status')

    // Build query with filters
    let whereClause = 'WHERE 1=1'
    const queryParams: any[] = []
    let paramCount = 0

    if (role) {
      paramCount++
      whereClause += ` AND u.role = $${paramCount}`
      queryParams.push(role)
    }

    if (status) {
      paramCount++
      whereClause += ` AND u.status = $${paramCount}`
      queryParams.push(status)
    }

    // Add limit and offset
    paramCount++
    const limitParam = `$${paramCount}`
    paramCount++
    const offsetParam = `$${paramCount}`
    queryParams.push(limit, offset)

    // Fetch users with profiles from database
    const usersResult = await query(`
      SELECT 
        u.id,
        u.email,
        u.role,
        u.status,
        u.created_at,
        u.updated_at,
        u.last_login,
        up.first_name,
        up.last_name,
        up.avatar_url,
        up.phone,
        up.bio,
        up.location_country,
        up.location_city,
        up.timezone,
        up.is_onboarded
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ${limitParam} OFFSET ${offsetParam}
    `, queryParams)

    // Get total count for pagination
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM users u
      ${whereClause}
    `, queryParams.slice(0, -2)) // Remove limit and offset params

    const total = parseInt(countResult[0]?.total || '0')

    // Transform data to match expected format
    const users = usersResult.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status.toLowerCase(),
      profile: {
        first_name: user.first_name,
        last_name: user.last_name,
        avatar_url: user.avatar_url,
        phone: user.phone,
        bio: user.bio,
        location_country: user.location_country,
        location_city: user.location_city,
        timezone: user.timezone,
        is_onboarded: user.is_onboarded
      },
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_login: user.last_login
    }))

    return NextResponse.json({ 
      users,
      total,
      limit,
      offset
    })

  } catch (_error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
