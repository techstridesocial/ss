import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { updateExpiredProfiles, getCacheStats } from '@/lib/services/modash-cache'

// POST - Manually trigger cache updates (for admin/scheduler)
export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication check for admin users
    const authHeader = request.headers.get('Authorization')
    const expectedToken = process.env.MODASH_UPDATE_TOKEN || 'update-cache-token'
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🔄 Starting scheduled Modash cache update...')
    
    const _result = await updateExpiredProfiles()
    
    return NextResponse.json({
      success: true,
      message: 'Cache update completed',
      stats: {
        updated: result.updated,
        errors: result.errors,
        creditsUsed: result.creditsUsed
      }
    })

  } catch (error) {
    console.error('Error during cache update:', error)
    return NextResponse.json(
      { 
        error: 'Cache update failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET - Get cache statistics
export async function GET(request: NextRequest) {
  try {
    const stats = await getCacheStats()
    
    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Error getting cache stats:', error)
    return NextResponse.json(
      { error: 'Failed to get cache stats' },
      { status: 500 }
    )
  }
} 
