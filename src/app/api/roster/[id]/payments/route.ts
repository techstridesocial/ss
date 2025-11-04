import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getCurrentUserRole } from '@/lib/auth/roles'
import { getDatabase } from '@/lib/db/connection'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate
    await auth.protect()
    const userRole = await getCurrentUserRole()

    // Verify user has permission to view payment data
    if (!userRole || !['STAFF', 'ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Unauthorized to view payment data' },
        { status: 403 }
      )
    }

    const { id: influencerId } = params

    if (!influencerId) {
      return NextResponse.json(
        { error: 'Influencer ID is required' },
        { status: 400 }
      )
    }

    const db = getDatabase()

    // Get payment information
    const paymentInfoResult = await db.query(`
      SELECT 
        ip.id,
        ip.payment_method,
        ip.encrypted_details,
        ip.is_verified,
        ip.created_at,
        ip.updated_at
      FROM influencer_payments ip
      WHERE ip.influencer_id = $1
      ORDER BY ip.created_at DESC
      LIMIT 1
    `, [influencerId])

    let paymentInfo = null
    if (paymentInfoResult.rows.length > 0) {
      const payment = paymentInfoResult.rows[0]
      
      // Parse the encrypted details (in real app, this would be decrypted)
      let unmaskedDetails = {}
      try {
        const details = JSON.parse(payment.encrypted_details)
        
        // Return unmasked details for display
        unmaskedDetails = details
      } catch (error) {
        console.error('Error parsing payment details:', error)
      }

      paymentInfo = {
        id: payment.id,
        payment_method: payment.payment_method,
        is_verified: payment.is_verified,
        created_at: payment.created_at,
        updated_at: payment.updated_at,
        details: unmaskedDetails
      }
    }

    // Get payment summary (mock data for now)
    const paymentSummary = {
      total_earned: 2450.00,
      pending_amount: 850.00,
      paid_out: 1600.00,
      this_month: 320.00
    }

    // Get payment history (mock data for now)
    const paymentHistory = [
      {
        id: 'txn_1',
        amount: 850.00,
        currency: 'GBP',
        status: 'completed',
        transaction_id: 'PP-123456789',
        processed_at: '2024-01-18T09:15:00Z',
        created_at: '2024-01-15T10:30:00Z',
        campaign_name: 'Spring Fashion Campaign',
        brand_name: 'StyleCo'
      },
      {
        id: 'txn_2',
        amount: 750.00,
        currency: 'GBP',
        status: 'completed',
        transaction_id: 'PP-987654321',
        processed_at: '2024-01-10T14:22:00Z',
        created_at: '2024-01-08T11:45:00Z',
        campaign_name: 'Wellness Products Launch',
        brand_name: 'HealthPlus'
      }
    ]

    return NextResponse.json({
      success: true,
      data: {
        paymentInfo,
        paymentSummary,
        paymentHistory
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

// Helper functions for masking sensitive data
function maskEmail(email: string): string {
  if (!email) return ''
  const [localPart, domain] = email.split('@')
  if (localPart.length <= 2) return email
  return localPart.charAt(0) + '*'.repeat(localPart.length - 2) + localPart.charAt(localPart.length - 1) + '@' + domain
}

function maskAccountNumber(accountNumber: string): string {
  if (!accountNumber) return ''
  if (accountNumber.length <= 4) return '*'.repeat(accountNumber.length)
  return '*'.repeat(accountNumber.length - 4) + accountNumber.slice(-4)
}
