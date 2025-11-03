import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Pool } from 'pg'

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { influencerId, assigned_to, labels, notes } = body

    if (!influencerId) {
      return NextResponse.json({ error: 'Influencer ID is required' }, { status: 400 })
    }

    // Update influencer management data
    const query = `
      UPDATE influencers 
      SET 
        assigned_to = $1,
        labels = $2,
        notes = $3,
        updated_at = NOW()
      WHERE id = $4
      RETURNING id, assigned_to, labels, notes, updated_at
    `

    const values = [
      assigned_to || null,
      labels || [],
      notes || null,
      influencerId
    ]

    const _result = await pool.query(query, values)

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      data: result.rows[0] 
    })

  } catch (_error) {
    console.error('Error updating influencer management data:', error)
    return NextResponse.json({ 
      error: 'Failed to update influencer management data' 
    }, { status: 500 })
  }
} 