import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { query } from '@/lib/db/connection'
import { getInfluencerCampaigns } from '@/lib/db/queries/campaigns'

// GET - Fetch influencer campaign assignments
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get influencer ID from users table
    const userResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId]
    )

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user_id = userResult[0]?.id

    // Get influencer ID
    const influencerResult = await query<{ id: string }>(
      'SELECT id FROM influencers WHERE user_id = $1',
      [user_id]
    )

    if (influencerResult.length === 0) {
      return NextResponse.json(
        { error: 'Influencer not found' },
        { status: 404 }
      )
    }

    const influencer_id = influencerResult[0]?.id

    if (!influencer_id) {
      return NextResponse.json(
        { error: 'Influencer ID not found' },
        { status: 404 }
      )
    }

    // Use the new influencer campaigns function
    const campaignsResult = await getInfluencerCampaigns(influencer_id)

    if (!campaignsResult.success) {
      return NextResponse.json(
        { error: campaignsResult.error || 'Failed to fetch campaigns' },
        { status: 500 }
      )
    }

    return NextResponse.json(campaignsResult)

  } catch (error) {
    console.error('Error fetching influencer campaigns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
} 