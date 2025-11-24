import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { query } from '@/lib/db/connection'
import {
  getSelectedBrands,
  saveBrandPreferences
} from '@/lib/db/queries/talent-onboarding'

// GET - Fetch all brands for selection dropdown
export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a signed influencer
    const userRole = await getCurrentUserRole()
    if (!userRole || userRole !== 'INFLUENCER_SIGNED') {
      return NextResponse.json({ error: 'Forbidden - Signed influencer access required' }, { status: 403 })
    }

    // Get all brands
    const brandsResult = await query(`
      SELECT id, company_name, industry, website_url
      FROM brands
      ORDER BY company_name ASC
    `)

    return NextResponse.json({
      success: true,
      data: brandsResult
    })
  } catch (error) {
    console.error('Error fetching brands:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch brands' },
      { status: 500 }
    )
  }
}

// POST - Save selected brands
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a signed influencer
    const userRole = await getCurrentUserRole()
    if (!userRole || userRole !== 'INFLUENCER_SIGNED') {
      return NextResponse.json({ error: 'Forbidden - Signed influencer access required' }, { status: 403 })
    }

    // Get user_id from users table
    const userResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId]
    )

    if (userResult.length === 0 || !userResult[0]) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user_id = userResult[0].id
    const data = await request.json()

    // Validate required fields
    if (!Array.isArray(data.brand_ids)) {
      return NextResponse.json(
        { success: false, error: 'brand_ids must be an array' },
        { status: 400 }
      )
    }

    // Save brand preferences
    const preferences = await saveBrandPreferences(user_id, data.brand_ids)

    return NextResponse.json({
      success: true,
      data: preferences
    })
  } catch (error) {
    console.error('Error saving brand preferences:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save brand preferences' },
      { status: 500 }
    )
  }
}

