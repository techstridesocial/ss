import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { refreshInfluencerAnalytics } from '@/lib/services/analytics-refresh'

// POST /api/roster/[id]/refresh-analytics - Refresh analytics for roster influencer
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Store values for error handling
  let influencerId: string | undefined
  let requestPlatform: string | undefined

  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is staff or admin
    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden - Staff access required' }, { status: 403 })
    }

    // Await params in Next.js 15
    const { id } = await params
    influencerId = id

    // Optional payload coming from client (contains freshly fetched Modash data)
    let requestPayload: any = null
    const contentType = request.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      requestPayload = await request.json().catch(() => null)
      requestPlatform = requestPayload?.platform
    }

    // Delegate to service layer
    const result = await refreshInfluencerAnalytics({
      influencerId: id,
      refreshedBy: userId,
      payload: requestPayload
    })

    return NextResponse.json({
      success: true,
      message: 'Analytics refreshed successfully',
      data: {
        influencer_id: result.influencerId,
        platform: result.platform,
        totals: result.totals,
        metrics: result.metrics,
        last_refreshed: result.lastRefreshed
      }
    })

  } catch (error: any) {
    console.error('❌ Error refreshing analytics:', {
      influencerId: influencerId || 'unknown',
      platform: requestPlatform || 'unknown',
      error: error instanceof Error ? error.message : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined
    })

    // Handle specific error types with appropriate status codes
    if (error?.message?.includes('Influencer not found')) {
      return NextResponse.json({
        error: 'Influencer not found',
        code: 'NOT_FOUND',
        retryable: false
      }, { status: 404 })
    }

    if (error?.message?.includes('No valid Modash user ID found')) {
      return NextResponse.json({
        error: 'No valid Modash user ID found - cannot refresh analytics. Please ensure userId is a valid Modash identifier (not an internal UUID).',
        code: 'INVALID_USER_ID',
        details: error.message,
        retryable: false
      }, { status: 400 })
    }

    if (error?.message?.includes('Failed to fetch fresh analytics')) {
      return NextResponse.json({
        error: 'Failed to fetch data from Modash',
        code: 'MODASH_API_ERROR',
        details: error.message,
        retryable: true
      }, { status: 502 })
    }

    if (error?.message?.includes('Invalid Modash userId') || error?.message?.includes('Invalid userId')) {
      return NextResponse.json({
        error: 'Invalid user ID format',
        code: 'INVALID_USER_ID',
        details: error.message,
        retryable: false
      }, { status: 400 })
    }

    // Check for Postgres errors
    if (error?.code === '23505') { // Unique violation
      return NextResponse.json({
        error: 'Duplicate entry conflict',
        code: 'DUPLICATE_ERROR',
        retryable: true
      }, { status: 409 })
    }

    // Generic fallback
    return NextResponse.json({
      error: 'Failed to refresh analytics',
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      retryable: true
    }, { status: 500 })
  }
}
