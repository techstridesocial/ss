'use client'

import { useState, useEffect } from 'react'
import ModernStaffHeader from '../../../components/nav/ModernStaffHeader'
import { StaffProtectedRoute } from '../../../components/auth/ProtectedRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  ExternalLink,
  BarChart3,
  Star,
  MessageSquare
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface ContentSubmission {
  id: string
  contentUrl: string
  contentType: string
  platform: string
  views?: number
  likes?: number
  comments?: number
  shares?: number
  saves?: number
  title?: string
  description?: string
  caption?: string
  hashtags?: string[]
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED'
  submittedAt: string
  reviewNotes?: string
  screenshotUrl?: string
  influencer: {
    id: string
    displayName: string
    profileImageUrl?: string
  }
  campaign: {
    id: string
    name: string
    brand: string
  }
  qualityScore?: number
}

interface ContentStats {
  totalSubmissions: number
  pendingCount: number
  approvedCount: number
  rejectedCount: number
  revisionRequestedCount: number
  averageQualityScore: number
  topPerformingContent: ContentSubmission[]
}

export default function StaffContentManagement() {
  const { toast } = useToast()
  const [pendingSubmissions, setPendingSubmissions] = useState<ContentSubmission[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<ContentSubmission | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED'>('APPROVED')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stats, setStats] = useState<ContentStats | null>(null)

  useEffect(() => {
    loadPendingSubmissions()
  }, [])

  const loadPendingSubmissions = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/campaigns/content/pending')
      if (response.ok) {
        const data = await response.json()
        setPendingSubmissions(data.submissions)
      } else {
        toast({
          title: "Error",
          description: "Failed to load pending submissions",
          variant: "destructive"
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load pending submissions",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadContentStats = async () => {
    try {
      const response = await fetch('/api/campaigns/content/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch {
    }
  }

  const handleReviewSubmission = async () => {
    if (!selectedSubmission) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/campaigns/${selectedSubmission.campaign.id}/content`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          status: selectedStatus,
          reviewNotes: reviewNotes.trim() || undefined
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Content ${selectedStatus.toLowerCase()} successfully`,
        })
        
        // Remove from pending list
        setPendingSubmissions(prev => 
          prev.filter(sub => sub.id !== selectedSubmission.id)
        )
        
        // Reset form
        setSelectedSubmission(null)
        setReviewNotes('')
        setSelectedStatus('APPROVED')
        
        // Reload stats
        loadContentStats()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to review submission",
          variant: "destructive"
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to review submission",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      SUBMITTED: { color: 'bg-blue-100 text-blue-800', label: 'Submitted' },
      APPROVED: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      REJECTED: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      REVISION_REQUESTED: { color: 'bg-orange-100 text-orange-800', label: 'Revision Requested' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getQualityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (isLoading) {
    return (
      <StaffProtectedRoute>
        <div className="min-h-screen" style={{ backgroundColor: '#EEF7FA' }}>
          <ModernStaffHeader />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </StaffProtectedRoute>
    )
  }

  return (
    <StaffProtectedRoute>
      <div className="min-h-screen" style={{ backgroundColor: '#EEF7FA' }}>
        <ModernStaffHeader />
        
        <main className="px-4 lg:px-8 pb-8">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold">Content Management</h1>
            <Button onClick={loadPendingSubmissions} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                  <p className="text-2xl font-bold">{stats.totalSubmissions}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingCount}</p>
                </div>
                <Eye className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approvedCount}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Quality Score</p>
                  <p className={`text-2xl font-bold ${getQualityScoreColor(stats.averageQualityScore)}`}>
                    {stats.averageQualityScore}%
                  </p>
                </div>
                <Star className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Submissions List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Pending Reviews ({pendingSubmissions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingSubmissions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending submissions to review</p>
              ) : (
                pendingSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedSubmission?.id === submission.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{submission.influencer.displayName}</h3>
                          {getStatusBadge(submission.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {submission.campaign.name} • {submission.platform}
                        </p>
                        <p className="text-sm text-gray-500">
                          Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                        </p>
                        {submission.qualityScore && (
                          <div className="flex items-center gap-1 mt-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className={`text-sm font-medium ${getQualityScoreColor(submission.qualityScore)}`}>
                              {submission.qualityScore}% Quality Score
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation()
                          window.open(submission.contentUrl, '_blank')
                        }}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Review Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Review Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedSubmission ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Content Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Influencer:</strong> {selectedSubmission.influencer.displayName}</p>
                    <p><strong>Campaign:</strong> {selectedSubmission.campaign.name}</p>
                    <p><strong>Platform:</strong> {selectedSubmission.platform}</p>
                    <p><strong>Type:</strong> {selectedSubmission.contentType}</p>
                    {selectedSubmission.title && (
                      <p><strong>Title:</strong> {selectedSubmission.title}</p>
                    )}
                    {selectedSubmission.caption && (
                      <p><strong>Caption:</strong> {selectedSubmission.caption.substring(0, 100)}...</p>
                    )}
                  </div>
                </div>

                {selectedSubmission.views && (
                  <div>
                    <h4 className="font-medium mb-2">Performance Metrics</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p>Views: {selectedSubmission.views.toLocaleString()}</p>
                      <p>Likes: {selectedSubmission.likes?.toLocaleString() || 0}</p>
                      <p>Comments: {selectedSubmission.comments?.toLocaleString() || 0}</p>
                      <p>Shares: {selectedSubmission.shares?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Review Decision</h4>
                  <Select value={selectedStatus} onValueChange={(value: 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED') => setSelectedStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="APPROVED">Approve</SelectItem>
                      <SelectItem value="REJECTED">Reject</SelectItem>
                      <SelectItem value="REVISION_REQUESTED">Request Revision</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Review Notes</h4>
                  <Textarea
                    placeholder="Add review notes (optional)"
                    value={reviewNotes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReviewNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleReviewSubmission}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <>
                        {selectedStatus === 'APPROVED' && <CheckCircle className="w-4 h-4 mr-2" />}
                        {selectedStatus === 'REJECTED' && <XCircle className="w-4 h-4 mr-2" />}
                        {selectedStatus === 'REVISION_REQUESTED' && <RefreshCw className="w-4 h-4 mr-2" />}
                      </>
                    )}
                    {selectedStatus === 'APPROVED' ? 'Approve' : 
                     selectedStatus === 'REJECTED' ? 'Reject' : 'Request Revision'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedSubmission(null)
                      setReviewNotes('')
                      setSelectedStatus('APPROVED')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Select a submission to review
              </div>
            )}
          </CardContent>
        </Card>
      </div>
        </main>
      </div>
    </StaffProtectedRoute>
  )
} 