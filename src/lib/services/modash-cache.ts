import { query, transaction } from '../db/connection'
import { getProfileReport } from './modash'

export interface CachedProfileData {
  id: string
  influencer_platform_id: string
  modash_user_id: string
  platform: string
  cached_at: Date
  expires_at: Date
  last_updated: Date
  
  // Core profile data
  username: string
  fullname: string
  followers: number
  engagement_rate: number
  avg_likes: number
  avg_comments: number
  avg_views: number
  
  // Extended data
  bio?: string
  city?: string
  country?: string
  age_group?: string
  gender?: string
  is_verified: boolean
  
  // JSON data
  contacts?: any[]
  hashtags?: any[]
  mentions?: any[]
  recent_posts?: any[]
  popular_posts?: any[]
}

export interface CacheStats {
  total_cached_profiles: number
  profiles_needing_update: number
  last_update_run: Date | null
  credits_used_this_month: number
}

/**
 * Cache full Modash profile data when influencer connects their account
 */
export async function cacheModashProfile(
  influencerPlatformId: string,
  modashUserId: string,
  platform: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`🔄 Caching Modash profile for ${platform} user ${modashUserId}`)
    
    // Fetch full profile data from Modash
    console.log(`📡 Calling getProfileReport with:`, { modashUserId, platform })
    const modashData = await getProfileReport(modashUserId, platform)
    console.log(`📊 Modash API response:`, modashData ? 'Data received' : 'No data')
    
    if (!modashData?.profile) {
      console.error(`❌ No profile data returned from Modash for ${modashUserId} on ${platform}`)
      console.error(`❌ Full Modash response:`, modashData)
      throw new Error('No profile data returned from Modash')
    }
    
    const profile = modashData.profile.profile || {}
    const audience = modashData.profile.audience || {}
    const stats = modashData.profile.stats || {}
    
    // Cache the data in transaction
    await transaction(async (client) => {
      // Delete existing cache for this platform (if any)
      await client.query(
        'DELETE FROM modash_profile_cache WHERE influencer_platform_id = $1 AND platform = $2',
        [influencerPlatformId, platform.toUpperCase()]
      )
      
      // Insert new cache entry
      const cacheResult = await client.query(`
        INSERT INTO modash_profile_cache (
          influencer_platform_id, modash_user_id, platform,
          username, fullname, followers, following, engagement_rate,
          avg_likes, avg_comments, avg_views, avg_reels_plays, posts_count,
          profile_url, picture_url, bio, city, state, country,
          age_group, gender, language_code, language_name,
          is_private, is_verified, account_type,
          contacts, hashtags, mentions, stats,
          recent_posts, popular_posts, sponsored_posts,
          expires_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
          $31, $32, NOW() + INTERVAL '4 weeks'
        ) RETURNING id
      `, [
        influencerPlatformId,
        modashUserId,
        platform.toUpperCase(),
        profile.username,
        profile.fullname,
        profile.followers || 0,
        profile.following || 0,
        profile.engagementRate || 0,
        profile.avgLikes || 0,
        profile.avgComments || 0,
        profile.avgViews || 0,
        profile.avgReelsPlays || 0,
        profile.postsCount || 0,
        profile.url,
        profile.picture,
        profile.bio,
        profile.city,
        profile.state,
        profile.country,
        profile.ageGroup,
        profile.gender,
        profile.language?.code,
        profile.language?.name,
        profile.isPrivate || false,
        profile.isVerified || false,
        profile.accountType,
        JSON.stringify(profile.contacts || []),
        JSON.stringify(modashData.profile.hashtags || []),
        JSON.stringify(modashData.profile.mentions || []),
        JSON.stringify(stats),
        JSON.stringify(modashData.profile.recentPosts || []),
        JSON.stringify(modashData.profile.popularPosts || []),
        JSON.stringify(modashData.profile.sponsoredPosts || [])
      ])
      
      const profileCacheId = cacheResult[0]?.id
      
      // Cache audience data
      await client.query(`
        INSERT INTO modash_audience_cache (
          profile_cache_id, notable_percentage, credibility_score,
          fake_followers_percentage, genders, ages, genders_per_age,
          geo_countries, geo_cities, geo_states, interests,
          brand_affinity, languages, ethnicities, audience_reachability,
          audience_types, notable_users, audience_lookalikes
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
        )
      `, [
        profileCacheId,
        audience.notable || 0,
        audience.credibility || 0,
        audience.credibility ? (1 - audience.credibility) * 100 : null,
        JSON.stringify(audience.genders || []),
        JSON.stringify(audience.ages || []),
        JSON.stringify(audience.gendersPerAge || []),
        JSON.stringify(audience.geoCountries || []),
        JSON.stringify(audience.geoCities || []),
        JSON.stringify(audience.geoStates || []),
        JSON.stringify(audience.interests || []),
        JSON.stringify(audience.brandAffinity || []),
        JSON.stringify(audience.languages || []),
        JSON.stringify(audience.ethnicities || []),
        JSON.stringify(audience.audienceReachability || []),
        JSON.stringify(audience.audienceTypes || []),
        JSON.stringify(audience.notableUsers || []),
        JSON.stringify(audience.audienceLookalikes || [])
      ])
      
      // Log the update
      await client.query(`
        INSERT INTO modash_update_log (
          profile_cache_id, update_type, status, credits_used, completed_at
        ) VALUES ($1, 'initial', 'completed', 1, NOW())
      `, [profileCacheId])
    })
    
    console.log(`✅ Successfully cached Modash profile for ${platform} user ${modashUserId}`)
    return { success: true }
    
  } catch (error) {
    console.error('Error caching Modash profile:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get cached profile data with freshness check
 */
export async function getCachedProfile(
  influencerPlatformId: string,
  platform: string
): Promise<CachedProfileData | null> {
  try {
    const result = await query(`
      SELECT 
        mpc.*,
        mac.notable_percentage,
        mac.credibility_score,
        mac.fake_followers_percentage,
        mac.genders,
        mac.ages,
        mac.geo_countries,
        mac.interests,
        mac.languages
      FROM modash_profile_cache mpc
      LEFT JOIN modash_audience_cache mac ON mpc.id = mac.profile_cache_id
      WHERE mpc.influencer_platform_id = $1 
        AND mpc.platform = $2
        -- AND mpc.expires_at > NOW()  -- LAZY MODE: Never expire cache
      ORDER BY mpc.last_updated DESC
      LIMIT 1
    `, [influencerPlatformId, platform.toUpperCase()])
    
    if (result.length === 0) {
      return null
    }
    
    return result[0] as CachedProfileData
    
  } catch (error) {
    console.error('Error getting cached profile:', error)
    return null
  }
}

/**
 * Get profiles that need updating (expired or high priority)
 */
export async function getProfilesNeedingUpdate(limit: number = 10): Promise<any[]> {
  try {
    const result = await query(`
      SELECT 
        mpc.id,
        mpc.influencer_platform_id,
        mpc.modash_user_id,
        mpc.platform,
        mpc.expires_at,
        mpc.update_priority,
        ip.username
      FROM modash_profile_cache mpc
      JOIN influencer_platforms ip ON mpc.influencer_platform_id = ip.id
      WHERE mpc.expires_at <= NOW() + INTERVAL '1 day'
        OR mpc.update_priority > 75
      ORDER BY 
        CASE WHEN mpc.expires_at <= NOW() THEN 1 ELSE 2 END,
        mpc.update_priority DESC,
        mpc.expires_at ASC
      LIMIT $1
    `, [limit])
    
    return result
    
  } catch (error) {
    console.error('Error getting profiles needing update:', error)
    return []
  }
}

/**
 * Update expired cache entries (called by scheduler)
 */
export async function updateExpiredProfiles(): Promise<{
  updated: number
  errors: number
  creditsUsed: number
}> {
  const profilesToUpdate = await getProfilesNeedingUpdate(10) // Batch size
  let updated = 0
  let errors = 0
  let creditsUsed = 0
  
  for (const profile of profilesToUpdate) {
    try {
      console.log(`🔄 Updating expired cache for ${profile.platform} user ${profile.modash_user_id}`)
      
      const result = await cacheModashProfile(
        profile.influencer_platform_id,
        profile.modash_user_id,
        profile.platform
      )
      
      if (result.success) {
        updated++
        creditsUsed++
      } else {
        errors++
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
      
    } catch (error) {
      console.error(`Error updating profile ${profile.modash_user_id}:`, error)
      errors++
    }
  }
  
  console.log(`✅ Cache update completed: ${updated} updated, ${errors} errors, ${creditsUsed} credits used`)
  
  return { updated, errors, creditsUsed }
}

/**
 * Get cache statistics for monitoring
 */
export async function getCacheStats(): Promise<CacheStats> {
  try {
    const stats = await query(`
      SELECT 
        COUNT(*) as total_cached_profiles,
        COUNT(CASE WHEN expires_at <= NOW() THEN 1 END) as profiles_needing_update,
        MAX(last_updated) as last_update_run
      FROM modash_profile_cache
    `)
    
    const creditsUsed = await query(`
      SELECT COALESCE(SUM(credits_used), 0) as credits_used_this_month
      FROM modash_update_log
      WHERE started_at >= DATE_TRUNC('month', NOW())
        AND status = 'completed'
    `)
    
    return {
      total_cached_profiles: stats[0]?.total_cached_profiles || 0,
      profiles_needing_update: stats[0]?.profiles_needing_update || 0,
      last_update_run: stats[0]?.last_update_run,
      credits_used_this_month: creditsUsed[0]?.credits_used_this_month || 0
    }
    
  } catch (error) {
    console.error('Error getting cache stats:', error)
    return {
      total_cached_profiles: 0,
      profiles_needing_update: 0,
      last_update_run: null,
      credits_used_this_month: 0
    }
  }
} 
