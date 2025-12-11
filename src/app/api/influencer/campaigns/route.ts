import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { query } from '@/lib/db/connection'

// GET - Get campaigns for the current influencer
// OPTIMIZED: Single query with JOINs instead of 3 sequential queries
export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // OPTIMIZED: Single query with JOINs - reduces 3 queries to 1
    const campaigns = await query<{
      id: string,
      name: string,
      brand_name: string | null,
      status: string,
      created_at: Date,
      assignment_status: string
    }>(`
      SELECT 
        c.id,
        c.name,
        b.company_name as brand_name,
        c.status,
        c.created_at,
        ci.status as assignment_status
      FROM users u
      INNER JOIN influencers i ON i.user_id = u.id
      INNER JOIN campaign_influencers ci ON ci.influencer_id = i.id
      INNER JOIN campaigns c ON c.id = ci.campaign_id
      LEFT JOIN brands b ON c.brand_id = b.id
      WHERE u.clerk_id = $1
        AND c.status IN ('ACTIVE', 'COMPLETED')
      ORDER BY c.created_at DESC
    `, [userId])

    // Get user ID for currency lookup
    const userResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE clerk_id = $1 LIMIT 1',
      [userId]
    )
    
    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user_id = userResult[0].id

    // If no campaigns found, verify influencer exists for proper error messages
    if (campaigns.length === 0) {
      const influencerExists = await query<{ id: string }>(
        'SELECT id FROM influencers WHERE user_id = $1 LIMIT 1',
        [user_id]
      )
      
      if (influencerExists.length === 0) {
        return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
      }
    }

    // Get user's currency preference from payment history (most recent)
    const currencyResult = await query<{ currency: string }>(
      `SELECT currency FROM talent_payment_history 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [user_id]
    )

    const currency = currencyResult.length > 0 ? currencyResult[0].currency : 'GBP'

    return NextResponse.json({ campaigns, currency })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}