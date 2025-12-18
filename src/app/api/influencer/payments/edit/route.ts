import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { query } from '@/lib/db/connection'
import { decryptData } from '@/lib/utils/encryption'

// GET - Fetch UNMASKED payment information for editing
export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get influencer ID from users table
    const userResult = await query<{ id: string }>(
      'SELECT id FROM users WHERE clerk_id = $1',
      [userId]
    )

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user_id = userResult[0]?.id

    // Get influencer ID
    const influencerResult = await query<{ id: string }>(
      'SELECT id FROM influencers WHERE user_id = $1',
      [user_id]
    )

    if (influencerResult.length === 0) {
      return NextResponse.json(
        { error: 'Influencer not found' },
        { status: 404 }
      )
    }

    const influencer_id = influencerResult[0]?.id

    if (!influencer_id) {
      return NextResponse.json(
        { error: 'Influencer ID not found' },
        { status: 404 }
      )
    }

    // Get payment information with encrypted details
    const paymentResult = await query(
      `SELECT 
        id,
        payment_method,
        encrypted_details,
        is_verified,
        created_at,
        updated_at
      FROM influencer_payments
      WHERE influencer_id = $1 AND is_verified = true
      ORDER BY created_at DESC
      LIMIT 1`,
      [influencer_id]
    )

    if (paymentResult.length === 0) {
      return NextResponse.json(
        { error: 'No payment information found' },
        { status: 404 }
      )
    }

    const payment = paymentResult[0]

    // Decrypt the payment details
    let decryptedDetails: any
    try {
      const decrypted = decryptData(payment.encrypted_details)
      decryptedDetails = JSON.parse(decrypted)
    } catch (error) {
      console.error('Failed to decrypt payment details:', error)
      return NextResponse.json(
        { error: 'Failed to decrypt payment information' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        payment_method: payment.payment_method,
        payment_details: decryptedDetails
      }
    })

  } catch (error) {
    console.error('Error fetching payment data for editing:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment data' },
      { status: 500 }
    )
  }
}

