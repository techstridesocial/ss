import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { query } from '@/lib/db/connection'

// PATCH - Update WhatsApp URL for influencer
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
    const userResult = await query<{ role: string }>(
      'SELECT role FROM users WHERE clerk_id = $1',
      [userId]
    )

    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userRole = userResult[0].role
    if (userRole !== 'STAFF' && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const influencerId = params.id
    const body = await request.json()
    const { whatsapp_url } = body

    if (!whatsapp_url) {
      return NextResponse.json({ error: 'WhatsApp URL is required' }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(whatsapp_url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // Update influencer with WhatsApp URL
    const updateResult = await query(
      `UPDATE influencers 
       SET whatsapp_url = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING id`,
      [whatsapp_url, influencerId]
    )

    if (updateResult.length === 0) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'WhatsApp URL updated successfully'
    })
  } catch (error) {
    console.error('Error updating WhatsApp URL:', error)
    return NextResponse.json(
      { error: 'Failed to update WhatsApp URL' },
      { status: 500 }
    )
  }
}

// DELETE - Remove WhatsApp URL for influencer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is staff or admin
    const userResult = await query<{ role: string }>(
      'SELECT role FROM users WHERE clerk_id = $1',
      [userId]
    )

    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userRole = userResult[0].role
    if (userRole !== 'STAFF' && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const influencerId = params.id

    // Remove WhatsApp URL from influencer
    const updateResult = await query(
      `UPDATE influencers 
       SET whatsapp_url = NULL, updated_at = NOW() 
       WHERE id = $1 
       RETURNING id`,
      [influencerId]
    )

    if (updateResult.length === 0) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'WhatsApp URL removed successfully'
    })
  } catch (error) {
    console.error('Error removing WhatsApp URL:', error)
    return NextResponse.json(
      { error: 'Failed to remove WhatsApp URL' },
      { status: 500 }
    )
  }
}

