import { NextResponse } from 'next/server'
import { listTopics } from '../../../../lib/services/modash'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || undefined
    const limit = parseInt(searchParams.get('limit') || '10')
    
    console.log('🔍 Topics API request:', { query, limit })
    
    const result = await listTopics(query || 'lifestyle', limit)
    
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