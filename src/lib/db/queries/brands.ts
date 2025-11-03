import { query, transaction } from '../connection'
import { 
  Brand,
  UserWithProfile,
  PaginatedResponse,
  DatabaseResponse
} from '../../../types/database'

// Define local types for brand management
export interface BrandWithUser extends Brand {
  user: UserWithProfile;
}

export interface BrandFilters {
  search?: string;
  industry?: string;
  status?: string;
}

/**
 * Get all brands with optional filtering and pagination
 */
export async function getBrands(
  filters: BrandFilters = {},
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<BrandWithUser>> {
  
  try {
    const whereConditions = ['1=1']
    const params: any[] = []
    let paramIndex = 1

    // Apply filters
    if (filters.search) {
      whereConditions.push(`(
        b.company_name ILIKE $${paramIndex} OR 
        up.first_name ILIKE $${paramIndex} OR 
        up.last_name ILIKE $${paramIndex} OR
        u.email ILIKE $${paramIndex}
      )`)
      params.push(`%${filters.search}%`)
      paramIndex++
    }

    if (filters.industry) {
      whereConditions.push(`b.industry = $${paramIndex}`)
      params.push(filters.industry)
      paramIndex++
    }

    // Build the main query
    const whereClause = whereConditions.join(' AND ')
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM brands b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE ${whereClause}
    `
    
    const countResult = await query(countQuery, params)
    const total = parseInt(countResult[0]?.total || '0')

    // Get paginated data
    const offset = (page - 1) * limit
    const dataQuery = `
      SELECT 
        b.id,
        b.user_id,
        b.company_name,
        b.industry,
        b.website_url,
        b.created_at,
        b.updated_at,
        u.email,
        u.role,
        up.first_name,
        up.last_name,
        up.avatar_url,
        up.location_country,
        up.location_city
      FROM brands b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    
    params.push(limit, offset)
    const brandsResult = await query(dataQuery, params)

    // Transform the data to match the expected interface
    const brands: BrandWithUser[] = brandsResult.map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      company_name: row.company_name,
      industry: row.industry,
      website_url: row.website_url,
      description: null, // Brand interface requires this
      logo_url: null, // Not available in current schema
      created_at: row.created_at,
      updated_at: row.updated_at,
      user: {
        id: row.user_id,
        email: row.email,
        role: row.role,
        created_at: row.created_at,
        updated_at: row.updated_at,
        profile: {
          user_id: row.user_id,
          first_name: row.first_name,
          last_name: row.last_name,
          avatar_url: row.avatar_url,
          phone: null,
          location_country: row.location_country,
          location_city: row.location_city,
          bio: null,
          website_url: null,
          is_onboarded: true,
          created_at: row.created_at,
          updated_at: row.updated_at
        }
      }
    }))

    return {
      data: brands,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }

  } catch (error) {
    console.error('Error in getBrands:', error)
    throw new Error('Failed to fetch brands')
  }
}

/**
 * Get brand by ID with full details
 */
export async function getBrandById(id: string): Promise<BrandWithUser | null> {
  try {
    const brandQuery = `
      SELECT 
        b.id,
        b.user_id,
        b.company_name,
        b.industry,
        b.website_url,
        b.created_at,
        b.updated_at,
        u.email,
        u.role,
        up.first_name,
        up.last_name,
        up.avatar_url,
        up.location_country,
        up.location_city,
        up.bio,
        up.phone
      FROM brands b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE b.id = $1
    `
    
    const _result = await query(brandQuery, [id])
    
    if (result.length === 0) {
      return null
    }

    const row = result[0]
    return {
      id: row.id,
      user_id: row.user_id,
      company_name: row.company_name,
      industry: row.industry,
      website_url: row.website_url,
      description: null,
      logo_url: row.logo_url,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user: {
        id: row.user_id,
        email: row.email,
        role: row.role,
        created_at: row.created_at,
        updated_at: row.updated_at,
        profile: {
          user_id: row.user_id,
          first_name: row.first_name,
          last_name: row.last_name,
          avatar_url: row.avatar_url,
          location_country: row.location_country,
          location_city: row.location_city,
          bio: row.bio,
          phone: row.phone,
          website_url: null,
          is_onboarded: true,
          created_at: row.created_at,
          updated_at: row.updated_at
        }
      }
    }

  } catch (error) {
    console.error('Error in getBrandById:', error)
    throw new Error('Failed to fetch brand')
  }
}

