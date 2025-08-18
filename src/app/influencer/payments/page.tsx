'use client'

import React, { useState, useEffect } from 'react'
import { InfluencerProtectedRoute } from '../../../components/auth/ProtectedRoute'
import ModernInfluencerHeader from '../../../components/nav/ModernInfluencerHeader'
import { CreditCard, DollarSign, Clock, CheckCircle, AlertTriangle, Plus, Edit3, X, Save, Loader2 } from 'lucide-react'

interface PayPalDetails {
  email: string
  firstName: string
  lastName: string
}

interface BankDetails {
  accountHolderName: string
  accountNumber: string
  routingNumber: string // Changed from sortCode to routingNumber for international use
  bankName: string
  swiftCode: string // Added SWIFT code for international transfers
  iban: string // Added IBAN for European/international banking
  address: string
  city: string
  country: string // Changed from postcode to country
  currency: string // Added currency preference
}

interface PaymentInfo {
  id: string
  payment_method: 'PAYPAL' | 'BANK_TRANSFER'
  is_verified: boolean
  created_at: string
  updated_at: string
  masked_details: {
    email?: string
    accountNumber?: string
    accountHolderName?: string
  }
}

interface PaymentSummary {
  total_earned: number
  pending_amount: number
  paid_out: number
  this_month: number
}

