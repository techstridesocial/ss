import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { getUserInfo } from '@/lib/services/modash'

// GET - Test Raw API with a sample Instagram post
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const testUrl = searchParams.get('url') || 'https://www.instagram.com/p/Cr8xYqgLQ4Z/' // Sample post for testing

    console.log('🧪 Testing Raw API with URL:', testUrl)

    // First, get current credit status
    console.log('📊 Checking credits before test...')
    const userInfoBefore = await getUserInfo()
    const creditsBefore = (userInfoBefore as any)?.billing?.credits || 0
    const rawRequestsBefore = (userInfoBefore as any)?.billing?.rawRequests || 0

    console.log('💳 Credits before test:', { creditsBefore, rawRequestsBefore })

    // Extract shortcode from Instagram URL
    const instagramMatch = testUrl.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/)
    if (!instagramMatch) {
      return NextResponse.json(
        { error: 'Invalid Instagram URL format' },
        { status: 400 }
      )
    }

    const shortcode = instagramMatch[1]
    console.log('🔍 Extracted shortcode:', shortcode)

    // Call Modash Raw API
    const apiKey = process.env.MODASH_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Modash API key not configured' },
        { status: 500 }
      )
    }

    console.log('🚀 Making Raw API call to:', `https://api.modash.io/v1/raw/ig/media-info?code=${shortcode}`)

    const response = await fetch(`https://api.modash.io/v1/raw/ig/media-info?code=${shortcode}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('📡 Raw API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Raw API error: ${response.status} - ${errorText}`)
      
      return NextResponse.json({
        success: false,
        error: `Raw API error: ${response.status}`,
        details: errorText,
        testResults: {
          url: testUrl,
          shortcode,
          status: response.status,
          creditsBefore: { credits: creditsBefore, rawRequests: rawRequestsBefore }
        }
      }, { status: response.status })
    }

    const data = await response.json()
    console.log('✅ Raw API success! Response keys:', Object.keys(data))

    // Check credits after the call
    console.log('📊 Checking credits after test...')
    const userInfoAfter = await getUserInfo()
    const creditsAfter = (userInfoAfter as any)?.billing?.credits || 0
    const rawRequestsAfter = (userInfoAfter as any)?.billing?.rawRequests || 0

    const creditsUsed = creditsBefore - creditsAfter
    const rawRequestsUsed = rawRequestsAfter - rawRequestsBefore

    console.log('💳 Credits after test:', { 
      creditsAfter, 
      rawRequestsAfter, 
      creditsUsed, 
      rawRequestsUsed 
    })

    // Extract post data
    const postData = data?.items?.[0]
    const analytics = postData ? {
      likes: postData.like_count || 0,
      comments: postData.comment_count || 0,
      views: postData.view_count || 0,
      caption: postData.caption || '',
      mediaType: postData.media_type || 1,
      timestamp: postData.taken_at || null,
      user: {
        username: postData.user?.username || '',
        profilePicUrl: postData.user?.profile_pic_url || ''
      }
    } : null

    return NextResponse.json({
      success: true,
      testResults: {
        url: testUrl,
        shortcode,
        creditsUsed: {
          before: { credits: creditsBefore, rawRequests: rawRequestsBefore },
          after: { credits: creditsAfter, rawRequests: rawRequestsAfter },
          consumed: { credits: creditsUsed, rawRequests: rawRequestsUsed }
        },
        rawApiResponse: data,
        extractedAnalytics: analytics,
        dataQuality: {
          hasPostData: !!postData,
          hasLikes: !!(postData?.like_count),
          hasComments: !!(postData?.comment_count),
          hasViews: !!(postData?.view_count),
          hasUserInfo: !!(postData?.user?.username)
        }
      }
    })

  } catch (_error) {
    console.error('❌ Raw API test error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
