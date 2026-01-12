'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { InfluencerProtectedRoute } from '../../../components/auth/ProtectedRoute'
import ModernInfluencerHeader from '../../../components/nav/ModernInfluencerHeader'
import { Calendar, Clock, CheckCircle, DollarSign, AlertCircle, Plus, X, ExternalLink, Upload, FileText, Link as LinkIcon, TrendingUp, Award, Sparkles } from 'lucide-react'

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
  const [currency, setCurrency] = useState<string>('GBP')
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
      case 'active': return 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50'
      case 'completed': return 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/50'
      case 'pending_content': return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/50'
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
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

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Load campaigns from API
  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/influencer/campaigns')
        if (response.ok) {
          const data = await response.json()
          if (data.campaigns) {
            setCampaigns(data.campaigns || [])
          }
          if (data.currency) {
            setCurrency(data.currency)
          }
        }
      } catch (error) {
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
      } catch (error) {
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
    } catch (error) {
      console.error('Error submitting content:', error)
      alert('Error submitting content')
    } finally {
      setIsSubmitting(false)
    }
  }

  const CampaignCard = ({ campaign }: { campaign: any }) => {
    const campaignSubmissions = submittedContent[campaign.id] || []
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -2 }}
        className="group relative bg-white/90 backdrop-blur-md rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100/80 overflow-hidden"
      >
        {/* Gradient accent bar */}
        <div className={`h-1.5 ${campaign.status === 'active' ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-600' : campaign.status === 'completed' ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600' : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600'}`}></div>
        
        {/* Subtle background gradient */}
        <div className={`absolute inset-0 opacity-5 ${campaign.status === 'active' ? 'bg-gradient-to-br from-cyan-500 to-blue-500' : campaign.status === 'completed' ? 'bg-gradient-to-br from-emerald-500 to-green-500' : 'bg-gradient-to-br from-amber-500 to-orange-500'}`}></div>
        
        <div className="relative p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-2xl shadow-lg ${campaign.status === 'active' ? 'bg-gradient-to-br from-cyan-500 to-blue-500 shadow-cyan-500/30' : campaign.status === 'completed' ? 'bg-gradient-to-br from-emerald-500 to-green-500 shadow-emerald-500/30' : 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/30'}`}>
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{campaign.name}</h3>
                  <p className="text-gray-500 text-sm font-medium">{campaign.brand_name || campaign.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide ${getStatusColor(campaign.status)}`}>
                  {getStatusText(campaign.status)}
                </span>
                <span className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl text-emerald-700 font-bold shadow-sm border border-emerald-100">
                  <DollarSign className="h-4 w-4" />
                  {formatCurrency(campaign.amount || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50/80 to-cyan-50/80 rounded-2xl border border-blue-100/50 shadow-sm backdrop-blur-sm">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/25">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Deadline</p>
                <p className="text-base font-bold text-gray-900">{formatDeadline(campaign.deadline)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-purple-50/80 to-pink-50/80 rounded-2xl border border-purple-100/50 shadow-sm backdrop-blur-sm">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg shadow-purple-500/25">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Duration</p>
                <p className="text-base font-bold text-gray-900">{campaign.duration || 'N/A'} days</p>
              </div>
            </div>
          </div>

          {(campaign.requirements?.length > 0 || campaign.deliverables?.length > 0) && (
            <div className="space-y-4 mb-6">
              {campaign.requirements?.length > 0 && (
                <div className="p-5 bg-gradient-to-br from-emerald-50/80 to-green-50/80 rounded-2xl border border-emerald-100/50 shadow-sm backdrop-blur-sm">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    Requirements
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-2.5">
                    {campaign.requirements.map((req: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span className="leading-relaxed">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {campaign.deliverables?.length > 0 && (
                <div className="p-5 bg-gradient-to-br from-blue-50/80 to-cyan-50/80 rounded-2xl border border-blue-100/50 shadow-sm backdrop-blur-sm">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    Deliverables
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-2.5">
                    {campaign.deliverables.map((del: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <FileText className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="leading-relaxed">{del}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200/60">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Upload className="h-5 w-5 text-gray-600" />
                  Submitted Content
                </h4>
                {campaignSubmissions.length > 0 ? (
                  <div className="space-y-3">
                    {campaignSubmissions.map((submission: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-xl border shadow-sm ${
                          submission.status === 'REVISION_REQUESTED'
                            ? 'bg-orange-50/80 border-orange-200'
                            : submission.status === 'REJECTED'
                            ? 'bg-red-50/80 border-red-200'
                            : 'bg-gradient-to-r from-gray-50/80 to-gray-50/40 border-gray-100/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg shadow-md ${
                            submission.status === 'APPROVED'
                              ? 'bg-gradient-to-br from-emerald-500 to-green-500'
                              : submission.status === 'REJECTED'
                              ? 'bg-gradient-to-br from-red-500 to-rose-500'
                              : submission.status === 'REVISION_REQUESTED'
                              ? 'bg-gradient-to-br from-orange-500 to-amber-500'
                              : 'bg-gradient-to-br from-cyan-500 to-blue-500'
                          }`}>
                            <ExternalLink className="h-4 w-4 text-white" />
                          </div>
                          <a 
                            href={submission.content_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-cyan-600 hover:text-cyan-700 font-semibold flex-1 transition-colors"
                          >
                            {submission.content_type} on {submission.platform}
                          </a>
                          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                            submission.status === 'APPROVED' 
                              ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30' 
                              : submission.status === 'REJECTED' 
                              ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30'
                              : submission.status === 'REVISION_REQUESTED'
                              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30'
                              : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                          }`}>
                            {submission.status === 'REVISION_REQUESTED' ? 'REVISION NEEDED' : submission.status}
                          </span>
                        </div>
                        
                        {/* Staff Feedback */}
                        {(submission.status === 'REJECTED' || submission.status === 'REVISION_REQUESTED') && submission.review_notes && (
                          <div className={`mt-3 p-3 rounded-lg ${
                            submission.status === 'REJECTED'
                              ? 'bg-red-100/80 border border-red-200'
                              : 'bg-orange-100/80 border border-orange-200'
                          }`}>
                            <div className="flex items-start gap-2">
                              <AlertCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                                submission.status === 'REJECTED' ? 'text-red-600' : 'text-orange-600'
                              }`} />
                              <div>
                                <p className={`text-xs font-semibold mb-1 ${
                                  submission.status === 'REJECTED' ? 'text-red-700' : 'text-orange-700'
                                }`}>
                                  {submission.status === 'REJECTED' ? 'Rejection Reason' : 'Revision Requested'}
                                </p>
                                <p className={`text-sm ${
                                  submission.status === 'REJECTED' ? 'text-red-600' : 'text-orange-600'
                                }`}>
                                  {submission.review_notes}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No content submitted yet</p>
                )}
              </div>
              
              {campaign.status === 'active' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSubmissionModal(campaign.id)}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/50 flex items-center gap-2 font-bold"
                >
                  <Plus className="h-5 w-5" />
                  Submit Content
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30">
        <ModernInfluencerHeader />
        
        <div className="px-4 lg:px-8 pb-12 pt-8">

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="group relative bg-blue-50/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-blue-100/50 overflow-hidden"
            >
              <div className="relative">
                <div className="inline-flex p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/25 mb-4">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Active Campaigns</p>
                <p className="text-3xl font-bold text-gray-900">{activeCampaigns.length}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="group relative bg-emerald-50/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-emerald-100/50 overflow-hidden"
            >
              <div className="relative">
                <div className="inline-flex p-3 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl shadow-lg shadow-emerald-500/25 mb-4">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{completedCampaigns.length}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="group relative bg-amber-50/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-amber-100/50 overflow-hidden"
            >
              <div className="relative">
                <div className="inline-flex p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg shadow-amber-500/25 mb-4">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Earned</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalEarned)}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="group relative bg-purple-50/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-purple-100/50 overflow-hidden"
            >
              <div className="relative">
                <div className="inline-flex p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg shadow-purple-500/25 mb-4">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Pending Payment</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(pendingPayment)}</p>
              </div>
            </motion.div>
          </div>

          {/* Campaigns */}
          <div className="space-y-5">
            {campaigns.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="mx-auto h-20 w-20 text-gray-300 mb-6">
                  <Calendar className="h-20 w-20" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns yet</h3>
                <p className="text-gray-500 max-w-md mx-auto">You haven't been assigned to any campaigns yet. Check back soon!</p>
              </motion.div>
            ) : (
              campaigns.map((campaign, index) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CampaignCard campaign={campaign} />
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Content Submission Modal */}
        {submissionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSubmissionModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100/50"
            >
              <div className="p-6 border-b border-gray-200/60 bg-gradient-to-r from-gray-50/50 to-white">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Submit Content</h2>
                  <button
                    onClick={() => setSubmissionModal(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-6">
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 shadow-sm transition-all bg-white/80"
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
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 shadow-sm transition-all bg-white/80"
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
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 shadow-sm transition-all bg-white/80"
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 shadow-sm transition-all bg-white/80"
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 shadow-sm transition-all bg-white/80 resize-none"
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
                      className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 shadow-sm transition-all bg-white/80"
                    />
                    <input
                      type="number"
                      placeholder="Likes"
                      value={submissionForm.likes || ''}
                      onChange={(e) => setSubmissionForm(prev => ({ ...prev, likes: e.target.value ? parseInt(e.target.value) : undefined }))}
                      className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 shadow-sm transition-all bg-white/80"
                    />
                    <input
                      type="number"
                      placeholder="Comments"
                      value={submissionForm.comments || ''}
                      onChange={(e) => setSubmissionForm(prev => ({ ...prev, comments: e.target.value ? parseInt(e.target.value) : undefined }))}
                      className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 shadow-sm transition-all bg-white/80"
                    />
                    <input
                      type="number"
                      placeholder="Shares"
                      value={submissionForm.shares || ''}
                      onChange={(e) => setSubmissionForm(prev => ({ ...prev, shares: e.target.value ? parseInt(e.target.value) : undefined }))}
                      className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 shadow-sm transition-all bg-white/80"
                    />
                    <input
                      type="number"
                      placeholder="Saves"
                      value={submissionForm.saves || ''}
                      onChange={(e) => setSubmissionForm(prev => ({ ...prev, saves: e.target.value ? parseInt(e.target.value) : undefined }))}
                      className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 shadow-sm transition-all bg-white/80"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200/60 bg-gradient-to-r from-gray-50/50 to-white flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSubmissionModal(null)}
                  className="px-6 py-3 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm font-semibold"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSubmitContent(submissionModal)}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:opacity-60 transition-all shadow-lg shadow-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/50 flex items-center font-bold"
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
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </InfluencerProtectedRoute>
  )
} 