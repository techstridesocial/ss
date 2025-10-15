import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { query } from '@/lib/db/connection'
import { cacheModashProfile } from '@/lib/services/modash-cache'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all connected platforms for this user
    const userResult = await query(`
      SELECT id FROM users WHERE clerk_id = $1
    `, [userId])

    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const influencerResult = await query(`
      SELECT id FROM influencers WHERE user_id = $1
    `, [userResult[0].id])

    if (influencerResult.length === 0) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
    }

    // Get all connected platforms
    const platformsResult = await query(`
      SELECT id, platform, username, is_connected
      FROM influencer_platforms
      WHERE influencer_id = $1 AND is_connected = true
    `, [influencerResult[0].id])

    console.log('🔄 Found connected platforms:', platformsResult)

    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    // Refresh Modash data for each connected platform
    for (const platform of platformsResult) {
      try {
        console.log(`🔄 Refreshing Modash data for ${platform.platform}...`)
        
        const cacheResult = await cacheModashProfile(
          platform.id,
          platform.username,
          platform.platform
        )
        
        if (cacheResult.success) {
          successCount++
          console.log(`✅ Successfully cached ${platform.platform}`)
        } else {
          errorCount++
          errors.push(`Failed to cache ${platform.platform}: ${cacheResult.error}`)
          console.error(`❌ Failed to cache ${platform.platform}:`, cacheResult.error)
        }
      } catch (error) {
        errorCount++
        const errorMsg = `Error caching ${platform.platform}: ${error instanceof Error ? error.message : 'Unknown error'}`
        errors.push(errorMsg)
        console.error(`❌ ${errorMsg}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Refreshed ${successCount} platforms, ${errorCount} errors`,
      data: {
        total: platformsResult.length,
        success: successCount,
        errors: errorCount,
        errorDetails: errors
      }
    })

  } catch (error) {
    console.error('Error refreshing Modash data:', error)
    return NextResponse.json(
      { error: 'Failed to refresh Modash data' },
      { status: 500 }
    )
  }
}
