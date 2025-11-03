'use client'

import React, { useState, useEffect } from 'react'
import { InfluencerProtectedRoute } from '../../../components/auth/ProtectedRoute'
import ModernInfluencerHeader from '../../../components/nav/ModernInfluencerHeader'
import { Calendar, Clock, CheckCircle, DollarSign, AlertCircle, Plus, X, ExternalLink, Upload, FileText, Link as LinkIcon } from 'lucide-react'

interface ContentSubmission {
  content_url: string
  content_type: string
  platform: string
  title?: string
  description?: string
  caption?: string
  hashtags?: string[]
  views?: number
  likes?: number
  comments?: number
  shares?: number
  saves?: number
}

export default function InfluencerCampaigns() {
  // Campaigns will be loaded from API
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [submissionModal, setSubmissionModal] = useState<string | null>(null)
  const [submissionForm, setSubmissionForm] = useState<ContentSubmission>({
    content_url: '',
    content_type: 'post',
    platform: 'instagram',
    title: '',
    description: '',
    caption: '',
    hashtags: [],
    views: undefined,
    likes: undefined,
    comments: undefined,
    shares: undefined,
    saves: undefined
  })
  const [submittedContent, setSubmittedContent] = useState<{[key: string]: any[]}>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending_content': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active'
      case 'completed': return 'Completed'
      case 'pending_content': return 'Pending Content'
      default: return 'Unknown'
    }
  }

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const activeCampaigns = campaigns.filter((c: any) => c.status === 'active')
  const completedCampaigns = campaigns.filter((c: any) => c.status === 'completed')
  const totalEarned = campaigns.filter((c: any) => c.status === 'completed').reduce((sum: number, c: any) => sum + (c.amount || 0), 0)
  const pendingPayment = campaigns.filter((c: any) => c.status === 'active').reduce((sum: number, c: any) => sum + (c.amount || 0), 0)

  // Load campaigns from API
  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/influencer/campaigns')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setCampaigns(data.data.campaigns || [])
          }
        }
      } catch (_error) {
        console.error('Error loading campaigns:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCampaigns()
  }, [])

  // Load submitted content for campaigns
  useEffect(() => {
    const loadSubmittedContent = async () => {
      try {
        const contentData: {[key: string]: any[]} = {}
        for (const campaign of campaigns) {
          const response = await fetch(`/api/campaigns/${campaign.id}/submit-content`)
          if (response.ok) {
            const data = await response.json()
            if (data.success) {
              contentData[campaign.id] = data.submissions || []
            }
          }
        }
        setSubmittedContent(contentData)
      } catch (_error) {
        console.error('Error loading submitted content:', error)
      }
    }

    if (campaigns.length > 0) {
      loadSubmittedContent()
    }
  }, [campaigns])

  const handleSubmitContent = async (campaignId: string) => {
    if (!submissionForm.content_url || !submissionForm.content_type || !submissionForm.platform) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/campaigns/${campaignId}/submit-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionForm)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Reset form
          setSubmissionForm({
            content_url: '',
            content_type: 'post',
            platform: 'instagram',
            title: '',
            description: '',
            caption: '',
            hashtags: [],
            views: undefined,
            likes: undefined,
            comments: undefined,
            shares: undefined,
            saves: undefined
          })
          setSubmissionModal(null)
          
          // Reload submitted content
          const contentResponse = await fetch(`/api/campaigns/${campaignId}/submit-content`)
          if (contentResponse.ok) {
            const contentData = await contentResponse.json()
            if (contentData.success) {
              setSubmittedContent(prev => ({
                ...prev,
                [campaignId]: contentData.submissions || []
              }))
            }
          }
          
          alert('Content submitted successfully!')
        } else {
          alert(data.error || 'Failed to submit content')
        }
      } else {
        alert('Failed to submit content')
      }
    } catch (_error) {
      console.error('Error submitting content:', error)
      alert('Error submitting content')
    } finally {
      setIsSubmitting(false)
    }
  }

  const CampaignCard = ({ campaign }: { campaign: any }) => {
    const campaignSubmissions = submittedContent[campaign.id] || []
    
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{campaign.name}</h3>
            <p className="text-gray-600 mb-2">{campaign.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                {getStatusText(campaign.status)}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                ${campaign.amount || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Deadline: {formatDeadline(campaign.deadline)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Duration: {campaign.duration} days</span>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {campaign.requirements?.map((req: string, index: number) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  {req}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Deliverables</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {campaign.deliverables?.map((del: string, index: number) => (
                <li key={index} className="flex items-center gap-2">
                  <FileText className="h-3 w-3 text-blue-500" />
                  {del}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Submitted Content</h4>
              {campaignSubmissions.length > 0 ? (
                <div className="space-y-2">
                  {campaignSubmissions.map((submission: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <ExternalLink className="h-4 w-4 text-blue-500" />
                      <a 
                        href={submission.content_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {submission.content_type} on {submission.platform}
                      </a>
                      <span className={`px-2 py-1 rounded-full text-xs ${submission.status === 'APPROVED' ? 'bg-green-100 text-green-800' : submission.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {submission.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No content submitted yet</p>
              )}
            </div>
            
            {campaign.status === 'active' && (
              <button
                onClick={() => setSubmissionModal(campaign.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Submit Content
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <InfluencerProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <ModernInfluencerHeader />
          <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </InfluencerProtectedRoute>
    )
  }

  return (
    <InfluencerProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <ModernInfluencerHeader />
        
        <div className="px-4 lg:px-6 pb-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Campaigns</h1>
            <p className="text-gray-600">Manage your active campaigns and track your earnings</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                  <p className="text-2xl font-bold text-gray-900">{activeCampaigns.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{completedCampaigns.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Earned</p>
                  <p className="text-2xl font-bold text-gray-900">${totalEarned}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Payment</p>
                  <p className="text-2xl font-bold text-gray-900">${pendingPayment}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Campaigns */}
          <div className="space-y-6">
            {campaigns.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <Calendar className="h-12 w-12" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns</h3>
                <p className="mt-1 text-sm text-gray-500">You haven't been assigned to any campaigns yet.</p>
              </div>
            ) : (
              campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))
            )}
          </div>
        </div>

        {/* Content Submission Modal */}
        {submissionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Submit Content</h2>
                  <button
                    onClick={() => setSubmissionModal(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Required Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={submissionForm.content_url}
                      onChange={(e) => setSubmissionForm(prev => ({ ...prev, content_url: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://instagram.com/p/..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={submissionForm.content_type}
                        onChange={(e) => setSubmissionForm(prev => ({ ...prev, content_type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="post">Post</option>
                        <option value="story">Story</option>
                        <option value="reel">Reel</option>
                        <option value="video">Video</option>
                        <option value="blog_post">Blog Post</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Platform <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={submissionForm.platform}
                        onChange={(e) => setSubmissionForm(prev => ({ ...prev, platform: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="instagram">Instagram</option>
                        <option value="tiktok">TikTok</option>
                        <option value="youtube">YouTube</option>
                        <option value="twitter">Twitter</option>
                        <option value="facebook">Facebook</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Optional Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title (optional)
                    </label>
                    <input
                      type="text"
                      value={submissionForm.title || ''}
                      onChange={(e) => setSubmissionForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Content title or brief description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Caption (optional)
                    </label>
                    <textarea
                      value={submissionForm.caption || ''}
                      onChange={(e) => setSubmissionForm(prev => ({ ...prev, caption: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Caption or post text"
                    />
                  </div>
                </div>

                {/* Performance Metrics */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Performance Metrics (optional)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <input
                      type="number"
                      placeholder="Views"
                      value={submissionForm.views || ''}
                      onChange={(e) => setSubmissionForm(prev => ({ ...prev, views: e.target.value ? parseInt(e.target.value) : undefined }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Likes"
                      value={submissionForm.likes || ''}
                      onChange={(e) => setSubmissionForm(prev => ({ ...prev, likes: e.target.value ? parseInt(e.target.value) : undefined }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Comments"
                      value={submissionForm.comments || ''}
                      onChange={(e) => setSubmissionForm(prev => ({ ...prev, comments: e.target.value ? parseInt(e.target.value) : undefined }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Shares"
                      value={submissionForm.shares || ''}
                      onChange={(e) => setSubmissionForm(prev => ({ ...prev, shares: e.target.value ? parseInt(e.target.value) : undefined }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Saves"
                      value={submissionForm.saves || ''}
                      onChange={(e) => setSubmissionForm(prev => ({ ...prev, saves: e.target.value ? parseInt(e.target.value) : undefined }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setSubmissionModal(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmitContent(submissionModal)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:opacity-60 transition-colors flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Submit Content
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </InfluencerProtectedRoute>
  )
} 