/**
 * Create a new brand
 */
export async function createBrand(brandData: Partial<Brand>): Promise<Brand> {
  try {
    const createQuery = `
      INSERT INTO brands (
        user_id, company_name, industry, website_url
      ) VALUES ($1, $2, $3, $4)
      RETURNING *
    `
    
    const _result = await query(createQuery, [
      brandData.user_id,
      brandData.company_name,
      brandData.industry,
      brandData.website_url
    ])

    return result[0]

  } catch (error) {
    console.error('Error in createBrand:', error)
    throw new Error('Failed to create brand')
  }
}

/**
 * Update an existing brand
 */
export async function updateBrand(id: string, brandData: Partial<Brand>): Promise<Brand> {
  try {
    const updateQuery = `
      UPDATE brands 
      SET 
        company_name = COALESCE($2, company_name),
        industry = COALESCE($3, industry),
        website_url = COALESCE($4, website_url),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `
    
    const _result = await query(updateQuery, [
      id,
      brandData.company_name,
      brandData.industry,
      brandData.website_url
    ])

    if (result.length === 0) {
      throw new Error('Brand not found')
    }

    return result[0]

  } catch (error) {
    console.error('Error in updateBrand:', error)
    throw new Error('Failed to update brand')
  }
}

/**
 * Delete a brand
 */
export async function deleteBrand(id: string): Promise<boolean> {
  try {
    const deleteQuery = `DELETE FROM brands WHERE id = $1`
    const _result = await query(deleteQuery, [id])
    
    return result.length > 0

  } catch (error) {
    console.error('Error in deleteBrand:', error)
    throw new Error('Failed to delete brand')
  }
}

/**
 * Get brand statistics for dashboard
 */
export async function getBrandStats(): Promise<{
  totalBrands: number;
  activeBrands: number;
  inactiveBrands: number;
  recentBrands: number;
}> {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as active,
        COUNT(CASE WHEN created_at < NOW() - INTERVAL '30 days' THEN 1 END) as inactive,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as recent
      FROM brands
    `
    
    const _result = await query(statsQuery)
    const stats = result[0]

    return {
      totalBrands: parseInt(stats.total || '0'),
      activeBrands: parseInt(stats.active || '0'),
      inactiveBrands: parseInt(stats.inactive || '0'),
      recentBrands: parseInt(stats.recent || '0')
    }

  } catch (error) {
    console.error('Error in getBrandStats:', error)
    throw new Error('Failed to fetch brand statistics')
  }
}

/**
 * Create brand profile during onboarding
 */
export async function createBrandProfile(
  user_id: string,
  profileData: {
    company_name: string;
    industry: string;
    website_url?: string;
    company_size?: string;
    annual_budget_range?: string;
    preferred_niches?: string[];
    preferred_regions?: string[];
    description?: string;
    logo_url?: string;
  }
): Promise<DatabaseResponse<Brand>> {
  try {
    const _result = await transaction(async (client) => {
      // Insert brand record
      const brandResult = await client.query(`
        INSERT INTO brands (
          user_id, company_name, industry, website_url, 
          company_size, annual_budget_range, preferred_niches, 
          preferred_regions, description, logo_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        user_id,
        profileData.company_name,
        profileData.industry,
        profileData.website_url || null,
        profileData.company_size || null,
        profileData.annual_budget_range || null,
        profileData.preferred_niches || [],
        profileData.preferred_regions || [],
        profileData.description || null,
        profileData.logo_url || null
      ])

      // Update user status to indicate onboarding is complete
      await client.query(`
        UPDATE users 
        SET status = 'ACTIVE', updated_at = NOW()
        WHERE id = $1
      `, [user_id])

      // Update or insert user profile
      await client.query(`
        INSERT INTO user_profiles (
          user_id, is_onboarded
        ) VALUES ($1, $2)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          is_onboarded = $2,
          updated_at = NOW()
      `, [user_id, true])

      return brandResult.rows[0]
    })

    return {
      success: true,
      data: result
    }

  } catch (error) {
    console.error('Error in createBrandProfile:', error)
    return {
      success: false,
      error: 'Failed to create brand profile'
    }
  }
} 