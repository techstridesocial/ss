'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ModernBrandHeader from '../../../components/nav/ModernBrandHeader'
import { BrandProtectedRoute } from '../../../components/auth/ProtectedRoute'
import { FileText, Building2, Clock, CheckCircle, XCircle, AlertCircle, MessageSquare, Eye } from 'lucide-react'

type SubmissionListStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED'

interface SubmissionList {
  id: string
  name: string
  brandId: string
  brandName?: string
  createdBy: string
  createdByName?: string
  status: SubmissionListStatus
  notes: string | null
  submittedAt: Date | null
  reviewedAt: Date | null
  approvedAt: Date | null
  rejectedAt: Date | null
  createdAt: Date
  influencers: any[]
  comments: any[]
}

function BrandSubmissionsPageContent() {
  const router = useRouter()
  const [lists, setLists] = useState<SubmissionList[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  useEffect(() => {
    loadLists()
  }, [])

  const loadLists = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/brand/submissions')
      if (!response.ok) throw new Error('Failed to load submission lists')
      
      const result = await response.json()
      if (result.success) {
        setLists(result.data || [])
      } else {
        throw new Error(result.error || 'Failed to load lists')
      }
    } catch (err) {
      console.error('Error loading lists:', err)
      setError(err instanceof Error ? err.message : 'Failed to load submission lists')
    } finally {
      setIsLoading(false)
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

  const filteredLists = selectedStatus === 'all' 
    ? lists 
    : lists.filter(list => list.status === selectedStatus)

  return (
    <BrandProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <ModernBrandHeader />
        
        <div className="px-4 lg:px-8 py-8">

          {/* Filters */}
          <div className="mb-6 flex gap-2">
            {['all', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED'].map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedStatus === status
                    ? 'bg-cyan-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {status === 'all' ? 'All' : status.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
              <p className="mt-4 text-gray-600">Loading submission lists...</p>
            </div>
          ) : filteredLists.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No submission lists</h3>
              <p className="text-gray-600">No lists have been submitted yet</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredLists.map(list => (
                <div
                  key={list.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{list.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(list.status)}`}>
                          {list.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      {/* Submission Description */}
                      {list.notes && (
                        <p className="text-sm text-gray-700 mb-3">{list.notes}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {list.influencers?.length || 0} influencers
                        </div>
                        {list.comments && list.comments.length > 0 && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {list.comments.length} comments
                          </div>
                        )}
                        {list.createdByName && (
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            Submitted by {list.createdByName}
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-gray-500">
                        Submitted {new Date(list.submittedAt || list.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/brand/submissions/${list.id}`)}
                      className="ml-4 p-2 text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </BrandProtectedRoute>
  )
}

export default function BrandSubmissionsPage() {
  return <BrandSubmissionsPageContent />
}

