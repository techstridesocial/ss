import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { query } from '@/lib/db/connection'
import { getProfileReport } from '@/lib/services/modash'

// POST /api/roster/bulk-refresh-analytics - Refresh analytics for all roster influencers
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is staff or admin
    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden - Staff access required' }, { status: 403 })
    }

    console.log('🔄 Starting bulk analytics refresh for all roster influencers...')

    // Get all influencers with stored modash data
    const influencersResult = await query<{
      id: string
      display_name: string
      notes: string
    }>(
      `SELECT id, display_name, notes 
       FROM influencers 
       WHERE notes IS NOT NULL 
       AND notes != '' 
       AND notes != '{}'
       ORDER BY updated_at DESC`,
      []
    )

    console.log(`📊 Found ${influencersResult.length} influencers with stored analytics`)

    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    // Process each influencer
    for (const influencer of influencersResult) {
      try {
        // Parse existing notes to get modash data
        const existingNotes = influencer.notes ? JSON.parse(influencer.notes) : {}
        const modashUserId = existingNotes.modash_data?.userId || existingNotes.modash_data?.modash_user_id

        if (!modashUserId) {
          console.log(`⚠️ Skipping ${influencer.display_name} - no Modash user ID`)
          continue
        }

        // Get platform from existing data or default to instagram
        const platform = existingNotes.modash_data?.platform || 'instagram'

        console.log(`🔄 Refreshing ${influencer.display_name} (${platform})...`)

        // Fetch fresh analytics from Modash
        const freshProfileData = await getProfileReport(modashUserId, platform)
        
        if (!freshProfileData?.profile) {
          throw new Error(`No profile data returned for ${influencer.display_name}`)
        }

        // Update the influencer with fresh data
        const updatedNotes = {
          ...existingNotes,
          modash_data: {
            ...existingNotes.modash_data,
            ...freshProfileData, // Fresh complete analytics
            last_refreshed: new Date().toISOString(),
            refreshed_by: userId,
            bulk_refresh: true
          }
        }

        // Update database
        await query(
          'UPDATE influencers SET notes = $1, updated_at = NOW() WHERE id = $2',
          [JSON.stringify(updatedNotes), influencer.id]
        )

        successCount++
        console.log(`✅ Refreshed ${influencer.display_name}`)

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        errorCount++
        const errorMsg = `Failed to refresh ${influencer.display_name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        errors.push(errorMsg)
        console.error(`❌ ${errorMsg}`)
      }
    }

    console.log(`🎯 Bulk refresh completed: ${successCount} success, ${errorCount} errors`)

    return NextResponse.json({
      success: true,
      message: 'Bulk analytics refresh completed',
      data: {
        total_processed: influencersResult.length,
        successful_refreshes: successCount,
        failed_refreshes: errorCount,
        errors: errors.slice(0, 10), // Return first 10 errors only
        completed_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Bulk refresh error:', error)
    return NextResponse.json(
      { error: 'Failed to bulk refresh analytics' },
      { status: 500 }
    )
  }
}
