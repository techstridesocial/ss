'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ModernStaffHeader from '../../../components/nav/ModernStaffHeader'
import { StaffProtectedRoute } from '../../../components/auth/ProtectedRoute'
import { Plus, FileText, Building2, Clock, CheckCircle, XCircle, AlertCircle, MessageSquare, Eye, Trash2, Send } from 'lucide-react'
import dynamic from 'next/dynamic'

const CreateSubmissionListModal = dynamic(() => import('@/components/staff/CreateSubmissionListModal'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="text-white">Loading...</div>
  </div>
})

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
  updatedAt: Date
  influencers: any[]
  comments: any[]
}

function SubmissionsPageContent() {
  const router = useRouter()
  const [lists, setLists] = useState<SubmissionList[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  useEffect(() => {
    loadLists()
  }, [])

  const loadLists = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/staff/submissions')
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission list?')) return

    try {
      const response = await fetch(`/api/staff/submissions/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete list')
      
      await loadLists()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete list')
    }
  }

  const handleSubmit = async (id: string) => {
    try {
      const response = await fetch(`/api/staff/submissions/${id}/submit`, {
        method: 'POST'
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to submit list')
      }

      await loadLists()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit list')
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

  const getStatusIcon = (status: SubmissionListStatus) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />
      case 'REJECTED': return <XCircle className="w-4 h-4" />
      case 'REVISION_REQUESTED': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const filteredLists = selectedStatus === 'all' 
    ? lists 
    : lists.filter(list => list.status === selectedStatus)

  return (
    <StaffProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <ModernStaffHeader />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Submission Lists</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Create and manage influencer lists to submit to brands
                </p>
              </div>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create New List
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex gap-2">
            {['all', 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED'].map(status => (
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
              <p className="text-gray-600 mb-4">Get started by creating your first submission list</p>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
              >
                Create New List
              </button>
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(list.status)}`}>
                          {getStatusIcon(list.status)}
                          {list.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {list.brandName || 'Unknown Brand'}
                        </div>
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
                      </div>

                      {list.notes && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{list.notes}</p>
                      )}

                      <div className="text-xs text-gray-500">
                        Created {new Date(list.createdAt).toLocaleDateString()}
                        {list.submittedAt && ` • Submitted ${new Date(list.submittedAt).toLocaleDateString()}`}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => router.push(`/staff/submissions/${list.id}`)}
                        className="p-2 text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      
                      {list.status === 'DRAFT' && (
                        <>
                          <button
                            onClick={() => handleSubmit(list.id)}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Submit to Brand"
                          >
                            <Send className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(list.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Modal */}
        {createModalOpen && (
          <CreateSubmissionListModal
            isOpen={createModalOpen}
            onClose={() => {
              setCreateModalOpen(false)
              loadLists()
            }}
          />
        )}
      </div>
    </StaffProtectedRoute>
  )
}

export default function SubmissionsPage() {
  return <SubmissionsPageContent />
}

