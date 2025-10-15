import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
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

    // Check if user is staff or admin using Clerk metadata
    console.log('🔍 Checking staff user with Clerk ID:', userId)
    const client = await clerkClient()
    const clerkUser = await client.users.getUser(userId)
    const userRole = clerkUser.publicMetadata?.role as string

    console.log('📊 User role from Clerk metadata:', userRole)

    if (!userRole || (userRole !== 'STAFF' && userRole !== 'ADMIN')) {
      console.log('❌ User does not have STAFF or ADMIN role in Clerk metadata')
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      influencer_type, 
      content_type, 
      agency_name
    } = body

    // Validate required fields
    if (!influencer_type || !content_type) {
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
