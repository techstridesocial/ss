import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { updateAllInfluencerAnalytics } from '@/lib/services/analytics-updater'

// POST /api/analytics/update-all - Update analytics for all influencers
export async function POST(_request: NextRequest) {
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

    console.log('🔄 Starting analytics update for all influencers...')

    // Update analytics for all influencers
    const _result = await updateAllInfluencerAnalytics()

    return NextResponse.json({
      success: true,
      message: 'Analytics update completed',
      data: {
        success_count: result.success,
        failed_count: result.failed,
        total_processed: result.success + result.failed
      }
    })

  } catch (error) {
    console.error('❌ Error updating analytics:', error)
    return NextResponse.json(
      { error: 'Failed to update analytics' },
      { status: 500 }
    )
  }
}
