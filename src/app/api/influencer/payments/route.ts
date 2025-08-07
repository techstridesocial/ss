import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { query } from '@/lib/db/connection'
import { 
  getPaymentInfo, 
  getPaymentSummary, 
  getPaymentHistory, 
  updatePaymentInfo,
  PayPalDetails,
  BankDetails
} from '@/lib/db/queries/payments'

// GET - Fetch payment information and summary
export async function GET(request: NextRequest) {
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

    // Get payment information, summary, and history
    const [paymentInfoResult, paymentSummaryResult, paymentHistoryResult] = await Promise.all([
      getPaymentInfo(influencer_id),
      getPaymentSummary(influencer_id),
      getPaymentHistory(influencer_id)
    ])

    if (!paymentInfoResult.success) {
      return NextResponse.json(
        { error: paymentInfoResult.error || 'Failed to fetch payment information' },
        { status: 500 }
      )
    }

    if (!paymentSummaryResult.success) {
      return NextResponse.json(
        { error: paymentSummaryResult.error || 'Failed to fetch payment summary' },
        { status: 500 }
      )
    }

    if (!paymentHistoryResult.success) {
      return NextResponse.json(
        { error: paymentHistoryResult.error || 'Failed to fetch payment history' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        payment_info: paymentInfoResult.data,
        payment_summary: paymentSummaryResult.data,
        payment_history: paymentHistoryResult.data
      }
    })

  } catch (error) {
    console.error('Error fetching payment data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment data' },
      { status: 500 }
    )
  }
}

// POST - Update payment information
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { payment_method, payment_details } = body

    if (!payment_method || !payment_details) {
      return NextResponse.json(
        { error: 'Payment method and details are required' },
        { status: 400 }
      )
    }

    if (!['PAYPAL', 'BANK_TRANSFER'].includes(payment_method)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      )
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

    // Validate payment details based on method
    if (payment_method === 'PAYPAL') {
      const paypalDetails = payment_details as PayPalDetails
      if (!paypalDetails.email || !paypalDetails.firstName || !paypalDetails.lastName) {
        return NextResponse.json(
          { error: 'PayPal details incomplete' },
          { status: 400 }
        )
      }
      if (!paypalDetails.email.includes('@')) {
        return NextResponse.json(
          { error: 'Invalid PayPal email' },
          { status: 400 }
        )
      }
    } else if (payment_method === 'BANK_TRANSFER') {
      const bankDetails = payment_details as BankDetails
      if (!bankDetails.accountHolderName || !bankDetails.accountNumber || !bankDetails.routingNumber) {
        return NextResponse.json(
          { error: 'Bank details incomplete' },
          { status: 400 }
        )
      }
    }

    // Update payment information
    const updateResult = await updatePaymentInfo(
      influencer_id,
      payment_method as 'PAYPAL' | 'BANK_TRANSFER',
      payment_details
    )

    if (!updateResult.success) {
      return NextResponse.json(
        { error: updateResult.error || 'Failed to save payment information' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { id: updateResult.data?.id },
      message: 'Payment information saved successfully'
    })

  } catch (error) {
    console.error('Error updating payment information:', error)
    return NextResponse.json(
      { error: 'Failed to update payment information' },
      { status: 500 }
    )
  }
} 