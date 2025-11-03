import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db/connection'

export async function GET(_request: NextRequest) {
  try {
    console.log('🔍 Checking database data...')
    
    // Check influencer_platforms table
    const platformsResult = await query(`
      SELECT 
        id,
        platform,
        username,
        followers,
        engagement_rate,
        avg_views,
        is_connected,
        last_synced
      FROM influencer_platforms
      ORDER BY platform
    `)
    
    // Check modash_profile_cache table
    const cacheResult = await query(`
      SELECT 
        id,
        influencer_platform_id,
        modash_user_id,
        platform,
        username,
        followers,
        engagement_rate,
        cached_at,
        expires_at
      FROM modash_profile_cache
      ORDER BY cached_at DESC
    `)
    
    return NextResponse.json({
      success: true,
      data: {
        influencer_platforms: platformsResult,
        modash_profile_cache: cacheResult,
        analysis: {
          platforms_count: platformsResult.length,
          cache_count: cacheResult.length,
          has_mismatch: platformsResult.length > 0 && cacheResult.length === 0
        }
      }
    })
    
  } catch (error) {
    console.error('❌ Error checking database:', error)
    return NextResponse.json(
      { error: 'Failed to check database data' },
      { status: 500 }
    )
  }
}
