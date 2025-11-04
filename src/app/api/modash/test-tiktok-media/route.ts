import { NextRequest, NextResponse } from 'next/server'
import { getTikTokMediaInfo } from '@/lib/services/modash'

// GET /api/modash/test-tiktok-media - Test TikTok RAW API media info endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL parameter is required' },
        { status: 400 }
      )
    }

    console.log('🔄 Testing TikTok RAW API media info:', { url })

    // Call the TikTok RAW API media info endpoint
    const result = await getTikTokMediaInfo(url)
    
    console.log('📊 TikTok RAW API Response:', {
      hasData: !!result,
      hasError: !!(result as any)?.error
    })

    if ((result as any)?.error) {
      return NextResponse.json(
        { success: false, error: (result as any).error },
        { status: 500 }
      )
    }

    // Extract key analytics from the TikTok response
    const analytics = extractTikTokAnalytics(result)
    
    return NextResponse.json({
      success: true,
      data: {
        raw_response: result,
        analytics: analytics
      }
    })

  } catch (error) {
    console.error('❌ TikTok RAW API test error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Extract analytics from TikTok media info response
function extractTikTokAnalytics(data: any) {
  if (!data?.itemStruct) {
    return null
  }

  const item = data.itemStruct
  
  return {
    video_id: item.id,
    description: item.desc,
    create_time: item.createTime,
    play_count: item.stats?.playCount || 0,
    like_count: item.stats?.diggCount || 0,
    comment_count: item.stats?.commentCount || 0,
    share_count: item.stats?.shareCount || 0,
    author: {
      id: item.author?.id,
      unique_id: item.author?.uniqueId,
      nickname: item.author?.nickname,
      verified: item.author?.verified,
      follower_count: item.author?.stats?.followerCount || 0,
      following_count: item.author?.stats?.followingCount || 0,
      heart_count: item.author?.stats?.heartCount || 0,
      video_count: item.author?.stats?.videoCount || 0
    }
  }
}
