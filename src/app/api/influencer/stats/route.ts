import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getInfluencerStats } from '@/lib/db/queries/influencer-stats'

// GET - Fetch influencer statistics and platform metrics
export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use the new influencer stats function with mock data
    const statsResult = await getInfluencerStats(userId)

    if (!statsResult.success) {
      // Handle specific validation errors
      if (statsResult.error === 'User not found') {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }
      if (statsResult.error === 'Influencer not found') {
        return NextResponse.json(
          { error: 'Influencer not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: statsResult.error || 'Failed to fetch statistics' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: statsResult.data
    })

  } catch (_error) {
    console.error('Error fetching influencer stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
} 