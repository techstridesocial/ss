import { NextResponse } from 'next/server'
import { modashService } from '../../../../lib/services/modash'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || undefined
    const limit = parseInt(searchParams.get('limit') || '10')

    console.log('📋 List Users API called:', { query, limit })

    // Call the new List Users API
    const result = await modashService.listUsers(query, limit)

    if (result.error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    console.log('✅ List Users API success:', {
      userCount: result.users.length,
      users: result.users.map(u => ({
        userId: u.userId,
        username: u.username,
        followers: u.followers,
        verified: u.isVerified
      }))
    })

    return NextResponse.json({
      success: true,
      users: result.users,
      count: result.users.length
    })

  } catch (error) {
    console.error('❌ List Users API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { query, limit = 10 } = await request.json()

    console.log('📋 List Users API (POST) called:', { query, limit })

    const result = await modashService.listUsers(query, limit)

    if (result.error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      users: result.users,
      count: result.users.length
    })

  } catch (error) {
    console.error('❌ List Users API (POST) error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}