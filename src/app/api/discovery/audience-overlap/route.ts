import { NextResponse } from 'next/server'
import { modashService } from '../../../../lib/services/modash'

/**
 * Audience Overlap Reports API Route
 * POST /api/discovery/audience-overlap
 * 
 * Compare audience overlap between multiple influencers
 */

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userIds, segments, metrics } = body
    
    if (!userIds || !Array.isArray(userIds) || userIds.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'At least 2 user IDs are required for audience overlap analysis'
      }, { status: 400 })
    }
    
    if (userIds.length > 10) {
      return NextResponse.json({
        success: false,
        error: 'Maximum 10 user IDs allowed for audience overlap analysis'
      }, { status: 400 })
    }
    
    console.log('🎯 Audience overlap request:', {
      userCount: userIds.length,
      userIds: userIds.slice(0, 3), // Log first 3 for debugging
      segments: segments || 'default',
      metrics: metrics || 'default'
    })
    
    const result = await modashService.getAudienceOverlap(userIds, {
      segments,
      metrics
    })
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Audience overlap analysis failed'
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      data: result.data,
      metadata: {
        userCount: userIds.length,
        segments: segments || ['gender', 'age', 'location'],
        metrics: metrics || ['overlap_percentage', 'unique_audience']
      }
    })
    
  } catch (error) {
    console.error('❌ Error in audience overlap API route:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'Audience Overlap Reports',
    method: 'POST',
    description: 'Compare audience overlap between multiple influencers',
    parameters: {
      userIds: 'string[] - Array of user IDs (2-10 users)',
      segments: 'string[] - Optional. Segments to analyze (gender, age, location)',
      metrics: 'string[] - Optional. Metrics to calculate (overlap_percentage, unique_audience)'
    },
    example: {
      userIds: ['user1', 'user2'],
      segments: ['gender', 'age', 'location'],
      metrics: ['overlap_percentage', 'unique_audience']
    }
  })
}