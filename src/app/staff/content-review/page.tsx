'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ModernStaffHeader from '../../../components/nav/ModernStaffHeader'
import { Pagination } from '../../../components/ui/Pagination'
import {
  Video,
  Image,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  User,
  Building2,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  X,
  AlertCircle,
  RefreshCw,
  Loader2,
  Play,
  FileText
} from 'lucide-react'
import { useToast } from '../../../hooks/use-toast'

interface ContentSubmission {
  id: string
  contentUrl: string
  contentType: string
  platform: string
  title: string | null
  description: string | null
  caption: string | null
  hashtags: string[] | null
  views: number | null
  likes: number | null
  comments: number | null
  shares: number | null
  saves: number | null
  status: string
  submittedAt: string
  reviewedAt: string | null
  reviewNotes: string | null
  screenshotUrl: string | null
  influencer: {
    id: string
    displayName: string
    username: string
    profileImage: string | null
    email: string | null
  }
  campaign: {
    id: string
    name: string
    brand: string | null
  }
  reviewer: {
    email: string
    name: string
  } | null
}

interface Stats {
  total: number
  pending: number
  approved: number
  rejected: number
  revisionRequested: number
}

export default function StaffContentReviewPage() {
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [selectedSubmission, setSelectedSubmission] = useState<ContentSubmission | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const { toast } = useToast()

  const loadSubmissions = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      if (platformFilter && platformFilter !== 'all') {
        params.append('platform', platformFilter)
      }
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/staff/content-submissions?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data.submissions || [])
        setStats(data.stats || null)
      }
    } catch (error) {
      console.error('Error loading submissions:', error)
      toast({
        title: 'Error',
        description: 'Failed to load content submissions',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, platformFilter, searchQuery, toast])

  useEffect(() => {
    loadSubmissions()
  }, [loadSubmissions])

  const handleReview = async (action: 'approve' | 'reject' | 'revision') => {
    if (!selectedSubmission) return
    
    if ((action === 'reject' || action === 'revision') && !reviewNotes.trim()) {
      toast({
        title: 'Required',
        description: `Please provide a reason for ${action === 'reject' ? 'rejection' : 'revision request'}`,
        variant: 'destructive'
      })
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/staff/content-submissions/${selectedSubmission.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          notes: reviewNotes
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: 'Success',
          description: data.message || `Content ${action}ed successfully`,
        })
        setSelectedSubmission(null)
        setReviewNotes('')
        loadSubmissions()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to review content')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to review content',
        variant: 'destructive'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const formatNumber = (num: number | null) => {
    if (!num) return '0'
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      PENDING: { bg: 'bg-amber-100', text: 'text-amber-700', icon: <Clock className="w-3 h-3" /> },
      SUBMITTED: { bg: 'bg-amber-100', text: 'text-amber-700', icon: <Clock className="w-3 h-3" /> },
      APPROVED: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: <CheckCircle className="w-3 h-3" /> },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', icon: <XCircle className="w-3 h-3" /> },
      REVISION_REQUESTED: { bg: 'bg-orange-100', text: 'text-orange-700', icon: <RefreshCw className="w-3 h-3" /> }
    }
    const config = configs[status] || configs.PENDING
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.icon}
        {status.replace('_', ' ')}
      </span>
    )
  }

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, React.ReactNode> = {
      instagram: <Image className="w-4 h-4" />,
      tiktok: <Video className="w-4 h-4" />,
      youtube: <Play className="w-4 h-4" />,
      twitter: <MessageCircle className="w-4 h-4" />,
      facebook: <Share2 className="w-4 h-4" />
    }
    return icons[platform.toLowerCase()] || <FileText className="w-4 h-4" />
  }

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      instagram: 'bg-gradient-to-br from-purple-500 to-pink-500',
      tiktok: 'bg-black',
      youtube: 'bg-red-600',
      twitter: 'bg-blue-400',
      facebook: 'bg-blue-600'
    }
    return colors[platform.toLowerCase()] || 'bg-gray-500'
  }

  // Pagination
  const totalPages = Math.ceil(submissions.length / pageSize)
  const paginatedSubmissions = submissions.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernStaffHeader />
      
      <main className="px-4 lg:px-8 pb-12 pt-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-500">Total</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-amber-50 rounded-xl p-4 shadow-sm border border-amber-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-medium text-amber-600">Pending</span>
              </div>
              <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-emerald-50 rounded-xl p-4 shadow-sm border border-emerald-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-600">Approved</span>
              </div>
              <p className="text-2xl font-bold text-emerald-700">{stats.approved}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-red-50 rounded-xl p-4 shadow-sm border border-red-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-xs font-medium text-red-600">Rejected</span>
              </div>
              <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-orange-50 rounded-xl p-4 shadow-sm border border-orange-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-medium text-orange-600">Revision</span>
              </div>
              <p className="text-2xl font-bold text-orange-700">{stats.revisionRequested}</p>
            </motion.div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by creator or campaign..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="REVISION_REQUESTED">Revision Requested</option>
              </select>
              
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm bg-white"
              >
                <option value="all">All Platforms</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
                <option value="twitter">Twitter</option>
                <option value="facebook">Facebook</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              <p className="text-gray-500">Loading content submissions...</p>
            </div>
          </div>
        ) : submissions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-20 text-center">
            <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No content found</h3>
            <p className="text-gray-500">No content submissions match your current filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {paginatedSubmissions.map((submission, index) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ y: -4 }}
                  onClick={() => setSelectedSubmission(submission)}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                >
                  {/* Content Preview */}
                  <div className="relative aspect-video bg-gray-100">
                    {submission.screenshotUrl ? (
                      <img 
                        src={submission.screenshotUrl} 
                        alt="Content preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    
                    {/* Platform Badge */}
                    <div className={`absolute top-3 left-3 p-2 rounded-lg text-white ${getPlatformColor(submission.platform)}`}>
                      {getPlatformIcon(submission.platform)}
                    </div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(submission.status)}
                    </div>
                  </div>

                  {/* Content Info */}
                  <div className="p-4">
                    {/* Influencer */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                        {submission.influencer.profileImage ? (
                          <img 
                            src={submission.influencer.profileImage} 
                            alt={submission.influencer.displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {submission.influencer.displayName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          @{submission.influencer.username}
                        </p>
                      </div>
                    </div>

                    {/* Campaign */}
                    <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                      <Building2 className="w-3 h-3" />
                      <span className="truncate">{submission.campaign.name}</span>
                    </div>

                    {/* Metrics */}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {submission.views !== null && (
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {formatNumber(submission.views)}
                        </div>
                      )}
                      {submission.likes !== null && (
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {formatNumber(submission.likes)}
                        </div>
                      )}
                      {submission.comments !== null && (
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {formatNumber(submission.comments)}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={submissions.length}
                itemLabel="submissions"
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                pageSizeOptions={[12, 24, 48]}
              />
            </div>
          </>
        )}
      </main>

      {/* Content Review Modal */}
      <AnimatePresence>
        {selectedSubmission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedSubmission(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="grid md:grid-cols-2 gap-0">
                {/* Left - Content Preview */}
                <div className="bg-gray-900 p-6 flex flex-col">
                  <div className="flex-1 flex items-center justify-center min-h-[300px]">
                    {selectedSubmission.screenshotUrl ? (
                      <img 
                        src={selectedSubmission.screenshotUrl} 
                        alt="Content"
                        className="max-w-full max-h-[400px] rounded-lg object-contain"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <Video className="w-16 h-16 mx-auto mb-4" />
                        <p>No preview available</p>
                      </div>
                    )}
                  </div>
                  
                  <a
                    href={selectedSubmission.contentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on {selectedSubmission.platform}
                  </a>
                </div>

                {/* Right - Details */}
                <div className="p-6 flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg text-white ${getPlatformColor(selectedSubmission.platform)}`}>
                        {getPlatformIcon(selectedSubmission.platform)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 capitalize">
                          {selectedSubmission.contentType}
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">{selectedSubmission.platform}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedSubmission(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  {/* Status */}
                  <div className="mb-4">
                    {getStatusBadge(selectedSubmission.status)}
                  </div>

                  {/* Influencer & Campaign */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-medium text-gray-500">Creator</span>
                      </div>
                      <p className="font-medium text-gray-900 text-sm">{selectedSubmission.influencer.displayName}</p>
                      <p className="text-xs text-gray-500">@{selectedSubmission.influencer.username}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-medium text-gray-500">Campaign</span>
                      </div>
                      <p className="font-medium text-gray-900 text-sm">{selectedSubmission.campaign.name}</p>
                      <p className="text-xs text-gray-500">{selectedSubmission.campaign.brand}</p>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-5 gap-2 mb-6">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <Eye className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                      <p className="text-sm font-semibold text-gray-900">{formatNumber(selectedSubmission.views)}</p>
                      <p className="text-xs text-gray-500">Views</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <Heart className="w-4 h-4 mx-auto text-red-400 mb-1" />
                      <p className="text-sm font-semibold text-gray-900">{formatNumber(selectedSubmission.likes)}</p>
                      <p className="text-xs text-gray-500">Likes</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <MessageCircle className="w-4 h-4 mx-auto text-blue-400 mb-1" />
                      <p className="text-sm font-semibold text-gray-900">{formatNumber(selectedSubmission.comments)}</p>
                      <p className="text-xs text-gray-500">Comments</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <Share2 className="w-4 h-4 mx-auto text-green-400 mb-1" />
                      <p className="text-sm font-semibold text-gray-900">{formatNumber(selectedSubmission.shares)}</p>
                      <p className="text-xs text-gray-500">Shares</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <Bookmark className="w-4 h-4 mx-auto text-purple-400 mb-1" />
                      <p className="text-sm font-semibold text-gray-900">{formatNumber(selectedSubmission.saves)}</p>
                      <p className="text-xs text-gray-500">Saves</p>
                    </div>
                  </div>

                  {/* Caption */}
                  {selectedSubmission.caption && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Caption</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 max-h-24 overflow-y-auto">
                        {selectedSubmission.caption}
                      </p>
                    </div>
                  )}

                  {/* Submitted At */}
                  <div className="text-xs text-gray-500 mb-6">
                    Submitted: {formatDate(selectedSubmission.submittedAt)}
                    {selectedSubmission.reviewedAt && (
                      <> · Reviewed: {formatDate(selectedSubmission.reviewedAt)}</>
                    )}
                  </div>

                  {/* Previous Review Notes */}
                  {selectedSubmission.reviewNotes && (
                    <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-700">Previous Review Notes</span>
                      </div>
                      <p className="text-sm text-gray-700">{selectedSubmission.reviewNotes}</p>
                    </div>
                  )}

                  {/* Review Form */}
                  {(selectedSubmission.status === 'SUBMITTED' || selectedSubmission.status === 'PENDING' || selectedSubmission.status === 'REVISION_REQUESTED') && (
                    <div className="mt-auto">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review Notes (required for reject/revision)
                      </label>
                      <textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Add feedback or notes..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 resize-none text-sm"
                        rows={3}
                      />

                      {/* Actions */}
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => handleReview('revision')}
                          disabled={isProcessing}
                          className="flex-1 px-4 py-2.5 bg-orange-100 text-orange-700 rounded-lg font-medium hover:bg-orange-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Revision
                        </button>
                        <button
                          onClick={() => handleReview('reject')}
                          disabled={isProcessing}
                          className="flex-1 px-4 py-2.5 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                        <button
                          onClick={() => handleReview('approve')}
                          disabled={isProcessing}
                          className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Approve
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
