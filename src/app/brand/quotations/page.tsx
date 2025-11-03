'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { BrandProtectedRoute } from '@/components/auth/ProtectedRoute'
import ModernBrandHeader from '@/components/nav/ModernBrandHeader'
import { FileText, Clock, CheckCircle, XCircle, Calendar, DollarSign, Users, ChevronRight, Plus, Send } from 'lucide-react'

interface Quotation {
  id: string
  brandName: string
  campaignDescription: string
  targetAudience: string
  budget: number
  timeline: string
  deliverables: string[]
  status: 'PENDING_REVIEW' | 'SENT' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
  submittedAt: string
  reviewedAt?: string
  notes?: string
  influencers: any[]
  createdAt: string
  updatedAt: string
}

function QuotationsPageClient() {
  const router = useRouter()
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'PENDING_REVIEW' | 'SENT' | 'APPROVED' | 'REJECTED'>('ALL')

  useEffect(() => {
    loadQuotations()
  }, [])

  const loadQuotations = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/brand/quotations')
      if (response.ok) {
        const _result = await response.json()
        if (result.success) {
          setQuotations(result.data)
        }
      } else {
        console.error('Failed to load quotations')
      }
    } catch (_error) {
      console.error('Error loading quotations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveQuotation = async (quotationId: string) => {
    if (!confirm('Approve this quotation and proceed to create a campaign?')) return

    try {
      const response = await fetch(`/api/brand/quotations/${quotationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' })
      })

      if (response.ok) {
        loadQuotations()
        // TODO: Navigate to campaign creation with quotation data
        alert('Quotation approved! You can now create a campaign.')
      } else {
        alert('Failed to approve quotation')
      }
    } catch (_error) {
      console.error('Error approving quotation:', error)
      alert('Error approving quotation')
    }
  }

  const handleRejectQuotation = async (quotationId: string) => {
    if (!confirm('Reject this quotation?')) return

    try {
      const response = await fetch(`/api/brand/quotations/${quotationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' })
      })

      if (response.ok) {
        loadQuotations()
      } else {
        alert('Failed to reject quotation')
      }
    } catch (_error) {
      console.error('Error rejecting quotation:', error)
      alert('Error rejecting quotation')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'SENT':
        return <Send className="w-5 h-5 text-blue-600" />
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'EXPIRED':
        return <XCircle className="w-5 h-5 text-gray-600" />
      default:
        return <FileText className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'SENT':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const filteredQuotations = quotations.filter(q => 
    selectedStatus === 'ALL' || q.status === selectedStatus
  )

  const statusCounts = {
    ALL: quotations.length,
    PENDING_REVIEW: quotations.filter(q => q.status === 'PENDING_REVIEW').length,
    SENT: quotations.filter(q => q.status === 'SENT').length,
    APPROVED: quotations.filter(q => q.status === 'APPROVED').length,
    REJECTED: quotations.filter(q => q.status === 'REJECTED').length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernBrandHeader />
      
      <div className="px-4 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quotation Requests</h1>
              <p className="text-gray-600">
                Request pricing for influencer campaigns and track your quotes
              </p>
            </div>
            <button
              onClick={() => router.push('/brand/shortlists')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              New Request
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-6">
            {(['ALL', 'PENDING_REVIEW', 'SENT', 'APPROVED', 'REJECTED'] as const).map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`pb-3 px-1 border-b-2 transition-colors ${
                  selectedStatus === status
                    ? 'border-blue-600 text-blue-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {status === 'ALL' ? 'All' : formatStatus(status)}
                <span className="ml-2 text-sm">({statusCounts[status]})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quotations List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading quotations...</p>
          </div>
        ) : filteredQuotations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedStatus === 'ALL' ? 'No quotations yet' : `No ${formatStatus(selectedStatus).toLowerCase()} quotations`}
            </h3>
            <p className="text-gray-600 mb-6">
              {selectedStatus === 'ALL' 
                ? 'Request your first quote by selecting influencers from your shortlists'
                : 'Try selecting a different status filter'}
            </p>
            {selectedStatus === 'ALL' && (
              <button
                onClick={() => router.push('/brand/shortlists')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Influencers
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuotations.map(quotation => (
              <div
                key={quotation.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {quotation.campaignDescription}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(quotation.status)}`}>
                        {getStatusIcon(quotation.status)}
                        {formatStatus(quotation.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>Requested {new Date(quotation.submittedAt).toLocaleDateString()}</span>
                      </div>
                      {quotation.influencers.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          <span>{quotation.influencers.length} influencers</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quote Details for SENT status */}
                {quotation.status === 'SENT' && quotation.budget > 0 && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">Quote Received</span>
                      <div className="flex items-center gap-1 text-lg font-bold text-blue-900">
                        <DollarSign size={20} />
                        {quotation.budget.toLocaleString()}
                      </div>
                    </div>
                    {quotation.notes && (
                      <p className="text-sm text-blue-800">{quotation.notes}</p>
                    )}
                  </div>
                )}

                {/* Campaign Details */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-600">Target Audience:</span>
                    <p className="text-gray-900 font-medium">{quotation.targetAudience || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Timeline:</span>
                    <p className="text-gray-900 font-medium">{quotation.timeline || 'Not specified'}</p>
                  </div>
                </div>

                {quotation.deliverables && quotation.deliverables.length > 0 && (
                  <div className="mb-4">
                    <span className="text-sm text-gray-600">Deliverables:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {quotation.deliverables.map((item, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  {quotation.status === 'SENT' && (
                    <>
                      <button
                        onClick={() => handleApproveQuotation(quotation.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        <CheckCircle size={16} />
                        Approve Quote
                      </button>
                      <button
                        onClick={() => handleRejectQuotation(quotation.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </>
                  )}
                  {quotation.status === 'APPROVED' && (
                    <button
                      onClick={() => {
                        // TODO: Navigate to campaign creation with quotation data
                        router.push(`/brand/campaigns?quotation=${quotation.id}`)
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Create Campaign
                      <ChevronRight size={16} />
                    </button>
                  )}
                  {quotation.status === 'PENDING_REVIEW' && (
                    <span className="text-sm text-gray-600 italic">
                      Waiting for staff review...
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function BrandQuotationsPage() {
  return (
    <BrandProtectedRoute>
      <Suspense fallback={<div>Loading...</div>}>
        <QuotationsPageClient />
      </Suspense>
    </BrandProtectedRoute>
  )
}

