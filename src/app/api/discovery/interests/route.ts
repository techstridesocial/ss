import { NextResponse } from 'next/server'
import { listInterests } from '../../../../lib/services/modash'

export async function GET(_request: Request) {
  try {
    const { searchParams } = new URL(_request.url)
    const query = searchParams.get('query') || undefined
    const limit = parseInt(searchParams.get('limit') || '10')
    const platform = searchParams.get('platform') || 'instagram'
    
    console.log('🔍 Interests API request:', { query, limit, platform })
    
    const result = await listInterests(platform as 'instagram' | 'tiktok' | 'youtube', query || '', limit)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ Interests API error:', error)
    return NextResponse.json(
      { 
        error: true, 
        interests: [],
        total: 0,
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}