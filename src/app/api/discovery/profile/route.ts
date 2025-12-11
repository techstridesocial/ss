import { NextResponse } from 'next/server'
import { getProfileReport, getPerformanceData as _getPerformanceData } from '../../../../lib/services/modash'

export async function POST(_request: Request) {
  try {
    const { userId, username, platform, includePerformanceData } = await _request.json()
    
    // CRITICAL: Normalize platform to lowercase (Modash API requires lowercase)
    const normalizedPlatform = platform?.toLowerCase() || 'instagram'
    
    console.log('🔍 Modash Profile Request:', { userId, username, platform, normalizedPlatform, includePerformanceData })
    
    // If username is provided but userId is not, search for userId first
    let actualUserId = userId
    if (!actualUserId && username) {
      console.log(`🔍 Looking up userId for username: ${username} on ${normalizedPlatform}`)
      try {
        // Clean username: remove @ and any whitespace
        const cleanUsername = username.replace('@', '').trim()
        
        // YouTube doesn't have /users endpoint, use /search instead
        let searchResult: any
        let users: any[] = []
        
        if (normalizedPlatform === 'youtube') {
          // YouTube: Use search endpoint (POST)
          const { searchDiscovery } = await import('../../../../lib/services/modash')
          searchResult = await searchDiscovery('youtube', {
            query: cleanUsername,
            limit: 10
          }) as any
          // YouTube search returns different structure
          users = searchResult?.results || searchResult?.data || searchResult?.directs || []
        } else {
          // Instagram & TikTok: Use /users endpoint (GET)
        const { listUsers } = await import('../../../../lib/services/modash')
          searchResult = await listUsers(normalizedPlatform as 'instagram' | 'tiktok', {
            query: cleanUsername,
            limit: 10 // Increase limit to find exact match in results
        }) as any
          users = searchResult?.users || searchResult?.data || []
        }
        
        console.log(`🔍 Search results (${normalizedPlatform}):`, {
          usersCount: users.length,
          platform: normalizedPlatform,
          firstUser: users[0] ? {
            username: users[0].username,
            userId: users[0].userId,
            id: users[0].id,
            handle: users[0].handle,
            allKeys: Object.keys(users[0] || {})
          } : null
        })
        
        // Look for exact match (case-insensitive)
        // YouTube might use 'handle' field instead of 'username'
        const exactMatch = users.find((user: any) => {
          const userIdentifier = user.username || user.handle || ''
          return userIdentifier.toLowerCase() === cleanUsername.toLowerCase()
        })
        
        // Try both userId and id fields (Modash API uses different field names)
        // Also check for YouTube-specific field names
        const userId = exactMatch?.userId || exactMatch?.id
        if (userId) {
          actualUserId = userId
          const matchedIdentifier = exactMatch.username || exactMatch.handle || 'unknown'
          console.log(`✅ Found exact match userId: ${actualUserId} for ${normalizedPlatform} username: ${matchedIdentifier}`)
        } else if (users.length > 0) {
          // If no exact match, use first result (might be close match)
          const firstUserId = users[0].userId || users[0].id
          if (firstUserId) {
            actualUserId = firstUserId
            const firstIdentifier = users[0].username || users[0].handle || 'unknown'
            console.log(`⚠️ No exact match, using first result userId: ${actualUserId} for ${normalizedPlatform} username: ${firstIdentifier}`)
            console.log(`   Available identifiers: ${users.map((u: any) => u.username || u.handle || 'unknown').join(', ')}`)
          } else {
            throw new Error(`No userId found in ${normalizedPlatform} search results. First user keys: ${Object.keys(users[0] || {}).join(', ')}`)
          }
        } else {
          throw new Error(`No user found with username: ${username} on ${normalizedPlatform}. Searched for: ${cleanUsername}`)
        }
      } catch (searchError) {
        console.error('❌ Error searching for userId:', searchError)
        return NextResponse.json({
          success: false,
          error: `Could not find user with username: ${username}. ${searchError instanceof Error ? searchError.message : 'Unknown error'}`
        }, { status: 404 })
      }
    }
    
    if (!actualUserId) {
      return NextResponse.json({
        success: false,
        error: 'Either userId or username must be provided'
      }, { status: 400 })
    }
    
    // CRITICAL: Validate userId format before calling Modash API
    if (typeof actualUserId !== 'string' || actualUserId.trim() === '') {
      console.error('❌ Invalid userId format:', { actualUserId, type: typeof actualUserId })
      return NextResponse.json({
        success: false,
        error: 'Invalid userId format',
        debug: { actualUserId, platform: normalizedPlatform }
      }, { status: 400 })
    }

    // CRITICAL: Validate userId is NOT a UUID (our internal ID) and is a valid Modash userId format
    const { validateModashUserId, isUUID } = await import('@/lib/utils/modash-userid-validator')
    const validatedUserId = validateModashUserId(actualUserId)
    
    if (!validatedUserId) {
      if (isUUID(actualUserId)) {
        console.error('❌ Invalid userId: Appears to be an internal UUID, not a Modash userId:', { actualUserId, platform: normalizedPlatform })
        return NextResponse.json({
          success: false,
          error: 'Invalid userId: Appears to be an internal database ID (UUID), not a Modash userId. Please use username lookup instead.',
          debug: { actualUserId, platform: normalizedPlatform, detectedAs: 'UUID' }
        }, { status: 400 })
      } else {
        console.error('❌ Invalid Modash userId format:', { actualUserId, platform: normalizedPlatform })
        return NextResponse.json({
          success: false,
          error: 'Invalid Modash userId format',
          debug: { actualUserId, platform: normalizedPlatform }
        }, { status: 400 })
      }
    }
    
    // Use validated userId
    actualUserId = validatedUserId
    
    // CRITICAL: Validate platform is one of the supported values
    if (!['instagram', 'tiktok', 'youtube'].includes(normalizedPlatform)) {
      console.error('❌ Invalid platform:', { normalizedPlatform, originalPlatform: platform })
      return NextResponse.json({
        success: false,
        error: 'Invalid platform. Must be instagram, tiktok, or youtube',
        debug: { normalizedPlatform, originalPlatform: platform }
      }, { status: 400 })
    }
    
    console.log('🔍 Calling Modash API:', {
      userId: actualUserId,
      platform: normalizedPlatform,
      userIdLength: actualUserId.length,
      userIdType: typeof actualUserId
    })
    
    // Get raw Modash data - use normalized platform (lowercase required by Modash API)
    let modashResponse: any
    try {
      modashResponse = await getProfileReport(actualUserId.trim(), normalizedPlatform) as any
      console.log('✅ Modash API call successful')
    } catch (modashError: any) {
      console.error('❌ Modash API call failed:', {
        error: modashError,
        message: modashError?.message,
        userId: actualUserId,
        platform: normalizedPlatform,
        stack: modashError?.stack
      })
      // Re-throw to be caught by outer catch
      throw modashError
    }
    
    if (!modashResponse?.profile) {
      throw new Error('No profile data returned from Modash')
    }
    
    // Extract the profile data directly from Modash
    const profile = modashResponse.profile?.profile || {}
    const audience = modashResponse.profile?.audience || {}
    
    console.log('✅ Raw Modash profile data:', {
      followers: profile.followers,
      engagementRate: profile.engagementRate,
      avgLikes: profile.avgLikes,
      avgComments: profile.avgComments,
      credibility: audience.credibility
    })

    // 🚨 DEBUG: Log the FULL raw Modash response structure for TikTok
    if (normalizedPlatform === 'tiktok') {
      console.log('🚨 FULL TIKTOK MODASH RESPONSE:', JSON.stringify(modashResponse, null, 2))
      console.log('🚨 TikTok profile keys:', Object.keys(modashResponse.profile || {}))
      console.log('🚨 Looking for TikTok fields:', {
        paidPostPerformance: modashResponse.profile?.paidPostPerformance,
        recentPosts: modashResponse.profile?.recentPosts,
        popularPosts: modashResponse.profile?.popularPosts,
        statHistory: modashResponse.profile?.statHistory,
        postsCount: modashResponse.profile?.postsCount,
        engagements: modashResponse.profile?.engagements,
        totalLikes: modashResponse.profile?.totalLikes,
        averageViews: modashResponse.profile?.averageViews,
        gender: modashResponse.profile?.gender,
        ageGroup: modashResponse.profile?.ageGroup
      })
    }
    
    // Fetch performance data for enhanced post information (especially important for TikTok thumbnails)
    let performanceData = null
    if ((includePerformanceData || normalizedPlatform === 'tiktok') && profile.username) {
      try {
        console.log('📊 Fetching performance data for enhanced metrics and thumbnails...')
        const perfResult = await _getPerformanceData(normalizedPlatform as 'instagram' | 'tiktok' | 'youtube', profile.username, 10) as any // Get more posts for better thumbnails
        if (perfResult && (perfResult.posts || perfResult.reels)) {
          performanceData = perfResult
          console.log('✅ Performance data fetched:', {
            posts_total: performanceData.posts?.total || 0,
            posts_with_data: performanceData.posts?.data?.length || 0,
            reels_total: performanceData.reels?.total || 0,
            has_thumbnail_data: performanceData.posts?.data?.[0]?.thumbnail || 'none'
          })
        }
      } catch (perfError) {
        console.warn('⚠️ Performance data fetch failed (non-critical):', perfError)
        // Continue without performance data
      }
    }
    
    // Return pure Modash data - no wrappers, no calculations
    return NextResponse.json({
      success: true,
      data: {
        // Core profile metrics from Modash
        userId: actualUserId,
        username: profile.username,
        fullname: profile.fullname,
        followers: profile.followers,
        engagementRate: profile.engagementRate,
        avgLikes: profile.avgLikes,
        avgComments: profile.avgComments,
        picture: profile.picture,
        url: profile.url,
        
        // Audience data from Modash
        credibility: audience.credibility,
        fake_followers_percentage: audience.credibility ? (1 - audience.credibility) * 100 : null,
        
        // Audience demographics - structured for UI
        audience: {
          // Gender breakdown (convert Modash format to UI format)
          gender: Array.isArray(audience.genders) ? audience.genders.reduce((acc: any, g: any) => {
            acc[g.code.toLowerCase()] = g.weight * 100
            return acc
          }, {}) : null,
          
          // Age ranges (convert Modash format to UI format)
          age_ranges: Array.isArray(audience.ages) ? audience.ages.reduce((acc: any, age: any) => {
            acc[age.code] = age.weight * 100
            return acc
          }, {}) : null,
          
          // Location breakdown (convert Modash format to UI format)
          locations: Array.isArray(audience.geoCountries) ? audience.geoCountries.map((loc: any) => ({
            country: loc.name,
            percentage: loc.weight * 100
          })) : null,
          
          // Languages (convert Modash format to UI format)
          languages: Array.isArray(audience.languages) ? audience.languages.map((lang: any) => ({
            language: lang.name,
            percentage: lang.weight * 100
          })) : null
        },
        
        // Audience interests for specific UI sections
        audience_interests: Array.isArray(audience.interests) ? audience.interests.map((interest: any) => ({
          name: interest.name,
          percentage: interest.weight * 100
        })) : [],
        
        // Audience languages for specific UI sections
        audience_languages: Array.isArray(audience.languages) ? audience.languages.map((lang: any) => ({
          name: lang.name,
          percentage: lang.weight * 100
        })) : [],
        
        // Additional sections extracted from profile data
        relevant_hashtags: Array.isArray(modashResponse.profile?.hashtags) ? modashResponse.profile.hashtags : [], // Extract hashtags from profile report
        brand_partnerships: Array.isArray(modashResponse.profile?.sponsoredPosts) ? modashResponse.profile.sponsoredPosts : [], // Extract sponsored posts
        content_topics: Array.isArray(audience.interests) ? audience.interests.slice(0, 10).map((interest: any) => interest.name) : [], // Simple string array of topic names
        
        // Rich performance data (sponsored vs organic)
        sponsored_performance: {
          paid_post_performance: modashResponse.profile?.paidPostPerformance || 0,
          sponsored_posts_median_views: modashResponse.profile?.sponsoredPostsMedianViews || 0,
          sponsored_posts_median_likes: modashResponse.profile?.sponsoredPostsMedianLikes || 0,
          non_sponsored_posts_median_views: modashResponse.profile?.nonSponsoredPostsMedianViews || 0,
          non_sponsored_posts_median_likes: modashResponse.profile?.nonSponsoredPostsMedianLikes || 0
        },
        
        // Brand mentions and affinity
        brand_mentions: Array.isArray(modashResponse.profile?.mentions) ? modashResponse.profile.mentions : [],
        brand_affinity: Array.isArray(modashResponse.profile?.brandAffinity) ? modashResponse.profile.brandAffinity : [],
        
        // Raw audience data for debugging
        genders: audience.genders,
        ages: audience.ages,
        geoCountries: audience.geoCountries,
        languages: audience.languages,
        interests: audience.interests,
        
        // Additional data for UI compatibility
        engagement_rate: profile.engagementRate, // Alias for UI
        avgShares: 0, // Not available in Modash
        estimated_reach: null, // Not calculated
        estimated_impressions: null, // Not calculated
        
        // 🆕 NEW: Missing core profile data - FIXED PATHS
        mentions: Array.isArray(modashResponse.profile?.mentions) ? modashResponse.profile.mentions : [],
        statsByContentType: {
          all: modashResponse.profile?.statsByContentType?.all || {},
          reels: modashResponse.profile?.statsByContentType?.reels || {},
          // 🎯 YOUTUBE-SPECIFIC: Video content types
          videos: modashResponse.profile?.statsByContentType?.videos || {},
          shorts: modashResponse.profile?.statsByContentType?.shorts || {},
          streams: modashResponse.profile?.statsByContentType?.streams || {}
        },
        city: modashResponse.profile?.city || null,
        state: modashResponse.profile?.state || null,
        country: modashResponse.profile?.country || null,
        ageGroup: modashResponse.profile?.ageGroup || null,
        gender: modashResponse.profile?.gender || null,
        language: modashResponse.profile?.language || null,
        contacts: Array.isArray(modashResponse.profile?.contacts) ? modashResponse.profile.contacts : [],
        isPrivate: modashResponse.profile?.isPrivate || false,
        accountType: modashResponse.profile?.accountType || null,
        bio: modashResponse.profile?.bio || null,
        avgViews: modashResponse.profile?.avgViews || 0,
        avgReelsPlays: modashResponse.profile?.avgReelsPlays || 0,
        
        // 🚨 FIX: Add missing fields from the actual API response structure
        engagements: modashResponse.profile?.statsByContentType?.all?.engagements || 0,
        averageViews: modashResponse.profile?.statsByContentType?.all?.avgViews || 0,
        totalLikes: modashResponse.profile?.totalLikes || 0,
        
        // 🎯 YOUTUBE-SPECIFIC: Critical missing fields from YouTube API
        totalViews: modashResponse.profile?.totalViews || 0, // Total channel views
        handle: modashResponse.profile?.profile?.handle || modashResponse.profile?.handle || null, // Channel handle (@username)
        description: modashResponse.profile?.profile?.description || modashResponse.profile?.description || null, // Channel description
        channelUrl: modashResponse.profile?.profile?.url || modashResponse.profile?.url || null, // Channel URL
        
        // 🆕 NEW: Content data - Enhanced with performance data for better thumbnails
        recentPosts: (() => {
          // Try performance data first (has thumbnails), fallback to profile data
          const perfPosts = Array.isArray(performanceData?.posts?.data) ? performanceData.posts.data.slice(0, 10) : []
          const profilePosts = Array.isArray(modashResponse.profile?.recentPosts) ? modashResponse.profile.recentPosts : []
          
          // If performance data has posts, use it; otherwise use profile data
          return perfPosts.length > 0 ? perfPosts : profilePosts
        })(),
        popularPosts: Array.isArray(modashResponse.profile?.popularPosts) ? modashResponse.profile.popularPosts : [],
        
        // 🆕 NEW: Enhanced audience data
        audience_notable: audience.notable || 0,
        audience_credibility: audience.credibility || 0,
        audience_notable_users: Array.isArray(audience.notableUsers) ? audience.notableUsers : [],
        audience_lookalikes: Array.isArray(audience.audienceLookalikes) ? audience.audienceLookalikes : [],
        audience_ethnicities: Array.isArray(audience.ethnicities) ? audience.ethnicities : [],
        audience_reachability: Array.isArray(audience.audienceReachability) ? audience.audienceReachability : [],
        audience_types: Array.isArray(audience.audienceTypes) ? audience.audienceTypes : [],
        audience_genders_per_age: Array.isArray(audience.gendersPerAge) ? audience.gendersPerAge : [],
        audience_geo_cities: Array.isArray(audience.geoCities) ? audience.geoCities : [],
        audience_geo_states: Array.isArray(audience.geoStates) ? audience.geoStates : [],
        
        // 🆕 NEW: Performance comparison data
        stats_compared: {
          avgLikes: modashResponse.profile?.stats?.avgLikes || {},
          followers: modashResponse.profile?.stats?.followers || {},
          avgShares: modashResponse.profile?.stats?.avgShares || {},
          avgComments: modashResponse.profile?.stats?.avgComments || {}
        },
        
        // 🆕 NEW: Advanced audience analytics - Enhanced for YouTube
        audienceExtra: {
          engagementRateDistribution: modashResponse.profile?.audienceExtra?.engagementRateDistribution ||
                                     modashResponse.profile?.audience?.engagementRateDistribution || 
                                     modashResponse.profile?.engagementRateDistribution ||
                                     [],
          credibilityDistribution: modashResponse.profile?.audience?.credibilityDistribution || 
                                  modashResponse.profile?.credibilityDistribution ||
                                  [],
          followersRange: modashResponse.profile?.audienceExtra?.followersRange ||
                         modashResponse.profile?.audience?.followersRange || 
                         modashResponse.profile?.followersRange ||
                         {}
        },
        
        // 🔍 DEBUG: Log what's actually in the TikTok report structure
        ...((() => {
          console.log('🔍 Raw Modash response structure:', {
            profileKeys: Object.keys(modashResponse.profile || {}),
            audienceKeys: modashResponse.profile?.audience ? Object.keys(modashResponse.profile.audience) : 'no audience',
            hasEngagementDist: !!modashResponse.profile?.audience?.engagementRateDistribution || !!modashResponse.profile?.engagementRateDistribution,
            engagementDistSample: (modashResponse.profile?.audience?.engagementRateDistribution || modashResponse.profile?.engagementRateDistribution || []).slice(0, 2)
          })
          return {}
        })()),
        
        // 🆕 NEW: Paid content performance
        paidPostPerformance: modashResponse.profile?.paidPostPerformance || 0,
        paidPostPerformanceViews: modashResponse.profile?.paidPostPerformanceViews || 0,
        sponsoredPostsMedianViews: modashResponse.profile?.sponsoredPostsMedianViews || 0,
        sponsoredPostsMedianLikes: modashResponse.profile?.sponsoredPostsMedianLikes || 0,
        nonSponsoredPostsMedianViews: modashResponse.profile?.nonSponsoredPostsMedianViews || 0,
        nonSponsoredPostsMedianLikes: modashResponse.profile?.nonSponsoredPostsMedianLikes || 0,
        
        // 🆕 NEW: Creator-level data
        creator_interests: Array.isArray(modashResponse.profile?.interests) ? modashResponse.profile.interests : [],
        creator_brand_affinity: Array.isArray(modashResponse.profile?.brandAffinity) ? modashResponse.profile.brandAffinity : [],
        lookalikes: Array.isArray(modashResponse.profile?.lookalikes) ? modashResponse.profile.lookalikes : [],
        
        // 🎯 YOUTUBE-SPECIFIC: Advanced audience fields from YouTube API
        audienceCommenters: modashResponse.profile?.audienceCommenters || {
          notable: modashResponse.profile?.audience?.notable || 0,
          genders: modashResponse.profile?.audience?.genders || [],
          geoCountries: modashResponse.profile?.audience?.geoCountries || [],
          ages: modashResponse.profile?.audience?.ages || [],
          gendersPerAge: modashResponse.profile?.audience?.gendersPerAge || [],
          languages: modashResponse.profile?.audience?.languages || [],
          notableUsers: modashResponse.profile?.audience?.notableUsers || [],
          audienceLookalikes: modashResponse.profile?.audience?.audienceLookalikes || []
        },
        lookalikesByTopics: Array.isArray(modashResponse.profile?.lookalikesByTopics) ? modashResponse.profile.lookalikesByTopics : [],
        sponsoredPosts: (Array.isArray(modashResponse.profile?.sponsoredPosts) ? modashResponse.profile.sponsoredPosts : []).map((post: any) => ({
          ...post,
          sponsors: post.sponsors || []
        })),
        
        // 🆕 NEW: Missing historical and profile data - FIXED PATHS
        statHistory: Array.isArray(modashResponse.profile?.statHistory) ? modashResponse.profile.statHistory : [],
        postsCount: modashResponse.profile?.postsCount || modashResponse.profile?.postsCounts || 0,
        
        // Performance data for reels/stories sections (if requested)
        content_performance: performanceData ? {
          posts: performanceData.posts,
          reels: performanceData.reels,
          stories: null // Stories data not provided by this API
        } : (modashResponse.profile?.statsByContentType?.all ? {
          // 🚨 FIX: Use statsByContentType data if no performance data
          posts: {
            total: modashResponse.profile?.postsCount || 
                   (modashResponse.profile?.recentPosts?.length || 0) + (modashResponse.profile?.popularPosts?.length || 0) ||
                   0,
            likes: { median: [{ value: modashResponse.profile?.statsByContentType?.all?.avgLikes || 0 }] },
            comments: { median: [{ value: modashResponse.profile?.statsByContentType?.all?.avgComments || 0 }] },
            views: { median: [{ value: modashResponse.profile?.statsByContentType?.all?.avgViews || 0 }] },
            shares: { median: [{ value: modashResponse.profile?.statsByContentType?.all?.avgShares || 0 }] },
            saves: { median: [{ value: modashResponse.profile?.statsByContentType?.all?.avgSaves || modashResponse.profile?.statHistory?.[modashResponse.profile.statHistory.length - 1]?.avgSaves || 0 }] },
            engagement_rate: [{ value: modashResponse.profile?.statsByContentType?.all?.engagementRate || 0 }]
          }
        } : null)
      },
      source: 'modash',
      timestamp: new Date().toISOString(),
      performance_data_included: !!performanceData
    })
    
    console.log('🎬 Profile API Response Debug:', {
      hasPerformanceData: !!performanceData,
      performanceDataKeys: performanceData ? Object.keys(performanceData) : 'none',
      reelsTotal: performanceData?.reels?.total,
      postsTotal: performanceData?.posts?.total,
      contentPerformanceIncluded: !!performanceData
    })
    
    // 🔍 DEBUG: Check what data is actually available
    console.log('🔍 MODASH RESPONSE STRUCTURE:', {
      hasProfile: !!modashResponse.profile,
      profileKeys: modashResponse.profile ? Object.keys(modashResponse.profile) : 'none',
      hasContacts: !!modashResponse.profile?.contacts,
      hasBio: !!modashResponse.profile?.bio,
      hasStatHistory: !!modashResponse.profile?.statHistory,
      hasRecentPosts: !!modashResponse.profile?.recentPosts,
      contacts: modashResponse.profile?.contacts?.slice(0, 1),
      bio: modashResponse.profile?.bio ? 'HAS BIO' : 'NO BIO',
      city: modashResponse.profile?.city || 'NO CITY'
    })
    
  } catch (error: any) {
    console.error('❌ Modash profile error:', error)
        return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
} 