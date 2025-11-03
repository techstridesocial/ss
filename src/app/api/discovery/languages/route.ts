import { NextResponse } from 'next/server'
import { listLanguages } from '../../../../lib/services/modash'

export async function GET(_request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || undefined
    const limit = parseInt(searchParams.get('limit') || '10')
    
    console.log('🔍 Languages API request:', { query, limit })
    
    const result = await listLanguages(query || 'english', limit)
    
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