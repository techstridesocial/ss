import { NextResponse } from 'next/server'
import { modashService } from '../../../../lib/services/modash'

export async function GET() {
  try {
    console.log('💳 Fetching Modash credit usage...')
    
    const creditUsage = await modashService.getCreditUsage()
    
    console.log('✅ Credit usage fetched:', creditUsage)
    
    return NextResponse.json({
      success: true,
      data: {
        used: creditUsage.used,
        limit: creditUsage.limit,
        remaining: creditUsage.remaining,
        resetDate: creditUsage.resetDate,
        percentage: Math.round((creditUsage.used / creditUsage.limit) * 100)
      }
    })
    
  } catch (error) {
    console.error('❌ Credit usage API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch credit usage',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 