import { query } from '../connection'

export interface DiscoveredInfluencer {
  id: string
  username: string
  platform: string
  followers: number
  engagement_rate: number
  demographics: any
  discovery_date: Date
  modash_data: any
  created_at: Date
  updated_at: Date
}

export interface DiscoveryHistory {
  id: string
  search_query: string
  filters_used: any
  results_count: number
  credits_used: number
  search_date: Date
  user_id: string
}

/**
 * Store discovered influencer in database
 */
export async function storeDiscoveredInfluencer(
  username: string,
  platform: string,
  followers: number,
  engagement_rate: number,
  demographics: any,
  modash_data: any
): Promise<string> {
  try {
    const result = await query(`
      INSERT INTO discovered_influencers (
        username, platform, followers, engagement_rate, 
        demographics, discovery_date, modash_data
      ) VALUES ($1, $2, $3, $4, $5, NOW(), $6)
      ON CONFLICT (username, platform) 
      DO UPDATE SET 
        followers = $3,
        engagement_rate = $4,
        demographics = $5,
        modash_data = $6,
        updated_at = NOW()
      RETURNING id
    `, [username, platform, followers, engagement_rate, demographics, modash_data])
    
    return result[0]?.id
  } catch (error) {
    console.error('Error storing discovered influencer:', error)
    throw error
  }
}

/**
 * Get discovery history
 */
export async function getDiscoveryHistory(limit: number = 50): Promise<DiscoveryHistory[]> {
  try {
    const result = await query(`
      SELECT * FROM discovery_history 
      ORDER BY search_date DESC 
      LIMIT $1
    `, [limit])
    
    return result
  } catch (error) {
    console.error('Error getting discovery history:', error)
    throw error
  }
}

/**
 * Store discovery search in history
 */
export async function storeDiscoverySearch(
  searchQuery: string,
  filtersUsed: any,
  resultsCount: number,
  creditsUsed: number,
  userId: string
): Promise<string> {
  try {
    const result = await query(`
      INSERT INTO discovery_history (
        search_query, filters_used, results_count, credits_used, search_date, user_id
      ) VALUES ($1, $2, $3, $4, NOW(), $5)
      RETURNING id
    `, [searchQuery, JSON.stringify(filtersUsed), resultsCount, creditsUsed, userId])
    
    return result[0]?.id
  } catch (error) {
    console.error('Error storing discovery search:', error)
    throw error
  }
}

/**
 * Check if influencer already exists in roster
 */
export async function checkInfluencerInRoster(username: string, platform: string): Promise<boolean> {
  try {
    const result = await query(`
      SELECT COUNT(*) as count 
      FROM influencers i
      JOIN influencer_platforms ip ON i.id = ip.influencer_id
      WHERE ip.username = $1 AND ip.platform = $2
    `, [username, platform.toUpperCase()])
    
    return parseInt(result[0]?.count || '0') > 0
  } catch (error) {
    console.error('Error checking influencer in roster:', error)
    return false
  }
}

/**
 * Get discovered influencers with enrichment data
 */
export async function getDiscoveredInfluencers(limit: number = 100): Promise<DiscoveredInfluencer[]> {
  try {
    const result = await query(`
      SELECT * FROM discovered_influencers 
      ORDER BY discovery_date DESC 
      LIMIT $1
    `, [limit])
    
    return result
  } catch (error) {
    console.error('Error getting discovered influencers:', error)
    throw error
  }
}

/**
 * Add discovered influencer to roster
 */
export async function addDiscoveredInfluencerToRoster(
  discoveredId: string,
  userId: string
): Promise<string> {
  try {
    // Get discovered influencer data
    const discovered = await query(`
      SELECT * FROM discovered_influencers WHERE id = $1
    `, [discoveredId])
    
    if (discovered.length === 0) {
      throw new Error('Discovered influencer not found')
    }
    
    const influencer = discovered[0]
    
    // Create new influencer record
    const newInfluencer = await query(`
      INSERT INTO influencers (
        user_id, first_name, last_name, email, phone, 
        bio, profile_image_url, niche, location, 
        status, tier, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING id
    `, [
      userId,
      influencer.username, // Use username as first name
      '', // No last name
      '', // No email
      '', // No phone
      influencer.modash_data?.bio || '',
      influencer.modash_data?.profile_picture || '',
      'discovered', // Default niche
      influencer.modash_data?.location || 'Unknown',
      'PARTNERED', // Default status
      'BRONZE' // Default tier
    ])
    
    const influencerId = newInfluencer[0]?.id
    
    // Add platform data
    await query(`
      INSERT INTO influencer_platforms (
        influencer_id, platform, username, followers, 
        engagement_rate, avg_views, profile_url, verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      influencerId,
      influencer.platform.toUpperCase(),
      influencer.username,
      influencer.followers,
      influencer.engagement_rate,
      influencer.modash_data?.avg_views || 0,
      influencer.modash_data?.url || '',
      influencer.modash_data?.verified || false
    ])
    
    // Mark as added to roster
    await query(`
      UPDATE discovered_influencers 
      SET added_to_roster = true, added_at = NOW()
      WHERE id = $1
    `, [discoveredId])
    
    return influencerId
  } catch (error) {
    console.error('Error adding discovered influencer to roster:', error)
    throw error
  }
}

/**
 * Get discovery statistics
 */
export async function getDiscoveryStats(): Promise<{
  totalDiscovered: number
  totalAddedToRoster: number
  totalCreditsUsed: number
  averageEngagement: number
}> {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) as total_discovered,
        COUNT(CASE WHEN added_to_roster = true THEN 1 END) as total_added,
        AVG(engagement_rate) as avg_engagement
      FROM discovered_influencers
    `)
    
    const historyResult = await query(`
      SELECT SUM(credits_used) as total_credits
      FROM discovery_history
    `)
    
    return {
      totalDiscovered: parseInt(result[0]?.total_discovered || '0'),
      totalAddedToRoster: parseInt(result[0]?.total_added || '0'),
      totalCreditsUsed: parseFloat(historyResult[0]?.total_credits || '0'),
      averageEngagement: parseFloat(result[0]?.avg_engagement || '0')
    }
  } catch (error) {
    console.error('Error getting discovery stats:', error)
    throw error
  }
} 