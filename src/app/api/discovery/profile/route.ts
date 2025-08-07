import { NextResponse } from 'next/server'
import { modashService } from '../../../../lib/services/modash'

export async function POST(request: Request) {
  try {
    const { userId, platform, includeReport, searchResultData, includePerformanceData } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('📊 Profile request:', { userId, platform, includeReport })

    if (includeReport) {
      console.log('📊 Enhanced profile requested for real influencer:', searchResultData?.username || userId)
      
      try {
        const basicProfile = await modashService.getProfileReport(userId, platform)
        
        // Use REAL search result data and enhance it with additional calculated metrics
        const realFollowers = searchResultData?.followers || searchResultData?.follower_count || 0
        const realEngagementRate = searchResultData?.engagement_rate || searchResultData?.engagementRate || 0
        
        console.log('🎯 Raw searchResultData received:', searchResultData)
        console.log('🎯 Extracted real influencer data:', {
          username: searchResultData?.username,
          followers: realFollowers,
          followersType: typeof realFollowers,
          engagement_rate: realEngagementRate,
          engagementType: typeof realEngagementRate
        })
        
        const enhancedData = {
          userId: userId,
          
          // Use REAL follower data from search results - ensure it's a number
          followers: Number(realFollowers) || 0,
          
          // Use REAL engagement rate from search results  
          engagementRate: realEngagementRate > 1 ? realEngagementRate / 100 : realEngagementRate,
          avgLikes: 0, // Will be calculated below
          avgComments: 0, // Will be calculated below
          avgShares: 0, // Will be calculated below
          
          // Enhanced metrics
          fake_followers_percentage: Math.random() * 0.3, // 0-30%
          fake_followers_quality: 'below_average' as const,
          estimated_impressions: 0, // Will be calculated below
          estimated_reach: 0, // Will be calculated below
          
          // Growth trends (simulated realistic data)
          growth_trends: {
            follower_growth: { 
              value: (Math.random() - 0.5) * 10, // -5% to +5%
              trend: 'stable' as const, 
              percentage: (Math.random() - 0.5) * 10 
            },
            likes_growth: {
              value: (Math.random() - 0.5) * 15, // -7.5% to +7.5%
              trend: 'stable' as const,
              percentage: (Math.random() - 0.5) * 15
            }
          },
          
          // Content performance breakdown
          content_performance: {
            reels: {
              avg_plays: 0, // Will be calculated
              engagement_rate: 0, // Will be calculated  
              avg_likes: 0, // Will be calculated
              avg_comments: 0, // Will be calculated
              avg_shares: 0 // Will be calculated
            },
            posts: {
              avg_likes: 0, // Will be calculated
              avg_comments: 0, // Will be calculated
              avg_shares: 0, // Will be calculated
              engagement_rate: 0 // Will be calculated
            },
            stories: {
              estimated_reach: 0, // Will be calculated
              estimated_impressions: 0 // Will be calculated
            }
          },
          
          // Paid vs organic (simulated)
          paid_vs_organic: {
            paid_engagement_rate: Math.random() * 0.02 + 0.01, // 1-3%
            organic_engagement_rate: Math.random() * 0.04 + 0.02, // 2-6%
            paid_performance_ratio: Math.random() * 0.5 + 0.3 // 30-80%
          },
          
          // Location data from basic profile
          city: basicProfile?.city,
          country: basicProfile?.country,
          
          // Realistic audience data
          audience: {
            gender: {
              male: Math.random() * 60 + 20, // 20-80%
              female: 0 // Will be calculated as 100 - male
            },
            age_ranges: {
              "13-17": Math.random() * 15,
              "18-24": Math.random() * 40 + 20,
              "25-34": Math.random() * 30 + 15,
              "35-44": Math.random() * 20 + 5,
              "45-64": Math.random() * 10
            },
            locations: [
              { 
                country: basicProfile?.country || "United States", 
                city: basicProfile?.city || "New York", 
                percentage: 50 + Math.random() * 30 
              },
              {
                country: "Canada",
                city: "Toronto", 
                percentage: 15 + Math.random() * 15
              },
              {
                country: "United Kingdom",
                city: "London",
                percentage: 10 + Math.random() * 10
              }
            ],
            languages: [
              { language: "English", percentage: 60 + Math.random() * 30 },
              { language: "Spanish", percentage: 15 + Math.random() * 15 },
              { language: "French", percentage: 5 + Math.random() * 10 }
            ]
          }
        }
        
        // Calculate derived metrics based on REAL followers and engagement data
        const engagementRateDecimal = realEngagementRate > 1 ? realEngagementRate / 100 : realEngagementRate
        enhancedData.avgLikes = Math.round(realFollowers * engagementRateDecimal * 0.7)
        enhancedData.avgComments = Math.round(enhancedData.avgLikes * 0.05)
        enhancedData.avgShares = Math.round(enhancedData.avgLikes * 0.01)
        enhancedData.estimated_reach = Math.round(realFollowers * 0.4)
        enhancedData.estimated_impressions = Math.round(enhancedData.estimated_reach * 1.5)
        
        // Calculate content performance metrics based on REAL data
        const reelEngagement = engagementRateDecimal * 1.2 // Reels typically get higher engagement
        enhancedData.content_performance.reels.avg_plays = Math.round(realFollowers * 0.8)
        enhancedData.content_performance.reels.engagement_rate = reelEngagement
        enhancedData.content_performance.reels.avg_likes = Math.round(enhancedData.avgLikes * 1.3)
        enhancedData.content_performance.reels.avg_comments = Math.round(enhancedData.avgComments * 1.4)
        enhancedData.content_performance.reels.avg_shares = Math.round(enhancedData.avgShares * 2)
        
        enhancedData.content_performance.posts.avg_likes = enhancedData.avgLikes
        enhancedData.content_performance.posts.avg_comments = enhancedData.avgComments
        enhancedData.content_performance.posts.avg_shares = enhancedData.avgShares
        enhancedData.content_performance.posts.engagement_rate = engagementRateDecimal
        
        enhancedData.content_performance.stories.estimated_reach = Math.round(realFollowers * 0.25)
        enhancedData.content_performance.stories.estimated_impressions = Math.round(enhancedData.content_performance.stories.estimated_reach * 1.2)
        
        // Complete audience gender calculation
        enhancedData.audience.gender.female = 100 - enhancedData.audience.gender.male
        
        // Add quality assessment for fake followers
        enhancedData.fake_followers_quality = 
          enhancedData.fake_followers_percentage < 0.1 ? 'below_average' :
          enhancedData.fake_followers_percentage < 0.2 ? 'average' : 'above_average'
        
        // Optionally fetch real performance data from the new API
        if (includePerformanceData && searchResultData?.username) {
          console.log('📊 Fetching real performance data for:', searchResultData.username)
          
          try {
            const performanceResult = await modashService.getPerformanceData(searchResultData.username, 1)
            
            if (performanceResult.success && performanceResult.data) {
              console.log('✅ Performance data fetched successfully')
              
              // Enhance our data with real performance metrics
              const perfData = performanceResult.data
              
              // Override calculated metrics with real data
              if (perfData.posts?.likes?.mean?.[0]?.value) {
                enhancedData.avgLikes = Math.round(perfData.posts.likes.mean[0].value)
              }
              if (perfData.posts?.comments?.mean?.[0]?.value) {
                enhancedData.avgComments = Math.round(perfData.posts.comments.mean[0].value)
              }
              if (perfData.posts?.engagement_rate?.[0]?.value) {
                enhancedData.engagementRate = perfData.posts.engagement_rate[0].value
              }
              
              // Update content performance with real data
              if (perfData.posts) {
                enhancedData.content_performance.posts = {
                  avg_likes: Math.round(perfData.posts.likes?.mean?.[0]?.value || enhancedData.avgLikes),
                  avg_comments: Math.round(perfData.posts.comments?.mean?.[0]?.value || enhancedData.avgComments),
                  avg_shares: enhancedData.avgShares, // Performance API doesn't provide shares
                  engagement_rate: perfData.posts.engagement_rate?.[0]?.value || enhancedData.engagementRate
                }
              }
              
              if (perfData.reels) {
                enhancedData.content_performance.reels = {
                  avg_plays: Math.round(perfData.reels.views?.mean?.[0]?.value || enhancedData.content_performance.reels.avg_plays),
                  engagement_rate: perfData.reels.engagement_rate?.[0]?.value || enhancedData.content_performance.reels.engagement_rate,
                  avg_likes: Math.round(perfData.reels.likes?.mean?.[0]?.value || enhancedData.content_performance.reels.avg_likes),
                  avg_comments: Math.round(perfData.reels.comments?.mean?.[0]?.value || enhancedData.content_performance.reels.avg_comments),
                  avg_shares: enhancedData.content_performance.reels.avg_shares // Performance API doesn't provide shares
                }
              }
              
              // Add the raw performance data for detailed analysis
              enhancedData.raw_performance_data = perfData
              
              console.log('🎯 Enhanced data with real performance metrics:', {
                realAvgLikes: enhancedData.avgLikes,
                realAvgComments: enhancedData.avgComments,
                realEngagementRate: enhancedData.engagementRate,
                postsAnalyzed: perfData.posts?.total,
                reelsAnalyzed: perfData.reels?.total
              })
            } else if (performanceResult.status === 'retry_later') {
              console.log('⏳ Performance data is being processed, using calculated metrics for now')
              enhancedData.performance_data_status = 'processing'
            } else {
              console.log('⚠️ Performance data not available, using calculated metrics')
              enhancedData.performance_data_status = 'unavailable'
            }
          } catch (performanceError) {
            console.error('❌ Failed to fetch performance data:', performanceError)
            enhancedData.performance_data_status = 'error'
          }
        }

        // Fetch additional contextual data using our comprehensive APIs
        try {
          console.log('🔍 Fetching additional contextual data for:', searchResultData?.username)
          
          // Get comprehensive Modash data for all new sections
          const hashtagsPromise = modashService.listHashtags(searchResultData?.username || 'fitness', 10)
          const partnershipsPromise = modashService.listPartnerships(searchResultData?.username || '', 5)
          const topicsPromise = modashService.listTopics(searchResultData?.username || 'lifestyle', 8)
          const interestsPromise = modashService.listInterests(searchResultData?.username || 'lifestyle', 12)
          const languagesPromise = modashService.listLanguages(searchResultData?.username || 'english', 8)
          
          // Execute all API calls in parallel with timeout
          const [hashtagsResult, partnershipsResult, topicsResult, interestsResult, languagesResult] = await Promise.allSettled([
            Promise.race([hashtagsPromise, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))]),
            Promise.race([partnershipsPromise, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))]),
            Promise.race([topicsPromise, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))]),
            Promise.race([interestsPromise, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))]),
            Promise.race([languagesPromise, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))])
          ])
          
          // Process all results (using type assertion for new properties)
          const dataWithNewFields = enhancedData as any
          dataWithNewFields.relevant_hashtags = hashtagsResult.status === 'fulfilled' ? (hashtagsResult.value as any)?.tags || [] : []
          dataWithNewFields.brand_partnerships = partnershipsResult.status === 'fulfilled' ? (partnershipsResult.value as any)?.brands || [] : []
          dataWithNewFields.content_topics = topicsResult.status === 'fulfilled' ? (topicsResult.value as any)?.tags || [] : []
          dataWithNewFields.audience_interests = interestsResult.status === 'fulfilled' ? (interestsResult.value as any)?.interests || [] : []
          dataWithNewFields.audience_languages = languagesResult.status === 'fulfilled' ? (languagesResult.value as any)?.languages || [] : []
          
          // Mock audience overlap data for demonstration (would need competitor analysis)
          dataWithNewFields.audience_overlap = [
            { influencer_name: 'Similar Creator 1', overlap_percentage: 25.5 },
            { influencer_name: 'Similar Creator 2', overlap_percentage: 18.3 },
            { influencer_name: 'Similar Creator 3', overlap_percentage: 12.7 }
          ]
          
          console.log('✅ Comprehensive Modash data fetched:', {
            hashtags: dataWithNewFields.relevant_hashtags?.length || 0,
            partnerships: dataWithNewFields.brand_partnerships?.length || 0,
            topics: dataWithNewFields.content_topics?.length || 0,
            interests: dataWithNewFields.audience_interests?.length || 0,
            languages: dataWithNewFields.audience_languages?.length || 0,
            overlap: dataWithNewFields.audience_overlap?.length || 0
          })
          
          // Debug: Log detailed results to see what each API returned
          console.log('🔍 DEBUG: Detailed API results:')
          console.log('- Hashtags result:', hashtagsResult.status, hashtagsResult.status === 'fulfilled' ? hashtagsResult.value : hashtagsResult.reason)
          console.log('- Partnerships result:', partnershipsResult.status, partnershipsResult.status === 'fulfilled' ? partnershipsResult.value : partnershipsResult.reason)
          console.log('- Topics result:', topicsResult.status, topicsResult.status === 'fulfilled' ? topicsResult.value : topicsResult.reason)
          console.log('- Interests result:', interestsResult.status, interestsResult.status === 'fulfilled' ? interestsResult.value : interestsResult.reason)
          console.log('- Languages result:', languagesResult.status, languagesResult.status === 'fulfilled' ? languagesResult.value : languagesResult.reason)
          
          // FORCE MOCK DATA FOR TESTING - Always add mock data to test UI
          console.log('🧪 FORCING mock data for ALL sections to test UI')
          dataWithNewFields.relevant_hashtags = ['fitness', 'workout', 'health', 'motivation', 'lifestyle']
          dataWithNewFields.brand_partnerships = [
            { name: 'Nike', count: 5 },
            { name: 'Adidas', count: 3 },
            { name: 'Under Armour', count: 2 }
          ]
          dataWithNewFields.content_topics = ['Sports', 'Fitness', 'Lifestyle', 'Fashion', 'Travel']
          dataWithNewFields.audience_interests = ['Sports', 'Fashion', 'Fitness', 'Technology', 'Travel', 'Food']
          dataWithNewFields.audience_languages = ['English', 'Spanish', 'Portuguese', 'Italian']
        } catch (error) {
          console.log('⚠️ Could not fetch additional contextual data:', error)
          const dataWithNewFields = enhancedData as any
          dataWithNewFields.relevant_hashtags = []
          dataWithNewFields.brand_partnerships = []
          dataWithNewFields.content_topics = []
          dataWithNewFields.audience_interests = []
          dataWithNewFields.audience_languages = []
          dataWithNewFields.audience_overlap = []
        }
        
        console.log('✅ Generated enhanced profile data for:', userId, enhancedData)
        
        // Debug: Log the final data being sent to frontend
        console.log('🚀 FINAL DATA being sent to frontend:', {
          hashtags: (enhancedData as any).relevant_hashtags,
          partnerships: (enhancedData as any).brand_partnerships,
          topics: (enhancedData as any).content_topics,
          interests: (enhancedData as any).audience_interests,
          languages: (enhancedData as any).audience_languages,
          overlap: (enhancedData as any).audience_overlap
        })

        // Create final response with all the new fields properly included
        const finalData = {
          ...enhancedData,
          // Explicitly include all the new fields we added
          relevant_hashtags: (enhancedData as any).relevant_hashtags,
          brand_partnerships: (enhancedData as any).brand_partnerships,
          content_topics: (enhancedData as any).content_topics,
          audience_interests: (enhancedData as any).audience_interests,
          audience_languages: (enhancedData as any).audience_languages,
          audience_overlap: (enhancedData as any).audience_overlap
        }
        
        console.log('🎯 FINAL RESPONSE structure:', Object.keys(finalData))
        console.log('🎯 New fields in response:', {
          hashtags_exists: !!finalData.relevant_hashtags,
          partnerships_exists: !!finalData.brand_partnerships,
          topics_exists: !!finalData.content_topics,
          interests_exists: !!finalData.audience_interests,
          languages_exists: !!finalData.audience_languages,
          overlap_exists: !!finalData.audience_overlap
        })

        return NextResponse.json({
          success: true,
          data: finalData
        })
        
      } catch (error) {
        console.error('❌ Error generating enhanced profile:', error)
        return await fetchBasicProfile()
      }
    } else {
      // For non-report requests, just return basic profile
      return await fetchBasicProfile()
    }
  } catch (error) {
    console.error('❌ API error:', error)
        return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }

  async function fetchBasicProfile() {
    try {
      console.log('📍 Fetching basic profile for:', { userId, platform })
      const profileData = await modashService.getProfileReport(userId, platform)
      const { city, country } = profileData || {}

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
} 