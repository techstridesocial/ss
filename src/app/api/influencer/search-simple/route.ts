import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { listUsers } from '../../../../lib/services/modash'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, platform } = body

    if (!username || !platform) {
      return NextResponse.json(
        { error: 'Username and platform are required' },
        { status: 400 }
      )
    }

    console.log(`🔍 Searching for ${username} on ${platform}`)

    // Use the Modash listUsers service (same as discovery search)
    const response = await listUsers(platform as 'instagram' | 'tiktok' | 'youtube', {
      query: username.replace('@', ''),
      limit: 5
    })

    // Extract results from the API response
    const results = response?.users || response?.data || response || []

    if (!results || !Array.isArray(results) || results.length === 0) {
      return NextResponse.json({
        success: true,
        results: [],
        message: 'No profiles found'
      })
    }

    // Format results for the frontend
    const formattedResults = results.map((profile: any) => ({
      id: profile.id,
      username: profile.username,
      platform: platform,
      followers: profile.followers || 0,
      engagement_rate: profile.engagementRate || profile.engagement_rate || 0,
      avg_views: profile.avgViews || profile.avg_views || 0,
      profile_picture: profile.profilePicture || profile.profile_picture || null,
      bio: profile.bio || null,
      verified: profile.verified || false,
      is_private: profile.isPrivate || profile.is_private || false
    }))

    return NextResponse.json({
      success: true,
      results: formattedResults,
      message: `Found ${formattedResults.length} profiles`
    })

  } catch (_error) {
    console.error('Error in simple search:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
