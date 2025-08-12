import { NextResponse } from 'next/server'
import { listPartnerships } from '../../../../lib/services/modash'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || undefined
    const limit = parseInt(searchParams.get('limit') || '10')
    
    console.log('🔍 Partnerships API request:', { query, limit })
    
    const result = await listPartnerships(query || '', limit)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ Partnerships API error:', error)
    return NextResponse.json(
      { 
        error: true, 
        brands: [],
        total: 0,
        message: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}