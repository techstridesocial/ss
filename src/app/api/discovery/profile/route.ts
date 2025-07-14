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
        console.log('🔍 Raw report data structure:', JSON.stringify(reportData, null, 2))
        
        // Cast to any since the actual API returns more data than our type definitions
        const data = reportData as any
        
        const transformedData = {
          userId: reportData.userId,
          // Extract engagement metrics from the actual data structure
          avgLikes: data.statsByContentType?.all?.avgLikes || data.avgLikes || 0,
          avgComments: data.statsByContentType?.all?.avgComments || data.avgComments || 0,
          avgShares: data.statsByContentType?.all?.avgShares || data.avgShares || 0,
          engagementRate: data.statsByContentType?.all?.engagementRate || data.engagementRate || 0,
          
          // Extract post counts and account info
          postCount: data.posts?.length || data.postCount || 0,
          isPrivate: data.isPrivate || false,
          accountType: data.accountType || 'personal',
          
          // Historical performance data
          statHistory: data.statHistory || [],
          
          // Recent posts
          recentPosts: data.posts || data.recent_posts || [],
          
          // Audience demographics (if available in audience object)
          audience: {
            ageRanges: data.audience?.ageGroups || reportData.demographics?.age_ranges || {},
            gender: data.audience?.genders || reportData.demographics?.gender || {},
            locations: data.audience?.geoCountries || reportData.demographics?.locations || [],
            languages: data.audience?.languages || reportData.demographics?.languages || []
          },
          
          // Additional metrics from the comprehensive data
          paidPostPerformance: data.paidPostPerformance || 0,
          sponsoredPostsMedianLikes: data.sponsoredPostsMedianLikes || 0,
          nonSponsoredPostsMedianLikes: data.nonSponsoredPostsMedianLikes || 0,
          
          // Engagement distribution data
          engagementDistribution: data.audienceExtra?.engagementRateDistribution || [],
          credibilityDistribution: data.audienceExtra?.credibilityDistribution || []
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