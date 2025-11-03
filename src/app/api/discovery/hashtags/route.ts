import { NextResponse } from 'next/server'
import { listHashtags } from '../../../../lib/services/modash'

export async function GET(_request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || undefined
    const limit = parseInt(searchParams.get('limit') || '10')
    const platform = searchParams.get('platform') || 'instagram'
    
    console.log('🔍 Hashtags API request:', { query, limit, platform })
    
    const result = await listHashtags(platform as 'instagram' | 'tiktok' | 'youtube', query || 'fitness', limit)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ Hashtags API error:', error)
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