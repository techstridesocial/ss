import { NextResponse } from 'next/server'
import { getProfileReport, getPerformanceData as _getPerformanceData } from '../../../../lib/services/modash'

export async function POST(_request: Request) {
  try {
    const { userId, username, platform, includePerformanceData } = await _request.json()
    
    // CRITICAL: Normalize platform to lowercase (Modash API requires lowercase)
    const normalizedPlatform = platform?.toLowerCase() || 'instagram'
    
    console.log('🔍 Modash Profile Request:', { 
      userId, 
      username, 
      platform, 
      normalizedPlatform, 
      includePerformanceData,
      userIdType: typeof userId,
      userIdLength: userId?.length,
      isLikelyUUID: userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)
    })
    
    // CRITICAL INSIGHT: Modash profile report endpoints accept username directly as userId!
    // GET /instagram/profile/{username}/report works with username or userId
    // So we can skip the search step if username is provided - saves 1 API call and credits!
    
    let actualUserId = userId
    let preFetchedResponse: any = null // Store response if we get it from direct username lookup
    
    // If username provided but no userId, try using username directly first (FASTER - 1 API call instead of 2)
    if (!actualUserId && username) {
      const cleanUsername = username.replace('@', '').trim()
      console.log(`🚀 Attempting direct username lookup: "${cleanUsername}" on ${normalizedPlatform} (faster - 1 API call)`)
      
      // Try username directly first (Modash API accepts username as userId parameter)
      try {
        const { getProfileReport } = await import('../../../../lib/services/modash')
        const directResponse = await getProfileReport(cleanUsername, normalizedPlatform) as any
        
        // If successful, username works directly! Use this response and skip later API call
        if (directResponse?.profile) {
          actualUserId = cleanUsername
          preFetchedResponse = directResponse // Store to reuse instead of calling again
          console.log(`✅ Username "${cleanUsername}" works directly - using cached response (saved 1 API call + credits!)`)
        }
      } catch (directError: any) {
        // If direct username lookup fails, fall back to search method to find userId
        console.log(`⚠️ Direct username lookup failed (may need userId), falling back to search method:`, directError?.message?.substring(0, 100) || 'Unknown error')
        
        try {
          // Clean username: remove @ and any whitespace
          
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
          const foundUserId = exactMatch?.userId || exactMatch?.id
          if (foundUserId) {
            actualUserId = foundUserId
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
          const errorMsg = searchError instanceof Error ? searchError.message : 'Unknown error'
          return NextResponse.json({
            success: false,
            error: `Could not find user with username: ${username}. ${errorMsg}`,
            errorCode: 'ACCOUNT_NOT_FOUND',
            details: {
              username: cleanUsername,
              platform: normalizedPlatform,
              message: 'Both direct username lookup and search failed - account may not exist in Modash'
            }
          }, { status: 404 })
        }
      }
    }
    
    if (!actualUserId) {
      return NextResponse.json({
        success: false,
        error: 'Either userId or username must be provided',
        errorCode: 'MISSING_IDENTIFIER',
        details: {
          message: 'No valid userId found from username search and no userId was provided directly'
        }
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

    if (!actualUserId) {
      return NextResponse.json({
        success: false,
        error: 'Either userId or username must be provided'
      }, { status: 400 })
    }

    // CRITICAL: Validate userId is NOT a UUID (our internal ID) and is a valid Modash userId format
    // BUT: Only validate if userId was provided directly (not from username lookup)
    // If username lookup succeeded, the userId is already validated by Modash
    const { validateModashUserId, isUUID } = await import('@/lib/utils/modash-userid-validator')
    
    // Skip validation if we got userId from pre-fetched response (username lookup worked)
    if (!preFetchedResponse) {
      const validatedUserId = validateModashUserId(actualUserId)
      
      if (!validatedUserId) {
        if (isUUID(actualUserId)) {
          console.error('❌ Invalid userId: Appears to be an internal UUID, not a Modash userId:', { actualUserId, platform: normalizedPlatform })
          return NextResponse.json({
            success: false,
            error: 'Invalid userId: Appears to be an internal database ID (UUID), not a Modash userId. Please use username lookup instead.',
            errorCode: 'INVALID_UUID_AS_USERID',
            debug: { actualUserId, platform: normalizedPlatform, detectedAs: 'UUID' }
          }, { status: 400 })
        } else {
          console.error('❌ Invalid Modash userId format:', { actualUserId, platform: normalizedPlatform, userIdLength: actualUserId?.length, userIdType: typeof actualUserId })
          return NextResponse.json({
            success: false,
            error: 'Invalid Modash userId format',
            errorCode: 'INVALID_USERID_FORMAT',
            debug: { actualUserId, platform: normalizedPlatform, userIdLength: actualUserId?.length, userIdType: typeof actualUserId }
          }, { status: 400 })
        }
      }
      
      // Use validated userId
      actualUserId = validatedUserId
    } else {
      // If preFetchedResponse exists, actualUserId might be the username
      // The Modash API already validated it by returning a profile
      console.log('✅ Skipping userId validation - using pre-fetched response from username lookup')
    }
    
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
    // Note: actualUserId can be either a username or userId - Modash API accepts both!
    let modashResponse: any
    
    // If we already fetched the response from direct username lookup, reuse it (saves 1 API call!)
    if (preFetchedResponse) {
      modashResponse = preFetchedResponse
      console.log('✅ Using pre-fetched response from direct username lookup (saved 1 API call)')
    } else {
      // Otherwise, fetch now
      console.log('🔍 Calling Modash Profile Report:', {
        identifier: actualUserId,
        platform: normalizedPlatform,
        identifierLength: actualUserId.length,
        isLikelyUsername: !/^\d+$/.test(actualUserId) && !actualUserId.startsWith('UC') // Likely username if not numeric and not YouTube channel ID
      })
      
      try {
        modashResponse = await getProfileReport(actualUserId.trim(), normalizedPlatform) as any
        console.log('✅ Modash profile API call successful')
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

    // Log TikTok structure summary (not full response - too large)
    if (normalizedPlatform === 'tiktok') {
      console.log('🔍 TikTok profile structure:', {
        hasProfile: !!modashResponse.profile,
        profileKeys: Object.keys(modashResponse.profile || {}),
        hasPaidPerformance: !!modashResponse.profile?.paidPostPerformance,
        hasRecentPosts: !!modashResponse.profile?.recentPosts,
        recentPostsCount: modashResponse.profile?.recentPosts?.length || 0,
        hasPopularPosts: !!modashResponse.profile?.popularPosts,
        hasStatHistory: !!modashResponse.profile?.statHistory,
        postsCount: modashResponse.profile?.postsCount,
        hasEngagements: !!modashResponse.profile?.engagements,
        hasTotalLikes: !!modashResponse.profile?.totalLikes,
        hasAverageViews: !!modashResponse.profile?.averageViews,
        hasGender: !!modashResponse.profile?.gender,
        hasAgeGroup: !!modashResponse.profile?.ageGroup,
        // Sample first post only (not full data)
        firstPostSample: modashResponse.profile?.recentPosts?.[0] ? {
          hasText: !!modashResponse.profile.recentPosts[0].text,
          hasViews: !!modashResponse.profile.recentPosts[0].views,
          hasLikes: !!modashResponse.profile.recentPosts[0].likes,
          hasThumbnail: !!modashResponse.profile.recentPosts[0].thumbnail
        } : null
      })
    }
    
    // Fetch performance data in parallel with profile (if needed)
    // This significantly improves performance by making both requests simultaneously
    let performanceData = null
    const shouldFetchPerformance = (includePerformanceData || normalizedPlatform === 'tiktok') && profile.username
    
    if (shouldFetchPerformance) {
      try {
        console.log('📊 Fetching performance data in parallel for enhanced metrics and thumbnails...')
        // Fetch in parallel - don't await yet, will be handled below
        const performancePromise = _getPerformanceData(
          normalizedPlatform as 'instagram' | 'tiktok' | 'youtube', 
          profile.username, 
          10
        ) as Promise<any>
        
        // Wait for performance data (already have profile data)
        const perfResult = await performancePromise
        
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
        console.warn('⚠️ Performance data fetch failed (non-critical):', perfError instanceof Error ? perfError.message : perfError)
        // Continue without performance data - not critical
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
    
    // Log response summary (reduced logging)
    if (performanceData) {
      console.log('✅ Response includes performance data:', {
        reelsTotal: performanceData.reels?.total || 0,
        postsTotal: performanceData.posts?.total || 0
      })
    }
    
    // Log response structure summary (not full data)
    console.log('🔍 Modash response summary:', {
      hasProfile: !!modashResponse.profile,
      profileKeysCount: modashResponse.profile ? Object.keys(modashResponse.profile).length : 0,
      hasContacts: !!modashResponse.profile?.contacts,
      contactsCount: Array.isArray(modashResponse.profile?.contacts) ? modashResponse.profile.contacts.length : 0,
      hasBio: !!modashResponse.profile?.bio,
      bioLength: modashResponse.profile?.bio?.length || 0,
      hasStatHistory: !!modashResponse.profile?.statHistory,
      statHistoryLength: Array.isArray(modashResponse.profile?.statHistory) ? modashResponse.profile.statHistory.length : 0,
      hasRecentPosts: !!modashResponse.profile?.recentPosts,
      recentPostsCount: Array.isArray(modashResponse.profile?.recentPosts) ? modashResponse.profile.recentPosts.length : 0,
      city: modashResponse.profile?.city || null
    })
    
  } catch (error: any) {
    console.error('❌ Modash profile error:', error)
    
    // Extract error details from Modash API errors
    const errorMessage = error?.message || 'Unknown error'
    let statusCode = 500
    let errorCode: string | undefined
    let errorDetails: any = {}
    
    // Check if this is a Modash API error with specific codes
    if (errorMessage.includes('Modash API error')) {
      // Try to parse the error message for Modash-specific error codes
      const match = errorMessage.match(/code":"([^"]+)"/)
      if (match) {
        errorCode = match[1]
        errorDetails.code = errorCode
      }
      
      // Check error message for status codes
      const statusMatch = errorMessage.match(/\((\d+)\)/)
      if (statusMatch) {
        statusCode = parseInt(statusMatch[1], 10)
      }
      
      // Check for account_not_found specifically
      if (errorMessage.includes('account_not_found') || errorCode === 'account_not_found') {
        statusCode = 404
        errorCode = 'account_not_found'
        errorDetails.code = 'account_not_found'
        errorDetails.message = 'Requested account does not exist.'
      }
      
      // Check for invalid userId (UUID)
      if (errorMessage.includes('Invalid userId') || errorMessage.includes('UUID')) {
        statusCode = 400
        errorCode = 'INVALID_USER_ID'
        errorDetails.code = 'INVALID_USER_ID'
      }
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      errorCode,
      details: errorDetails
    }, { status: statusCode })
  }
} 