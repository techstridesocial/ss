'use client'

import React, { useState, useEffect } from 'react'
import { CreditCard, Shield, Eye, EyeOff, AlertCircle, CheckCircle, Clock, DollarSign } from 'lucide-react'
import { PremiumSectionWrapper } from '../components/PremiumSectionWrapper'

interface PaymentMethodsSectionProps {
  influencer: any
  selectedPlatform?: string
}

interface PaymentInfo {
  id: string
  payment_method: 'PAYPAL' | 'BANK_TRANSFER' | 'WISE' | 'STRIPE'
  is_verified: boolean
  created_at: string
  updated_at: string
  masked_details: {
    email?: string
    accountNumber?: string
    accountHolderName?: string
    bankName?: string
    country?: string
    currency?: string
  }
}

interface PaymentSummary {
  total_earned: number
  pending_amount: number
  paid_out: number
  this_month: number
}

interface PaymentTransaction {
  id: string
  amount: number
  currency: string
  status: string
  transaction_id?: string
  processed_at?: string
  created_at: string
  campaign_name: string
  brand_name: string
}

export function PaymentMethodsSection({ influencer }: PaymentMethodsSectionProps) {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null)
  const [paymentHistory, setPaymentHistory] = useState<PaymentTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  // Fetch payment data from API
  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        setLoading(true)
        
        // Try to fetch real payment data from the database
        // For roster influencers, we can fetch from the API
        if (influencer.isRosterInfluencer && influencer.rosterId) {
          console.log('🔍 Fetching payment data for roster influencer:', influencer.rosterId)
          
          // Fetch payment info
          const paymentInfoResponse = await fetch(`/api/roster/${influencer.rosterId}/payments`, {
            headers: {
              'Content-Type': 'application/json'
            }
          })
          
          if (paymentInfoResponse.ok) {
            const paymentData = await paymentInfoResponse.json()
            if (paymentData.success && paymentData.data) {
              setPaymentInfo(paymentData.data.paymentInfo)
              setPaymentSummary(paymentData.data.paymentSummary)
              setPaymentHistory(paymentData.data.paymentHistory || [])
            }
          }
        } else {
          // Fallback to mock data for discovery influencers
          console.log('📝 Using mock payment data for discovery influencer')
          
          const mockPaymentInfo: PaymentInfo = {
            id: 'pay_1',
            payment_method: 'PAYPAL',
            is_verified: true,
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-20T14:22:00Z',
            masked_details: {
              email: 's****@gmail.com'
            }
          }

          const mockPaymentSummary: PaymentSummary = {
            total_earned: 2450.00,
            pending_amount: 850.00,
            paid_out: 1600.00,
            this_month: 320.00
          }

          setPaymentInfo(mockPaymentInfo)
          setPaymentSummary(mockPaymentSummary)
          setPaymentHistory([])
        }
      } catch (error) {
        console.error('Error fetching payment data:', error)
        // Set empty state on error
        setPaymentInfo(null)
        setPaymentSummary(null)
        setPaymentHistory([])
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentData()
  }, [influencer.id, influencer.isRosterInfluencer, influencer.rosterId])

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'PAYPAL':
        return <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center text-blue-600 font-bold text-xs">P</div>
      case 'BANK_TRANSFER':
        return <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center text-green-600 font-bold text-xs">B</div>
      case 'WISE':
        return <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center text-purple-600 font-bold text-xs">W</div>
      case 'STRIPE':
        return <div className="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center text-indigo-600 font-bold text-xs">S</div>
      default:
        return <CreditCard size={20} className="text-gray-400" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />
      case 'processing':
        return <Clock size={16} className="text-blue-500" />
      case 'failed':
        return <AlertCircle size={16} className="text-red-500" />
      default:
        return <Clock size={16} className="text-gray-400" />
    }
  }

  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <PremiumSectionWrapper title="Payment Methods" defaultOpen={false}>
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </PremiumSectionWrapper>
    )
  }

  return (
    <PremiumSectionWrapper title="Payment Methods" defaultOpen={false}>
      <div className="space-y-6">
        {/* Payment Method Information */}
        {paymentInfo ? (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getPaymentMethodIcon(paymentInfo.payment_method)}
                <div>
                  <h4 className="font-medium text-gray-900">
                    {paymentInfo.payment_method === 'PAYPAL' ? 'PayPal' : 
                     paymentInfo.payment_method === 'BANK_TRANSFER' ? 'Bank Transfer' :
                     paymentInfo.payment_method === 'WISE' ? 'Wise' : 'Stripe'}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {paymentInfo.payment_method === 'PAYPAL' && paymentInfo.masked_details.email}
                    {paymentInfo.payment_method === 'BANK_TRANSFER' && paymentInfo.masked_details.accountHolderName}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {paymentInfo.is_verified ? (
                  <div className="flex items-center text-green-600 text-sm">
                    <CheckCircle size={14} className="mr-1" />
                    Verified
                  </div>
                ) : (
                  <div className="flex items-center text-yellow-600 text-sm">
                    <Clock size={14} className="mr-1" />
                    Pending
                  </div>
                )}
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="p-1 hover:bg-gray-200 rounded"
                  title={showDetails ? 'Hide details' : 'Show details'}
                >
                  {showDetails ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            {showDetails && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Method:</span>
                    <span className="ml-2 font-medium">{paymentInfo.payment_method}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Added:</span>
                    <span className="ml-2 font-medium">{formatDate(paymentInfo.created_at)}</span>
                  </div>
                  {paymentInfo.payment_method === 'BANK_TRANSFER' && (
                    <>
                      <div>
                        <span className="text-gray-500">Bank:</span>
                        <span className="ml-2 font-medium">{paymentInfo.masked_details.bankName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Country:</span>
                        <span className="ml-2 font-medium">{paymentInfo.masked_details.country}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle size={20} className="text-yellow-600 mr-3" />
              <div>
                <h4 className="font-medium text-yellow-800">No Payment Method</h4>
                <p className="text-sm text-yellow-700">This influencer hasn't set up a payment method yet.</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Summary */}
        {paymentSummary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Earned</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(paymentSummary.total_earned)}
                  </p>
                </div>
                <DollarSign size={20} className="text-blue-500" />
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Pending</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {formatCurrency(paymentSummary.pending_amount)}
                  </p>
                </div>
                <Clock size={20} className="text-yellow-500" />
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Paid Out</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(paymentSummary.paid_out)}
                  </p>
                </div>
                <CheckCircle size={20} className="text-green-500" />
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">This Month</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatCurrency(paymentSummary.this_month)}
                  </p>
                </div>
                <CreditCard size={20} className="text-purple-500" />
              </div>
            </div>
          </div>
        )}

        {/* Payment History */}
        {paymentHistory.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Recent Payments</h4>
            <div className="space-y-3">
              {paymentHistory.map((transaction) => (
                <div key={transaction.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(transaction.status)}
                      <div>
                        <p className="font-medium text-gray-900">{transaction.campaign_name}</p>
                        <p className="text-sm text-gray-500">{transaction.brand_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.processed_at ? formatDate(transaction.processed_at) : 'Pending'}
                      </p>
                    </div>
                  </div>
                  {transaction.transaction_id && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Transaction ID: {transaction.transaction_id}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PremiumSectionWrapper>
  )
}
