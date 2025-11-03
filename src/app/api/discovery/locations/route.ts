import { NextResponse } from 'next/server'
import { listLocations } from '../../../../lib/services/modash'

export async function GET(_request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || undefined
    const platform = searchParams.get('platform') || 'instagram'
    const limit = parseInt(searchParams.get('limit') || '10')
    
    console.log('🔍 Locations API request:', { query, platform, limit })
    
    // Fix: listLocations expects (platform, query, limit)
    const result = await listLocations(
      platform as 'instagram' | 'tiktok' | 'youtube',
      query || 'united states', 
      limit
    )
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ Locations API error:', error)
    return NextResponse.json(
      { 
        error: true, 
        locations: [],
        total: 0,
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}