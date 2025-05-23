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
// TEMPORARY MOCK DATA (Remove when DB is ready)
// =============================================

const MOCK_USERS: UserWithProfile[] = [
  {
    id: 'user_1',
    email: 'staff-test@stridesocial.com',
    role: 'STAFF' as UserRole,
    created_at: new Date('2024-01-15T10:00:00Z'),
    updated_at: new Date('2024-01-15T10:00:00Z'),
    profile: {
      user_id: 'user_1',
      first_name: 'Staff',
      last_name: 'Member',
      avatar_url: null,
      phone: null,
      location_country: 'United Kingdom',
      location_city: 'London',
      bio: null,
      website_url: null,
      is_onboarded: true,
      created_at: new Date('2024-01-15T10:00:00Z'),
      updated_at: new Date('2024-01-15T10:00:00Z')
    }
  },
  {
    id: 'user_2',
    email: 'brand@example.com',
    role: 'BRAND' as UserRole,
    created_at: new Date('2024-01-10T14:30:00Z'),
    updated_at: new Date('2024-01-10T14:30:00Z'),
    profile: {
      user_id: 'user_2',
      first_name: 'Brand',
      last_name: 'Manager',
      avatar_url: null,
      phone: '+44 20 1234 5678',
      location_country: 'United Kingdom',
      location_city: 'Manchester',
      bio: null,
      website_url: 'https://example.com',
      is_onboarded: true,
      created_at: new Date('2024-01-10T14:30:00Z'),
      updated_at: new Date('2024-01-10T14:30:00Z')
    }
  },
  {
    id: 'user_3',
    email: 'sarah.creator@gmail.com',
    role: 'INFLUENCER_SIGNED' as UserRole,
    created_at: new Date('2024-01-08T09:15:00Z'),
    updated_at: new Date('2024-01-08T09:15:00Z'),
    profile: {
      user_id: 'user_3',
      first_name: 'Sarah',
      last_name: 'Creator',
      avatar_url: null,
      phone: null,
      location_country: 'United Kingdom',
      location_city: 'Birmingham',
      bio: 'Lifestyle & Fashion Content Creator',
      website_url: 'https://sarahcreator.com',
      is_onboarded: true,
      created_at: new Date('2024-01-08T09:15:00Z'),
      updated_at: new Date('2024-01-08T09:15:00Z')
    }
  },
  {
    id: 'user_4',
    email: 'mike.partner@outlook.com',
    role: 'INFLUENCER_PARTNERED' as UserRole,
    created_at: new Date('2024-01-05T16:45:00Z'),
    updated_at: new Date('2024-01-05T16:45:00Z'),
    profile: {
      user_id: 'user_4',
      first_name: 'Mike',
      last_name: 'Content',
      avatar_url: null,
      phone: null,
      location_country: 'United States',
      location_city: 'New York',
      bio: 'Tech & Gaming Influencer',
      website_url: null,
      is_onboarded: false,
      created_at: new Date('2024-01-05T16:45:00Z'),
      updated_at: new Date('2024-01-05T16:45:00Z')
    }
  },
  {
    id: 'user_5',
    email: 'admin@stridesocial.com',
    role: 'ADMIN' as UserRole,
    created_at: new Date('2024-01-01T12:00:00Z'),
    updated_at: new Date('2024-01-01T12:00:00Z'),
    profile: {
      user_id: 'user_5',
      first_name: 'System',
      last_name: 'Admin',
      avatar_url: null,
      phone: null,
      location_country: 'United Kingdom',
      location_city: 'London',
      bio: null,
      website_url: null,
      is_onboarded: true,
      created_at: new Date('2024-01-01T12:00:00Z'),
      updated_at: new Date('2024-01-01T12:00:00Z')
    }
  }
]

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
  
  // TEMPORARY: Use mock data instead of database
  console.log('getUsers: Using mock data (database not yet set up)')
  
  let filteredUsers = [...MOCK_USERS]
  
  // Apply filters
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filteredUsers = filteredUsers.filter(user => 
      user.email.toLowerCase().includes(searchLower) ||
      user.profile?.first_name?.toLowerCase().includes(searchLower) ||
      user.profile?.last_name?.toLowerCase().includes(searchLower)
    )
  }
  
  if (filters.roles && filters.roles.length > 0) {
    filteredUsers = filteredUsers.filter(user => filters.roles!.includes(user.role))
  }
  
  // Apply pagination
  const total = filteredUsers.length
  const offset = (page - 1) * limit
  const paginatedUsers = filteredUsers.slice(offset, offset + limit)
  
  return {
    data: paginatedUsers,
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
  
  // TEMPORARY: Use mock data instead of database
  console.log('getUserStats: Using mock data (database not yet set up)')
  
  const usersByRole: Record<UserRole, number> = {
    BRAND: 1,
    INFLUENCER_SIGNED: 1,
    INFLUENCER_PARTNERED: 1,
    STAFF: 1,
    ADMIN: 1
  }

  return {
    totalUsers: MOCK_USERS.length,
    usersByRole,
    recentUsers: 2, // Mock recent users in last 7 days
    onboardedUsers: 4 // Mock onboarded users
  }
} 