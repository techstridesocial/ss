/**
 * GET Platform Username
 * Simple endpoint to get username for a specific platform
 * Used for fetching Modash analytics
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { query } from '@/lib/db/connection'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is staff or admin
    const client = await clerkClient()
    const clerkUser = await client.users.getUser(userId)
    const userRole = clerkUser.publicMetadata?.role as string

    if (!userRole || !['STAFF', 'ADMIN', 'BRAND'].includes(userRole)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 })
    }

    // Await params in Next.js 15
    const { id } = await params
    const influencerId = id

    // Get platform from query params
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')

    if (!platform) {
      return NextResponse.json({ success: false, error: 'Platform parameter is required' }, { status: 400 })
    }

    // Simple query: just get username for this platform
    const result = await query(`
      SELECT username
      FROM influencer_platforms
      WHERE influencer_id = $1 
        AND LOWER(platform::text) = LOWER($2)
      LIMIT 1
    `, [influencerId, platform])

    if (result.length === 0 || !result[0].username) {
      return NextResponse.json({ 
        success: false, 
        username: null,
        error: 'Platform username not found'
      })
    }

    return NextResponse.json({
      success: true,
      username: result[0].username
    })

  } catch (error) {
    console.error('❌ Error fetching platform username:', error)
    
    return NextResponse.json(
      { 
        success: false,
        username: null,
        error: 'Failed to fetch platform username',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 500 }
    )
  }
}

