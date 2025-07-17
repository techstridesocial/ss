'use client'

import React, { useState, useEffect } from 'react'
import { InfluencerProtectedRoute } from '../../../components/auth/ProtectedRoute'
import ModernInfluencerHeader from '../../../components/nav/ModernInfluencerHeader'
import { Calendar, Clock, CheckCircle, DollarSign, AlertCircle, Plus, X, ExternalLink, Upload, FileText, Link as LinkIcon } from 'lucide-react'

// Mock assigned campaigns (already accepted externally)
const MOCK_CAMPAIGNS = [
  {
    id: 'camp_1',
    campaign_name: 'Summer Beauty Collection',
    brand_name: 'Luxe Beauty Co',
    description: 'Create authentic content showcasing your daily routine with our new makeup line.',
    amount: 1500,
    deadline: '2024-02-15T23:59:59Z',
    deliverables: ['Instagram Posts', 'Stories', 'Reels'],
    status: 'active',
    assigned_at: '2024-01-10T10:00:00Z'
  },
  {
    id: 'camp_2',
    campaign_name: 'Fitness Equipment Launch',
    brand_name: 'FitGear Pro',
    description: 'Create engaging workout content showcasing our new home gym equipment.',
    amount: 920,
    deadline: '2024-03-01T23:59:59Z',
    deliverables: ['Instagram Posts', 'YouTube Review', 'Stories'],
    status: 'completed',
    assigned_at: '2024-01-05T09:00:00Z'
  }
]

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

  const activeCampaigns = MOCK_CAMPAIGNS.filter(c => c.status === 'active')
  const completedCampaigns = MOCK_CAMPAIGNS.filter(c => c.status === 'completed')
  const totalEarned = MOCK_CAMPAIGNS.filter(c => c.status === 'completed').reduce((sum, c) => sum + c.amount, 0)
  const pendingPayment = MOCK_CAMPAIGNS.filter(c => c.status === 'active').reduce((sum, c) => sum + c.amount, 0)

  // Load submitted content for campaigns
  useEffect(() => {
    const loadSubmittedContent = async () => {
      for (const campaign of MOCK_CAMPAIGNS) {
        try {
          const response = await fetch(`/api/campaigns/${campaign.id}/submit-content`)
          if (response.ok) {
            const data = await response.json()
            setSubmittedContent(prev => ({
              ...prev,
              [campaign.id]: data.submissions || []
            }))
          }
        } catch (error) {
          console.error('Error loading submitted content:', error)
        }
      }
    }

    loadSubmittedContent()
  }, [])

  const handleSubmitContent = async (campaignId: string) => {
    if (!submissionForm.content_url || !submissionForm.content_type || !submissionForm.platform) {
      alert('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/submit-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...submissionForm,
          hashtags: submissionForm.hashtags?.filter(tag => tag.trim()) || []
        })
      })

      const result = await response.json()

      if (response.ok) {
        alert('Content submitted successfully!')
        
        // Refresh submitted content for this campaign
        const refreshResponse = await fetch(`/api/campaigns/${campaignId}/submit-content`)
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json()
          setSubmittedContent(prev => ({
            ...prev,
            [campaignId]: refreshData.submissions || []
          }))
        }

        // Reset form and close modal
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
      } else {
        alert(`Error: ${result.error || 'Failed to submit content'}`)
      }
    } catch (error) {
      console.error('Error submitting content:', error)
      alert('Failed to submit content. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const CampaignCard = ({ campaign }: { campaign: any }) => {
    const campaignSubmissions = submittedContent[campaign.id] || []
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{campaign.campaign_name}</h3>
            <p className="text-gray-600">{campaign.brand_name}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-green-600">£{campaign.amount}</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${getStatusColor(campaign.status)}`}>
              {getStatusText(campaign.status)}
            </span>
          </div>
        </div>
        
        <p className="text-gray-700 mb-4">{campaign.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-1" />
            Due: {formatDeadline(campaign.deadline)}
          </div>
          <div className="flex flex-wrap gap-2">
            {campaign.deliverables.map((deliverable: string, index: number) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                {deliverable}
              </span>
            ))}
          </div>
        </div>

        {/* Content Submissions Section */}
        {campaign.status === 'active' && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">Content Submissions</h4>
              <button
                onClick={() => setSubmissionModal(campaign.id)}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Content
              </button>
            </div>

            {campaignSubmissions.length > 0 ? (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {campaignSubmissions.map((submission: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="capitalize font-medium">{submission.content_type}</span>
                      <span className="text-gray-500">on {submission.platform}</span>
                      {submission.title && <span className="text-gray-700">- {submission.title}</span>}
                    </div>
                    <a
                      href={submission.content_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                      title="View content"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No content submitted yet</p>
            )}
          </div>
        )}

        {/* Show submitted content for completed campaigns */}
        {campaign.status === 'completed' && campaignSubmissions.length > 0 && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Submitted Content</h4>
            <div className="space-y-2">
              {campaignSubmissions.map((submission: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded text-xs">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="capitalize font-medium">{submission.content_type}</span>
                    <span className="text-gray-500">on {submission.platform}</span>
                    {submission.title && <span className="text-gray-700">- {submission.title}</span>}
                  </div>
                  <a
                    href={submission.content_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                    title="View content"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <InfluencerProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <ModernInfluencerHeader />
        
        <div className="px-4 lg:px-6 pb-8">
          {/* Campaign Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Active</h3>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{activeCampaigns.length}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Completed</h3>
                  <p className="text-2xl font-bold text-green-600 mt-1">{completedCampaigns.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Earned</h3>
                  <p className="text-2xl font-bold text-green-600 mt-1">£{totalEarned}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Pending</h3>
                  <p className="text-2xl font-bold text-orange-600 mt-1">£{pendingPayment}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Active Campaigns */}
          {activeCampaigns.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Campaigns</h2>
              <div className="space-y-4">
                {activeCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            </div>
          )}

          {/* Completed Campaigns */}
          {completedCampaigns.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Completed Campaigns</h2>
              <div className="space-y-4">
                {completedCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {MOCK_CAMPAIGNS.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns assigned</h3>
              <p className="text-gray-600 mb-6">
                You don't have any campaigns assigned yet. New campaigns will appear here when you're selected for collaborations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Complete Your Profile
                </button>
                <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Connect Social Accounts
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content Submission Modal */}
        {submissionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Submit Campaign Content</h3>
                  <button
                    onClick={() => setSubmissionModal(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Content URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={submissionForm.content_url}
                    onChange={(e) => setSubmissionForm(prev => ({ ...prev, content_url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://instagram.com/p/..."
                  />
                </div>

                {/* Content Type and Platform */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content Type *
                    </label>
                    <select
                      value={submissionForm.content_type}
                      onChange={(e) => setSubmissionForm(prev => ({ ...prev, content_type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="post">Post</option>
                      <option value="story">Story</option>
                      <option value="reel">Reel</option>
                      <option value="video">Video</option>
                      <option value="blog_post">Blog Post</option>
                      <option value="review">Review</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform *
                    </label>
                    <select
                      value={submissionForm.platform}
                      onChange={(e) => setSubmissionForm(prev => ({ ...prev, platform: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                      <option value="youtube">YouTube</option>
                      <option value="twitter">Twitter</option>
                      <option value="facebook">Facebook</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="blog">Blog/Website</option>
                    </select>
                  </div>
                </div>

                {/* Title and Description */}
                <div className="grid grid-cols-1 gap-4">
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