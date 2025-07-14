import { NextRequest, NextResponse } from 'next/server'
import { modashService } from '@/lib/services/modash'

export async function POST(request: NextRequest) {
  try {
    const { userId, platform = 'instagram' } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log(`🔍 Fetching profile report for user ${userId} on ${platform}`)

    // Fetch profile report from Modash
    const profileData = await modashService.getProfileReport(userId, platform)

    if (!profileData) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch profile report' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: profileData
    })

  } catch (error) {
    console.error('❌ Profile API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile data' },
      { status: 500 }
    )
  }
} 