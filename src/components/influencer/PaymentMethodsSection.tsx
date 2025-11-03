'use client'

import React, { useState, useEffect } from 'react'
import { CreditCard, Shield, Eye, EyeOff, AlertCircle, CheckCircle, Clock, DollarSign } from 'lucide-react'

interface PaymentMethodsSectionProps {
  influencer: any
}

interface PaymentInfo {
  id: string
  payment_method: 'PAYPAL' | 'BANK_TRANSFER'
  is_verified: boolean
  created_at: string
  updated_at: string
  details: {
    // PayPal fields
    email?: string
    firstName?: string
    lastName?: string
    // Bank Transfer fields
    accountType?: string
    accountHolderName?: string
    accountNumber?: string
    routingNumber?: string
    abaCode?: string
    bankName?: string
    swiftCode?: string
    iban?: string
    address?: string
    city?: string
    country?: string
    currency?: string
    vatRegistered?: string
  }
}

interface PaymentSummary {
  total_earned: number
  pending_amount: number
  paid_out: number
  this_month: number
}

export function PaymentMethodsSection({ influencer }: PaymentMethodsSectionProps) {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  // Fetch payment data from API
  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        setLoading(true)
        
        // Fetch payment data for roster influencer
        if (influencer?.id) {
          console.log('🔍 Fetching payment data for roster influencer:', influencer.id)
          
          const paymentInfoResponse = await fetch(`/api/roster/${influencer.id}/payments`, {
            headers: {
              'Content-Type': 'application/json'
            }
          })
          
          if (paymentInfoResponse.ok) {
            const paymentData = await paymentInfoResponse.json()
            if (paymentData.success && paymentData.data) {
              setPaymentInfo(paymentData.data.paymentInfo)
              setPaymentSummary(paymentData.data.paymentSummary)
            }
          }
        }
      } catch (_error) {
        console.error('Error fetching payment data:', error)
        setPaymentInfo(null)
        setPaymentSummary(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentData()
  }, [influencer?.id])

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'PAYPAL':
        return <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center text-blue-600 font-bold text-xs">P</div>
      case 'BANK_TRANSFER':
        return <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center text-green-600 font-bold text-xs">B</div>
      default:
        return <CreditCard size={20} className="text-gray-400" />
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
          <div className="flex items-center space-x-2">
            <Shield size={16} className="text-gray-400" />
            <span className="text-sm text-gray-500">Secure</span>
          </div>
        </div>

        <div className="space-y-4">
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
                      {paymentInfo.payment_method === 'PAYPAL' && paymentInfo.details.email}
                      {paymentInfo.payment_method === 'BANK_TRANSFER' && paymentInfo.details.accountHolderName}
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

          {/* Detailed Payment Information */}
          {paymentInfo && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Payment Details</h4>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Method:</span>
                  <span className="font-medium">{paymentInfo.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Added:</span>
                  <span className="font-medium">{formatDate(paymentInfo.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Updated:</span>
                  <span className="font-medium">{formatDate(paymentInfo.updated_at)}</span>
                </div>
                
                {/* PayPal Details */}
                {paymentInfo.payment_method === 'PAYPAL' && (
                  <>
                    {paymentInfo.details.email && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">PayPal Email:</span>
                        <span className="font-medium">{paymentInfo.details.email}</span>
                      </div>
                    )}
                    {paymentInfo.details.firstName && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">First Name:</span>
                        <span className="font-medium">{paymentInfo.details.firstName}</span>
                      </div>
                    )}
                    {paymentInfo.details.lastName && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Last Name:</span>
                        <span className="font-medium">{paymentInfo.details.lastName}</span>
                      </div>
                    )}
                  </>
                )}
                
                {/* Bank Transfer Details */}
                {paymentInfo.payment_method === 'BANK_TRANSFER' && (
                  <>
                    {paymentInfo.details.accountType && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Account Type:</span>
                        <span className="font-medium">{paymentInfo.details.accountType}</span>
                      </div>
                    )}
                    {paymentInfo.details.accountHolderName && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Account Holder:</span>
                        <span className="font-medium">{paymentInfo.details.accountHolderName}</span>
                      </div>
                    )}
                    {paymentInfo.details.accountNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Account Number:</span>
                        <span className="font-medium">{paymentInfo.details.accountNumber}</span>
                      </div>
                    )}
                    {paymentInfo.details.routingNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Routing Number:</span>
                        <span className="font-medium">{paymentInfo.details.routingNumber}</span>
                      </div>
                    )}
                    {paymentInfo.details.bankName && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Bank Name:</span>
                        <span className="font-medium">{paymentInfo.details.bankName}</span>
                      </div>
                    )}
                    {paymentInfo.details.swiftCode && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">SWIFT Code:</span>
                        <span className="font-medium">{paymentInfo.details.swiftCode}</span>
                      </div>
                    )}
                    {paymentInfo.details.iban && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">IBAN:</span>
                        <span className="font-medium">{paymentInfo.details.iban}</span>
                      </div>
                    )}
                    {paymentInfo.details.address && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Address:</span>
                        <span className="font-medium">{paymentInfo.details.address}</span>
                      </div>
                    )}
                    {paymentInfo.details.city && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">City:</span>
                        <span className="font-medium">{paymentInfo.details.city}</span>
                      </div>
                    )}
                    {paymentInfo.details.country && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Country:</span>
                        <span className="font-medium">{paymentInfo.details.country}</span>
                      </div>
                    )}
                    {paymentInfo.details.currency && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Currency:</span>
                        <span className="font-medium">{paymentInfo.details.currency}</span>
                      </div>
                    )}
                    {paymentInfo.details.vatRegistered && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">VAT Registered:</span>
                        <span className="font-medium">{paymentInfo.details.vatRegistered}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
