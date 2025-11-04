import { NextResponse } from 'next/server'
import { listLanguages } from '../../../../lib/services/modash'

export async function GET(_request: Request) {
  try {
    const { searchParams } = new URL(_request.url)
    const query = searchParams.get('query') || undefined
    const limit = parseInt(searchParams.get('limit') || '10')
    const platform = searchParams.get('platform') || 'instagram'
    
    console.log('🔍 Languages API request:', { query, limit, platform })
    
    const result = await listLanguages(platform as 'instagram' | 'tiktok' | 'youtube', query || 'english', limit)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ Languages API error:', error)
    return NextResponse.json(
      { 
        error: true, 
        languages: [],
        total: 0,
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}