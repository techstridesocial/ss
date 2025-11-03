import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { getDatabase } from '@/lib/db/connection'

export async function GET(
  request: NextRequest,
  { params }: { params: { influencerId: string } }
) {
  try {
    // Authenticate
    await auth.protect()
    const userRole = await getCurrentUserRole()

    // Verify user has permission to view campaigns
    if (!userRole || !['INFLUENCER_SIGNED', 'INFLUENCER_PARTNERED', 'STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Unauthorized to view campaigns' },
        { status: 403 }
      )
    }

    const { influencerId } = params

    if (!influencerId) {
      return NextResponse.json(
        { error: 'Influencer ID is required' },
        { status: 400 }
      )
    }

    // Additional permission check: influencers can only see their own campaigns
    if (['INFLUENCER_SIGNED', 'INFLUENCER_PARTNERED'].includes(userRole)) {
      const { userId } = await auth()
      if (!userId) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Verify the influencer ID belongs to the current user
      const db = getDatabase()
      const userCheck = await db.query(`
        SELECT i.id 
        FROM influencers i 
        JOIN users u ON i.user_id = u.id 
        WHERE u.clerk_id = $1 AND i.id = $2
      `, [userId, influencerId])

      if (userCheck.rows.length === 0) {
        return NextResponse.json(
          { error: 'You can only view your own campaigns' },
          { status: 403 }
        )
      }
    }

    // Get campaigns assigned to the influencer
    const db = getDatabase()
    const _result = await db.query(`
      SELECT 
        c.id,
        c.name as campaign_name,
        c.description,
        c.status,
        c.budget,
        c.start_date,
        c.end_date,
        c.deliverables,
        c.created_at,
        
        -- Campaign influencer details
        ci.status as participation_status,
        ci.compensation_amount,
        ci.deadline,
        ci.product_shipped,
        ci.content_posted,
        ci.payment_released,
        ci.notes,
        ci.created_at as assigned_at,
        ci.accepted_at,
        ci.declined_at,
        
        -- Brand information
        b.company_name as brand_name,
        b.industry,
        
        -- Quotation reference (if campaign was created from quotation)
        q.brand_name as quotation_brand_name
        
      FROM campaign_influencers ci
      JOIN campaigns c ON ci.campaign_id = c.id
      LEFT JOIN brands b ON c.brand_id = b.id
      LEFT JOIN quotations q ON c.quotation_id = q.id
      WHERE ci.influencer_id = $1
      ORDER BY ci.created_at DESC
    `, [influencerId])

    // Format the campaigns for the response
    const campaigns = result.rows.map((row: any) => ({
      id: row.id,
      campaign_name: row.campaign_name,
      brand_name: row.brand_name || row.quotation_brand_name || 'Unknown Brand',
      description: row.description,
      amount: row.compensation_amount || row.budget || 0,
      deadline: row.deadline || row.end_date,
      deliverables: row.deliverables ? JSON.parse(row.deliverables) : [],
      status: row.participation_status === 'accepted' ? 'active' : 
              row.participation_status === 'declined' ? 'declined' :
              row.participation_status === 'pending' ? 'pending' : 'active',
      campaign_status: row.status,
      assigned_at: row.assigned_at,
      accepted_at: row.accepted_at,
      declined_at: row.declined_at,
      
      // Progress tracking
      product_shipped: row.product_shipped || false,
      content_posted: row.content_posted || false,
      payment_released: row.payment_released || false,
      
      // Additional details
      industry: row.industry,
      notes: row.notes,
      created_at: row.created_at
    }))

    return NextResponse.json({
      success: true,
      campaigns,
      count: campaigns.length
    })

  } catch (error) {
    console.error('Error fetching influencer campaigns:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
} 