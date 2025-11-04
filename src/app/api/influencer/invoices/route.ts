import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { query, queryOne } from '@/lib/db/connection'

// GET - Get all invoices for the current influencer
export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user ID from Clerk ID
    const userResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId]
    )

    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user_id = userResult[0]?.id

    // Get influencer ID
    const influencerResult = await query<{ id: string }>(
      'SELECT id FROM influencers WHERE user_id = $1',
      [user_id]
    )

    if (influencerResult.length === 0) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
    }

    const influencer_id = influencerResult[0]?.id

    // Get all invoices for this influencer
    const invoices = await query(`
      SELECT 
        ii.*,
        c.name as campaign_name,
        c.brand_name,
        c.status as campaign_status
      FROM influencer_invoices ii
      LEFT JOIN campaigns c ON ii.campaign_id = c.id
      WHERE ii.influencer_id = $1
      ORDER BY ii.created_at DESC
    `, [influencer_id])

    return NextResponse.json({ invoices })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

// POST - Create a new invoice
export async function POST(_request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await _request.json()
    const {
      campaign_id,
      creator_name,
      creator_address,
      creator_email,
      creator_phone,
      campaign_reference,
      brand_name,
      content_description,
      content_link,
      agreed_price,
      currency = 'GBP',
      vat_required = false,
      vat_rate = 20.00,
      payment_terms = 'Net 30'
    } = body

    // Validate required fields
    if (!campaign_id || !creator_name || !campaign_reference || !brand_name || 
        !content_description || !content_link || !agreed_price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user ID from Clerk ID
    const userResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId]
    )

    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user_id = userResult[0]?.id

    // Get influencer ID
    const influencerResult = await query<{ id: string }>(
      'SELECT id FROM influencers WHERE user_id = $1',
      [user_id]
    )

    if (influencerResult.length === 0) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
    }

    const influencer_id = influencerResult[0]?.id

    // Verify campaign exists and belongs to this influencer
    const campaignResult = await queryOne(`
      SELECT id FROM campaign_influencers 
      WHERE campaign_id = $1 AND influencer_id = $2
    `, [campaign_id, influencer_id])

    if (!campaignResult) {
      return NextResponse.json(
        { error: 'Campaign not found or not assigned to this influencer' },
        { status: 404 }
      )
    }

    // Create the invoice
    const invoiceResult = await queryOne(`
      INSERT INTO influencer_invoices (
        influencer_id,
        campaign_id,
        creator_name,
        creator_address,
        creator_email,
        creator_phone,
        campaign_reference,
        brand_name,
        content_description,
        content_link,
        agreed_price,
        currency,
        vat_required,
        vat_rate,
        payment_terms,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `, [
      influencer_id,
      campaign_id,
      creator_name,
      creator_address,
      creator_email,
      creator_phone,
      campaign_reference,
      brand_name,
      content_description,
      content_link,
      agreed_price,
      currency,
      vat_required,
      vat_rate,
      payment_terms,
      user_id
    ])

    return NextResponse.json({ 
      message: 'Invoice created successfully',
      invoice: invoiceResult 
    })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}
