import { query } from '../connection'

export interface Shortlist {
  id: string
  brand_id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface ShortlistInfluencer {
  id: string
  shortlist_id: string
  influencer_id: string
  added_at: string
}

export interface ShortlistWithInfluencers extends Shortlist {
  influencers: Array<{
    id: string
    display_name: string
    username?: string
    platform: string
    followers: number
    engagement_rate: number
    profile_picture?: string
    niches?: string[]
    location?: string
    bio?: string
    added_at: string
  }>
}

// Create a new shortlist
export async function createShortlist(
  brandId: string,
  name: string,
  description?: string
): Promise<Shortlist> {
  const result = await query(`
    INSERT INTO shortlists (brand_id, name, description)
    VALUES ($1, $2, $3)
    RETURNING *
  `, [brandId, name, description])
  
  return result[0]
}

// Get all shortlists for a brand
export async function getShortlistsByBrand(brandId: string): Promise<ShortlistWithInfluencers[]> {
  const result = await query(`
    SELECT 
      s.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', i.id,
            'display_name', i.display_name,
            'username', i.display_name,
            'platform', 'instagram',
            'followers', i.total_followers,
            'engagement_rate', i.total_engagement_rate,
            'profile_picture', NULL,
            'niches', i.niches,
            'location', '',
            'bio', '',
            'added_at', si.added_at
          ) ORDER BY si.added_at DESC
        ) FILTER (WHERE i.id IS NOT NULL),
        '[]'::json
      ) as influencers
    FROM shortlists s
    LEFT JOIN shortlist_influencers si ON s.id = si.shortlist_id
    LEFT JOIN influencers i ON si.influencer_id = i.id
    WHERE s.brand_id = $1
    GROUP BY s.id, s.brand_id, s.name, s.description, s.created_at, s.updated_at
    ORDER BY s.updated_at DESC
  `, [brandId])
  
  return result.map(row => ({
    ...row,
    influencers: row.influencers || []
  }))
}

// Get a specific shortlist with influencers
export async function getShortlistById(shortlistId: string): Promise<ShortlistWithInfluencers | null> {
  const result = await query(`
    SELECT 
      s.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', i.id,
            'display_name', i.display_name,
            'username', i.display_name,
            'platform', 'instagram',
            'followers', i.total_followers,
            'engagement_rate', i.total_engagement_rate,
            'profile_picture', NULL,
            'niches', i.niches,
            'location', '',
            'bio', '',
            'added_at', si.added_at
          ) ORDER BY si.added_at DESC
        ) FILTER (WHERE i.id IS NOT NULL),
        '[]'::json
      ) as influencers
    FROM shortlists s
    LEFT JOIN shortlist_influencers si ON s.id = si.shortlist_id
    LEFT JOIN influencers i ON si.influencer_id = i.id
    WHERE s.id = $1
    GROUP BY s.id, s.brand_id, s.name, s.description, s.created_at, s.updated_at
  `, [shortlistId])
  
  if (result.length === 0) return null
  
  return {
    ...result[0],
    influencers: result[0].influencers || []
  }
}

// Update shortlist details
export async function updateShortlist(
  shortlistId: string,
  updates: { name?: string; description?: string }
): Promise<Shortlist | null> {
  const setClauses = []
  const values = []
  let paramCounter = 1

  if (updates.name !== undefined) {
    setClauses.push(`name = $${paramCounter}`)
    values.push(updates.name)
    paramCounter++
  }

  if (updates.description !== undefined) {
    setClauses.push(`description = $${paramCounter}`)
    values.push(updates.description)
    paramCounter++
  }

  if (setClauses.length === 0) {
    return null
  }

  setClauses.push(`updated_at = NOW()`)
  values.push(shortlistId)

  const result = await query(`
    UPDATE shortlists 
    SET ${setClauses.join(', ')}
    WHERE id = $${paramCounter}
    RETURNING *
  `, values)
  
  return result.length > 0 ? result[0] : null
}

// Delete a shortlist
export async function deleteShortlist(shortlistId: string): Promise<boolean> {
  const result = await query(`
    DELETE FROM shortlists WHERE id = $1
  `, [shortlistId])
  
  return result.rowCount > 0
}

// Duplicate a shortlist
export async function duplicateShortlist(
  shortlistId: string,
  newName: string,
  newDescription?: string
): Promise<ShortlistWithInfluencers | null> {
  // First get the original shortlist
  const original = await getShortlistById(shortlistId)
  if (!original) return null

  // Create new shortlist
  const newShortlist = await createShortlist(original.brand_id, newName, newDescription)
  
  // Copy all influencers from original shortlist
  if (original.influencers.length > 0) {
    const influencerIds = original.influencers.map(inf => inf.id)
    await addInfluencersToShortlist(newShortlist.id, influencerIds)
  }
  
  // Return the new shortlist with influencers
  return await getShortlistById(newShortlist.id)
}

// Add influencer to shortlist
export async function addInfluencerToShortlist(
  shortlistId: string,
  influencerId: string
): Promise<boolean> {
  try {
    await query(`
      INSERT INTO shortlist_influencers (shortlist_id, influencer_id)
      VALUES ($1, $2)
      ON CONFLICT (shortlist_id, influencer_id) DO NOTHING
    `, [shortlistId, influencerId])
    
    // Update shortlist updated_at
    await query(`
      UPDATE shortlists SET updated_at = NOW() WHERE id = $1
    `, [shortlistId])
    
    return true
  } catch (error) {
    console.error('Error adding influencer to shortlist:', error)
    return false
  }
}

// Add multiple influencers to shortlist
export async function addInfluencersToShortlist(
  shortlistId: string,
  influencerIds: string[]
): Promise<boolean> {
  if (influencerIds.length === 0) return true
  
  try {
    // Build bulk insert query
    const values = influencerIds.map((id, index) => 
      `($1, $${index + 2})`
    ).join(', ')
    
    await query(`
      INSERT INTO shortlist_influencers (shortlist_id, influencer_id)
      VALUES ${values}
      ON CONFLICT (shortlist_id, influencer_id) DO NOTHING
    `, [shortlistId, ...influencerIds])
    
    // Update shortlist updated_at
    await query(`
      UPDATE shortlists SET updated_at = NOW() WHERE id = $1
    `, [shortlistId])
    
    return true
  } catch (error) {
    console.error('Error adding influencers to shortlist:', error)
    return false
  }
}

// Remove influencer from shortlist
export async function removeInfluencerFromShortlist(
  shortlistId: string,
  influencerId: string
): Promise<boolean> {
  try {
    const result = await query(`
      DELETE FROM shortlist_influencers 
      WHERE shortlist_id = $1 AND influencer_id = $2
    `, [shortlistId, influencerId])
    
    // Update shortlist updated_at
    await query(`
      UPDATE shortlists SET updated_at = NOW() WHERE id = $1
    `, [shortlistId])
    
    return result.rowCount > 0
  } catch (error) {
    console.error('Error removing influencer from shortlist:', error)
    return false
  }
}

// Check if influencer is in shortlist
export async function isInfluencerInShortlist(
  shortlistId: string,
  influencerId: string
): Promise<boolean> {
  const result = await query(`
    SELECT 1 FROM shortlist_influencers 
    WHERE shortlist_id = $1 AND influencer_id = $2
  `, [shortlistId, influencerId])
  
  return result.length > 0
}

// Get all shortlists containing a specific influencer for a brand
export async function getInfluencerShortlists(
  brandId: string,
  influencerId: string
): Promise<Shortlist[]> {
  const result = await query(`
    SELECT s.* 
    FROM shortlists s
    INNER JOIN shortlist_influencers si ON s.id = si.shortlist_id
    WHERE s.brand_id = $1 AND si.influencer_id = $2
    ORDER BY s.updated_at DESC
  `, [brandId, influencerId])
  
  return result
}

// Get shortlist statistics
export async function getShortlistStats(brandId: string) {
  const result = await query(`
    SELECT 
      COUNT(DISTINCT s.id) as total_shortlists,
      COUNT(DISTINCT si.influencer_id) as total_unique_influencers,
      COUNT(si.influencer_id) as total_shortlist_entries
    FROM shortlists s
    LEFT JOIN shortlist_influencers si ON s.id = si.shortlist_id
    WHERE s.brand_id = $1
  `, [brandId])
  
  return result[0] || { total_shortlists: 0, total_unique_influencers: 0, total_shortlist_entries: 0 }
}
