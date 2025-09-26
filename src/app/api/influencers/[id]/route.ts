import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { query } from '@/lib/db/connection'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is staff or admin
    const userResult = await query(`
      SELECT role FROM users WHERE clerk_id = $1
    `, [userId])

    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userRole = userResult[0].role
    if (userRole !== 'STAFF' && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { influencer_type, content_type, agency_name } = body

    // Validate required fields
    if (!influencer_type || !content_type) {
      return NextResponse.json({ 
        error: 'influencer_type and content_type are required' 
      }, { status: 400 })
    }

    // Validate influencer_type
    if (!['SIGNED', 'PARTNERED', 'AGENCY_PARTNER'].includes(influencer_type)) {
      return NextResponse.json({ 
        error: 'Invalid influencer_type. Must be SIGNED, PARTNERED, or AGENCY_PARTNER' 
      }, { status: 400 })
    }

    // Validate content_type
    if (!['STANDARD', 'UGC', 'SEEDING'].includes(content_type)) {
      return NextResponse.json({ 
        error: 'Invalid content_type. Must be STANDARD, UGC, or SEEDING' 
      }, { status: 400 })
    }

    // Validate agency_name for AGENCY_PARTNER
    if (influencer_type === 'AGENCY_PARTNER' && (!agency_name || !agency_name.trim())) {
      return NextResponse.json({ 
        error: 'agency_name is required for AGENCY_PARTNER type' 
      }, { status: 400 })
    }

    // Update influencer data
    const updateResult = await query(`
      UPDATE influencers 
      SET 
        influencer_type = $1,
        content_type = $2,
        agency_name = $3,
        updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `, [influencer_type, content_type, agency_name || null, params.id])

    if (updateResult.length === 0) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: updateResult[0]
    })

  } catch (error) {
    console.error('Error updating influencer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
