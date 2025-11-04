import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '../../../lib/auth/roles'
import { getBrands, createBrand } from '../../../lib/db/queries/brands'

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check role-based access
    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({
        error: 'Access denied. Only staff and admin users can view brands'
      }, { status: 403 })
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || undefined
    const industry = searchParams.get('industry') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Apply filters
    const filters = {
      search,
      industry
    }

    // Get brands from database
    const result = await getBrands(filters, page, limit)

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    })

  } catch (error) {
    console.error('Error in GET /api/brands:', error)
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check role-based access
    const userRole = await getCurrentUserRole()
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({
        error: 'Access denied. Only staff and admin users can create brands'
      }, { status: 403 })
    }

    // Parse request body
    const body = await req.json()
    const { user_id, company_name, industry, website_url, logo_url } = body

    // Validate required fields
    if (!user_id || !company_name) {
      return NextResponse.json({
        error: 'Missing required fields: user_id and company_name are required'
      }, { status: 400 })
    }

    // Create brand
    const brand = await createBrand({
      user_id,
      company_name,
      industry,
      website_url,
      logo_url
    })

    return NextResponse.json({
      success: true,
      data: brand,
      message: 'Brand created successfully'
    })

  } catch (error) {
    console.error('Error in POST /api/brands:', error)
    return NextResponse.json(
      { error: 'Failed to create brand' },
      { status: 500 }
    )
  }
} 