'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import ModernStaffHeader from '../../../../components/nav/ModernStaffHeader'
import { StaffProtectedRoute } from '../../../../components/auth/ProtectedRoute'
import { ArrowLeft, Send, MessageSquare, Plus, Trash2, Edit2, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react'

type SubmissionListStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED'

interface SubmissionList {
  id: string
  name: string
  brandId: string
  brandName?: string
  status: SubmissionListStatus
  notes: string | null
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

function SubmissionDetailPageContent() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [list, setList] = useState<SubmissionList | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  useEffect(() => {
    if (id) {
      loadList()
    }
  }, [id])

  const loadList = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/api/staff/submissions/${id}`)
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

  const handleSubmit = async () => {
    if (!confirm('Submit this list to the brand for review?')) return

    try {
      const response = await fetch(`/api/staff/submissions/${id}/submit`, {
        method: 'POST'
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to submit list')
      }

      await loadList()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit list')
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
      
      setNewComment('')
      await loadList()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add comment')
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

  if (isLoading) {
    return (
      <StaffProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <ModernStaffHeader />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
              <p className="mt-4 text-gray-600">Loading submission list...</p>
            </div>
          </div>
        </div>
      </StaffProtectedRoute>
    )
  }

  if (error || !list) {
    return (
      <StaffProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <ModernStaffHeader />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              {error || 'Submission list not found'}
            </div>
          </div>
        </div>
      </StaffProtectedRoute>
    )
  }

  return (
    <StaffProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <ModernStaffHeader />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/staff/submissions')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Submissions
            </button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{list.name}</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Brand: {list.brandName || 'Unknown'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(list.status)}`}>
                  {list.status.replace('_', ' ')}
                </span>
                {list.status === 'DRAFT' && (
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                    Submit to Brand
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Notes */}
              {list.notes && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Notes</h2>
                  <p className="text-gray-600">{list.notes}</p>
                </div>
              )}

              {/* Influencers */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Influencers ({list.influencers?.length || 0})
                </h2>
                <div className="space-y-3">
                  {list.influencers?.map(inf => (
                    <div key={inf.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{inf.influencerName || 'Unknown'}</p>
                        {inf.notes && (
                          <p className="text-sm text-gray-600 mt-1">{inf.notes}</p>
                        )}
                      </div>
                      {inf.initialPrice && (
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">£{inf.initialPrice.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Comments Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Conversation
                </h2>

                {/* Comments List */}
                <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                  {list.comments?.map(comment => (
                    <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900">
                          {comment.userName || 'Unknown'}
                        </p>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{comment.comment}</p>
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
                    placeholder="Add a comment..."
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
    </StaffProtectedRoute>
  )
}

export default function SubmissionDetailPage() {
  return <SubmissionDetailPageContent />
}

