import { NextResponse } from 'next/server'
import { modashService } from '../../../../lib/services/modash'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL parameter is required (username or user ID)' },
        { status: 400 }
      )
    }

    console.log('📊 Performance Data API called:', { url })

    // Call the new Performance Data API
    const result = await modashService.getPerformanceData(url, 3)

    if (!result.success) {
      if (result.status === 'retry_later') {
        return NextResponse.json({
          success: false,
          status: 'retry_later',
          message: result.message || 'Data is being processed. Please retry in 5 minutes.'
        })
      }

      return NextResponse.json(
        { success: false, error: result.message || 'Failed to fetch performance data' },
        { status: 500 }
      )
    }

    console.log('✅ Performance Data API success:', {
      postsTotal: result.data?.posts?.total,
      reelsTotal: result.data?.reels?.total,
      hasData: !!result.data
    })

    return NextResponse.json({
      success: true,
      data: result.data
    })

  } catch (error) {
    console.error('❌ Performance Data API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL parameter is required (username or user ID)' },
        { status: 400 }
      )
    }

    console.log('📊 Performance Data API (POST) called:', { url })

    const result = await modashService.getPerformanceData(url, 3)

    if (!result.success) {
      if (result.status === 'retry_later') {
        return NextResponse.json({
          success: false,
          status: 'retry_later',
          message: result.message || 'Data is being processed. Please retry in 5 minutes.'
        })
      }

      return NextResponse.json(
        { success: false, error: result.message || 'Failed to fetch performance data' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data
    })

  } catch (error) {
    console.error('❌ Performance Data API (POST) error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}