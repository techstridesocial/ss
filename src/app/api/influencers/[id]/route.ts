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
    console.log('🔍 Checking staff user with Clerk ID:', userId)
    const userResult = await query(`
      SELECT role FROM users WHERE clerk_id = $1
    `, [userId])

    console.log('📊 User lookup result:', userResult)

    if (userResult.length === 0) {
      console.log('❌ Staff user not found in database for Clerk ID:', userId)
      return NextResponse.json({ error: 'Staff user not found' }, { status: 404 })
    }

    const userRole = userResult[0].role
    if (userRole !== 'STAFF' && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      influencer_type, 
      content_type, 
      agency_name, 
      assigned_to, 
      labels, 
      notes 
    } = body

    // For management updates, we don't require influencer_type and content_type
    const isManagementUpdate = assigned_to !== undefined || labels !== undefined || notes !== undefined
    
    // Validate required fields only for non-management updates
    if (!isManagementUpdate && (!influencer_type || !content_type)) {
      return NextResponse.json({ 
        error: 'influencer_type and content_type are required' 
      }, { status: 400 })
    }

    // Validate influencer_type (only if provided)
    if (influencer_type && !['SIGNED', 'PARTNERED', 'AGENCY_PARTNER'].includes(influencer_type)) {
      return NextResponse.json({ 
        error: 'Invalid influencer_type. Must be SIGNED, PARTNERED, or AGENCY_PARTNER' 
      }, { status: 400 })
    }

    // Validate content_type (only if provided)
    if (content_type && !['STANDARD', 'UGC', 'SEEDING'].includes(content_type)) {
      return NextResponse.json({ 
        error: 'Invalid content_type. Must be STANDARD, UGC, or SEEDING' 
      }, { status: 400 })
    }

    // Validate agency_name for AGENCY_PARTNER (only if influencer_type is provided)
    if (influencer_type === 'AGENCY_PARTNER' && (!agency_name || !agency_name.trim())) {
      return NextResponse.json({ 
        error: 'agency_name is required for AGENCY_PARTNER type' 
      }, { status: 400 })
    }

    // Validate assigned_to (should be a valid user ID if provided)
    if (assigned_to !== undefined && assigned_to !== null && assigned_to !== '') {
      const staffResult = await query(`
        SELECT id FROM users WHERE id = $1 AND role IN ('STAFF', 'ADMIN')
      `, [assigned_to])
      
      if (staffResult.length === 0) {
        return NextResponse.json({ 
          error: 'Invalid assigned_to. Must be a valid staff or admin user ID' 
        }, { status: 400 })
      }
    }

    // Build dynamic update query
    const updateFields = []
    const updateValues = []
    let paramCounter = 1

    if (influencer_type !== undefined) {
      updateFields.push(`influencer_type = $${paramCounter}`)
      updateValues.push(influencer_type)
      paramCounter++
    }

    if (content_type !== undefined) {
      updateFields.push(`content_type = $${paramCounter}`)
      updateValues.push(content_type)
      paramCounter++
    }

    if (agency_name !== undefined) {
      updateFields.push(`agency_name = $${paramCounter}`)
      updateValues.push(agency_name || null)
      paramCounter++
    }

    if (assigned_to !== undefined) {
      updateFields.push(`assigned_to = $${paramCounter}`)
      updateValues.push(assigned_to || null)
      paramCounter++
    }

    if (labels !== undefined) {
      updateFields.push(`labels = $${paramCounter}`)
      updateValues.push(JSON.stringify(labels || []))
      paramCounter++
    }

    if (notes !== undefined) {
      updateFields.push(`notes = $${paramCounter}`)
      updateValues.push(notes || null)
      paramCounter++
    }

    // Always update the timestamp
    updateFields.push('updated_at = NOW()')
    updateValues.push(params.id)

    if (updateFields.length === 1) { // Only timestamp update
      return NextResponse.json({ 
        error: 'No fields to update' 
      }, { status: 400 })
    }

    // Update influencer data
    const updateResult = await query(`
      UPDATE influencers 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCounter}
      RETURNING *
    `, updateValues)

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
