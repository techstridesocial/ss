import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { query, queryOne } from '@/lib/db/connection'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 Testing database connection for user:', userId)

    // Test basic database connection
    const testQuery = await query('SELECT NOW() as current_time')
    console.log('✅ Database connection test:', testQuery)

    // Test user lookup
    const userResult = await queryOne(`
      SELECT id, email, role FROM users WHERE clerk_id = $1
    `, [userId])
    console.log('👤 User lookup result:', userResult)

    // Test influencer lookup if user exists
    let influencerResult = null
    if (userResult) {
      influencerResult = await queryOne(`
        SELECT id FROM influencers WHERE user_id = $1
      `, [userResult.id])
      console.log('👤 Influencer lookup result:', influencerResult)
    }

    return NextResponse.json({
      success: true,
      debug: {
        userId,
        databaseConnected: true,
        userExists: !!userResult,
        userData: userResult,
        influencerExists: !!influencerResult,
        influencerData: influencerResult
      }
    })

  } catch (error) {
    console.error('❌ Database debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
