import { query, queryOne, transaction } from '../connection'
import { 
  User, 
  UserProfile, 
  UserWithProfile, 
  UserRole, 
  UserFilters, 
  PaginatedResponse,
  DatabaseResponse 
} from '../../../types/database'

// =============================================
// User Query Functions
// =============================================

/**
 * Get all users with optional filtering and pagination
 */
export async function getUsers(
  filters: UserFilters = {},
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<UserWithProfile>> {
  
  try {
    const whereConditions = ['1=1']
    const params: any[] = []
    let paramIndex = 1

    // Apply filters
    if (filters.search) {
      whereConditions.push(`(
        u.email ILIKE $${paramIndex} OR 
        up.first_name ILIKE $${paramIndex} OR 
        up.last_name ILIKE $${paramIndex}
      )`)
      params.push(`%${filters.search}%`)
      paramIndex++
    }

    if (filters.roles && filters.roles.length > 0) {
      const rolePlaceholders = filters.roles.map((_, i) => `$${paramIndex + i}`).join(',')
      whereConditions.push(`u.role IN (${rolePlaceholders})`)
      params.push(...filters.roles)
      paramIndex += filters.roles.length
    }

    if (filters.is_onboarded !== undefined) {
      whereConditions.push(`up.is_onboarded = $${paramIndex}`)
      params.push(filters.is_onboarded)
      paramIndex++
    }

    // Build the main query
    const whereClause = whereConditions.join(' AND ')
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE ${whereClause}
    `
    
    const countResult = await query(countQuery, params)
    const total = parseInt(countResult[0]?.total || '0')

    // Get paginated data
    const offset = (page - 1) * limit
    const dataQuery = `
      SELECT 
        u.id,
        u.email,
        u.role,
        u.created_at,
        u.updated_at,
        up.first_name,
        up.last_name,
        up.avatar_url,
        up.phone,
        up.location_country,
        up.location_city,
        up.bio,
        up.is_onboarded
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    
    params.push(limit, offset)
    const usersResult = await query(dataQuery, params)

    // Transform the data to match the expected interface
    const users: UserWithProfile[] = usersResult.map((row: any) => ({
      id: row.id,
      email: row.email,
      role: row.role,
      created_at: row.created_at,
      updated_at: row.updated_at,
      profile: row.first_name || row.last_name ? {
        user_id: row.id,
        first_name: row.first_name,
        last_name: row.last_name,
        avatar_url: row.avatar_url,
        phone: row.phone,
        location_country: row.location_country,
        location_city: row.location_city,
        bio: row.bio,
        website_url: null, // Not available in current schema
        is_onboarded: row.is_onboarded || false,
        created_at: row.created_at,
        updated_at: row.updated_at
      } : null
    }))

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }

  } catch (error) {
    console.error('Error in getUsers:', error)
    throw new Error('Failed to fetch users')
  }
}

/**
 * Get user by Clerk ID
 */
export async function getUserFromClerkId(clerkId: string): Promise<User | null> {
  const sql = `
    SELECT id, email, role, status, created_at, updated_at
    FROM users 
    WHERE clerk_id = $1
  `
  
  const row = await queryOne<User>(sql, [clerkId])
  return row
}

/**
 * Get user by ID with profile
 */
export async function getUserById(userId: string): Promise<UserWithProfile | null> {
  const sql = `
    SELECT 
      u.id,
      u.email,
      u.role,
      u.created_at,
      u.updated_at,
      up.first_name,
      up.last_name,
      up.avatar_url,
      up.phone,
      up.location_country,
      up.location_city,
      up.bio,
      up.website_url,
      up.is_onboarded,
      up.created_at as profile_created_at,
      up.updated_at as profile_updated_at
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE u.id = $1
  `
  
  const row = await queryOne<any>(sql, [userId])
  
  if (!row) return null

  return {
    id: row.id,
    email: row.email,
    role: row.role,
    created_at: row.created_at,
    updated_at: row.updated_at,
    profile: row.first_name || row.last_name ? {
      user_id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      avatar_url: row.avatar_url,
      phone: row.phone,
      location_country: row.location_country,
      location_city: row.location_city,
      bio: row.bio,
      website_url: row.website_url,
      is_onboarded: row.is_onboarded,
      created_at: row.profile_created_at,
      updated_at: row.profile_updated_at
    } : null
  }
}

/**
 * Create new user with optional profile
 */
