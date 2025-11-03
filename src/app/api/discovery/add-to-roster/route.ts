import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { addDiscoveredInfluencerToRoster, getDiscoveredInfluencers, addDiscoveredInfluencerToRosterWithCompleteData } from '../../../../lib/db/queries/discovery'
import { getProfileReport } from '../../../../lib/services/modash'
import { query } from '../../../../lib/db/connection'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { discoveredId, modashUserId, platform } = body

    if (!discoveredId) {
      return NextResponse.json({ error: 'Discovered influencer ID is required' }, { status: 400 })
    }

    console.log('➕ Adding discovered influencer to roster with COMPLETE Modash data:', { 
      discoveredId, 
      userId, 
      modashUserId, 
      platform 
    })

    // Get discovered influencer data first
    const discoveredInfluencer = await query(`
      SELECT * FROM discovered_influencers WHERE id = $1
    `, [discoveredId])

    if (discoveredInfluencer.length === 0) {
      return NextResponse.json({ error: 'Discovered influencer not found' }, { status: 404 })
    }

    const influencer = discoveredInfluencer[0]
    
    // Fetch COMPLETE Modash data if we have the user ID
    let completeModashData = null
    if (modashUserId && platform) {
      try {
        console.log('🔄 Fetching COMPLETE Modash data for caching...')
        const modashResponse = await getProfileReport(modashUserId, platform)
        
        if ((modashResponse as any)?.profile) {
          completeModashData = (modashResponse as any).profile
          const _profile = (modashResponse as any).profile
          console.log('✅ Complete Modash data fetched:', {
            hasProfile: !!profile.profile,
            hasAudience: !!profile.audience,
            hasRecentPosts: !!profile.recentPosts,
            hasPopularPosts: !!profile.popularPosts,
            hasSponsoredPosts: !!profile.sponsoredPosts,
            hasHashtags: !!profile.hashtags,
            hasMentions: !!profile.mentions,
            hasBrandAffinity: !!profile.brandAffinity,
            hasStatHistory: !!profile.statHistory,
            hasContacts: !!profile.contacts,
            dataKeys: Object.keys(profile)
          })
        }
      } catch (modashError) {
        console.warn('⚠️ Failed to fetch complete Modash data:', modashError)
        // Continue without complete data - use existing basic data
      }
    }

    // Add to roster with COMPLETE Modash data cached (or fallback to basic data)
    const newInfluencerId = completeModashData 
      ? await addDiscoveredInfluencerToRosterWithCompleteData(
          discoveredId, 
          userId, 
          completeModashData,
          influencer
        )
      : await addDiscoveredInfluencerToRoster(discoveredId, userId)

    console.log('✅ Successfully added to roster with complete analytics data:', { 
      discoveredId, 
      newInfluencerId,
      hasCompleteData: !!completeModashData
    })

    return NextResponse.json({
      success: true,
      data: {
        discoveredId,
        newInfluencerId,
        message: 'Influencer successfully added to roster with complete analytics',
        hasCompleteData: !!completeModashData
      }
    })

  } catch (_error) {
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

  } catch (_error) {
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