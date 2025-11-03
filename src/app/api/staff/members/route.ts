import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { query } from '@/lib/db/connection'

// GET - Fetch all staff members for assignment dropdowns
export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user has access (brands and staff can see staff list)
    const userRole = await getCurrentUserRole()
    if (!userRole || !['BRAND', 'STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get all active staff and admin users
    const staffMembers = await query(`
      SELECT 
        u.id,
        u.email,
        up.first_name,
        up.last_name,
        u.role,
        u.status,
        u.last_login
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.role IN ('STAFF', 'ADMIN') 
        AND u.status = 'ACTIVE'
      ORDER BY up.first_name, up.last_name, u.email
    `)

    const formattedStaff = staffMembers.map(member => ({
      id: member.id,
      email: member.email,
      firstName: member.first_name || '',
      lastName: member.last_name || '',
      fullName: `${member.first_name || ''} ${member.last_name || ''}`.trim() || member.email,
      role: member.role,
      status: member.status,
      lastLogin: member.last_login
    }))

    return NextResponse.json({
      success: true,
      data: formattedStaff
    })
    
  } catch (error) {
    console.error('Error fetching staff members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff members' },
      { status: 500 }
    )
  }
}
