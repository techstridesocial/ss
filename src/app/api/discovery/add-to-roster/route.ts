import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { addDiscoveredInfluencerToRoster, getDiscoveredInfluencers } from '../../../../lib/db/queries/discovery'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { discoveredId } = body

    if (!discoveredId) {
      return NextResponse.json({ error: 'Discovered influencer ID is required' }, { status: 400 })
    }

    console.log('➕ Adding discovered influencer to roster:', { discoveredId, userId })

    // Add to roster
    const newInfluencerId = await addDiscoveredInfluencerToRoster(discoveredId, userId)

    console.log('✅ Successfully added to roster:', { discoveredId, newInfluencerId })

    return NextResponse.json({
      success: true,
      data: {
        discoveredId,
        newInfluencerId,
        message: 'Influencer successfully added to roster'
      }
    })

  } catch (error) {
    console.error('❌ Error adding to roster:', error)
    return NextResponse.json(
      { 
        error: 'Failed to add influencer to roster',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    console.log('📋 Getting discovered influencers:', { limit, userId })

    // Get discovered influencers
    const discoveredInfluencers = await getDiscoveredInfluencers(limit)

    console.log(`✅ Retrieved ${discoveredInfluencers.length} discovered influencers`)

    return NextResponse.json({
      success: true,
      data: {
        discoveredInfluencers,
        total: discoveredInfluencers.length
      }
    })

  } catch (error) {
    console.error('❌ Error getting discovered influencers:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get discovered influencers',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 