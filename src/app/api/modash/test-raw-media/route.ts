import { NextRequest, NextResponse } from 'next/server'
import { getMediaInfo, detectPlatformFromUrl } from '@/lib/services/modash'

// GET /api/modash/test-raw-media - Test RAW API media info endpoint (auto-detects platform)
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

    // Auto-detect platform
    const platform = detectPlatformFromUrl(url)
    console.log('🔄 Testing Modash RAW API media info:', { url, platform })

    // Call the appropriate RAW API endpoint based on platform
    const result = await getMediaInfo(url)
    
    console.log('📊 RAW API Response:', {
      hasItems: !!result?.items,
      itemsCount: result?.items?.length || 0,
      hasError: !!result?.error
    })

    if (result?.error) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    // Extract key analytics from the response (handles both Instagram and TikTok)
    const analytics = extractAnalyticsFromMediaInfo(result, platform)
    
    return NextResponse.json({
      success: true,
      data: {
        raw_response: result,
        analytics: analytics
      }
    })

  } catch (error) {
    console.error('❌ RAW API test error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Extract analytics from media info response (handles Instagram, TikTok, and YouTube)
function extractAnalyticsFromMediaInfo(data: any, platform: string) {
  if (platform === 'instagram') {
    return extractInstagramAnalytics(data)
  } else if (platform === 'tiktok') {
    return extractTikTokAnalytics(data)
  } else if (platform === 'youtube') {
    return extractYouTubeAnalytics(data)
  } else {
    return null
  }
}

// Extract analytics from Instagram response
function extractInstagramAnalytics(data: any) {
  if (!data?.items || data.items.length === 0) {
    return null
  }

  const item = data.items[0] // Get first (and usually only) item
  
  return {
    platform: 'instagram',
    like_count: item.like_count || 0,
    comment_count: item.comment_count || 0,
    play_count: item.play_count || 0,
    view_count: item.view_count || 0,
    media_type: item.media_type,
    taken_at: item.taken_at,
    code: item.code,
    caption: item.caption?.text || '',
    has_audio: item.has_audio,
    is_dash_eligible: item.is_dash_eligible,
    like_and_view_counts_disabled: item.like_and_view_counts_disabled
  }
}

// Extract analytics from TikTok response
function extractTikTokAnalytics(data: any) {
  if (!data?.itemStruct) {
    return null
  }

  const item = data.itemStruct
  const stats = item.stats || {}
  const author = item.author || {}
  
  return {
    platform: 'tiktok',
    video_id: item.id,
    description: item.desc,
    create_time: item.createTime,
    play_count: stats.playCount || 0,
    like_count: stats.diggCount || 0,
    comment_count: stats.commentCount || 0,
    share_count: stats.shareCount || 0,
    author: {
      id: author.id,
      unique_id: author.uniqueId,
      nickname: author.nickname,
      verified: author.verified,
      follower_count: author.stats?.followerCount || 0,
      following_count: author.stats?.followingCount || 0,
      heart_count: author.stats?.heartCount || 0,
      video_count: author.stats?.videoCount || 0
    }
  }
}

// Extract analytics from YouTube response
function extractYouTubeAnalytics(data: any) {
  if (!data?.video_info) {
    return null
  }

  const video = data.video_info
  
  return {
    platform: 'youtube',
    video_id: video.video_id,
    channel_id: video.channel_id,
    title: video.title,
    published_at: video.published_at,
    duration: video.duration,
    views: video.views || 0,
    likes: video.likes || 0,
    dislikes: video.dislikes || 0,
    comments: video.comments || 0,
    genre: video.genre,
    thumbnail: video.thumbnail,
    description: video.description,
    keywords: video.keywords || [],
    includes_paid_promotion: video.includes_paid_promotion || false
  }
}
