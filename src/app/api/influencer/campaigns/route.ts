import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { query } from '@/lib/db/connection'

// GET - Get campaigns for the current influencer
export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user ID from Clerk ID
    const userResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId]
    )

    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user_id = userResult[0]?.id

    // Get influencer ID
    const influencerResult = await query<{ id: string }>(
      'SELECT id FROM influencers WHERE user_id = $1',
      [user_id]
    )

    if (influencerResult.length === 0) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
    }

    const influencer_id = influencerResult[0]?.id

    // Get campaigns assigned to this influencer
    const campaigns = await query(`
      SELECT 
        c.id,
        c.name,
        c.brand_name,
        c.status,
        c.created_at,
        ci.status as assignment_status
      FROM campaigns c
      JOIN campaign_influencers ci ON c.id = ci.campaign_id
      WHERE ci.influencer_id = $1
      AND c.status IN ('ACTIVE', 'COMPLETED')
      ORDER BY c.created_at DESC
    `, [influencer_id])

    return NextResponse.json({ campaigns })
  } catch (_error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}