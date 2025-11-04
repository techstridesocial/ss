import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { getContentSubmissionStats } from '@/lib/db/queries/content-submissions'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Only staff members can view content statistics' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaignId')

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    const stats = await getContentSubmissionStats(campaignId)

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Error fetching content statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content statistics' },
      { status: 500 }
    )
  }
} 