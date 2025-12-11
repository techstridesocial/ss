'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ModernStaffHeader from '../../../components/nav/ModernStaffHeader'
import { StaffProtectedRoute } from '../../../components/auth/ProtectedRoute'
import { Plus, FileText, Building2, Clock, CheckCircle, XCircle, AlertCircle, MessageSquare, Eye, Trash2, Send, Users } from 'lucide-react'
import { motion } from 'framer-motion'
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
      case 'DRAFT': return 'bg-gray-100/80 text-gray-800 border border-gray-200/50'
      case 'SUBMITTED': return 'bg-blue-100/80 text-blue-800 border border-blue-200/50'
      case 'UNDER_REVIEW': return 'bg-amber-100/80 text-amber-800 border border-amber-200/50'
      case 'APPROVED': return 'bg-emerald-100/80 text-emerald-800 border border-emerald-200/50'
      case 'REJECTED': return 'bg-red-100/80 text-red-800 border border-red-200/50'
      case 'REVISION_REQUESTED': return 'bg-orange-100/80 text-orange-800 border border-orange-200/50'
      default: return 'bg-gray-100/80 text-gray-800 border border-gray-200/50'
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
        
        <div className="px-4 lg:px-8 py-8">
          {/* Header with Filters and Create Button */}
          <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
            {/* Filters */}
            <div className="flex flex-wrap gap-2 flex-1">
              {['all', 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED'].map(status => (
                <motion.button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedStatus === status
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                      : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-gray-50 border border-gray-200/50 shadow-sm'
                  }`}
                >
                  {status === 'all' ? 'All' : status.replace('_', ' ')}
                </motion.button>
              ))}
            </div>
            
            {/* Create Button */}
            <motion.button
              onClick={() => setCreateModalOpen(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 font-semibold whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Create New List
            </motion.button>
          </div>

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border-2 border-red-200/50 rounded-2xl text-red-800 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{error}</span>
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
              <p className="mt-4 text-gray-600">Loading submission lists...</p>
            </div>
          ) : filteredLists.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-2xl border border-white/30 shadow-xl"
            >
              <div className="p-4 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl w-16 h-16 mx-auto mb-6 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No submission lists</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">Get started by creating your first submission list to submit influencers to brands</p>
              <motion.button
                onClick={() => setCreateModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 font-semibold"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Create New List
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid gap-6">
              {filteredLists.map((list, index) => (
                <motion.div
                  key={list.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6 hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg shadow-cyan-500/25">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{list.name}</h3>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold ${getStatusColor(list.status)}`}>
                            {getStatusIcon(list.status)}
                            {list.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm mb-4 pl-14">
                        <div className="flex items-center gap-2 text-gray-700">
                          <div className="p-1.5 bg-blue-50 rounded-lg">
                            <Building2 className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="font-medium">{list.brandName || 'Unknown Brand'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <div className="p-1.5 bg-purple-50 rounded-lg">
                            <Users className="w-4 h-4 text-purple-600" />
                          </div>
                          <span className="font-medium">{list.influencers?.length || 0} influencers</span>
                        </div>
                        {list.comments && list.comments.length > 0 && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <div className="p-1.5 bg-emerald-50 rounded-lg">
                              <MessageSquare className="w-4 h-4 text-emerald-600" />
                            </div>
                            <span className="font-medium">{list.comments.length} comments</span>
                          </div>
                        )}
                      </div>

                      {list.notes && (
                        <div className="mb-4 pl-14">
                          <p className="text-sm text-gray-600 line-clamp-2 bg-gray-50/50 rounded-lg p-3 border border-gray-100">{list.notes}</p>
                        </div>
                      )}

                      <div className="text-xs text-gray-500 pl-14">
                        Created {new Date(list.createdAt).toLocaleDateString()}
                        {list.submittedAt && ` • Submitted ${new Date(list.submittedAt).toLocaleDateString()}`}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <motion.button
                        onClick={() => router.push(`/staff/submissions/${list.id}`)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2.5 text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all shadow-sm hover:shadow-md"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </motion.button>
                      
                      {list.status === 'DRAFT' && (
                        <>
                          <motion.button
                            onClick={() => handleSubmit(list.id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all shadow-sm hover:shadow-md"
                            title="Submit to Brand"
                          >
                            <Send className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            onClick={() => handleDelete(list.id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm hover:shadow-md"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
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

