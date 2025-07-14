'use client'

import { useState, useEffect } from 'react'
import { X, Star, Building2, Calendar, DollarSign, Users, CheckCircle, Play, Pause, Edit, TrendingUp, Target, Clock, Package, MessageCircle, ChevronDown, ChevronUp, User, Mail, Phone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CampaignDetailPanelProps {
  isOpen: boolean
  onClose: () => void
  campaign: any
  onPauseCampaign?: (campaignId: string) => void
  onResumeCampaign?: (campaignId: string) => void
}

// Enhanced Section component with animation
const Section = ({ 
  title, 
  children, 
  className = '',
  delay = 0,
  action
}: { 
  title: string
  children: React.ReactNode
  className?: string
  delay?: number
  action?: React.ReactNode
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/40 p-8 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        {action}
      </div>
      {children}
    </motion.div>
  )
}

const InfoField = ({
  label,
  value,
  icon,
  type = 'text'
}: {
  label: string
  value: string | number
  icon?: React.ReactNode
  type?: 'text' | 'currency' | 'date' | 'percentage'
}) => {
  const renderValue = () => {
    if (type === 'currency' && typeof value === 'number') {
      return <span className="text-gray-900 font-medium">${value.toLocaleString()}</span>
    }
    
    if (type === 'date' && value) {
      return <span className="text-gray-900 font-medium">{new Date(value as string).toLocaleDateString()}</span>
    }
    
    if (type === 'percentage' && typeof value === 'number') {
      return <span className="text-gray-900 font-medium">{value}%</span>
    }
    
    return <span className="text-gray-900 font-medium">{value}</span>
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        {icon && <span className="text-gray-400">{icon}</span>}
        <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">{label}</label>
      </div>
      <div className="text-base leading-relaxed">{renderValue()}</div>
    </div>
  )
}

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return {
          label: 'Active',
          className: 'bg-green-100 text-green-800 border-green-200',
          dotColor: 'bg-green-600',
          icon: <Play size={10} />
        }
      case 'PAUSED':
        return {
          label: 'Paused',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          dotColor: 'bg-yellow-600',
          icon: <Pause size={10} />
        }
      case 'COMPLETED':
        return {
          label: 'Completed',
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          dotColor: 'bg-blue-600',
          icon: <CheckCircle size={10} />
        }
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          className: 'bg-red-100 text-red-800 border-red-200',
          dotColor: 'bg-red-600',
          icon: <X size={10} />
        }
      default:
        return {
          label: 'Draft',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          dotColor: 'bg-gray-600',
          icon: <Clock size={10} />
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full border ${config.className}`}>
      <div className={`w-2 h-2 ${config.dotColor} rounded-full mr-2`}></div>
      {config.icon}
      <span className="ml-1">{config.label}</span>
    </span>
  )
}

const ProgressBar = ({ current, total, label, color = 'blue' }: { current: number, total: number, label: string, color?: string }) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="text-gray-900 font-semibold">{current} / {total} ({percentage}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={`${colorClasses[color as keyof typeof colorClasses]} h-3 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

const InfluencerCard = ({ influencer }: { influencer: any }) => {
  const getContactStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'border-l-green-500 bg-green-50'
      case 'contacted': return 'border-l-yellow-500 bg-yellow-50'
      case 'pending': return 'border-l-gray-500 bg-gray-50'
      default: return 'border-l-gray-500 bg-gray-50'
    }
  }

  const getContactStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle size={16} className="text-green-600" />
      case 'contacted': return <Mail size={16} className="text-yellow-600" />
      case 'pending': return <Clock size={16} className="text-gray-600" />
      default: return <User size={16} className="text-gray-600" />
    }
  }

  const getContactStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmed'
      case 'contacted': return 'Contacted'
      case 'pending': return 'Pending Contact'
      default: return 'Unknown'
    }
  }

  return (
    <div className={`border-l-4 ${getContactStatusColor(influencer.contact_status)} p-4 rounded-r-lg`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {getContactStatusIcon(influencer.contact_status)}
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{influencer.name}</h4>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
              <span>{influencer.followers.toLocaleString()} followers</span>
              <span>{influencer.engagement_rate}% engagement</span>
              <span>{influencer.platform}</span>
            </div>
            {influencer.offered_amount && (
              <p className="text-sm text-gray-600 mt-1">Offered: ${influencer.offered_amount.toLocaleString()}</p>
            )}
            {influencer.contact_notes && (
              <p className="text-sm text-gray-700 mt-2 italic">{influencer.contact_notes}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            influencer.contact_status === 'confirmed' ? 'bg-green-100 text-green-800' :
            influencer.contact_status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {getContactStatusLabel(influencer.contact_status)}
          </span>
          {influencer.contacted_at && (
            <div className="text-xs text-gray-500 mt-1">
              {influencer.contact_status === 'confirmed' ? 'Confirmed' : 'Contacted'}: {new Date(influencer.contacted_at).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CampaignDetailPanel({ 
  isOpen, 
  onClose, 
  campaign, 
  onPauseCampaign,
  onResumeCampaign
}: CampaignDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'influencers' | 'analytics'>('overview')
  const [isLoading, setIsLoading] = useState(false)

  if (!campaign) return null

  // Determine if campaign has started (Active, Paused, or Completed campaigns)
  const campaignHasStarted = ['ACTIVE', 'PAUSED', 'COMPLETED'].includes(campaign.status)

  // Mock influencer data for the campaign - in real app this would come from props or API
  const baseInfluencers = [
    {
      id: 'inf_1',
      name: 'Sarah Creator',
      platform: 'Instagram',
      followers: 45000,
      engagement_rate: 4.2,
      contact_status: 'confirmed',
      offered_amount: 1500,
      contacted_at: '2024-01-10T14:30:00Z',
      contact_notes: 'Confirmed participation. Content delivery scheduled for Jan 25th.'
    },
    {
      id: 'inf_2',
      name: 'BeautyByBella',
      platform: 'TikTok',
      followers: 89000,
      engagement_rate: 6.1,
      contact_status: 'confirmed',
      offered_amount: 2200,
      contacted_at: '2024-01-12T09:15:00Z',
      contact_notes: 'Confirmed. Requesting product samples by Jan 20th.'
    },
    {
      id: 'inf_3',
      name: 'TechReviewTom',
      platform: 'YouTube',
      followers: 125000,
      engagement_rate: 3.8,
      contact_status: campaignHasStarted ? 'confirmed' : 'contacted',
      offered_amount: 3000,
      contacted_at: '2024-01-15T11:00:00Z',
      contact_notes: campaignHasStarted ? 'Confirmed participation. Campaign is now active.' : 'Initial contact made. Awaiting response by Jan 22nd.'
    },
    {
      id: 'inf_4',
      name: 'FitnessLifestyle',
      platform: 'Instagram',
      followers: 67000,
      engagement_rate: 5.3,
      contact_status: campaignHasStarted ? 'confirmed' : 'contacted',
      offered_amount: 1800,
      contacted_at: '2024-01-14T16:45:00Z',
      contact_notes: campaignHasStarted ? 'Confirmed participation. Campaign is now active.' : 'Sent collaboration proposal. Follow-up scheduled for Jan 21st.'
    },
    {
      id: 'inf_5',
      name: 'WellnessWarrior',
      platform: 'Instagram',
      followers: 34000,
      engagement_rate: 7.2,
      contact_status: campaignHasStarted ? 'confirmed' : 'pending',
      offered_amount: 1200,
      contacted_at: campaignHasStarted ? '2024-01-16T10:30:00Z' : null,
      contact_notes: campaignHasStarted ? 'Confirmed participation. Campaign is now active.' : 'Identified as potential match. Contact planned for Jan 20th.'
    },
    {
      id: 'inf_6',
      name: 'LifestyleLuxe',
      platform: 'TikTok',
      followers: 112000,
      engagement_rate: 4.9,
      contact_status: campaignHasStarted ? 'confirmed' : 'pending',
      offered_amount: 2500,
      contacted_at: campaignHasStarted ? '2024-01-17T14:00:00Z' : null,
      contact_notes: campaignHasStarted ? 'Confirmed participation. Campaign is now active.' : 'On contact list. Outreach scheduled for this week.'
    }
  ]

  const mockInfluencers = baseInfluencers

  const handleAction = async (action: string) => {
    setIsLoading(true)
    try {
      switch (action) {
        case 'pause':
          onPauseCampaign?.(campaign.id)
          break
        case 'resume':
          onResumeCampaign?.(campaign.id)
          break
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Enhanced Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60]"
          />
          
          {/* Enhanced Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 200,
              duration: 0.6
            }}
            className="fixed right-0 top-0 h-full w-full max-w-5xl bg-white shadow-2xl z-[60] overflow-hidden flex flex-col"
          >
            {/* Enhanced Header */}
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex-shrink-0"
            >
              <div className="p-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <Star size={32} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h2 className="text-2xl font-bold text-gray-900">{campaign.name}</h2>
                        <StatusBadge status={campaign.status} />
                      </div>
                      <p className="text-sm text-gray-600 font-medium mb-2">{campaign.brand_name}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Users size={14} />
                          <span>{campaign.assigned_influencers} influencers</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <DollarSign size={14} />
                          <span>${campaign.budget.toLocaleString()} budget</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{new Date(campaign.end_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <motion.button
                    onClick={onClose}
                    className="p-3 rounded-2xl hover:bg-gray-100 transition-all duration-200 group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X size={20} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </motion.button>
                </div>

                {/* Tab Navigation */}
                <div className="mt-6 border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    {[
                      { id: 'overview', label: 'Campaign Overview' },
                      { id: 'influencers', label: 'Influencers & Status' },
                      { id: 'analytics', label: 'Performance Analytics' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'border-black text-black'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/30">
              <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                  width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: rgba(0, 0, 0, 0.2);
                  border-radius: 10px;
                  border: 2px solid transparent;
                  background-clip: content-box;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: rgba(0, 0, 0, 0.3);
                  background-clip: content-box;
                }
              `}</style>
              
              <div className="p-8 space-y-10">
                {/* Campaign Overview Tab */}
                {activeTab === 'overview' && (
                  <>
                    <Section title="Campaign Details" delay={0.1}>
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <InfoField
                            label="Brand"
                            value={campaign.brand_name}
                            icon={<Building2 size={18} />}
                          />
                          <InfoField
                            label="Campaign Name"
                            value={campaign.name}
                            icon={<Star size={18} />}
                          />
                          <InfoField
                            label="Budget"
                            value={campaign.budget}
                            type="currency"
                            icon={<DollarSign size={18} />}
                          />
                          <InfoField
                            label="Spent"
                            value={campaign.spent}
                            type="currency"
                            icon={<TrendingUp size={18} />}
                          />
                          <InfoField
                            label="Start Date"
                            value={campaign.start_date}
                            type="date"
                            icon={<Calendar size={18} />}
                          />
                          <InfoField
                            label="End Date"
                            value={campaign.end_date}
                            type="date"
                            icon={<Calendar size={18} />}
                          />
                        </div>
                        
                        <div className="border-t border-gray-100 pt-6">
                          <InfoField
                            label="Description"
                            value={campaign.description}
                            icon={<MessageCircle size={18} />}
                          />
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                          <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide flex items-center">
                              <Target size={16} className="mr-2" />
                              Target Niches
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {campaign.target_niches?.map((niche: string) => (
                                <span key={niche} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                  {niche}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                          <div className="space-y-4">
                            <h4 className="text-sm font-medium text-gray-600 uppercase tracking-wide flex items-center">
                              <Package size={16} className="mr-2" />
                              Target Platforms
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {campaign.target_platforms?.map((platform: string) => (
                                <span key={platform} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                                  {platform}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {campaign.created_from_quotation && (
                          <div className="border-t border-gray-100 pt-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                              <div className="flex items-center space-x-2">
                                <Star size={16} className="text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">
                                  Created from Quotation: {campaign.quotation_id}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </Section>

                    <Section title="Progress Overview" delay={0.2}>
                      <div className="space-y-6">
                        <ProgressBar
                          current={campaign.spent}
                          total={campaign.budget}
                          label="Budget Usage"
                          color="blue"
                        />
                        <ProgressBar
                          current={campaign.completed_deliverables}
                          total={campaign.assigned_influencers}
                          label="Deliverables Completed"
                          color="green"
                        />
                        <ProgressBar
                          current={campaign.confirmed_influencers}
                          total={campaign.contacted_influencers}
                          label="Influencers Confirmed"
                          color="yellow"
                        />
                      </div>
                    </Section>
                  </>
                )}

                {/* Influencers Tab */}
                {activeTab === 'influencers' && (
                  <>
                    <Section title={campaignHasStarted ? "Influencer Status Overview" : "Contact Status Overview"} delay={0.1}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {mockInfluencers.filter(inf => inf.contact_status === 'confirmed').length}
                          </div>
                          <div className="text-sm text-green-800">{campaignHasStarted ? 'Active Influencers' : 'Confirmed'}</div>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-yellow-600">
                            {mockInfluencers.filter(inf => inf.contact_status === 'contacted').length}
                          </div>
                          <div className="text-sm text-yellow-800">{campaignHasStarted ? 'In Progress' : 'Contacted'}</div>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-gray-600">
                            {mockInfluencers.filter(inf => inf.contact_status === 'pending').length}
                          </div>
                          <div className="text-sm text-gray-800">{campaignHasStarted ? 'Not Started' : 'Pending Contact'}</div>
                        </div>
                      </div>
                    </Section>

                    <Section title="Influencer Details" delay={0.2}>
                      <div className="space-y-4">
                        {mockInfluencers.map((influencer) => (
                          <InfluencerCard key={influencer.id} influencer={influencer} />
                        ))}
                      </div>
                    </Section>
                  </>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                  <>
                    <Section title="Performance Metrics" delay={0.1}>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <InfoField
                            label="Total Reach"
                            value={campaign.actual_reach?.toLocaleString() || '0'}
                            icon={<TrendingUp size={18} />}
                          />
                          <InfoField
                            label="Estimated Reach"
                            value={campaign.estimated_reach?.toLocaleString() || '0'}
                            icon={<Target size={18} />}
                          />
                        </div>
                        <div className="space-y-4">
                          <InfoField
                            label="Engagement Rate"
                            value={campaign.engagement_rate || 0}
                            type="percentage"
                            icon={<Star size={18} />}
                          />
                          <InfoField
                            label="Cost Per Reach"
                            value={campaign.actual_reach ? Math.round(campaign.spent / campaign.actual_reach * 1000) / 1000 : 0}
                            type="currency"
                            icon={<DollarSign size={18} />}
                          />
                        </div>
                      </div>
                    </Section>

                    <Section title="ROI Analysis" delay={0.2}>
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-900 mb-2">
                            {campaign.actual_reach && campaign.budget 
                              ? `${Math.round((campaign.actual_reach / campaign.budget) * 100)}%` 
                              : 'N/A'
                            }
                          </div>
                          <div className="text-sm text-blue-700">Reach per Dollar Spent</div>
                        </div>
                      </div>
                    </Section>
                  </>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm p-8">
              <div className="flex justify-between items-center">
                <div className="flex space-x-3">
                  {campaign.status === 'ACTIVE' && (
                    <motion.button
                      onClick={() => handleAction('pause')}
                      className="px-6 py-3 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Pause size={16} />
                      <span>Pause Campaign</span>
                    </motion.button>
                  )}
                  
                  {campaign.status === 'PAUSED' && (
                    <motion.button
                      onClick={() => handleAction('resume')}
                      className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Play size={16} />
                      <span>Resume Campaign</span>
                    </motion.button>
                  )}
                  
                  <motion.button
                    onClick={onClose}
                    className="px-6 py-3 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 text-gray-700 font-medium shadow-sm hover:shadow-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 