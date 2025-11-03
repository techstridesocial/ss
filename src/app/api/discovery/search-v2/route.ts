import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { searchDiscovery } from '../../../../lib/services/modash'

export async function POST(_request: Request) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      console.error('❌ Authentication failed - no user ID found')
      return NextResponse.json({ 
        error: 'Authentication required', 
        message: 'Please sign in to continue',
        code: 'AUTH_REQUIRED'
      }, { status: 401 })
    }

    const body = await request.json()
    console.log('🔍 Search v2 API request:', {
      hasFilters: !!body.filter,
      page: body.page || 0,
      sort: body.sort
    })

    // Extract parameters
    const {
      page = 0,
      sort,
      filter = {}
    } = body

    // Extract platform from request body, default to instagram
    const platform = body.platform || 'instagram'
    
    // Call the platform-aware discovery API
    const _result = await searchDiscovery(platform, {
      page,
      limit: 15,
      sort,
      filter
    })

    if (!result.success) {
      console.error('❌ Search v2 failed:', result.error)
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    // Transform results to match our expected format
    const directs = (result as any)?.data?.directs || (result as any)?.results || []
    const lookalikes = (result as any)?.data?.lookalikes || []
    const allResults = [...directs, ...lookalikes]
    
    const transformedResults = allResults.map(influencer => ({
      id: influencer.userId,
      username: influencer.profile.username,
      handle: influencer.profile.username,
      fullname: influencer.profile.fullname || influencer.profile.username,
      followers: influencer.profile.followers,
      engagement_rate: influencer.profile.engagementRate,
      engagements: influencer.profile.engagements,
      profile_picture: influencer.profile.picture,
      url: influencer.profile.url,
      platform: 'instagram',
      verified: false, // Would need to be extracted from additional data
      location: '', // Would need to be extracted from additional data
      match: influencer.match // Keep match data for sorting/relevance
    }))

    console.log('✅ Search v2 success:', {
      totalFound: (result as any)?.data?.total || (result as any)?.total || 0,
      resultsReturned: transformedResults.length,
      isExactMatch: result.data?.isExactMatch
    })

    return NextResponse.json({
      success: true,
      influencers: transformedResults,
      pagination: {
        page,
        total: (result as any)?.data?.total || (result as any)?.total || 0,
        hasMore: transformedResults.length >= 15 && (result.data?.total || 0) > (page + 1) * 15
      },
      metadata: {
        isExactMatch: (result as any)?.data?.isExactMatch,
        directsCount: directs.length || 0,
        lookalikesCount: lookalikes.length || 0
      }
    })

  } catch (_error) {
    console.error('❌ Error in search v2 API route:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}