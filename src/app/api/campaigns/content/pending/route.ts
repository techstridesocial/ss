import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { getPendingContentReviews } from '@/lib/db/queries/content-submissions'

export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Only staff members can view pending content reviews' },
        { status: 403 }
      )
    }

    const pendingSubmissions = await getPendingContentReviews()

    return NextResponse.json({
      success: true,
      submissions: pendingSubmissions
    })

  } catch (error) {
    console.error('Error fetching pending content reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending content reviews' },
      { status: 500 }
    )
  }
} 