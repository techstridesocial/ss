import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { query } from '@/lib/db/connection'
import { getProfileReport } from '@/lib/services/modash'

// POST /api/roster/[id]/refresh-analytics - Refresh analytics for roster influencer
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params

    // Get current influencer data
    const influencerResult = await query<{
      id: string
      display_name: string
      notes: string
    }>(
      'SELECT id, display_name, notes FROM influencers WHERE id = $1',
      [id]
    )

    if (influencerResult.length === 0) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
    }

    const influencer = influencerResult[0]
    
    // Parse existing notes to get modash data
    const existingNotes = influencer.notes ? JSON.parse(influencer.notes) : {}
    const modashUserId = existingNotes.modash_data?.userId || existingNotes.modash_data?.modash_user_id

    if (!modashUserId) {
      return NextResponse.json({ 
        error: 'No Modash user ID found - cannot refresh analytics' 
      }, { status: 400 })
    }

    // Get platform from existing data or default to instagram
    const platform = existingNotes.modash_data?.platform || 'instagram'

    console.log('🔄 Refreshing analytics for:', {
      influencerId: id,
      modashUserId,
      platform
    })

    // Fetch fresh analytics from Modash
    const freshProfileData = await getProfileReport(modashUserId, platform)
    
    if (!freshProfileData?.profile) {
      throw new Error('Failed to fetch fresh analytics from Modash')
    }

    // Update the influencer with fresh data
    const updatedNotes = {
      ...existingNotes,
      modash_data: {
        ...existingNotes.modash_data,
        ...freshProfileData, // Fresh complete analytics
        last_refreshed: new Date().toISOString(),
        refreshed_by: userId
      }
    }

    // Update database
    await query(
      'UPDATE influencers SET notes = $1, updated_at = NOW() WHERE id = $2',
      [JSON.stringify(updatedNotes), id]
    )

    console.log('✅ Successfully refreshed analytics for influencer:', id)

    return NextResponse.json({
      success: true,
      message: 'Analytics refreshed successfully',
      data: {
        influencer_id: id,
        last_refreshed: updatedNotes.modash_data.last_refreshed
      }
    })

  } catch (error) {
    console.error('❌ Error refreshing analytics:', error)
    return NextResponse.json(
      { error: 'Failed to refresh analytics' },
      { status: 500 }
    )
  }
}