export async function createUser(
  email: string,
  role: UserRole,
  profileData?: Partial<UserProfile>
): Promise<DatabaseResponse<UserWithProfile>> {
  try {
    const result = await transaction(async (client) => {
      // Create user
      const userResult = await client.query(
        `INSERT INTO users (email, role) 
         VALUES ($1, $2) 
         RETURNING id, email, role, created_at, updated_at`,
        [email, role]
      )
      
      const user = userResult.rows[0]

      // Create profile if data provided
      let profile = null
      if (profileData) {
        const profileResult = await client.query(
          `INSERT INTO user_profiles (
            user_id, first_name, last_name, phone, 
            location_country, location_city, bio, website_url
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *`,
          [
            user.id,
            profileData.first_name || null,
            profileData.last_name || null,
            profileData.phone || null,
            profileData.location_country || null,
            profileData.location_city || null,
            profileData.bio || null,
            profileData.website_url || null
          ]
        )
        profile = profileResult.rows[0]
      }

      return { ...user, profile }
    })

    return {
      success: true,
      data: result,
      message: 'User created successfully'
    }
  } catch (error) {
    console.error('Error creating user:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create user'
    }
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(
  userId: string,
  newRole: UserRole
): Promise<DatabaseResponse<User>> {
  try {
    const sql = `
      UPDATE users 
      SET role = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `
    
    const user = await queryOne<User>(sql, [newRole, userId])
    
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      }
    }

    return {
      success: true,
      data: user,
      message: 'User role updated successfully'
    }
  } catch (error) {
    console.error('Error updating user role:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user role'
    }
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  profileData: Partial<UserProfile>
): Promise<DatabaseResponse<UserProfile>> {
  try {
    const setClause = []
    const values = []
    let paramIndex = 1

    // Build dynamic SET clause
    const allowedFields = [
      'first_name', 'last_name', 'phone', 'location_country', 
      'location_city', 'bio', 'website_url', 'avatar_url'
    ]

    for (const field of allowedFields) {
      if (profileData[field as keyof UserProfile] !== undefined) {
        setClause.push(`${field} = $${paramIndex}`)
        values.push(profileData[field as keyof UserProfile])
        paramIndex++
      }
    }

    if (setClause.length === 0) {
      return {
        success: false,
        error: 'No valid fields to update'
      }
    }

    setClause.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(userId)

    const sql = `
      UPDATE user_profiles 
      SET ${setClause.join(', ')}
      WHERE user_id = $${paramIndex}
      RETURNING *
    `

    const _profile = await queryOne<UserProfile>(sql, values)

    if (!_profile) {
      return {
        success: false,
        error: 'User profile not found'
      }
    }

    return {
      success: true,
      data: _profile,
      message: 'Profile updated successfully'
    }
  } catch (error) {
    console.error('Error updating user profile:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update profile'
    }
  }
}

/**
 * Delete user (soft delete by setting inactive)
 */
export async function deleteUser(userId: string): Promise<DatabaseResponse<void>> {
  try {
    const result = await transaction(async (client) => {
      // Check if user exists
      const user = await client.query('SELECT id FROM users WHERE id = $1', [userId])
      
      if (user.rows.length === 0) {
        throw new Error('User not found')
      }

      // For now, we'll actually delete the user
      // In production, you might want to soft delete
      await client.query('DELETE FROM user_profiles WHERE user_id = $1', [userId])
      await client.query('DELETE FROM users WHERE id = $1', [userId])
    })

    return {
      success: true,
      message: 'User deleted successfully'
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete user'
    }
  }
}

/**
 * Get user statistics for dashboard
 */
export async function getUserStats(): Promise<{
  totalUsers: number;
  usersByRole: Record<UserRole, number>;
  recentUsers: number;
  onboardedUsers: number;
}> {
  
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN u.role = 'BRAND' THEN 1 END) as brand_count,
        COUNT(CASE WHEN u.role = 'INFLUENCER_SIGNED' THEN 1 END) as influencer_signed_count,
        COUNT(CASE WHEN u.role = 'INFLUENCER_PARTNERED' THEN 1 END) as influencer_partnered_count,
        COUNT(CASE WHEN u.role = 'STAFF' THEN 1 END) as staff_count,
        COUNT(CASE WHEN u.role = 'ADMIN' THEN 1 END) as admin_count,
        COUNT(CASE WHEN u.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as recent,
        COUNT(CASE WHEN up.is_onboarded = true THEN 1 END) as onboarded
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
    `
    
    const result = await query(statsQuery)
    const stats = result[0]

    const usersByRole: Record<UserRole, number> = {
      BRAND: parseInt(stats.brand_count || '0'),
      INFLUENCER_SIGNED: parseInt(stats.influencer_signed_count || '0'),
      INFLUENCER_PARTNERED: parseInt(stats.influencer_partnered_count || '0'),
      STAFF: parseInt(stats.staff_count || '0'),
      ADMIN: parseInt(stats.admin_count || '0')
    }

    return {
      totalUsers: parseInt(stats.total || '0'),
      usersByRole,
      recentUsers: parseInt(stats.recent || '0'),
      onboardedUsers: parseInt(stats.onboarded || '0')
    }

  } catch (error) {
    console.error('Error in getUserStats:', error)
    throw new Error('Failed to fetch user statistics')
  }
} 