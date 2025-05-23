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
  const offset = (page - 1) * limit
  
  let whereConditions: string[] = []
  let params: any[] = []
  let paramIndex = 1

  // Build dynamic WHERE conditions
  if (filters.search) {
    whereConditions.push(`
      (u.email ILIKE $${paramIndex} 
       OR up.first_name ILIKE $${paramIndex} 
       OR up.last_name ILIKE $${paramIndex})
    `)
    params.push(`%${filters.search}%`)
    paramIndex++
  }

  if (filters.roles && filters.roles.length > 0) {
    whereConditions.push(`u.role = ANY($${paramIndex})`)
    params.push(filters.roles)
    paramIndex++
  }

  if (filters.is_onboarded !== undefined) {
    whereConditions.push(`up.is_onboarded = $${paramIndex}`)
    params.push(filters.is_onboarded)
    paramIndex++
  }

  if (filters.location_countries && filters.location_countries.length > 0) {
    whereConditions.push(`up.location_country = ANY($${paramIndex})`)
    params.push(filters.location_countries)
    paramIndex++
  }

  const whereClause = whereConditions.length > 0 
    ? 'WHERE ' + whereConditions.join(' AND ')
    : ''

  // Get total count
  const countQuery = `
    SELECT COUNT(DISTINCT u.id) as total
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    ${whereClause}
  `
  const countResult = await queryOne<{ total: string }>(countQuery, params)
  const total = parseInt(countResult?.total || '0')

  // Get paginated results
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
      up.website_url,
      up.is_onboarded,
      up.created_at as profile_created_at,
      up.updated_at as profile_updated_at
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    ${whereClause}
    ORDER BY u.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `
  params.push(limit, offset)

  const rows = await query<any>(dataQuery, params)
  
  const users: UserWithProfile[] = rows.map(row => ({
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
  }))

  return {
    data: users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  }
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

    const profile = await queryOne<UserProfile>(sql, values)

    if (!profile) {
      return {
        success: false,
        error: 'User profile not found'
      }
    }

    return {
      success: true,
      data: profile,
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
  const totalUsersResult = await queryOne<{ count: string }>(
    'SELECT COUNT(*) as count FROM users'
  )

  const usersByRoleResult = await query<{ role: UserRole; count: string }>(
    'SELECT role, COUNT(*) as count FROM users GROUP BY role'
  )

  const recentUsersResult = await queryOne<{ count: string }>(
    `SELECT COUNT(*) as count FROM users 
     WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'`
  )

  const onboardedUsersResult = await queryOne<{ count: string }>(
    `SELECT COUNT(*) as count FROM user_profiles 
     WHERE is_onboarded = true`
  )

  const usersByRole: Record<UserRole, number> = {
    BRAND: 0,
    INFLUENCER_SIGNED: 0,
    INFLUENCER_PARTNERED: 0,
    STAFF: 0,
    ADMIN: 0
  }

  for (const row of usersByRoleResult) {
    usersByRole[row.role] = parseInt(row.count)
  }

  return {
    totalUsers: parseInt(totalUsersResult?.count || '0'),
    usersByRole,
    recentUsers: parseInt(recentUsersResult?.count || '0'),
    onboardedUsers: parseInt(onboardedUsersResult?.count || '0')
  }
} 