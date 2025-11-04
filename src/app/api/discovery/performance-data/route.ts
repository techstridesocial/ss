import { NextResponse } from 'next/server'
import { getPerformanceData } from '../../../../lib/services/modash'

export async function GET(_request: Request) {
  try {
    const { searchParams } = new URL(_request.url)
    const url = searchParams.get('url')
    const platform = searchParams.get('platform') || 'instagram'

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL parameter is required (username or user ID)' },
        { status: 400 }
      )
    }

    console.log('📊 Performance Data API called:', { url, platform })

    // Call the platform-aware Performance Data API
    const result = await getPerformanceData(platform as 'instagram' | 'tiktok' | 'youtube', url, 3)
    console.log('📊 Raw result from getPerformanceData:', { 
      result: typeof result,
      hasResult: !!result,
      keys: result ? Object.keys(result) : 'none',
      hasError: !!(result as any)?.error,
      postsTotal: (result as any)?.posts?.total,
      reelsTotal: (result as any)?.reels?.total
    })

    // Modash API returns { error, posts, reels } directly
    if ((result as any)?.error) {
      return NextResponse.json(
        { success: false, error: (result as any).error || 'Failed to fetch performance data' },
        { status: 500 }
      )
    }

    console.log('✅ Performance Data API success:', {
      postsTotal: (result as any)?.posts?.total,
      reelsTotal: (result as any)?.reels?.total,
      hasData: !!((result as any)?.posts || (result as any)?.reels)
    })

    return NextResponse.json({
      success: true,
      data: {
        posts: (result as any)?.posts,
        reels: (result as any)?.reels
      }
    })

  } catch (error) {
    console.error('❌ Performance Data API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(_request: Request) {
  try {
    const { url, platform = 'instagram' } = await _request.json()

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL parameter is required (username or user ID)' },
        { status: 400 }
      )
    }

    console.log('📊 Performance Data API (POST) called:', { url, platform })

    const result = await getPerformanceData(platform as 'instagram' | 'tiktok' | 'youtube', url, 3)

    // Modash API returns { error, posts, reels } directly
    if ((result as any)?.error) {
      return NextResponse.json(
        { success: false, error: (result as any).error || 'Failed to fetch performance data' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        posts: (result as any)?.posts,
        reels: (result as any)?.reels
      }
    })

  } catch (error) {
    console.error('❌ Performance Data API (POST) error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}