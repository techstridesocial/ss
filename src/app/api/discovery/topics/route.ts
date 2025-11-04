import { NextResponse } from 'next/server'
import { listTopics } from '../../../../lib/services/modash'

export async function GET(_request: Request) {
  try {
    const { searchParams } = new URL(_request.url)
    const query = searchParams.get('query') || undefined
    const limit = parseInt(searchParams.get('limit') || '10')
    const platform = searchParams.get('platform') || 'instagram'
    
    console.log('🔍 Topics API request:', { query, limit, platform })
    
    const result = await listTopics(platform as 'instagram' | 'tiktok' | 'youtube', query || 'lifestyle', limit)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ Topics API error:', error)
    return NextResponse.json(
      { 
        error: true, 
        tags: [],
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}