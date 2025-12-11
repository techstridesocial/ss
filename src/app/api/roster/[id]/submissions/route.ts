import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { query } from '@/lib/db/connection'
import { getSubmissionListsByInfluencer } from '@/lib/db/queries/submissions'

// GET - Get all submission lists for an influencer
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is staff
    const userRole = await getCurrentUserRole()
    if (!userRole || userRole !== 'STAFF') {
      return NextResponse.json({ error: 'Forbidden - Staff access required' }, { status: 403 })
    }

    const { id: influencerId } = await params

    if (!influencerId) {
      return NextResponse.json({ error: 'Influencer ID is required' }, { status: 400 })
    }

    const submissionLists = await getSubmissionListsByInfluencer(influencerId)

    return NextResponse.json({
      success: true,
      data: submissionLists
    })
  } catch (error) {
    console.error('Error fetching submission lists for influencer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submission lists' },
      { status: 500 }
    )
  }
}
