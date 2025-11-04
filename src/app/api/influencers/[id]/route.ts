import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { query } from '@/lib/db/connection'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
      agency_name,
      assigned_to,
      labels,
      notes,
      tier,
      display_name,
      first_name,
      last_name,
      niches,
      bio,
      location_country,
      location_city,
      website_url,
      is_active,
      total_followers,
      total_avg_views
    } = body

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

    // Validate tier (only if provided)
    if (tier && !['GOLD', 'SILVER'].includes(tier)) {
      return NextResponse.json({ 
        error: 'Invalid tier. Must be GOLD or SILVER' 
      }, { status: 400 })
    }

    // Validate agency_name for AGENCY_PARTNER
    if (influencer_type === 'AGENCY_PARTNER' && (!agency_name || !agency_name.trim())) {
      return NextResponse.json({ 
        error: 'agency_name is required for AGENCY_PARTNER type' 
      }, { status: 400 })
    }

    // Build dynamic update query
    const updateFields = []
    const updateValues = []
    let paramCounter = 1

    // Type and classification fields
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

    if (tier !== undefined) {
      updateFields.push(`tier = $${paramCounter}`)
      updateValues.push(tier)
      paramCounter++
    }

    // Management fields
    if (assigned_to !== undefined) {
      updateFields.push(`assigned_to = $${paramCounter}`)
      updateValues.push(assigned_to || null)
      paramCounter++
    }

    if (labels !== undefined) {
      updateFields.push(`labels = $${paramCounter}`)
      updateValues.push(JSON.stringify(labels))
      paramCounter++
    }

    if (notes !== undefined) {
      updateFields.push(`notes = $${paramCounter}`)
      updateValues.push(notes || null)
      paramCounter++
    }

    // Profile fields
    if (display_name !== undefined) {
      updateFields.push(`display_name = $${paramCounter}`)
      updateValues.push(display_name)
      paramCounter++
    }

    if (first_name !== undefined) {
      updateFields.push(`first_name = $${paramCounter}`)
      updateValues.push(first_name || null)
      paramCounter++
    }

    if (last_name !== undefined) {
      updateFields.push(`last_name = $${paramCounter}`)
      updateValues.push(last_name || null)
      paramCounter++
    }

    if (niches !== undefined) {
      updateFields.push(`niches = $${paramCounter}`)
      updateValues.push(JSON.stringify(niches))
      paramCounter++
    }

    if (bio !== undefined) {
      updateFields.push(`bio = $${paramCounter}`)
      updateValues.push(bio || null)
      paramCounter++
    }

    if (location_country !== undefined) {
      updateFields.push(`location_country = $${paramCounter}`)
      updateValues.push(location_country || null)
      paramCounter++
    }

    if (location_city !== undefined) {
      updateFields.push(`location_city = $${paramCounter}`)
      updateValues.push(location_city || null)
      paramCounter++
    }

    if (website_url !== undefined) {
      updateFields.push(`website_url = $${paramCounter}`)
      updateValues.push(website_url || null)
      paramCounter++
    }

    // Status and metrics fields
    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramCounter}`)
      updateValues.push(is_active)
      paramCounter++
    }

    if (total_followers !== undefined) {
      updateFields.push(`total_followers = $${paramCounter}`)
      updateValues.push(total_followers)
      paramCounter++
    }

    if (total_avg_views !== undefined) {
      updateFields.push(`total_avg_views = $${paramCounter}`)
      updateValues.push(total_avg_views)
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

// DELETE - Delete influencer from roster
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is staff or admin using Clerk metadata
    const client = await clerkClient()
    const clerkUser = await client.users.getUser(userId)
    const userRole = clerkUser.publicMetadata?.role as string

    if (!userRole || (userRole !== 'STAFF' && userRole !== 'ADMIN')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const influencerId = params.id

    // Delete the influencer
    const deleteResult = await query(
      `DELETE FROM influencers WHERE id = $1 RETURNING id, display_name`,
      [influencerId]
    )

    if (deleteResult.length === 0) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `Influencer ${deleteResult[0].display_name} deleted successfully`,
      data: deleteResult[0]
    })

  } catch (error) {
    console.error('Error deleting influencer:', error)
    return NextResponse.json(
      { error: 'Failed to delete influencer' },
      { status: 500 }
    )
  }
}
