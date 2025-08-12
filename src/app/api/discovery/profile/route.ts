import { NextResponse } from 'next/server'
import { getProfileReport, getPerformanceData } from '../../../../lib/services/modash'

export async function POST(request: Request) {
  try {
    const { userId, platform, includePerformanceData } = await request.json()
    
    console.log('🔍 Modash Profile Request:', { userId, platform, includePerformanceData })
    
    // Get raw Modash data
    const modashResponse = await getProfileReport(userId, platform) as any
    
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
    
    // Optionally fetch performance data for reels/stories sections
    let performanceData = null
    if (includePerformanceData && profile.username) {
      try {
        console.log('📊 Fetching performance data for enhanced metrics...')
        const perfResult = await getPerformanceData(profile.username, 5) as any
        if (perfResult && (perfResult.posts || perfResult.reels)) {
          performanceData = perfResult
          console.log('✅ Performance data fetched:', {
            posts_total: performanceData.posts?.total || 0,
            reels_total: performanceData.reels?.total || 0
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
        userId: userId,
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
          gender: audience.genders ? audience.genders.reduce((acc: any, g: any) => {
            acc[g.code.toLowerCase()] = g.weight * 100
            return acc
          }, {}) : null,
          
          // Age ranges (convert Modash format to UI format)
          age_ranges: audience.ages ? audience.ages.reduce((acc: any, age: any) => {
            acc[age.code] = age.weight * 100
            return acc
          }, {}) : null,
          
          // Location breakdown (convert Modash format to UI format)
          locations: audience.geoCountries ? audience.geoCountries.map((loc: any) => ({
            country: loc.name,
            percentage: loc.weight * 100
          })) : null,
          
          // Languages (convert Modash format to UI format)
          languages: audience.languages ? audience.languages.map((lang: any) => ({
            language: lang.name,
            percentage: lang.weight * 100
          })) : null
        },
        
        // Audience interests for specific UI sections
        audience_interests: audience.interests ? audience.interests.map((interest: any) => ({
          name: interest.name,
          percentage: interest.weight * 100
        })) : [],
        
        // Audience languages for specific UI sections
        audience_languages: audience.languages ? audience.languages.map((lang: any) => ({
          name: lang.name,
          percentage: lang.weight * 100
        })) : [],
        
        // Additional sections extracted from profile data
        relevant_hashtags: modashResponse.profile?.hashtags || [], // Extract hashtags from profile report
        brand_partnerships: modashResponse.profile?.sponsoredPosts || [], // Extract sponsored posts
        content_topics: audience.interests ? audience.interests.slice(0, 10).map((interest: any) => interest.name) : [], // Simple string array of topic names
        
        // Rich performance data (sponsored vs organic)
        sponsored_performance: {
          paid_post_performance: modashResponse.profile?.paidPostPerformance || 0,
          sponsored_posts_median_views: modashResponse.profile?.sponsoredPostsMedianViews || 0,
          sponsored_posts_median_likes: modashResponse.profile?.sponsoredPostsMedianLikes || 0,
          non_sponsored_posts_median_views: modashResponse.profile?.nonSponsoredPostsMedianViews || 0,
          non_sponsored_posts_median_likes: modashResponse.profile?.nonSponsoredPostsMedianLikes || 0
        },
        
        // Brand mentions and affinity
        brand_mentions: modashResponse.profile?.mentions || [],
        brand_affinity: modashResponse.profile?.brandAffinity || [],
        
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
        mentions: modashResponse.profile?.mentions || [],
        statsByContentType: modashResponse.profile?.statsByContentType || { all: {}, reels: {} },
        city: modashResponse.profile?.city || null,
        state: modashResponse.profile?.state || null,
        country: modashResponse.profile?.country || null,
        ageGroup: modashResponse.profile?.ageGroup || null,
        gender: modashResponse.profile?.gender || null,
        language: modashResponse.profile?.language || null,
        contacts: modashResponse.profile?.contacts || [],
        isPrivate: modashResponse.profile?.isPrivate || false,
        accountType: modashResponse.profile?.accountType || null,
        bio: modashResponse.profile?.bio || null,
        avgViews: modashResponse.profile?.avgViews || 0,
        avgReelsPlays: modashResponse.profile?.avgReelsPlays || 0,
        
        // 🆕 NEW: Content data - FIXED PATHS
        recentPosts: modashResponse.profile?.recentPosts || [],
        popularPosts: modashResponse.profile?.popularPosts || [],
        
        // 🆕 NEW: Enhanced audience data
        audience_notable: audience.notable || 0,
        audience_credibility: audience.credibility || 0,
        audience_notable_users: audience.notableUsers || [],
        audience_lookalikes: audience.audienceLookalikes || [],
        audience_ethnicities: audience.ethnicities || [],
        audience_reachability: audience.audienceReachability || [],
        audience_types: audience.audienceTypes || [],
        audience_genders_per_age: audience.gendersPerAge || [],
        audience_geo_cities: audience.geoCities || [],
        audience_geo_states: audience.geoStates || [],
        
        // 🆕 NEW: Performance comparison data
        stats_compared: {
          avgLikes: modashResponse.profile?.stats?.avgLikes || {},
          followers: modashResponse.profile?.stats?.followers || {},
          avgShares: modashResponse.profile?.stats?.avgShares || {},
          avgComments: modashResponse.profile?.stats?.avgComments || {}
        },
        
        // 🆕 NEW: Advanced audience analytics
        audienceExtra: modashResponse.profile?.audienceExtra || {},
        
        // 🆕 NEW: Paid content performance
        paidPostPerformance: modashResponse.profile?.paidPostPerformance || 0,
        paidPostPerformanceViews: modashResponse.profile?.paidPostPerformanceViews || 0,
        sponsoredPostsMedianViews: modashResponse.profile?.sponsoredPostsMedianViews || 0,
        sponsoredPostsMedianLikes: modashResponse.profile?.sponsoredPostsMedianLikes || 0,
        nonSponsoredPostsMedianViews: modashResponse.profile?.nonSponsoredPostsMedianViews || 0,
        nonSponsoredPostsMedianLikes: modashResponse.profile?.nonSponsoredPostsMedianLikes || 0,
        
        // 🆕 NEW: Creator-level data
        creator_interests: modashResponse.profile?.interests || [],
        creator_brand_affinity: modashResponse.profile?.brandAffinity || [],
        lookalikes: modashResponse.profile?.lookalikes || [],
        
        // 🆕 NEW: Missing historical and profile data - FIXED PATHS
        statHistory: modashResponse.profile?.statHistory || [],
        postsCount: modashResponse.profile?.postsCount || modashResponse.profile?.postsCounts || 0,
        
        // Performance data for reels/stories sections (if requested)
        content_performance: performanceData ? {
          posts: performanceData.posts,
          reels: performanceData.reels,
          stories: null // Stories data not provided by this API
        } : null
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