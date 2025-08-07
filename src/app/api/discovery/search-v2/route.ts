import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { modashService } from '../../../../lib/services/modash'

export async function POST(request: Request) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // Call the new search influencers API
    const result = await modashService.searchInfluencers(filter, page, sort)

    if (!result.success) {
      console.error('❌ Search v2 failed:', result.error)
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    // Transform results to match our expected format
    const allResults = [...(result.data?.directs || []), ...(result.data?.lookalikes || [])]
    
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
      totalFound: result.data?.total || 0,
      resultsReturned: transformedResults.length,
      isExactMatch: result.data?.isExactMatch
    })

    return NextResponse.json({
      success: true,
      influencers: transformedResults,
      pagination: {
        page,
        total: result.data?.total || 0,
        hasMore: transformedResults.length >= 15 && (result.data?.total || 0) > (page + 1) * 15
      },
      metadata: {
        isExactMatch: result.data?.isExactMatch,
        directsCount: result.data?.directs?.length || 0,
        lookalikesCount: result.data?.lookalikes?.length || 0
      }
    })

  } catch (error) {
    console.error('❌ Error in search v2 API route:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}