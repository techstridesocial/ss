import { NextResponse } from 'next/server'
import { modashService } from '../../../../lib/services/modash'

/**
 * Profile Report API Route
 * GET /api/discovery/profile-report?userId={userId}&platform={platform}
 * 
 * Get detailed profile report for an influencer (city/country data)
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const platform = searchParams.get('platform') || 'instagram'
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId parameter is required'
      }, { status: 400 })
    }
    
    console.log('📍 Profile report request:', { userId, platform })
    
    const result = await modashService.getProfileReport(userId, platform)
    
    if (!result) {
      return NextResponse.json({
        success: false,
        error: 'Profile report not available for this user'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: {
        userId,
        platform,
        location: {
          city: result.city || null,
          country: result.country || null
        }
      }
    })
    
  } catch (error) {
    console.error('❌ Error in profile report API route:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}