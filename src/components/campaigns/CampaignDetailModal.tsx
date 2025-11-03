'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Users, 
  DollarSign, 
  Calendar, 
  Target,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  TrendingUp
} from 'lucide-react'
import { Campaign } from '../../types/index'

interface CampaignDetailModalProps {
  campaign: Campaign | null
  isOpen: boolean
  onClose: () => void
}

interface CampaignDetail {
  campaign: any
  influencers: any[]
  content: any[]
}

interface CampaignAnalytics {
  total_influencers: number
  accepted_influencers: number
  content_posted: number
  total_spend: number
  total_content: number
  total_views: number
  total_likes: number
  total_comments: number
  total_shares: number
  instagram_posts: number
  tiktok_posts: number
  youtube_posts: number
}

export default function CampaignDetailModal({ campaign, isOpen, onClose }: CampaignDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'influencers' | 'content' | 'analytics'>('overview')
  const [campaignDetail, setCampaignDetail] = useState<CampaignDetail | null>(null)
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch campaign details when modal opens
  useEffect(() => {
    if (isOpen && campaign?.id) {
      fetchCampaignDetails()
      fetchCampaignAnalytics()
    }
  }, [isOpen, campaign?.id])

  const fetchCampaignDetails = async () => {
    if (!campaign?.id) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/brand/campaigns/${campaign.id}`)
      if (response.ok) {
        const _result = await response.json()
        setCampaignDetail(result.data)
      }
    } catch (_error) {
      console.error('Failed to fetch campaign details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCampaignAnalytics = async () => {
    if (!campaign?.id) return
    
    try {
      const response = await fetch(`/api/brand/campaigns/${campaign.id}?include=analytics`)
      if (response.ok) {
        const _result = await response.json()
        setAnalytics(result.data)
      }
    } catch (_error) {
      console.error('Failed to fetch campaign analytics:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getEngagementRate = (likes: number, comments: number, views: number) => {
    if (views === 0) return 0
    return ((likes + comments) / views * 100).toFixed(1)
  }

  if (!isOpen || !campaign) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Background overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-screen items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-6xl bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <h2 className="text-2xl font-bold text-gray-900">{campaign.name}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-gray-500" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                {[
                  { id: 'overview', label: 'Overview', icon: Target },
                  { id: 'influencers', label: 'Influencers', icon: Users },
                  { id: 'content', label: 'Content', icon: Eye },
                  { id: 'analytics', label: 'Analytics', icon: TrendingUp }
                ].map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === tab.id
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Campaign Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-blue-50 rounded-xl p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Users size={20} className="text-blue-600" />
                            <span className="text-sm font-medium text-blue-600">Influencers</span>
                          </div>
                          <div className="text-2xl font-bold text-gray-900">
                            {campaign.acceptedCount}/{campaign.totalInfluencers}
                          </div>
                          <div className="text-sm text-gray-600">Accepted</div>
                        </div>

                        <div className="bg-green-50 rounded-xl p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <DollarSign size={20} className="text-green-600" />
                            <span className="text-sm font-medium text-green-600">Budget</span>
                          </div>
                          <div className="text-2xl font-bold text-gray-900">
                            {formatCurrency(campaign.budget.total)}
                          </div>
                          <div className="text-sm text-gray-600">Total Budget</div>
                        </div>

                        <div className="bg-purple-50 rounded-xl p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Eye size={20} className="text-purple-600" />
                            <span className="text-sm font-medium text-purple-600">Content</span>
                          </div>
                          <div className="text-2xl font-bold text-gray-900">
                            {campaignDetail?.content?.length || 0}
                          </div>
                          <div className="text-sm text-gray-600">Submissions</div>
                        </div>

                        <div className="bg-orange-50 rounded-xl p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Calendar size={20} className="text-orange-600" />
                            <span className="text-sm font-medium text-orange-600">Timeline</span>
                          </div>
                          <div className="text-2xl font-bold text-gray-900">
                            {campaign.timeline.contentDeadline ? 
                              Math.ceil((new Date(campaign.timeline.contentDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                              : '--'
                            }
                          </div>
                          <div className="text-sm text-gray-600">Days Left</div>
                        </div>
                      </div>

                      {/* Campaign Details */}
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Description</h3>
                        <p className="text-gray-700 mb-4">{campaign.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Deliverables</h4>
                            <ul className="space-y-1">
                              {campaign.deliverables.map((deliverable: string, index: number) => (
                                <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                                  <CheckCircle size={14} className="text-green-500" />
                                  <span>{deliverable}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Platforms</h4>
                            <div className="flex flex-wrap gap-2">
                              {campaign.requirements.platforms.map((platform: string, index: number) => (
                                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                  {platform}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Influencers Tab */}
                  {activeTab === 'influencers' && (
                    <div className="space-y-4">
                      {campaignDetail?.influencers?.map((influencer: any) => (
                        <div key={influencer.id} className="bg-white border border-gray-200 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <img
                                src={influencer.avatar_url || '/default-avatar.svg'}
                                alt={influencer.display_name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              <div>
                                <h4 className="font-medium text-gray-900">{influencer.display_name}</h4>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <span>{formatNumber(influencer.total_followers)} followers</span>
                                  <span>{(influencer.total_engagement_rate * 100).toFixed(1)}% engagement</span>
                                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">{influencer.niche_primary}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className="text-sm text-gray-600">Status</div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  influencer.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                                  influencer.status === 'INVITED' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {influencer.status}
                                </span>
                              </div>
                              
                              <div className="text-right">
                                <div className="text-sm text-gray-600">Content</div>
                                <div className="text-sm font-medium">
                                  {influencer.approved_content}/{influencer.content_submissions}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {(!campaignDetail?.influencers || campaignDetail.influencers.length === 0) && (
                        <div className="text-center py-12 text-gray-500">
                          <Users size={48} className="mx-auto mb-4 text-gray-300" />
                          <p>No influencers assigned to this campaign yet.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content Tab */}
                  {activeTab === 'content' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {campaignDetail?.content?.map((content: any) => (
                        <div key={content.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                          <div className="aspect-video bg-gray-100 relative">
                            {content.screenshot_url ? (
                              <img 
                                src={content.screenshot_url} 
                                alt="Content preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-gray-400">
                                <Eye size={24} />
                              </div>
                            )}
                            <div className="absolute top-2 left-2">
                              <span className="px-2 py-1 bg-black bg-opacity-75 text-white text-xs rounded">
                                {content.platform}
                              </span>
                            </div>
                            <div className="absolute top-2 right-2">
                              <span className={`px-2 py-1 text-xs rounded ${
                                content.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                content.status === 'SUBMITTED' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {content.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <img
                                src={content.influencer_avatar || '/default-avatar.svg'}
                                alt={content.influencer_name}
                                className="w-6 h-6 rounded-full"
                              />
                              <span className="text-sm font-medium text-gray-900">
                                {content.influencer_name}
                              </span>
                            </div>
                            
                            {content.views && (
                              <div className="flex items-center justify-between text-sm text-gray-600">
                                <div className="flex items-center space-x-4">
                                  <span className="flex items-center space-x-1">
                                    <Eye size={14} />
                                    <span>{formatNumber(content.views)}</span>
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <Heart size={14} />
                                    <span>{formatNumber(content.likes || 0)}</span>
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <MessageCircle size={14} />
                                    <span>{formatNumber(content.comments || 0)}</span>
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {getEngagementRate(content.likes || 0, content.comments || 0, content.views)}%
                                </span>
                              </div>
                            )}
                            
                            {content.content_url && (
                              <a
                                href={content.content_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 mt-2"
                              >
                                <span>View Post</span>
                                <ExternalLink size={14} />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {(!campaignDetail?.content || campaignDetail.content.length === 0) && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                          <Eye size={48} className="mx-auto mb-4 text-gray-300" />
                          <p>No content submissions yet.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Analytics Tab */}
                  {activeTab === 'analytics' && analytics && (
                    <div className="space-y-6">
                      {/* Key Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-blue-50 rounded-xl p-4">
                          <div className="text-2xl font-bold text-gray-900">{formatNumber(analytics.total_views || 0)}</div>
                          <div className="text-sm text-gray-600">Total Views</div>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4">
                          <div className="text-2xl font-bold text-gray-900">{formatNumber(analytics.total_likes || 0)}</div>
                          <div className="text-sm text-gray-600">Total Likes</div>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-4">
                          <div className="text-2xl font-bold text-gray-900">{formatNumber(analytics.total_comments || 0)}</div>
                          <div className="text-sm text-gray-600">Total Comments</div>
                        </div>
                        <div className="bg-orange-50 rounded-xl p-4">
                          <div className="text-2xl font-bold text-gray-900">
                            {analytics.total_views > 0 ? 
                              getEngagementRate(analytics.total_likes || 0, analytics.total_comments || 0, analytics.total_views) + '%'
                              : '0%'
                            }
                          </div>
                          <div className="text-sm text-gray-600">Avg Engagement</div>
                        </div>
                      </div>

                      {/* Platform Breakdown */}
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Breakdown</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{analytics.instagram_posts || 0}</div>
                            <div className="text-sm text-gray-600">Instagram Posts</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{analytics.tiktok_posts || 0}</div>
                            <div className="text-sm text-gray-600">TikTok Videos</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{analytics.youtube_posts || 0}</div>
                            <div className="text-sm text-gray-600">YouTube Videos</div>
                          </div>
                        </div>
                      </div>

                      {/* Campaign Performance */}
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Performance</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <div className="text-sm text-gray-600 mb-2">Influencer Participation</div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Accepted</span>
                                <span className="font-medium">{analytics.accepted_influencers}/{analytics.total_influencers}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full" 
                                  style={{ 
                                    width: `${analytics.total_influencers > 0 ? (analytics.accepted_influencers / analytics.total_influencers) * 100 : 0}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-gray-600 mb-2">Content Delivery</div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Posted</span>
                                <span className="font-medium">{analytics.content_posted}/{analytics.total_content}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ 
                                    width: `${analytics.total_content > 0 ? (analytics.content_posted / analytics.total_content) * 100 : 0}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}
