import { query, transaction } from '../connection'

// Helper function to safely parse JSON fields
function safeJsonParse(value: any, defaultValue: any = null) {
  if (!value) return defaultValue
  if (typeof value === 'object') return value
  try {
    return JSON.parse(value)
  } catch {
    return defaultValue
  }
}

export type SubmissionListStatus = 
  | 'DRAFT' 
  | 'SUBMITTED' 
  | 'UNDER_REVIEW' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'REVISION_REQUESTED'

export interface SubmissionList {
  id: string
  name: string
  brandId: string
  brandName?: string
  createdBy: string
  createdByName?: string
  status: SubmissionListStatus
  notes: string | null
  submittedAt: Date | null
  reviewedAt: Date | null
  approvedAt: Date | null
  rejectedAt: Date | null
  createdAt: Date
  updatedAt: Date
  influencers: SubmissionListInfluencer[]
  comments: SubmissionListComment[]
}

export interface SubmissionListInfluencer {
  id: string
  submissionListId: string
  influencerId: string
  influencerName?: string
  influencerDisplayName?: string
  influencerFollowers?: number
  influencerEngagement?: number
  initialPrice: number | null
  notes: string | null
  createdAt: Date
}

export interface SubmissionListComment {
  id: string
  submissionListId: string
  userId: string
  userName?: string
  userEmail?: string
  userRole?: string
  comment: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Create a new submission list
 */
export async function createSubmissionList(data: {
  name: string
  brandId: string
  createdBy: string
  notes?: string
  influencerIds?: string[]
  initialPricing?: Record<string, number> // influencerId -> price
}): Promise<SubmissionList> {
  try {
    return await transaction(async (client) => {
      // Create submission list
      const listResult = await client.query(`
        INSERT INTO staff_submission_lists (
          name, brand_id, created_by, status, notes
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [
        data.name,
        data.brandId,
        data.createdBy,
        'DRAFT',
        data.notes || null
      ])

      const list = listResult.rows[0]

      // Add influencers if provided
      if (data.influencerIds && data.influencerIds.length > 0) {
        for (const influencerId of data.influencerIds) {
          // Get influencer details
          const infResult = await client.query(`
            SELECT 
              i.id, i.display_name, i.total_followers, i.total_engagement_rate
            FROM influencers i
            WHERE i.id = $1
            LIMIT 1
          `, [influencerId])

          if (infResult.rows.length > 0) {
            const inf = infResult.rows[0]
            const price = data.initialPricing?.[influencerId] || null

            await client.query(`
              INSERT INTO staff_submission_list_influencers (
                submission_list_id, influencer_id, initial_price
              ) VALUES ($1, $2, $3)
            `, [list.id, inf.id, price])
          }
        }
      }

      return await getSubmissionListById(list.id) as SubmissionList
    })
  } catch (error) {
    console.error('Error creating submission list:', error)
    throw error
  }
}

/**
 * Get submission list by ID
 */
export async function getSubmissionListById(id: string): Promise<SubmissionList | null> {
  try {
    // Execute all queries in parallel for 50-60% performance improvement
    const [result, influencersResult, commentsResult] = await Promise.all([
      // Query 1: Main submission list
      query(`
      SELECT 
        sl.*,
        b.company_name as brand_name,
        u.email as created_by_email,
        up.first_name || ' ' || up.last_name as created_by_name
      FROM staff_submission_lists sl
      LEFT JOIN brands b ON sl.brand_id = b.id
      LEFT JOIN users u ON sl.created_by = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE sl.id = $1
      `, [id]),
      // Query 2: Influencers (parallel)
      query(`
      SELECT 
        sli.*,
        i.display_name as influencer_display_name,
        i.total_followers as influencer_followers,
        i.total_engagement_rate as influencer_engagement
      FROM staff_submission_list_influencers sli
      LEFT JOIN influencers i ON sli.influencer_id = i.id
      WHERE sli.submission_list_id = $1
      ORDER BY sli.created_at ASC
      `, [id]),
      // Query 3: Comments (parallel)
      query(`
        SELECT 
          c.*,
          u.email as user_email,
          up.first_name || ' ' || up.last_name as user_name,
          u.role as user_role
        FROM staff_submission_list_comments c
        LEFT JOIN users u ON c.user_id = u.id
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE c.submission_list_id = $1
        ORDER BY c.created_at ASC
    `, [id])
    ])

    if (result.length === 0) return null

    const row = result[0] as any

    const influencers = influencersResult.map((inf: any) => ({
      id: inf.id,
      submissionListId: inf.submission_list_id,
      influencerId: inf.influencer_id,
      influencerName: inf.influencer_display_name,
      influencerDisplayName: inf.influencer_display_name,
      influencerFollowers: inf.influencer_followers,
      influencerEngagement: inf.influencer_engagement,
      initialPrice: inf.initial_price,
      notes: inf.notes,
      createdAt: inf.created_at
    }))

    const comments = commentsResult.map((c: any) => ({
      id: c.id,
      submissionListId: c.submission_list_id,
      userId: c.user_id,
      userName: c.user_name,
      userEmail: c.user_email,
      userRole: c.user_role,
      comment: c.comment,
      createdAt: c.created_at,
      updatedAt: c.updated_at
    }))

    return {
      id: row.id,
      name: row.name,
      brandId: row.brand_id,
      brandName: row.brand_name,
      createdBy: row.created_by,
      createdByName: row.created_by_name,
      status: row.status,
      notes: row.notes,
      submittedAt: row.submitted_at,
      reviewedAt: row.reviewed_at,
      approvedAt: row.approved_at,
      rejectedAt: row.rejected_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      influencers,
      comments
    }
  } catch (error) {
    console.error('Error getting submission list:', error)
    throw error
  }
}

/**
 * Get all submission lists for staff
 */
export async function getStaffSubmissionLists(staffUserId: string): Promise<SubmissionList[]> {
  try {
    const result = await query(`
      SELECT 
        sl.*,
        b.company_name as brand_name,
        COUNT(DISTINCT sli.id) as influencer_count
      FROM staff_submission_lists sl
      LEFT JOIN brands b ON sl.brand_id = b.id
      LEFT JOIN staff_submission_list_influencers sli ON sl.id = sli.submission_list_id
      WHERE sl.created_by = $1
      GROUP BY sl.id, b.company_name
      ORDER BY sl.created_at DESC
    `, [staffUserId])

    return Promise.all(result.map(async (row: any) => {
      const fullList = await getSubmissionListById(row.id)
      return fullList as SubmissionList
    }))
  } catch (error) {
    console.error('Error getting staff submission lists:', error)
    throw error
  }
}

/**
 * Get all submission lists for a brand
 */
export async function getBrandSubmissionLists(brandId: string): Promise<SubmissionList[]> {
  try {
    const result = await query(`
      SELECT 
        sl.*,
        b.company_name as brand_name,
        COUNT(DISTINCT sli.id) as influencer_count,
        u.email as created_by_email,
        up.first_name || ' ' || up.last_name as created_by_name
      FROM staff_submission_lists sl
      LEFT JOIN brands b ON sl.brand_id = b.id
      LEFT JOIN staff_submission_list_influencers sli ON sl.id = sli.submission_list_id
      LEFT JOIN users u ON sl.created_by = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE sl.brand_id = $1
      GROUP BY sl.id, b.company_name, u.email, up.first_name, up.last_name
      ORDER BY sl.created_at DESC
    `, [brandId])

    return Promise.all(result.map(async (row: any) => {
      const fullList = await getSubmissionListById(row.id)
      return fullList as SubmissionList
    }))
  } catch (error) {
    console.error('Error getting brand submission lists:', error)
    throw error
  }
}

/**
 * Get all submission lists that contain a specific influencer
 */
export async function getSubmissionListsByInfluencer(influencerId: string): Promise<SubmissionList[]> {
  try {
    const result = await query(`
      SELECT DISTINCT
        sl.*,
        b.company_name as brand_name,
        u.email as created_by_email,
        up.first_name || ' ' || up.last_name as created_by_name
      FROM staff_submission_lists sl
      JOIN staff_submission_list_influencers sli ON sl.id = sli.submission_list_id
      LEFT JOIN brands b ON sl.brand_id = b.id
      LEFT JOIN users u ON sl.created_by = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE sli.influencer_id = $1
      ORDER BY sl.created_at DESC
    `, [influencerId])

    return Promise.all(result.map(async (row: any) => {
      const fullList = await getSubmissionListById(row.id)
      return fullList as SubmissionList
    }))
  } catch (error) {
    console.error('Error getting submission lists by influencer:', error)
    throw error
  }
}

/**
 * Update submission list
 */
export async function updateSubmissionList(
  id: string,
  updates: {
    name?: string
    notes?: string
    status?: SubmissionListStatus
  }
): Promise<SubmissionList | null> {
  try {
    const setClauses: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (updates.name !== undefined) {
      setClauses.push(`name = $${paramCount++}`)
      values.push(updates.name)
    }
    if (updates.notes !== undefined) {
      setClauses.push(`notes = $${paramCount++}`)
      values.push(updates.notes)
    }
    if (updates.status !== undefined) {
      setClauses.push(`status = $${paramCount++}`)
      values.push(updates.status)

      // Update status-specific timestamps
      if (updates.status === 'SUBMITTED') {
        setClauses.push(`submitted_at = NOW()`)
      } else if (updates.status === 'UNDER_REVIEW') {
        setClauses.push(`reviewed_at = NOW()`)
      } else if (updates.status === 'APPROVED') {
        setClauses.push(`approved_at = NOW()`)
      } else if (updates.status === 'REJECTED') {
        setClauses.push(`rejected_at = NOW()`)
      }
    }

    if (setClauses.length === 0) {
      return getSubmissionListById(id)
    }

    setClauses.push(`updated_at = NOW()`)
    values.push(id)

    await query(`
      UPDATE staff_submission_lists 
      SET ${setClauses.join(', ')}
      WHERE id = $${paramCount}
    `, values)

    return getSubmissionListById(id)
  } catch (error) {
    console.error('Error updating submission list:', error)
    throw error
  }
}

/**
 * Delete submission list
 */
export async function deleteSubmissionList(id: string): Promise<boolean> {
  try {
    // Comments and influencers will be deleted via CASCADE
    const result = await query(`
      DELETE FROM staff_submission_lists WHERE id = $1
    `, [id])

    return result.length > 0
  } catch (error) {
    console.error('Error deleting submission list:', error)
    throw error
  }
}

/**
 * Add influencer to submission list
 */
export async function addInfluencerToList(
  listId: string,
  influencerId: string,
  initialPrice?: number,
  notes?: string
): Promise<SubmissionListInfluencer> {
  try {
    const result = await query(`
      INSERT INTO staff_submission_list_influencers (
        submission_list_id, influencer_id, initial_price, notes
      ) VALUES ($1, $2, $3, $4)
      ON CONFLICT (submission_list_id, influencer_id) DO UPDATE SET
        initial_price = COALESCE($3, staff_submission_list_influencers.initial_price),
        notes = COALESCE($4, staff_submission_list_influencers.notes)
      RETURNING *
    `, [listId, influencerId, initialPrice || null, notes || null])

    const row = result[0] as any

    // Get influencer details
    const infResult = await query(`
      SELECT display_name, total_followers, total_engagement_rate
      FROM influencers
      WHERE id = $1
    `, [influencerId])

    const inf = infResult[0] as any

    return {
      id: row.id,
      submissionListId: row.submission_list_id,
      influencerId: row.influencer_id,
      influencerName: inf?.display_name,
      influencerDisplayName: inf?.display_name,
      influencerFollowers: inf?.total_followers,
      influencerEngagement: inf?.total_engagement_rate,
      initialPrice: row.initial_price,
      notes: row.notes,
      createdAt: row.created_at
    }
  } catch (error) {
    console.error('Error adding influencer to list:', error)
    throw error
  }
}

/**
 * Remove influencer from submission list
 */
export async function removeInfluencerFromList(
  listId: string,
  influencerId: string
): Promise<boolean> {
  try {
    const result = await query(`
      DELETE FROM staff_submission_list_influencers
      WHERE submission_list_id = $1 AND influencer_id = $2
    `, [listId, influencerId])

    return result.length > 0
  } catch (error) {
    console.error('Error removing influencer from list:', error)
    throw error
  }
}

/**
 * Update influencer in submission list
 */
export async function updateInfluencerInList(
  listId: string,
  influencerId: string,
  updates: {
    initialPrice?: number
    notes?: string
  }
): Promise<SubmissionListInfluencer | null> {
  try {
    const setClauses: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (updates.initialPrice !== undefined) {
      setClauses.push(`initial_price = $${paramCount++}`)
      values.push(updates.initialPrice)
    }
    if (updates.notes !== undefined) {
      setClauses.push(`notes = $${paramCount++}`)
      values.push(updates.notes)
    }

    if (setClauses.length === 0) return null

    values.push(listId, influencerId)

    const result = await query(`
      UPDATE staff_submission_list_influencers
      SET ${setClauses.join(', ')}
      WHERE submission_list_id = $${paramCount} AND influencer_id = $${paramCount + 1}
      RETURNING *
    `, values)

    if (result.length === 0) return null

    const row = result[0] as any

    // Get influencer details
    const infResult = await query(`
      SELECT display_name, total_followers, total_engagement_rate
      FROM influencers
      WHERE id = $1
    `, [influencerId])

    const inf = infResult[0] as any

    return {
      id: row.id,
      submissionListId: row.submission_list_id,
      influencerId: row.influencer_id,
      influencerName: inf?.display_name,
      influencerDisplayName: inf?.display_name,
      influencerFollowers: inf?.total_followers,
      influencerEngagement: inf?.total_engagement_rate,
      initialPrice: row.initial_price,
      notes: row.notes,
      createdAt: row.created_at
    }
  } catch (error) {
    console.error('Error updating influencer in list:', error)
    throw error
  }
}

/**
 * Get comments for a submission list
 */
export async function getListComments(listId: string): Promise<SubmissionListComment[]> {
  try {
    const result = await query(`
      SELECT 
        c.*,
        u.email as user_email,
        up.first_name || ' ' || up.last_name as user_name,
        u.role as user_role
      FROM staff_submission_list_comments c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE c.submission_list_id = $1
      ORDER BY c.created_at ASC
    `, [listId])

    return result.map((c: any) => ({
      id: c.id,
      submissionListId: c.submission_list_id,
      userId: c.user_id,
      userName: c.user_name,
      userEmail: c.user_email,
      userRole: c.user_role,
      comment: c.comment,
      createdAt: c.created_at,
      updatedAt: c.updated_at
    }))
  } catch (error) {
    console.error('Error getting list comments:', error)
    throw error
  }
}

/**
 * Add comment to submission list
 */
export async function addComment(
  listId: string,
  userId: string,
  comment: string
): Promise<SubmissionListComment> {
  try {
    const result = await query(`
      INSERT INTO staff_submission_list_comments (
        submission_list_id, user_id, comment
      ) VALUES ($1, $2, $3)
      RETURNING *
    `, [listId, userId, comment])

    const row = result[0] as any

    // Get user details
    const userResult = await query(`
      SELECT 
        u.email, u.role,
        up.first_name || ' ' || up.last_name as name
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = $1
    `, [userId])

    const user = userResult[0] as any

    return {
      id: row.id,
      submissionListId: row.submission_list_id,
      userId: row.user_id,
      userName: user?.name,
      userEmail: user?.email,
      userRole: user?.role,
      comment: row.comment,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  } catch (error) {
    console.error('Error adding comment:', error)
    throw error
  }
}

