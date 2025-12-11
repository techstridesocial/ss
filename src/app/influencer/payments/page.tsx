'use client'

import React, { useState, useEffect } from 'react'
import { InfluencerProtectedRoute } from '../../../components/auth/ProtectedRoute'
import ModernInfluencerHeader from '../../../components/nav/ModernInfluencerHeader'
import { CreditCard, DollarSign, Clock, CheckCircle, AlertTriangle, Plus, Edit3, X, Save, Loader2, FileText, Eye, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import InvoiceSubmissionModal from '../../../components/influencer/InvoiceSubmissionModal'

interface PayPalDetails {
  email: string
  firstName: string
  lastName: string
}

interface BankDetails {
  accountType: string // Personal Account or Business Account
  accountHolderName: string
  accountNumber: string
  routingNumber: string // Changed from sortCode to routingNumber for international use
  abaCode: string // ABA code for Australians
  bankName: string
  swiftCode: string // Added SWIFT code for international transfers
  iban: string // Added IBAN for European/international banking
  address: string
  city: string
  country: string // Changed from postcode to country
  currency: string // Added currency preference
  vatRegistered: string // Yes or No
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

interface Invoice {
  id: string
  invoice_number: string
  invoice_date: string
  due_date: string
  creator_name: string
  brand_name: string
  content_description: string
  content_link: string
  agreed_price: number
  currency: string
  vat_amount: number
  total_amount: number
  status: 'DRAFT' | 'SENT' | 'VERIFIED' | 'DELAYED' | 'PAID' | 'VOIDED'
  staff_notes?: string
  pdf_path?: string
  created_at: string
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
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  
  // PayPal form state
  const [paypalDetails, setPaypalDetails] = useState<PayPalDetails>({
    email: '',
    firstName: '',
    lastName: ''
  })

  // Bank form state
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountType: '',
    accountHolderName: '',
    accountNumber: '',
    routingNumber: '',
    abaCode: '',
    bankName: '',
    swiftCode: '',
    iban: '',
    address: '',
    city: '',
    country: '',
    currency: 'GBP', // Default to GBP
    vatRegistered: ''
  })

  // Saved details (simulated)
  const [savedPaypalDetails, setSavedPaypalDetails] = useState<PayPalDetails | null>(null)
  const [savedBankDetails, setSavedBankDetails] = useState<BankDetails | null>(null)

  // Fetch payment data on component mount
  useEffect(() => {
    fetchPaymentData()
    fetchInvoices()
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
      accountType: '',
      accountHolderName: '',
      accountNumber: '',
      routingNumber: '',
      abaCode: '',
      bankName: '',
      swiftCode: '',
      iban: '',
      address: '',
      city: '',
      country: '',
      currency: 'GBP',
      vatRegistered: ''
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
      accountType: '',
      accountHolderName: '',
      accountNumber: '',
      routingNumber: '',
      abaCode: '',
      bankName: '',
      swiftCode: '',
      iban: '',
      address: '',
      city: '',
      country: '',
      currency: 'GBP',
      vatRegistered: ''
    })
  }

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/influencer/invoices')
      if (response.ok) {
        const data = await response.json()
        setInvoices(data.invoices || [])
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    }
  }

  const handleInvoiceCreated = () => {
    fetchInvoices()
    fetchPaymentData() // Refresh payment data
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT': return 'text-blue-600 bg-blue-100'
      case 'VERIFIED': return 'text-green-600 bg-green-100'
      case 'DELAYED': return 'text-orange-600 bg-orange-100'
      case 'PAID': return 'text-green-600 bg-green-100'
      case 'VOIDED': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT': return <Clock className="h-4 w-4" />
      case 'VERIFIED': return <CheckCircle className="h-4 w-4" />
      case 'DELAYED': return <AlertTriangle className="h-4 w-4" />
      case 'PAID': return <CheckCircle className="h-4 w-4" />
      case 'VOIDED': return <X className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }
  
  return (
    <InfluencerProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <ModernInfluencerHeader />
        
        <div className="px-4 lg:px-8 pb-8">
          {/* Payment Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-emerald-50/50 p-6 rounded-lg shadow border border-emerald-100/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Total Earned</h3>
                  {isLoading ? (
                    <div className="flex items-center mt-2">
                      <Loader2 className="h-6 w-6 text-green-600 animate-spin mr-2" />
                      <span className="text-gray-500">Loading...</span>
                    </div>
                  ) : (
                    <p className="text-3xl font-bold text-green-600 mt-2">£{Number(paymentSummary.total_earned).toFixed(2)}</p>
                  )}
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-amber-50/50 p-6 rounded-lg shadow border border-amber-100/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Pending</h3>
                  {isLoading ? (
                    <div className="flex items-center mt-2">
                      <Loader2 className="h-6 w-6 text-orange-600 animate-spin mr-2" />
                      <span className="text-gray-500">Loading...</span>
                    </div>
                  ) : (
                    <p className="text-3xl font-bold text-orange-600 mt-2">£{Number(paymentSummary.pending_amount).toFixed(2)}</p>
                  )}
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            
            <div className="bg-blue-50/50 p-6 rounded-lg shadow border border-blue-100/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Paid Out</h3>
                  {isLoading ? (
                    <div className="flex items-center mt-2">
                      <Loader2 className="h-6 w-6 text-blue-600 animate-spin mr-2" />
                      <span className="text-gray-500">Loading...</span>
                    </div>
                  ) : (
                    <p className="text-3xl font-bold text-blue-600 mt-2">£{Number(paymentSummary.paid_out).toFixed(2)}</p>
                  )}
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-purple-50/50 p-6 rounded-lg shadow border border-purple-100/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">This Month</h3>
                  {isLoading ? (
                    <div className="flex items-center mt-2">
                      <Loader2 className="h-6 w-6 text-purple-600 animate-spin mr-2" />
                      <span className="text-gray-500">Loading...</span>
                    </div>
                  ) : (
                    <p className="text-3xl font-bold text-purple-600 mt-2">£{Number(paymentSummary.this_month).toFixed(2)}</p>
                  )}
                </div>
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">£</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/80 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/25">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Payment Method</h3>
              </div>
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
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 flex items-center justify-center font-semibold"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add PayPal
                  </button>
                  <button 
                    onClick={() => setShowBankForm(true)}
                      className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center font-semibold shadow-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Bank Account
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 border border-blue-100/50 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/25">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">
                        {paymentInfo.payment_method === 'PAYPAL' ? 'PayPal Account' : 'Bank Account'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {paymentInfo.payment_method === 'PAYPAL' 
                          ? paymentInfo.masked_details.email
                          : paymentInfo.masked_details.accountNumber
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">Verified</span>
                  </div>
                </div>
              </div>
            )}

            {/* PayPal Form */}
            {showPayPalForm && (
              <div className="mt-6 border-2 border-blue-100/50 rounded-2xl p-6 bg-gradient-to-br from-blue-50/50 to-white backdrop-blur-sm shadow-sm">
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
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
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
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
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
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
                      />
                    </div>
                  </div>
                  
                  {/* PayPal Fees Notice */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800">
                        <strong>Please note:</strong> We do not cover any PayPal fees. Any fees charged by PayPal will be deducted from your payment.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
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
                      className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Bank Account Form */}
            {showBankForm && (
              <div className="mt-6 border-2 border-blue-100/50 rounded-2xl p-6 bg-gradient-to-br from-blue-50/50 to-white backdrop-blur-sm shadow-sm">
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
                  {/* Account Type Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Type *
                    </label>
                    <select
                      required
                      value={bankDetails.accountType}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, accountType: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
                    >
                      <option value="">Select Account Type</option>
                      <option value="Personal">Personal Account</option>
                      <option value="Business">Business Account</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={bankDetails.accountHolderName}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, accountHolderName: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
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
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
                          placeholder="Account number (varies by country)"
                        />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Wire Routing Number/Sort Code (varies by country)
                      </label>
                      <input
                        type="text"
                        value={bankDetails.routingNumber}
                        onChange={(e) => setBankDetails(prev => ({ ...prev, routingNumber: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
                        placeholder="Wire Routing Number/Sort Code (varies by country)"
                      />
                    </div>
                  </div>
                  
                  {/* ABA Code for Australians */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ABA Code (for Australians)
                    </label>
                    <input
                      type="text"
                      value={bankDetails.abaCode}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, abaCode: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
                      placeholder="ABA Code (for Australians)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={bankDetails.bankName}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, bankName: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
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
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
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
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
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
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
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
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
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
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
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
                       className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
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

                  {/* VAT Registered Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      VAT Registered *
                    </label>
                    <select
                      required
                      value={bankDetails.vatRegistered}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, vatRegistered: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
                    >
                      <option value="">Select VAT Status</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
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
                      className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Payment History */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/80 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl shadow-lg shadow-emerald-500/25">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Payment History</h3>
            </div>
            
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
              <div className="overflow-x-auto rounded-xl border border-gray-100/50">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
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
                  <tbody className="bg-white divide-y divide-gray-100">
                    {paymentHistory.map((payment) => (
                      <tr key={payment.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{payment.campaign_name}</div>
                            <div className="text-sm text-gray-500">{payment.brand_name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            £{Number(payment.amount).toFixed(2)}
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

          {/* Invoice Management Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/80 p-8 mt-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/25">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Invoice Management</h3>
              </div>
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 flex items-center font-semibold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </button>
            </div>

            {invoices.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Invoices Yet</h4>
                <p className="text-gray-600 mb-4">
                  Create your first invoice to get paid for your campaigns.
                </p>
                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 flex items-center font-semibold mx-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Invoice
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-100/50">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice #
                      </th>
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
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.invoice_number}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(invoice.invoice_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{invoice.brand_name}</div>
                            <div className="text-sm text-gray-500">{invoice.content_description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.currency} {Number(invoice.total_amount).toFixed(2)}
                          </div>
                          {invoice.vat_amount > 0 && (
                            <div className="text-sm text-gray-500">
                              (incl. {invoice.currency} {Number(invoice.vat_amount).toFixed(2)} VAT)
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                            {getStatusIcon(invoice.status)}
                            <span className="ml-1">{invoice.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(invoice.due_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(invoice.content_link, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {invoice.pdf_path && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(invoice.pdf_path, '_blank')}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payment Information Section */}
          <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/50 border-2 border-amber-200/50 rounded-2xl p-8 mt-8 shadow-lg backdrop-blur-sm">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg shadow-amber-500/25 flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-4">
                  <h4 className="text-xl font-semibold text-amber-900">Payment Information</h4>
                </div>
                <ul className="text-sm text-amber-800 space-y-2.5">
                  <li className="flex items-start space-x-2">
                    <span className="text-amber-600 font-bold mt-0.5">•</span>
                    <span>Payments are processed weekly on Mondays</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-amber-600 font-bold mt-0.5">•</span>
                    <span>Minimum payout amount is £50</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-amber-600 font-bold mt-0.5">•</span>
                    <span>Tax forms may be required for payments over £600 annually</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-amber-600 font-bold mt-0.5">•</span>
                    <span>Payment method must be verified before first payout</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-amber-600 font-bold mt-0.5">•</span>
                    <span>All payment details are encrypted and securely stored</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Submission Modal */}
        <InvoiceSubmissionModal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          onInvoiceCreated={handleInvoiceCreated}
        />
      </div>
    </InfluencerProtectedRoute>
  )
} 