interface PaymentHistoryItem {
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

export default function InfluencerPayments() {
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null)
  const [showPayPalForm, setShowPayPalForm] = useState(false)
  const [showBankForm, setShowBankForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // Payment data from API
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary>({
    total_earned: 0,
    pending_amount: 0,
    paid_out: 0,
    this_month: 0
  })
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([])
  
  // PayPal form state
  const [paypalDetails, setPaypalDetails] = useState<PayPalDetails>({
    email: '',
    firstName: '',
    lastName: ''
  })

  // Bank form state
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountHolderName: '',
    accountNumber: '',
    routingNumber: '',
    bankName: '',
    swiftCode: '',
    iban: '',
    address: '',
    city: '',
    country: '',
    currency: 'GBP' // Default to GBP
  })

  // Saved details (simulated)
  const [savedPaypalDetails, setSavedPaypalDetails] = useState<PayPalDetails | null>(null)
  const [savedBankDetails, setSavedBankDetails] = useState<BankDetails | null>(null)

  // Fetch payment data on component mount
  useEffect(() => {
    fetchPaymentData()
  }, [])

  const fetchPaymentData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/influencer/payments')
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment data')
      }
      
      const result = await response.json()
      
      if (result.success) {
        setPaymentInfo(result.data.payment_info)
        setPaymentSummary(result.data.payment_summary)
        setPaymentHistory(result.data.payment_history)
        
        // Set payment method based on saved info
        if (result.data.payment_info) {
          setPaymentMethod(result.data.payment_info.payment_method.toLowerCase())
        }
      }
    } catch (error) {
      console.error('Error fetching payment data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayPalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!paypalDetails.email || !paypalDetails.firstName || !paypalDetails.lastName) {
      alert('Please fill in all required fields')
      return
    }

    if (!paypalDetails.email.includes('@')) {
      alert('Please enter a valid email address')
      return
    }

    try {
      setIsSaving(true)
      
      const response = await fetch('/api/influencer/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_method: 'PAYPAL',
          payment_details: paypalDetails
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save PayPal details')
      }

      const result = await response.json()
      
      if (result.success) {
        // Save details locally
    setSavedPaypalDetails(paypalDetails)
    setPaymentMethod('paypal')
    setShowPayPalForm(false)
    setIsEditing(false)
    
    // Reset form
    setPaypalDetails({ email: '', firstName: '', lastName: '' })
        
        // Refresh payment data
        await fetchPaymentData()
    
    alert('PayPal details saved successfully!')
      } else {
        throw new Error(result.error || 'Failed to save PayPal details')
      }
    } catch (error) {
      console.error('Error saving PayPal details:', error)
      alert(error instanceof Error ? error.message : 'Failed to save PayPal details')
    } finally {
      setIsSaving(false)
    }
  }

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!bankDetails.accountHolderName || !bankDetails.accountNumber || !bankDetails.routingNumber) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setIsSaving(true)
      
      const response = await fetch('/api/influencer/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_method: 'BANK_TRANSFER',
          payment_details: bankDetails
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save bank details')
      }

      const result = await response.json()
      
      if (result.success) {
        // Save details locally
    setSavedBankDetails(bankDetails)
    setPaymentMethod('bank')
    setShowBankForm(false)
    setIsEditing(false)
    
    // Reset form
    setBankDetails({
      accountHolderName: '',
      accountNumber: '',
      routingNumber: '',
      bankName: '',
      swiftCode: '',
      iban: '',
      address: '',
      city: '',
      country: '',
      currency: 'GBP'
    })
        
        // Refresh payment data
        await fetchPaymentData()
    
    alert('Bank details saved successfully!')
      } else {
        throw new Error(result.error || 'Failed to save bank details')
      }
    } catch (error) {
      console.error('Error saving bank details:', error)
      alert(error instanceof Error ? error.message : 'Failed to save bank details')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    if (paymentMethod === 'paypal' && savedPaypalDetails) {
      setPaypalDetails(savedPaypalDetails)
      setShowPayPalForm(true)
    } else if (paymentMethod === 'bank' && savedBankDetails) {
      setBankDetails(savedBankDetails)
      setShowBankForm(true)
    }
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setShowPayPalForm(false)
    setShowBankForm(false)
    // Reset forms
    setPaypalDetails({ email: '', firstName: '', lastName: '' })
    setBankDetails({
      accountHolderName: '',
      accountNumber: '',
      routingNumber: '',
      bankName: '',
      swiftCode: '',
      iban: '',
      address: '',
      city: '',
      country: '',
      currency: 'GBP'
    })
  }
  
  return (
    <InfluencerProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <ModernInfluencerHeader />
        
        <div className="px-4 lg:px-6 pb-8">
          {/* Payment Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Total Earned</h3>
                  {isLoading ? (
                    <div className="flex items-center mt-2">
                      <Loader2 className="h-6 w-6 text-green-600 animate-spin mr-2" />
                      <span className="text-gray-500">Loading...</span>
                    </div>
                  ) : (
                    <p className="text-3xl font-bold text-green-600 mt-2">£{paymentSummary.total_earned.toFixed(2)}</p>
                  )}
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Pending</h3>
                  {isLoading ? (
                    <div className="flex items-center mt-2">
                      <Loader2 className="h-6 w-6 text-orange-600 animate-spin mr-2" />
                      <span className="text-gray-500">Loading...</span>
                    </div>
                  ) : (
                    <p className="text-3xl font-bold text-orange-600 mt-2">£{paymentSummary.pending_amount.toFixed(2)}</p>
                  )}
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Paid Out</h3>
                  {isLoading ? (
                    <div className="flex items-center mt-2">
                      <Loader2 className="h-6 w-6 text-blue-600 animate-spin mr-2" />
                      <span className="text-gray-500">Loading...</span>
                    </div>
                  ) : (
                    <p className="text-3xl font-bold text-blue-600 mt-2">£{paymentSummary.paid_out.toFixed(2)}</p>
                  )}
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">This Month</h3>
                  {isLoading ? (
                    <div className="flex items-center mt-2">
                      <Loader2 className="h-6 w-6 text-purple-600 animate-spin mr-2" />
                      <span className="text-gray-500">Loading...</span>
                    </div>
                  ) : (
                    <p className="text-3xl font-bold text-purple-600 mt-2">£{paymentSummary.this_month.toFixed(2)}</p>
                  )}
                </div>
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">£</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Payment Method</h3>
              {paymentMethod && !isEditing && (
                <button 
                  onClick={handleEdit}
                  className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-spin" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Loading payment information...</h4>
              </div>
            ) : !paymentInfo ? (
              <div className="text-center py-8">
                <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No payment method added</h4>
                <p className="text-gray-600 mb-6">
                  Add your payment details to receive payments from campaigns
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => setShowPayPalForm(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add PayPal
                  </button>
                  <button 
                    onClick={() => setShowBankForm(true)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Bank Account
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {paymentInfo.payment_method === 'PAYPAL' ? 'PayPal Account' : 'Bank Account'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {paymentInfo.payment_method === 'PAYPAL' 
                          ? paymentInfo.masked_details.email
                          : paymentInfo.masked_details.accountNumber
                        }
                      </p>
                    </div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            )}

            {/* PayPal Form */}
            {showPayPalForm && (
              <div className="mt-6 border border-gray-200 rounded-lg p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">PayPal Details</h4>
                  <button 
                    onClick={cancelEdit}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <form onSubmit={handlePayPalSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PayPal Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={paypalDetails.email}
                      onChange={(e) => setPaypalDetails(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="your-email@example.com"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={paypalDetails.firstName}
                        onChange={(e) => setPaypalDetails(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={paypalDetails.lastName}
                        onChange={(e) => setPaypalDetails(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                      <Save className="h-4 w-4 mr-2" />
                      )}
                      {isSaving ? 'Saving...' : 'Save PayPal Details'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={isSaving}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Bank Account Form */}
            {showBankForm && (
              <div className="mt-6 border border-gray-200 rounded-lg p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Bank Account Details</h4>
                  <button 
                    onClick={cancelEdit}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <form onSubmit={handleBankSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Holder Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={bankDetails.accountHolderName}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, accountHolderName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Full name as shown on account"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Number *
                      </label>
                                              <input
                          type="text"
                          required
                          value={bankDetails.accountNumber}
                          onChange={(e) => setBankDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Account number (varies by country)"
                        />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Routing Number *
                      </label>
                                              <input
                          type="text"
                          required
                          value={bankDetails.routingNumber}
                          onChange={(e) => setBankDetails(prev => ({ ...prev, routingNumber: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Routing/Sort Code (varies by country)"
                        />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={bankDetails.bankName}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, bankName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Barclays, HSBC, Lloyds"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SWIFT Code
                    </label>
                    <input
                      type="text"
                      value={bankDetails.swiftCode}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, swiftCode: e.target.value.toUpperCase() }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="BARCGB22"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IBAN
                    </label>
                    <input
                      type="text"
                      value={bankDetails.iban}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, iban: e.target.value.toUpperCase() }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="GB33BUKB20201555555555"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={bankDetails.address}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your address"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={bankDetails.city}
                        onChange={(e) => setBankDetails(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="London"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={bankDetails.country}
                        onChange={(e) => setBankDetails(prev => ({ ...prev, country: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="United Kingdom"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency Preference
                    </label>
                                         <select
                       value={bankDetails.currency}
                       onChange={(e) => setBankDetails(prev => ({ ...prev, currency: e.target.value }))}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     >
                       <option value="GBP">GBP - British Pound Sterling</option>
                       <option value="USD">USD - United States Dollar</option>
                       <option value="EUR">EUR - Euro</option>
                       <option value="AUD">AUD - Australian Dollar</option>
                       <option value="CAD">CAD - Canadian Dollar</option>
                       <option value="JPY">JPY - Japanese Yen</option>
                       <option value="CHF">CHF - Swiss Franc</option>
                       <option value="CNY">CNY - Chinese Yuan</option>
                       <option value="INR">INR - Indian Rupee</option>
                       <option value="SGD">SGD - Singapore Dollar</option>
                       <option value="HKD">HKD - Hong Kong Dollar</option>
                       <option value="NZD">NZD - New Zealand Dollar</option>
                       <option value="SEK">SEK - Swedish Krona</option>
                       <option value="NOK">NOK - Norwegian Krone</option>
                       <option value="DKK">DKK - Danish Krone</option>
                       <option value="CZK">CZK - Czech Koruna</option>
                       <option value="PLN">PLN - Polish Zloty</option>
                       <option value="HUF">HUF - Hungarian Forint</option>
                       <option value="BRL">BRL - Brazilian Real</option>
                       <option value="RUB">RUB - Russian Ruble</option>
                       <option value="TRY">TRY - Turkish Lira</option>
                       <option value="ZAR">ZAR - South African Rand</option>
                       <option value="MXN">MXN - Mexican Peso</option>
                       <option value="KRW">KRW - South Korean Won</option>
                       <option value="THB">THB - Thai Baht</option>
                       <option value="MYR">MYR - Malaysian Ringgit</option>
                       <option value="PHP">PHP - Philippine Peso</option>
                       <option value="VND">VND - Vietnamese Dong</option>
                       <option value="IDR">IDR - Indonesian Rupiah</option>
                     </select>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                      <Save className="h-4 w-4 mr-2" />
                      )}
                      {isSaving ? 'Saving...' : 'Save Bank Details'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={isSaving}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Payment History</h3>
            
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-spin" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Loading payment history...</h4>
              </div>
            ) : paymentHistory.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No payments yet</h4>
              <p className="text-gray-600">
                Your payment history will appear here once you complete campaigns and receive payments.
              </p>
            </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Campaign
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paymentHistory.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{payment.campaign_name}</div>
                            <div className="text-sm text-gray-500">{payment.brand_name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            £{payment.amount.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            payment.status === 'completed' 
                              ? 'bg-green-100 text-green-800'
                              : payment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : payment.status === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Important Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mt-8">
            <div className="flex items-start">
              <AlertTriangle className="h-6 w-6 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-lg font-medium text-amber-800 mb-2">Payment Information</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Payments are processed weekly on Mondays</li>
                  <li>• Minimum payout amount is £50</li>
                  <li>• Tax forms may be required for payments over £600 annually</li>
                  <li>• Payment method must be verified before first payout</li>
                  <li>• All payment details are encrypted and securely stored</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </InfluencerProtectedRoute>
  )
} 