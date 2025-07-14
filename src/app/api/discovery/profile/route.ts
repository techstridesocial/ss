import { NextRequest, NextResponse } from 'next/server'
import { modashService } from '@/lib/services/modash'

export async function POST(request: NextRequest) {
  try {
    const { userId, platform = 'instagram', includeReport = false } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log(`🔍 Fetching ${includeReport ? 'full report' : 'basic profile'} for user ${userId} on ${platform}`)

    // Helper function to fetch basic profile data
    const fetchBasicProfile = async () => {
      try {
        const profileData = await modashService.getProfileReport(userId, platform)
        
        if (!profileData) {
          return NextResponse.json(
            { success: false, error: 'Failed to fetch profile report' },
            { status: 404 }
          )
        }

        const { city, country } = profileData
        return NextResponse.json({
          success: true,
          city: city || 'Unknown',
          country: country || 'Unknown'
        })
      } catch (error) {
        console.error('❌ Failed to fetch basic profile:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to fetch profile data' },
          { status: 500 }
        )
      }
    }

    if (includeReport) {
      // Try to fetch comprehensive influencer report with demographics
      try {
        const reportData = await modashService.getInfluencerReport(userId)
        
        if (!reportData) {
          console.warn('⚠️ No report data available for user:', userId)
          // Fall back to basic profile data instead of returning error
          return await fetchBasicProfile()
        }

        // Transform the report data to match our UI expectations
        const transformedData = {
          userId: reportData.userId,
          demographics: reportData.demographics,
          engagement: reportData.engagement,
          recentPosts: reportData.recent_posts,
          // Map demographics to our expected format
          audience: {
            ageRanges: reportData.demographics?.age_ranges || {},
            gender: reportData.demographics?.gender || {},
            locations: reportData.demographics?.locations || [],
            languages: reportData.demographics?.languages || []
          },
          // Add engagement details
          avgLikes: reportData.engagement?.avg_likes || 0,
          avgComments: reportData.engagement?.avg_comments || 0,
          avgShares: reportData.engagement?.avg_shares || 0,
          engagementRate: reportData.engagement?.engagement_rate || 0
        }

        return NextResponse.json({
          success: true,
          data: transformedData
        })
      } catch (error) {
        console.warn('⚠️ Failed to fetch comprehensive report, falling back to basic profile:', error)
        return await fetchBasicProfile()
      }
    } else {
      // Just fetch basic profile location data
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
    }

  } catch (error) {
    console.error('❌ Profile API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile data' },
      { status: 500 }
    )
  }
} 