'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import ModernBrandHeader from '../../../../components/nav/ModernBrandHeader'
import { BrandProtectedRoute } from '../../../../components/auth/ProtectedRoute'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft, MessageSquare, CheckCircle, XCircle, AlertCircle, Clock, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

type SubmissionListStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED'

interface SubmissionList {
  id: string
  name: string
  brandId: string
  brandName?: string
  status: SubmissionListStatus
  notes: string | null
  submittedAt: Date | null
  reviewedAt: Date | null
  approvedAt: Date | null
  rejectedAt: Date | null
  influencers: Array<{
    id: string
    influencerId: string
    influencerName?: string
    initialPrice: number | null
    notes: string | null
  }>
  comments: Array<{
    id: string
    userId: string
    userName?: string
    userRole?: string
    comment: string
    createdAt: Date
  }>
}

function BrandSubmissionDetailPageContent() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const { toast } = useToast()
  const [list, setList] = useState<SubmissionList | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  
  // Influencer list features
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const influencersPerPage = 10

  useEffect(() => {
    if (id) {
      loadList()
      
      // Disable automatic polling to prevent flashing - user can manually refresh if needed
      // Polling was causing the page to flash on every refresh
    }
  }, [id])


  const loadList = async () => {
    try {
      // Only set loading on initial load, not on subsequent calls to prevent flashing
      if (!list) {
      setIsLoading(true)
      }
      setError(null)
      const response = await fetch(`/api/brand/submissions/${id}`)
      if (!response.ok) throw new Error('Failed to load submission list')
      
      const result = await response.json()
      if (result.success) {
        setList(result.data)
      } else {
        throw new Error(result.error || 'Failed to load list')
      }
    } catch (err) {
      console.error('Error loading list:', err)
      setError(err instanceof Error ? err.message : 'Failed to load submission list')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (status: SubmissionListStatus) => {
    if (!confirm(`Are you sure you want to ${status.toLowerCase()} this list?`)) return

    setIsUpdatingStatus(true)
    try {
      const response = await fetch(`/api/brand/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to update status')
      }

      toast({
        title: 'Success',
        description: 'Status updated successfully.',
        variant: 'default'
      })
      await loadList()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update status. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmittingComment(true)
    try {
      const response = await fetch(`/api/submissions/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: newComment })
      })

      if (!response.ok) throw new Error('Failed to add comment')
      
      toast({
        title: 'Success',
        description: 'Comment added successfully.',
        variant: 'default'
      })
      setNewComment('')
      await loadList()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to add comment. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const getStatusColor = (status: SubmissionListStatus) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800'
      case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'REVISION_REQUESTED': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'STAFF': return 'bg-purple-100 text-purple-800'
      case 'BRAND': return 'bg-cyan-100 text-cyan-800'
      case 'INFLUENCER': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDateTime = (date: Date | string | null) => {
    if (!date) return 'N/A'
    const d = new Date(date)
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A'
    const d = new Date(date)
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // Filter and paginate influencers
  const filteredInfluencers = useMemo(() => {
    if (!list?.influencers) return []
    if (!searchQuery.trim()) return list.influencers
    
    const query = searchQuery.toLowerCase()
    return list.influencers.filter(inf => 
      inf.influencerName?.toLowerCase().includes(query) ||
      inf.notes?.toLowerCase().includes(query)
    )
  }, [list?.influencers, searchQuery])

  const totalPages = Math.ceil(filteredInfluencers.length / influencersPerPage)
  const paginatedInfluencers = useMemo(() => {
    const start = (currentPage - 1) * influencersPerPage
    const end = start + influencersPerPage
    return filteredInfluencers.slice(start, end)
  }, [filteredInfluencers, currentPage])

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  const canApprove = list?.status === 'SUBMITTED' || list?.status === 'UNDER_REVIEW'
  const canReject = list?.status === 'SUBMITTED' || list?.status === 'UNDER_REVIEW'
  const canRequestRevision = list?.status === 'SUBMITTED' || list?.status === 'UNDER_REVIEW'

  if (isLoading) {
    return (
      <BrandProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <ModernBrandHeader />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
              <p className="mt-4 text-gray-600">Loading submission list...</p>
            </div>
          </div>
        </div>
      </BrandProtectedRoute>
    )
  }

  if (error || !list) {
    return (
      <BrandProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <ModernBrandHeader />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              {error || 'Submission list not found'}
            </div>
          </div>
        </div>
      </BrandProtectedRoute>
    )
  }

  return (
    <BrandProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <ModernBrandHeader />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/brand/submissions')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Submissions
            </button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{list.name}</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Submitted by Stride Social Staff
                </p>
                
                {/* Submission Dates */}
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                  {list.submittedAt && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Submitted: {formatDateTime(list.submittedAt)}</span>
                    </div>
                  )}
                  {list.reviewedAt && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Reviewed: {formatDateTime(list.reviewedAt)}</span>
                    </div>
                  )}
                  {list.approvedAt && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Approved: {formatDateTime(list.approvedAt)}</span>
                    </div>
                  )}
                  {list.rejectedAt && (
                    <div className="flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      <span>Rejected: {formatDateTime(list.rejectedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(list.status)}`}>
                  {list.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Main Content - Full width grid matching header */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6 min-w-0">
              {/* Action Buttons */}
              {canApprove && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleStatusUpdate('APPROVED')}
                      disabled={isUpdatingStatus}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('REJECTED')}
                      disabled={isUpdatingStatus}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('REVISION_REQUESTED')}
                      disabled={isUpdatingStatus}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                    >
                      <AlertCircle className="w-5 h-5" />
                      Request Revision
                    </button>
                  </div>
                </div>
              )}

              {/* Notes */}
              {list.notes && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Notes</h2>
                  <p className="text-gray-600">{list.notes}</p>
                </div>
              )}

              {/* Influencers */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                  Influencers ({list.influencers?.length || 0})
                </h2>
                  
                  {/* Search */}
                  {list.influencers && list.influencers.length > 0 && (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search influencers..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value)
                          setCurrentPage(1)
                        }}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>

                {filteredInfluencers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery ? 'No influencers match your search' : 'No influencers in this list'}
                  </div>
                ) : (
                  <>
                <div className="space-y-3">
                      {paginatedInfluencers.map(inf => (
                        <div key={inf.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {inf.influencerName || 'Unknown'}
                            </p>
                            {inf.notes && (
                              <p className="text-sm text-gray-600 mt-1">{inf.notes}</p>
                            )}
                          </div>
                      {inf.initialPrice && (
                            <div className="text-right ml-4">
                          <p className="font-semibold text-gray-900">£{inf.initialPrice.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                          Showing {(currentPage - 1) * influencersPerPage + 1} to {Math.min(currentPage * influencersPerPage, filteredInfluencers.length)} of {filteredInfluencers.length}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="text-sm text-gray-600">
                            Page {currentPage} of {totalPages}
                          </span>
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Comments Sidebar */}
            <div className="lg:col-span-1 min-w-0">
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Conversation
                </h2>

                {/* Comments List */}
                <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                  {list.comments?.map(comment => (
                    <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">
                          {comment.userName || 'Unknown'}
                        </p>
                          {comment.userRole && (
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(comment.userRole)}`}>
                              {comment.userRole}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500" title={formatDateTime(comment.createdAt)}>
                          {formatDateTime(comment.createdAt)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 prose prose-sm max-w-none">
                        <ReactMarkdown>{comment.comment}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                  {(!list.comments || list.comments.length === 0) && (
                    <p className="text-sm text-gray-500 text-center py-4">No comments yet</p>
                  )}
                </div>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="space-y-2">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment... (Markdown supported)"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || isSubmittingComment}
                    className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BrandProtectedRoute>
  )
}

export default function BrandSubmissionDetailPage() {
  return <BrandSubmissionDetailPageContent />
}
