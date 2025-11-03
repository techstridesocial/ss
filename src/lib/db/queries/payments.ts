import { query } from '../connection'
import { encryptData, decryptData, maskSensitiveData } from '../../utils/encryption'

export interface DatabaseResponse<T> {
  success: boolean
  data?: T
  error?: string
  message: string
}

export interface PayPalDetails {
  email: string
  firstName: string
  lastName: string
}

export interface BankDetails {
  accountHolderName: string
  accountNumber: string
  routingNumber: string
  bankName: string
  swiftCode: string
  iban: string
  address: string
  city: string
  country: string
  currency: string
}

export interface PaymentInfo {
  id: string
  payment_method: 'PAYPAL' | 'BANK_TRANSFER'
  is_verified: boolean
  created_at: Date
  updated_at: Date
  // Masked data for display
  masked_details: {
    email?: string
    accountNumber?: string
    accountHolderName?: string
  }
}

export interface PaymentSummary {
  total_earned: number
  pending_amount: number
  paid_out: number
  this_month: number
}

/**
 * Get payment information for an influencer
 */
export async function getPaymentInfo(influencerId: string): Promise<DatabaseResponse<PaymentInfo | null>> {
  try {
    const queryText = `
      SELECT 
        id,
        payment_method,
        encrypted_details,
        is_verified,
        created_at,
        updated_at
      FROM influencer_payments
      WHERE influencer_id = $1 AND is_verified = true
      ORDER BY created_at DESC
      LIMIT 1
    `

    const _result = await query(queryText, [influencerId])

    if (result.length === 0) {
      return {
        success: true,
        data: null,
        message: 'No payment information found'
      }
    }

    const payment = result[0]
    
    // Decrypt the payment details
    let decryptedDetails: PayPalDetails | BankDetails
    try {
      const decrypted = decryptData(payment.encrypted_details)
      decryptedDetails = JSON.parse(decrypted)
    } catch (_error) {
      console.error('Failed to decrypt payment details:', error)
      console.error('Payment record ID:', payment.id)
      console.error('Encrypted details (first 50 chars):', payment.encrypted_details?.substring(0, 50))
      
      // Instead of failing completely, return null to indicate no valid payment info
      return {
        success: true,
        data: null,
        message: 'Payment information corrupted - please re-enter your payment details'
      }
    }

    // Create masked version for display
    const maskedDetails: any = {}
    if (payment.payment_method === 'PAYPAL') {
      const paypal = decryptedDetails as PayPalDetails
      maskedDetails.email = maskSensitiveData(paypal.email, 'email')
    } else if (payment.payment_method === 'BANK_TRANSFER') {
      const bank = decryptedDetails as BankDetails
      maskedDetails.accountNumber = maskSensitiveData(bank.accountNumber, 'bank')
      maskedDetails.accountHolderName = bank.accountHolderName
    }

    const paymentInfo: PaymentInfo = {
      id: payment.id,
      payment_method: payment.payment_method,
      is_verified: payment.is_verified,
      created_at: payment.created_at,
      updated_at: payment.updated_at,
      masked_details: maskedDetails
    }

    return {
      success: true,
      data: paymentInfo,
      message: 'Payment information retrieved successfully'
    }

  } catch (_error) {
    console.error('Error getting payment info:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to retrieve payment information'
    }
  }
}

/**
 * Update or create payment information for an influencer
 */
export async function updatePaymentInfo(
  influencerId: string, 
  paymentMethod: 'PAYPAL' | 'BANK_TRANSFER', 
  paymentDetails: PayPalDetails | BankDetails
): Promise<DatabaseResponse<{ id: string }>> {
  try {
    // Encrypt the payment details
    const encryptedDetails = encryptData(JSON.stringify(paymentDetails))

    // Use UPSERT to either insert new or update existing
    const queryText = `
      INSERT INTO influencer_payments (
        influencer_id, 
        payment_method, 
        encrypted_details, 
        is_verified
      ) VALUES ($1, $2, $3, true)
      ON CONFLICT (influencer_id) 
      DO UPDATE SET 
        payment_method = $2,
        encrypted_details = $3,
        is_verified = true,
        updated_at = NOW()
      RETURNING id
    `

    const _result = await query(queryText, [influencerId, paymentMethod, encryptedDetails])

    if (result.length === 0) {
      return {
        success: false,
        error: 'Failed to save payment information',
        message: 'No payment record created'
      }
    }

    return {
      success: true,
      data: { id: result[0].id },
      message: 'Payment information saved successfully'
    }

  } catch (_error) {
    console.error('Error updating payment info:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to save payment information'
    }
  }
}

/**
 * Get payment summary statistics for an influencer
 */
export async function getPaymentSummary(influencerId: string): Promise<DatabaseResponse<PaymentSummary>> {
  try {
    // Get payment transactions for this influencer
    const queryText = `
      SELECT 
        pt.amount,
        pt.currency,
        pt.status,
        pt.created_at
      FROM payment_transactions pt
      JOIN campaign_influencers ci ON pt.campaign_influencer_id = ci.id
      WHERE ci.influencer_id = $1
      ORDER BY pt.created_at DESC
    `

    const transactions = await query(queryText, [influencerId])

    // Calculate summary statistics
    let totalEarned = 0
    let pendingAmount = 0
    let paidOut = 0
    let thisMonth = 0

    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    transactions.forEach((transaction: any) => {
      const amount = parseFloat(transaction.amount) || 0
      const transactionDate = new Date(transaction.created_at)

      if (transaction.status === 'completed') {
        totalEarned += amount
        paidOut += amount
        
        if (transactionDate >= thisMonthStart) {
          thisMonth += amount
        }
      } else if (transaction.status === 'pending' || transaction.status === 'processing') {
        pendingAmount += amount
      }
    })

    const summary: PaymentSummary = {
      total_earned: totalEarned,
      pending_amount: pendingAmount,
      paid_out: paidOut,
      this_month: thisMonth
    }

    return {
      success: true,
      data: summary,
      message: 'Payment summary retrieved successfully'
    }

  } catch (_error) {
    console.error('Error getting payment summary:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to retrieve payment summary'
    }
  }
}

/**
 * Get payment history for an influencer
 */
export async function getPaymentHistory(influencerId: string): Promise<DatabaseResponse<any[]>> {
  try {
    const queryText = `
      SELECT 
        pt.id,
        pt.amount,
        pt.currency,
        pt.status,
        pt.transaction_id,
        pt.processed_at,
        pt.created_at,
        c.name as campaign_name,
        c.brand as brand_name
      FROM payment_transactions pt
      JOIN campaign_influencers ci ON pt.campaign_influencer_id = ci.id
      JOIN campaigns c ON ci.campaign_id = c.id
      WHERE ci.influencer_id = $1
      ORDER BY pt.created_at DESC
      LIMIT 50
    `

    const transactions = await query(queryText, [influencerId])

    const history = transactions.map((transaction: any) => ({
      id: transaction.id,
      amount: parseFloat(transaction.amount) || 0,
      currency: transaction.currency,
      status: transaction.status,
      transaction_id: transaction.transaction_id,
      processed_at: transaction.processed_at,
      created_at: transaction.created_at,
      campaign_name: transaction.campaign_name,
      brand_name: transaction.brand_name
    }))

    return {
      success: true,
      data: history,
      message: 'Payment history retrieved successfully'
    }

  } catch (_error) {
    console.error('Error getting payment history:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to retrieve payment history'
    }
  }
} 